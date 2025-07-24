
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@2.0.0'
import { z } from 'https://deno.land/x/zod@v3.22.2/mod.ts'

// Security configurations
const SECURITY_CONFIG = {
  MAX_REQUEST_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_EMPLOYEES_PER_IMPORT: 500,
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
  MAX_REQUESTS_PER_WINDOW: 5,
  REQUEST_TIMEOUT: 30 * 1000, // 30 seconds
  ALLOWED_EMAIL_DOMAINS: [], // Empty means all domains allowed, add domains to restrict
  BLOCKED_DISPOSABLE_DOMAINS: [
    '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
    'yopmail.com', 'temp-mail.org', 'throwaway.email', 'sharklasers.com'
  ]
}

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Concurrent import protection
const activeImports = new Set<string>()

// Security logger
const securityLog = (event: string, details: any, level: 'info' | 'warn' | 'error' = 'info') => {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    event,
    level,
    ...details
  }
  console.log(`[SECURITY-${level.toUpperCase()}]`, JSON.stringify(logEntry))
}

// Enhanced input sanitization functions
const sanitizeString = (str: string): string => {
  if (!str || typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .substring(0, 255); // Limit length
};

const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '';
  return email
    .toLowerCase()
    .trim()
    .replace(/[^\w@.-]/g, ''); // Keep only valid email characters
};

const sanitizeName = (name: string): string => {
  if (!name || typeof name !== 'string') return '';
  return name
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[^\w\s'-]/g, '') // Keep only letters, spaces, hyphens, apostrophes
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .substring(0, 100); // Limit length
};

// Security middleware functions
const checkRateLimit = (identifier: string): boolean => {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + SECURITY_CONFIG.RATE_LIMIT_WINDOW })
    return true
  }
  
  if (record.count >= SECURITY_CONFIG.MAX_REQUESTS_PER_WINDOW) {
    return false
  }
  
  record.count++
  return true
}

const validateEmailDomain = (email: string): { valid: boolean; reason?: string } => {
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return { valid: false, reason: 'Invalid email format' }
  
  // Check against blocked disposable domains
  if (SECURITY_CONFIG.BLOCKED_DISPOSABLE_DOMAINS.includes(domain)) {
    return { valid: false, reason: 'Disposable email domains not allowed' }
  }
  
  // Check against allowed domains (if configured)
  if (SECURITY_CONFIG.ALLOWED_EMAIL_DOMAINS.length > 0 && 
      !SECURITY_CONFIG.ALLOWED_EMAIL_DOMAINS.includes(domain)) {
    return { valid: false, reason: 'Email domain not in allowed list' }
  }
  
  return { valid: true }
}

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

interface ImportRequest {
  orgName: string
  people: Array<{
    id: string
    firstName: string
    lastName: string
    email: string
    jobTitle: string
    department: string
    division: string
    employeeId?: number
    role?: string
  }>
  adminInfo: {
    name: string
    email: string
    role: string
  }
}

interface ImportResult {
  success: boolean
  message: string
  imported: number
  failed: number
  errors: Array<{
    email: string
    error: string
  }>
  organizationId?: string
}

const importRequestSchema = z.object({
  orgName: z.string()
    .min(1, "Organization name is required")
    .max(255, "Organization name too long")
    .transform(sanitizeString),
  people: z.array(
    z.object({
      id: z.string().uuid("Invalid employee ID"),
      firstName: z.string()
        .min(1, "First name is required")
        .max(100, "First name too long")
        .transform(sanitizeName),
      lastName: z.string()
        .min(1, "Last name is required")
        .max(100, "Last name too long")
        .transform(sanitizeName),
      email: z.string()
        .email("Invalid email format")
        .max(254, "Email too long")
        .transform(sanitizeEmail)
        .refine((email) => {
          // Additional email validation
          const parts = email.split('@');
          if (parts.length !== 2) return false;
          const [local, domain] = parts;
          return local.length > 0 && local.length <= 64 && domain.includes('.');
        }, "Invalid email format"),
      jobTitle: z.string()
        .max(150, "Job title too long")
        .transform(sanitizeString),
      department: z.string()
        .max(100, "Department name too long")
        .transform(sanitizeString)
        .optional(),
      division: z.string()
        .max(100, "Division name too long")
        .transform(sanitizeString)
        .optional(),
      employeeId: z.number().int().positive().optional(),
      role: z.string()
        .max(50, "Role name too long")
        .transform(sanitizeString)
        .optional()
    })
  ).min(1, "At least one employee is required").max(1000, "Too many employees in single import"),
  adminInfo: z.object({
    name: z.string()
      .min(1, "Admin name is required")
      .max(255, "Admin name too long")
      .transform(sanitizeName),
    email: z.string()
      .email("Invalid admin email")
      .transform(sanitizeEmail),
    role: z.string()
      .max(50, "Role too long")
      .transform(sanitizeString)
  })
})

// Initialize Resend with graceful handling of missing API key
const resendApiKey = Deno.env.get('RESEND_API_KEY')
const resend = resendApiKey ? new Resend(resendApiKey) : null

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

    // Rate limiting check
    if (!checkRateLimit(clientIP)) {
      securityLog('rate_limit_exceeded', { ip: clientIP }, 'warn')
      return createSecureErrorResponse(new Error('Rate limit exceeded'), 429)
    }

    // Request size validation
    const contentLength = req.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > SECURITY_CONFIG.MAX_REQUEST_SIZE) {
      securityLog('request_too_large', { 
        ip: clientIP, 
        size: contentLength 
      }, 'warn')
      return createSecureErrorResponse(new Error('Request too large'), 413)
    }

    // Authentication validation
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      securityLog('missing_auth_header', { ip: clientIP }, 'warn')
      return createSecureErrorResponse(new Error('Authentication required'), 401)
    }

    // Create regular client for organization checks
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Create admin client for user creation
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const token = authHeader.replace('Bearer ', '')
    
    // Verify the requesting user with enhanced error handling
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      securityLog('auth_failed', { 
        ip: clientIP, 
        error: authError?.message || 'No user returned' 
      }, 'warn')
      return createSecureErrorResponse(new Error('Authentication failed'), 401)
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

    // Parse and validate request body with additional security checks
    const body = await req.json()
    let validatedData: ImportRequest

    try {
      validatedData = importRequestSchema.parse(body)
    } catch (validationError) {
      securityLog('validation_failed', { 
        userId: user.id, 
        ip: clientIP,
        errors: validationError.errors || []
      }, 'warn')
      activeImports.delete(importKey)
      return createSecureErrorResponse(validationError, 400)
    }

    const { orgName, people, adminInfo } = validatedData

    // Additional security validations
    if (people.length > SECURITY_CONFIG.MAX_EMPLOYEES_PER_IMPORT) {
      securityLog('employee_limit_exceeded', { 
        userId: user.id, 
        ip: clientIP,
        employeeCount: people.length 
      }, 'warn')
      activeImports.delete(importKey)
      return createSecureErrorResponse(new Error('Too many employees'), 400)
    }

    // Validate email domains
    for (const person of people) {
      const emailValidation = validateEmailDomain(person.email)
      if (!emailValidation.valid) {
        securityLog('invalid_email_domain', { 
          userId: user.id, 
          ip: clientIP,
          email: person.email,
          reason: emailValidation.reason 
        }, 'warn')
        activeImports.delete(importKey)
        return createSecureErrorResponse(new Error(`Invalid email domain: ${emailValidation.reason}`), 400)
      }
    }

    // Log import attempt
    securityLog('import_started', { 
      userId: user.id, 
      ip: clientIP,
      orgName,
      employeeCount: people.length 
    }, 'info')
    console.log('Starting enhanced import for organization:', orgName)
    console.log('Importing', people.length, 'people with auth user creation')

    // Get or create organization
    const { data: orgData, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .eq('name', orgName)
      .single()
    let org = orgData

    if (orgError && orgError.code === 'PGRST116') {
      const { data: newOrg, error: createOrgError } = await supabaseAdmin
        .from('organizations')
        .insert({ name: orgName })
        .select('id')
        .single()
      
      if (createOrgError) {
        console.error('Error creating organization:', createOrgError)
        throw createOrgError
      }
      org = newOrg
    } else if (orgError) {
      console.error('Error fetching organization:', orgError)
      throw orgError
    }

    const organizationId = org.id
    console.log('Using organization ID:', organizationId)

    // Create unique divisions and departments
    const divisions = [...new Set(people.map(p => p.division).filter(Boolean))]
    const departments = [...new Set(people.map(p => p.department).filter(Boolean))]

    console.log('Creating divisions:', divisions)
    console.log('Creating departments:', departments)

    // Insert divisions
    const divisionMap: Record<string, string> = {}
    if (divisions.length > 0) {
      const { data: insertedDivisions, error: divisionError } = await supabaseAdmin
        .from('divisions')
        .upsert(
          divisions.map(name => ({
            name,
            organization_id: organizationId
          })),
          { onConflict: 'name,organization_id' }
        )
        .select('id, name')

      if (divisionError) {
        console.error('Error inserting divisions:', divisionError)
        throw divisionError
      }

      insertedDivisions?.forEach(div => {
        divisionMap[div.name] = div.id
      })
    }

    // Insert departments
    const departmentMap: Record<string, string> = {}
    if (departments.length > 0) {
      const { data: insertedDepartments, error: departmentError } = await supabaseAdmin
        .from('departments')
        .upsert(
          departments.map(name => ({
            name,
            organization_id: organizationId,
            division_id: null
          })),
          { onConflict: 'name,organization_id' }
        )
        .select('id, name')

      if (departmentError) {
        console.error('Error inserting departments:', departmentError)
        throw departmentError
      }

      insertedDepartments?.forEach(dept => {
        departmentMap[dept.name] = dept.id
      })
    }

    const result: ImportResult = {
      success: true,
      message: 'Import completed',
      imported: 0,
      failed: 0,
      errors: [],
      organizationId
    }

    // Process each employee
    for (const person of people) {
      try {
        console.log(`Processing employee: ${person.email}`)

        // Check if user already exists using getUserByEmail
        const { data: existingUserData, error: getUserError } =
          await supabaseAdmin.auth.admin.getUserByEmail(person.email)

        let existingUser = existingUserData?.user

        if (getUserError) {
          if (getUserError.status === 404 || getUserError.message?.includes('User not found')) {
            existingUser = null
          } else {
            console.error(`Error checking user ${person.email}:`, getUserError)
            result.errors.push({
              email: person.email,
              error: `Failed to check existing user: ${getUserError.message}`
            })
            result.failed++
            continue
          }
        }
        
        let userId: string
        let isNewUser = false

        if (existingUser) {
          userId = existingUser.id
          console.log(`User already exists: ${person.email}`)
        } else {
          // Create new auth user
          const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
            email: person.email,
            email_confirm: true,
            user_metadata: {
              first_name: person.firstName,
              last_name: person.lastName,
              organization_id: organizationId,
              invited_by: user.id
            }
          })

          if (createUserError) {
            console.error(`Error creating user for ${person.email}:`, createUserError)
            result.errors.push({
              email: person.email,
              error: `Failed to create user: ${createUserError.message}`
            })
            result.failed++
            continue
          }

          userId = newUser.user.id
          isNewUser = true
          console.log(`Created new user: ${person.email}`)
        }

        // Create or update profile using the correct employee_info table
        const profileData = {
          user_id: userId,
          email: person.email,
          first_name: person.firstName,
          last_name: person.lastName,
          name: `${person.firstName} ${person.lastName}`,
          job_title: person.jobTitle,
          organization_id: organizationId,
          division_id: person.division ? divisionMap[person.division] : null,
          department_id: person.department ? departmentMap[person.department] : null,
          status: isNewUser ? 'invited' : 'active'
        }

        const { data: profile, error: profileError } = await supabaseAdmin
          .from('employee_info')
          .upsert(profileData, { onConflict: 'email,organization_id' })
          .select('id')
          .single()

        if (profileError) {
          console.error(`Error creating profile for ${person.email}:`, profileError)
          result.errors.push({
            email: person.email,
            error: `Failed to create profile: ${profileError.message}`
          })
          result.failed++
          continue
        }

        // Assign employee role explicitly to ensure proper role setup
        try {
          const { error: roleError } = await supabaseAdmin
            .from('user_roles')
            .upsert({
              profile_id: profile.id,
              user_id: userId,
              role: 'employee',
              organization_id: organizationId,
              is_active: true
            }, { onConflict: 'profile_id,role,organization_id' })

          if (roleError) {
            console.error(`Error assigning role for ${person.email}:`, roleError)
            // Don't fail import for role assignment errors, continue processing
          } else {
            console.log(`Employee role assigned to ${person.email}`)
          }
        } catch (roleError) {
          console.error(`Role assignment error for ${person.email}:`, roleError)
          // Continue with import even if role assignment fails
        }

        // Send invitation email for new users
        if (isNewUser && resend) {
          try {
            const inviteLink = `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?type=invite&token_hash=${encodeURIComponent('placeholder')}&redirect_to=${encodeURIComponent(req.headers.get('origin') || 'http://localhost:3000')}`
            
            await resend.emails.send({
              from: 'Team <onboarding@resend.dev>',
              to: [person.email],
              subject: `Welcome to ${orgName} - Complete Your Account Setup`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h1 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
                    Welcome to ${orgName}!
                  </h1>
                  
                  <p>Hi ${person.firstName},</p>
                  
                  <p>You've been added to the ${orgName} performance management system. Your account has been created with the following details:</p>
                  
                  <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <strong>Your Details:</strong><br>
                    Name: ${person.firstName} ${person.lastName}<br>
                    Email: ${person.email}<br>
                    Job Title: ${person.jobTitle}<br>
                    ${person.department ? `Department: ${person.department}<br>` : ''}
                    ${person.division ? `Division: ${person.division}<br>` : ''}
                  </div>
                  
                  <p>To access your account, please check your email for a sign-in link from Supabase, or visit our platform and use the "Forgot Password" option to set up your password.</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${req.headers.get('origin') || 'http://localhost:3000'}" 
                       style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                      Access Platform
                    </a>
                  </div>
                  
                  <p>If you have any questions, please contact your administrator.</p>
                  
                  <p>Best regards,<br>The ${orgName} Team</p>
                </div>
              `
            })
            
            console.log(`Invitation email sent to ${person.email}`)
          } catch (emailError) {
            console.error(`Error sending email to ${person.email}:`, emailError)
            // Don't fail the import for email errors
          }
        } else if (isNewUser && !resend) {
          console.log(`Skipping email for ${person.email} - Resend not configured`)
        }

        result.imported++
        console.log(`Successfully processed ${person.email}`)

      } catch (error) {
        console.error(`Error processing ${person.email}:`, error)
        result.errors.push({
          email: person.email,
          error: error.message || 'Unknown error occurred'
        })
        result.failed++
      }
    }

    // Update admin user's profile using the correct employee_info table
    try {
      const { error: adminUpdateError } = await supabaseAdmin
        .from('employee_info')
        .update({
          organization_id: organizationId,
          first_name: adminInfo.name.split(' ')[0] || adminInfo.name,
          last_name: adminInfo.name.split(' ').slice(1).join(' ') || '',
          name: adminInfo.name,
          status: 'active',
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      // Admin role assignment removed - will be handled by automatic role sync
    } catch (adminError) {
      console.error('Error updating admin profile:', adminError)
    }

    // Update result message
    if (result.failed > 0) {
      result.message = `Import completed with ${result.imported} successful and ${result.failed} failed imports`
      result.success = result.imported > 0
    } else {
      result.message = `Successfully imported ${result.imported} employees with auth users and invitations`
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
