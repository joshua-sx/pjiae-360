import type { ImportRequest, SecurityContext } from './types.ts'

export interface ValidationResult {
  valid: boolean
  error?: string
  data?: ImportRequest
}

export interface SecurityValidationResult {
  valid: boolean
  error?: string
}

export const SECURITY_CONFIG = {
  MAX_REQUEST_SIZE: 10 * 1024 * 1024, // 10MB
  REQUEST_TIMEOUT_MS: 300000, // 5 minutes
  MAX_PEOPLE_PER_IMPORT: 500,
  RATE_LIMIT_WINDOW_MS: 60000, // 1 minute
  MAX_REQUESTS_PER_WINDOW: 5
}

// Security logging function
export function securityLog(
  eventType: string, 
  details: any, 
  level: 'info' | 'warn' | 'error' = 'info'
): void {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    level,
    eventType,
    details
  }
  
  if (level === 'error') {
    console.error('Security event:', logEntry)
  } else if (level === 'warn') {
    console.warn('Security event:', logEntry)
  } else {
    console.info('Security event:', logEntry)
  }
}

// Rate limiting store (in-memory for serverless functions)
const requestTracker = new Map<string, Array<number>>()

export function validateRequestSecurity(
  req: Request, 
  context: SecurityContext
): SecurityValidationResult {
  try {
    // Check request method
    if (req.method !== 'POST') {
      securityLog('invalid_method', { method: req.method, ip: context.clientIP }, 'warn')
      return { valid: false, error: 'Only POST method allowed' }
    }

    // Check content type
    const contentType = req.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      securityLog('invalid_content_type', { contentType, ip: context.clientIP }, 'warn')
      return { valid: false, error: 'Content-Type must be application/json' }
    }

    // Rate limiting (basic implementation)
    const clientKey = context.clientIP
    const now = Date.now()
    const windowStart = now - SECURITY_CONFIG.RATE_LIMIT_WINDOW_MS
    
    if (!requestTracker.has(clientKey)) {
      requestTracker.set(clientKey, [])
    }
    
    const clientRequests = requestTracker.get(clientKey)!
    const recentRequests = clientRequests.filter(timestamp => timestamp > windowStart)
    
    if (recentRequests.length >= SECURITY_CONFIG.MAX_REQUESTS_PER_WINDOW) {
      securityLog('rate_limit_exceeded', { 
        ip: context.clientIP, 
        requests: recentRequests.length 
      }, 'warn')
      return { valid: false, error: 'Rate limit exceeded' }
    }
    
    // Add current request
    recentRequests.push(now)
    requestTracker.set(clientKey, recentRequests)

    return { valid: true }
  } catch (error) {
    securityLog('security_validation_error', { 
      error: error.message, 
      ip: context.clientIP 
    }, 'error')
    return { valid: false, error: 'Security validation failed' }
  }
}

export function validateImportRequest(body: any, context: SecurityContext): ValidationResult {
  try {
    if (!body) {
      return { valid: false, error: 'Request body is required' }
    }

    // Validate organizationId (must be a valid UUID)
    if (!body.organizationId || typeof body.organizationId !== 'string') {
      return { valid: false, error: 'organizationId is required and must be a string' }
    }

    // Basic UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(body.organizationId)) {
      return { valid: false, error: 'organizationId must be a valid UUID' }
    }

    // Validate people array
    if (!Array.isArray(body.people)) {
      return { valid: false, error: 'people must be an array' }
    }

    if (body.people.length === 0) {
      return { valid: false, error: 'At least one person is required' }
    }

    if (body.people.length > SECURITY_CONFIG.MAX_PEOPLE_PER_IMPORT) {
      return { valid: false, error: `Cannot import more than ${SECURITY_CONFIG.MAX_PEOPLE_PER_IMPORT} people at once` }
    }

    // Validate each person
    for (const [index, person] of body.people.entries()) {
      if (!person || typeof person !== 'object') {
        return { valid: false, error: `Person at index ${index} must be an object` }
      }

      if (!person.firstName || typeof person.firstName !== 'string' || person.firstName.trim().length === 0) {
        return { valid: false, error: `Person at index ${index} must have a valid firstName` }
      }

      if (!person.lastName || typeof person.lastName !== 'string' || person.lastName.trim().length === 0) {
        return { valid: false, error: `Person at index ${index} must have a valid lastName` }
      }

      if (!person.email || typeof person.email !== 'string') {
        return { valid: false, error: `Person at index ${index} must have a valid email` }
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(person.email)) {
        return { valid: false, error: `Person at index ${index} has invalid email format` }
      }

      // Optional fields validation
      if (person.jobTitle && typeof person.jobTitle !== 'string') {
        return { valid: false, error: `Person at index ${index} jobTitle must be a string` }
      }

      if (person.department && typeof person.department !== 'string') {
        return { valid: false, error: `Person at index ${index} department must be a string` }
      }

      if (person.division && typeof person.division !== 'string') {
        return { valid: false, error: `Person at index ${index} division must be a string` }
      }

      if (person.role && typeof person.role !== 'string') {
        return { valid: false, error: `Person at index ${index} role must be a string` }
      }

      if (person.employeeId && typeof person.employeeId !== 'string') {
        return { valid: false, error: `Person at index ${index} employeeId must be a string` }
      }

      if (person.phoneNumber && typeof person.phoneNumber !== 'string') {
        return { valid: false, error: `Person at index ${index} phoneNumber must be a string` }
      }
    }

    // Validate adminInfo
    if (!body.adminInfo || typeof body.adminInfo !== 'object') {
      return { valid: false, error: 'adminInfo is required and must be an object' }
    }

    if (!body.adminInfo.name || typeof body.adminInfo.name !== 'string' || body.adminInfo.name.trim().length === 0) {
      return { valid: false, error: 'adminInfo.name is required and must be a valid string' }
    }

    if (!body.adminInfo.email || typeof body.adminInfo.email !== 'string') {
      return { valid: false, error: 'adminInfo.email is required and must be a valid string' }
    }

    const adminEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!adminEmailRegex.test(body.adminInfo.email)) {
      return { valid: false, error: 'adminInfo.email has invalid format' }
    }

    if (!body.adminInfo.role || typeof body.adminInfo.role !== 'string') {
      return { valid: false, error: 'adminInfo.role is required and must be a string' }
    }

    // Check for duplicate emails
    const emails = body.people.map((p: any) => p.email.toLowerCase())
    const uniqueEmails = new Set(emails)
    if (emails.length !== uniqueEmails.size) {
      return { valid: false, error: 'Duplicate emails found in people array' }
    }

    // Log successful validation
    securityLog('import_validation_success', {
      organizationId: body.organizationId,
      peopleCount: body.people.length,
      userId: context.userId
    })

    return {
      valid: true,
      data: {
        organizationId: body.organizationId,
        people: body.people.map((person: any) => ({
          firstName: person.firstName.trim(),
          lastName: person.lastName.trim(),
          email: person.email.toLowerCase().trim(),
          jobTitle: person.jobTitle?.trim(),
          department: person.department?.trim(),
          division: person.division?.trim(),
          role: person.role?.trim(),
          employeeId: person.employeeId?.trim(),
          phoneNumber: person.phoneNumber?.trim(),
        })),
        adminInfo: {
          name: body.adminInfo.name.trim(),
          email: body.adminInfo.email.toLowerCase().trim(),
          role: body.adminInfo.role.trim(),
        },
      }
    }
  } catch (error) {
    securityLog('validation_error', { 
      error: error.message, 
      userId: context.userId 
    }, 'error')
    return { valid: false, error: 'Validation failed due to internal error' }
  }
}