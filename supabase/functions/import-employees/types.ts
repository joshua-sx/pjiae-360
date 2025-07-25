// Shared types and interfaces for the import function

export interface ImportRequest {
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

export interface ImportResult {
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

export interface ValidationResult {
  valid: boolean
  error?: string
  data?: ImportRequest
}

export interface EmailValidationResult {
  valid: boolean
  reason?: string
}

export interface SecurityContext {
  userId: string
  clientIP: string
  startTime: number
}

export interface DatabaseContext {
  supabaseAdmin: any
  organizationId: string
  divisionMap: Record<string, string>
  departmentMap: Record<string, string>
}