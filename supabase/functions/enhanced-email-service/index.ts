import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import React from 'npm:react@18.3.1'

// Import email templates
import WelcomeEmail from '../_templates/WelcomeEmail.tsx'
import AppraisalNotificationEmail from '../_templates/AppraisalNotificationEmail.tsx'
import SystemNotificationEmail from '../_templates/SystemNotificationEmail.tsx'
import AccountWelcomeEmail from '../_templates/AccountWelcomeEmail.tsx'
import EmployeeInviteEmail from '../_templates/EmployeeInviteEmail.tsx'
import ImportSummaryEmail from '../_templates/ImportSummaryEmail.tsx'

// Import shared email utilities
import { sharedEmailService, corsHeaders, createSuccessResponse, createErrorResponse } from '../_shared/email.ts'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

interface EmailRequest {
  template: 'welcome' | 'appraisal' | 'system' | 'account_welcome' | 'employee_invite' | 'import_summary'
  to: string | string[]
  data: any
  preview?: boolean
}

interface WelcomeEmailData {
  firstName: string
  lastName: string
  email: string
  jobTitle: string
  department?: string
  division?: string
  orgName: string
  verificationUrl?: string
  loginUrl: string
}

interface AppraisalEmailData {
  firstName: string
  orgName: string
  notificationType: 'reminder' | 'deadline' | 'completed' | 'assigned'
  appraisalTitle: string
  dueDate?: string
  actionUrl: string
  message?: string
}

interface SystemEmailData {
  recipientName: string
  orgName: string
  notificationType: 'import_success' | 'import_error' | 'system_alert' | 'maintenance'
  title: string
  message: string
  actionUrl?: string
  actionText?: string
  details?: {
    totalAttempted?: number
    successful?: number
    failed?: number
    errors?: Array<{ email: string; error: string }>
  }
}

interface AccountWelcomeEmailData {
  firstName: string
  lastName: string
  email: string
  verificationUrl?: string
  loginUrl: string
  supportEmail: string
}

interface EmployeeInviteEmailData {
  employeeName: string
  companyName: string
  inviteUrl: string
  adminName: string
  jobTitle: string
}

interface ImportSummaryEmailData {
  adminName: string
  companyName: string
  totalRecords: number
  successfulRecords: number
  failedRecords: number
  dashboardUrl: string
  hasErrors: boolean
}

async function renderTemplate(template: string, data: any): Promise<string> {
  try {
    switch (template) {
      case 'welcome':
        return await renderAsync(React.createElement(WelcomeEmail, data as WelcomeEmailData))
      
      case 'appraisal':
        return await renderAsync(React.createElement(AppraisalNotificationEmail, data as AppraisalEmailData))
      
      case 'system':
        return await renderAsync(React.createElement(SystemNotificationEmail, data as SystemEmailData))
      
      case 'account_welcome':
        return await renderAsync(React.createElement(AccountWelcomeEmail, data as AccountWelcomeEmailData))
      
      case 'employee_invite':
        return await renderAsync(React.createElement(EmployeeInviteEmail, data as EmployeeInviteEmailData))
      
      case 'import_summary':
        return await renderAsync(React.createElement(ImportSummaryEmail, data as ImportSummaryEmailData))
      
      default:
        throw new Error(`Unknown template: ${template}`)
    }
  } catch (error) {
    console.error(`Error rendering template ${template}:`, error)
    throw new Error(`Failed to render email template: ${error.message}`)
  }
}

function getEmailSubject(template: string, data: any): string {
  switch (template) {
    case 'welcome':
      const welcomeData = data as WelcomeEmailData
      return welcomeData.verificationUrl 
        ? `Welcome to ${welcomeData.orgName} - Verify Your Email`
        : `Welcome to ${welcomeData.orgName} - Get Started`
    
    case 'appraisal':
      const appraisalData = data as AppraisalEmailData
      switch (appraisalData.notificationType) {
        case 'reminder':
          return `Appraisal Reminder: ${appraisalData.appraisalTitle}`
        case 'deadline':
          return `Urgent: ${appraisalData.appraisalTitle} Deadline Approaching`
        case 'completed':
          return `Appraisal Completed: ${appraisalData.appraisalTitle}`
        case 'assigned':
          return `New Appraisal Assigned: ${appraisalData.appraisalTitle}`
        default:
          return `Appraisal Update: ${appraisalData.appraisalTitle}`
      }
    
    case 'system':
      const systemData = data as SystemEmailData
      return systemData.title
    
    case 'account_welcome':
      return 'Welcome to PJIAE 360 – Your Gateway to Seamless Performance Management'
    
    case 'employee_invite':
      const inviteData = data as EmployeeInviteEmailData
      return `Welcome to ${inviteData.companyName} - Complete your setup`
    
    case 'import_summary':
      const summaryData = data as ImportSummaryEmailData
      return `Employee import completed - ${summaryData.companyName}`
    
    default:
      return 'Notification from Your Performance Management System'
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  try {
    const { template, to, data, preview = false }: EmailRequest = await req.json()

    if (!template || !to || !data) {
      return createErrorResponse('Missing required fields: template, to, data', 400)
    }

    // Render the email template
    console.log(`Rendering email template: ${template}`)
    const html = await renderTemplate(template, data)
    
    // If preview mode, return the HTML
    if (preview) {
      return new Response(html, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      })
    }

    // Send the email using shared service
    const subject = getEmailSubject(template, data)
    const orgName = data.companyName || data.orgName || 'Performance Team'
    
    const component = React.createElement(
      template === 'welcome' ? WelcomeEmail :
      template === 'appraisal' ? AppraisalNotificationEmail :
      template === 'system' ? SystemNotificationEmail :
      template === 'account_welcome' ? AccountWelcomeEmail :
      template === 'employee_invite' ? EmployeeInviteEmail :
      template === 'import_summary' ? ImportSummaryEmail :
      WelcomeEmail, // fallback
      data
    )

    const result = await sharedEmailService.sendTemplatedEmail(component, to, subject, orgName)
    
    if (!result.success) {
      return createErrorResponse(result.error!, result.error!.includes('domain not verified') ? 403 : 500, result.details)
    }

    return createSuccessResponse({ 
      success: true, 
      id: result.id,
      message: `Email sent to ${Array.isArray(to) ? to.length : 1} recipient(s)` 
    })

  } catch (error: any) {
    console.error('Error in enhanced-email-service:', error)
    return createErrorResponse(error.message, 500)
  }
}

serve(handler)