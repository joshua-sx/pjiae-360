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
  
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    // Initialize security context
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'
    const securityContext: SecurityContext = {
      userId: '',
      clientIP,
      startTime
    }

    securityLog('import_request_received', { 
      ip: clientIP, 
      userAgent,
      timestamp: new Date().toISOString() 
    })

    // Request timeout protection
    const timeoutId = setTimeout(() => {
      securityLog('import_timeout', { duration: Date.now() - startTime }, 'warn')
    }, SECURITY_CONFIG.REQUEST_TIMEOUT_MS)

    try {
      // Validate request security first
      const securityValidation = validateRequestSecurity(req, securityContext)
      if (!securityValidation.valid) {
        return createSecureErrorResponse(new Error(securityValidation.error), 400)
      }

      // Initialize Supabase with service role for admin operations
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // Authenticate user request
      const authHeader = req.headers.get('Authorization')
      if (!authHeader) {
        return createSecureErrorResponse(new Error('Authentication required'), 401)
      }

      const supabaseUser = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      )

      const { data: { user }, error: authError } = await supabaseUser.auth.getUser(
        authHeader.replace('Bearer ', '')
      )

      if (authError || !user) {
        securityLog('authentication_failed', { 
          authError: authError?.message,
          ip: clientIP 
        }, 'warn')
        return createSecureErrorResponse(new Error('Invalid authentication'), 401)
      }

      securityContext.userId = user.id

      // Parse and validate request body
      const body = await req.json()
      
      // Update validation to require organizationId instead of orgName
      if (!body.organizationId) {
        return createSecureErrorResponse(new Error('organizationId is required'), 400)
      }

      // Validate user membership to the organization
      const { data: userOrgCheck, error: orgCheckError } = await supabaseAdmin
        .from('employee_info')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('organization_id', body.organizationId)
        .single()

      if (orgCheckError || !userOrgCheck) {
        securityLog('unauthorized_org_access', {
          userId: user.id,
          attemptedOrgId: body.organizationId,
          error: orgCheckError?.message
        }, 'warn')
        return createSecureErrorResponse(new Error('Access denied'), 403)
      }

      const validation = validateImportRequest(body, securityContext)
      
      if (!validation.valid) {
        securityLog('validation_failed', { 
          error: validation.error,
          userId: user.id 
        }, 'warn')
        return createSecureErrorResponse(new Error(validation.error), 400)
      }

      const importRequest = validation.data!
      const organizationId = body.organizationId

      // Check for concurrent imports for the same organization
      const importKey = `${organizationId}-${user.id}`
      if (activeImports.has(importKey)) {
        securityLog('concurrent_import_blocked', { 
          organizationId,
          userId: user.id 
        }, 'warn')
        return createSecureErrorResponse(new Error('Import already in progress'), 429)
      }

      activeImports.add(importKey)

      try {
        // Initialize database service
        const dbService = new DatabaseService(supabaseAdmin)
        
        // Validate organization exists and user has access (already checked above)
        const { data: org, error: orgError } = await supabaseAdmin
          .from('organizations')
          .select('id, name')
          .eq('id', organizationId)
          .single()

        if (orgError || !org) {
          throw new Error('Organization not found')
        }

        // Create divisions and departments
        const { divisionMap, departmentMap } = await dbService.createDivisionsAndDepartments(
          importRequest.people, 
          organizationId
        )

        const databaseContext = {
          supabaseAdmin,
          organizationId,
          divisionMap,
          departmentMap
        }

        // Process employees in batches
        const batchSize = 10
        const batches = []
        for (let i = 0; i < importRequest.people.length; i += batchSize) {
          batches.push(importRequest.people.slice(i, i + batchSize))
        }

        const results = {
          successful: [] as Array<{
            email: string
            userId: string
            profileId: string
            isNewUser: boolean
            verificationToken?: string | null
          }>,
          failed: [] as Array<{ email: string; error: string }>
        }

        // Process each batch
        for (const batch of batches) {
          const batchResult = await dbService.processEmployeeBatch(
            batch,
            databaseContext,
            user.id
          )
          results.successful.push(...batchResult.successful)
          results.failed.push(...batchResult.failed)
        }

        // Update admin profile
        const adminUpdateResult = await dbService.updateAdminProfile(
          importRequest.adminInfo,
          user.id,
          organizationId
        )

        if (!adminUpdateResult.success) {
          securityLog('admin_profile_update_failed', {
            error: adminUpdateResult.error,
            userId: user.id,
            organizationId
          }, 'warn')
        }

        // Send welcome emails for new users
        const emailPromises = results.successful
          .filter(result => result.isNewUser && result.verificationToken)
          .map(result => emailService.sendWelcomeEmail(
            importRequest.people.find(p => p.email === result.email)!,
            { organizationName: org.name },
            result.verificationToken!
          ))

        const emailResults = await Promise.allSettled(emailPromises)
        
        // Send notification to admin
        const notificationResult = await emailService.sendErrorNotification(
          user.email!,
          org.name,
          {
            imported: results.successful.length,
            failed: results.failed.length,
            errors: results.failed
          }
        )

        // Prepare success details for client-side linking
        const successDetails = results.successful.map(s => ({
          email: s.email,
          userId: s.userId,
          employeeInfoId: s.profileId // profileId maps to employee_info.id
        }));

        const importResult: ImportResult = {
          success: results.failed.length === 0,
          message: results.failed.length === 0 
            ? `Successfully imported ${results.successful.length} employees`
            : `Imported ${results.successful.length} employees with ${results.failed.length} failures`,
          imported: results.successful.length,
          failed: results.failed.length,
          errors: results.failed,
          organizationId,
          successDetails
        }

        securityLog('import_completed', {
          organizationId,
          imported: results.successful.length,
          failed: results.failed.length,
          duration: Date.now() - startTime
        })

        return new Response(
          JSON.stringify(importResult),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )

      } finally {
        activeImports.delete(importKey)
      }

    } finally {
      clearTimeout(timeoutId)
    }

  } catch (error: any) {
    securityLog('import_error', {
      error: error.message,
      stack: error.stack,
      duration: Date.now() - startTime
    }, 'error')
    
    return createSecureErrorResponse(error)
  }
})