
import { ImportRequest } from './types.ts'

export function validateImportRequest(body: any): ImportRequest | { error: string } {
  if (!body) {
    return { error: 'Request body is required' }
  }

  // Validate organizationId (must be a valid UUID)
  if (!body.organizationId || typeof body.organizationId !== 'string') {
    return { error: 'organizationId is required and must be a string' }
  }

  // Basic UUID format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(body.organizationId)) {
    return { error: 'organizationId must be a valid UUID' }
  }

  // Validate people array
  if (!Array.isArray(body.people)) {
    return { error: 'people must be an array' }
  }

  if (body.people.length === 0) {
    return { error: 'At least one person is required' }
  }

  if (body.people.length > 500) {
    return { error: 'Cannot import more than 500 people at once' }
  }

  // Validate each person
  for (const [index, person] of body.people.entries()) {
    if (!person || typeof person !== 'object') {
      return { error: `Person at index ${index} must be an object` }
    }

    if (!person.firstName || typeof person.firstName !== 'string' || person.firstName.trim().length === 0) {
      return { error: `Person at index ${index} must have a valid firstName` }
    }

    if (!person.lastName || typeof person.lastName !== 'string' || person.lastName.trim().length === 0) {
      return { error: `Person at index ${index} must have a valid lastName` }
    }

    if (!person.email || typeof person.email !== 'string') {
      return { error: `Person at index ${index} must have a valid email` }
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(person.email)) {
      return { error: `Person at index ${index} has invalid email format` }
    }

    // Optional fields validation
    if (person.jobTitle && typeof person.jobTitle !== 'string') {
      return { error: `Person at index ${index} jobTitle must be a string` }
    }

    if (person.department && typeof person.department !== 'string') {
      return { error: `Person at index ${index} department must be a string` }
    }

    if (person.division && typeof person.division !== 'string') {
      return { error: `Person at index ${index} division must be a string` }
    }

    if (person.role && typeof person.role !== 'string') {
      return { error: `Person at index ${index} role must be a string` }
    }
  }

  // Validate adminInfo
  if (!body.adminInfo || typeof body.adminInfo !== 'object') {
    return { error: 'adminInfo is required and must be an object' }
  }

  if (!body.adminInfo.name || typeof body.adminInfo.name !== 'string' || body.adminInfo.name.trim().length === 0) {
    return { error: 'adminInfo.name is required and must be a valid string' }
  }

  if (!body.adminInfo.email || typeof body.adminInfo.email !== 'string') {
    return { error: 'adminInfo.email is required and must be a valid string' }
  }

  const adminEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!adminEmailRegex.test(body.adminInfo.email)) {
    return { error: 'adminInfo.email has invalid format' }
  }

  if (!body.adminInfo.role || typeof body.adminInfo.role !== 'string') {
    return { error: 'adminInfo.role is required and must be a string' }
  }

  // Check for duplicate emails
  const emails = body.people.map((p: any) => p.email.toLowerCase())
  const uniqueEmails = new Set(emails)
  if (emails.length !== uniqueEmails.size) {
    return { error: 'Duplicate emails found in people array' }
  }

  return {
    organizationId: body.organizationId,
    people: body.people.map((person: any) => ({
      firstName: person.firstName.trim(),
      lastName: person.lastName.trim(),
      email: person.email.toLowerCase().trim(),
      jobTitle: person.jobTitle?.trim(),
      department: person.department?.trim(),
      division: person.division?.trim(),
      role: person.role?.trim(),
    })),
    adminInfo: {
      name: body.adminInfo.name.trim(),
      email: body.adminInfo.email.toLowerCase().trim(),
      role: body.adminInfo.role.trim(),
    },
  }
}
