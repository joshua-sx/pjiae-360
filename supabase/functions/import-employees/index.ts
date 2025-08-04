
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Import our refactored services
import { validateRequestSecurity, validateImportRequest, securityLog, SECURITY_CONFIG } from './validation.ts'
import { emailService } from './email-service.ts'
import { DatabaseService } from './database-service.ts'
import type { ImportRequest, ImportResult, SecurityContext } from './types.ts'

// Concurrent import protection
const activeImports = new Set<string>()

const createSecureErrorResponse = (error: any, statusCode: number = 500): Response => {
  // Log the full error for debugging but don't expose it
  securityLog('error_occurred', { 
    error: error.message || 'Unknown error',
    stack: error.stack || 'No stack trace',
    timestamp: new Date().toISOString()
  }, 'error')
  
  // Return sanitized error response
  const sanitizedMessage = statusCode === 400 ? 'Invalid request data' :
                          statusCode === 401 ? 'Authentication required' :
                          statusCode === 403 ? 'Access denied' :
                          statusCode === 429 ? 'Rate limit exceeded' :
                          'Service temporarily unavailable'
  
  return new Response(
    JSON.stringify({ 
      success: false,
      error: sanitizedMessage,
      imported: 0,
      failed: 0,
      errors: []
    }),
    { 
      status: statusCode, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  const startTime = Date.now()
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Set timeout for the entire request
  const timeoutId = setTimeout(() => {
    throw new Error('Request timeout')
  }, SECURITY_CONFIG.REQUEST_TIMEOUT)

  try {
    // Security checks
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown'

    // Authentication validation
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      securityLog('missing_auth_header', { ip: clientIP }, 'warn')
      return createSecureErrorResponse(new Error('Authentication required'), 401)
    }

    // Create Supabase clients
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const token = authHeader.replace('Bearer ', '')
    
    // Verify the requesting user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      securityLog('auth_failed', { 
        ip: clientIP, 
        error: authError?.message || 'No user returned' 
      }, 'warn')
      return createSecureErrorResponse(new Error('Authentication failed'), 401)
    }

    // Create security context
    const securityContext: SecurityContext = {
      userId: user.id,
      clientIP,
      startTime
    }

    // Request security validation
    const securityValidation = validateRequestSecurity(req, securityContext)
    if (!securityValidation.valid) {
      return createSecureErrorResponse(new Error(securityValidation.error), 429)
    }

    // Concurrent import protection
    const importKey = `${user.id}-import`
    if (activeImports.has(importKey)) {
      securityLog('concurrent_import_blocked', { 
        userId: user.id, 
        ip: clientIP 
      }, 'warn')
      return createSecureErrorResponse(new Error('Import already in progress'), 409)
    }
    activeImports.add(importKey)

    // Parse and validate request body
    const body = await req.json()
    const validation = validateImportRequest(body, securityContext)
    
    if (!validation.valid) {
      activeImports.delete(importKey)
      return createSecureErrorResponse(new Error(validation.error), 400)
    }

    const validatedData = validation.data!
    const { orgName, people, adminInfo } = validatedData

    // Log import attempt
    securityLog('import_started', { 
      userId: user.id, 
      ip: clientIP,
      orgName,
      employeeCount: people.length 
    }, 'info')
    console.log('Starting enhanced import for organization:', orgName)
    console.log('Importing', people.length, 'people with auth user creation')

    // Initialize database service
    const databaseService = new DatabaseService(supabaseAdmin)

    // Create organization
    const orgResult = await databaseService.findOrCreateOrganization(orgName)
    if (!orgResult.success) {
      activeImports.delete(importKey)
      throw new Error(orgResult.error)
    }
    const organizationId = orgResult.organizationId!

    // Create divisions and departments
    const { divisionMap, departmentMap } = await databaseService.createDivisionsAndDepartments(people, organizationId)

    // Create database context
    const databaseContext = {
      supabaseAdmin,
      organizationId,
      divisionMap,
      departmentMap
    }

    // Process employees in batch
    const batchResult = await databaseService.processEmployeeBatch(people, databaseContext, user.id)

    // Send welcome emails for new users with verification tokens
    const newUsers = batchResult.successful.filter(emp => emp.isNewUser)
    const emailContext = {
      orgName,
      originUrl: req.headers.get("origin") || undefined,
    }

    for (const newUser of newUsers) {
      const person = people.find(p => p.email === newUser.email)!
      
      if (!person) {
        console.error(`Person data not found for email: ${newUser.email}`)
        continue
      }
      
      if (!emailService.isEmailConfigured()) {
        console.log(
          `Skipping welcome email for ${newUser.email} - RESEND_API_KEY not configured`,
        )
        continue
      }
      
      try {
        const emailResult = await emailService.sendWelcomeEmail(
          person,
          emailContext,
          newUser.verificationToken,
        )
        
        if (emailResult.success) {
          console.log(`Welcome email sent to ${newUser.email}`)
        } else {
          console.error(
            `Failed to send welcome email to ${newUser.email}: ${emailResult.error}`,
          )
        }
      } catch (error) {
        console.error(
          `Error sending welcome email to ${newUser.email}: ${error.message}`,
        )
      }
    }

    // Update admin profile
    await databaseService.updateAdminProfile(adminInfo, user.id, organizationId)

    // Send admin notification about import completion
    try {
      const importDetails = {
        totalAttempted: batchResult.successful.length + batchResult.failed.length,
        successful: batchResult.successful.length,
        failed: batchResult.failed.length,
        errors: batchResult.failed
      }
      
      await emailService.sendErrorNotification(user.email!, orgName, importDetails)
      console.log(`Admin notification sent to ${user.email}`)
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError)
      // Don't fail the import for email notification issues
    }

    // Prepare final result
    const result: ImportResult = {
      success: batchResult.failed.length === 0 || batchResult.successful.length > 0,
      message: batchResult.failed.length > 0 
        ? `Import completed with ${batchResult.successful.length} successful and ${batchResult.failed.length} failed imports`
        : `Successfully imported ${batchResult.successful.length} employees with auth users and invitations`,
      imported: batchResult.successful.length,
      failed: batchResult.failed.length,
      errors: batchResult.failed,
      organizationId
    }

    // Log successful completion
    securityLog('import_completed', { 
      userId: user.id, 
      ip: clientIP,
      orgName,
      imported: result.imported,
      failed: result.failed,
      duration: Date.now() - startTime
    }, 'info')

    console.log('Import completed:', result)

    // Clean up resources
    clearTimeout(timeoutId)
    activeImports.delete(importKey)

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    // Clean up timeout and active imports
    clearTimeout(timeoutId)
    const importKey = `${(req as any).user?.id || 'unknown'}-import`
    activeImports.delete(importKey)

    // Security logging with context
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown'
    
    securityLog('import_failed', { 
      ip: clientIP,
      error: error.message || 'Unknown error',
      duration: Date.now() - startTime
    }, 'error')

    // Return secure error response
    return createSecureErrorResponse(error, 500)
  }
})
