import { Resend } from 'https://esm.sh/resend@2.0.0'
import type { ImportRequest } from './types.ts'
import { sharedEmailService } from '../_shared/email.ts'

// Initialize Resend with graceful handling of missing API key
const resendApiKey = Deno.env.get('RESEND_API_KEY')
const resend = resendApiKey ? new Resend(resendApiKey) : null

// Feature flag for fallback behavior
const EMAIL_FALLBACK_ENABLED = Deno.env.get('EMAIL_FALLBACK_ENABLED') !== 'false'

export interface EmailContext {
  orgName: string
  originUrl?: string
}

export interface EmailResult {
  success: boolean
  error?: string
}

// Email templates
const createWelcomeEmailHTML = (
  person: ImportRequest['people'][0], 
  context: EmailContext,
  verificationToken?: string | null
): string => {
  const { orgName, originUrl } = context
  const verificationUrl = verificationToken 
    ? `${originUrl || 'http://localhost:3000'}/verify-email?token=${verificationToken}`
    : null;
  
  return `
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
      
      ${verificationUrl ? `
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #856404; margin-top: 0;">🔐 Important: Verify Your Email Address</h3>
          <p style="color: #856404;">For security purposes, you must verify your email address before accessing the platform.</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
               Verify Email Address
            </a>
          </div>
          <p style="font-size: 14px; color: #856404;">
            This verification link will expire in 24 hours. If you didn't request this, please ignore this email.
          </p>
        </div>
      ` : `
        <p>To access your account, please check your email for a sign-in link from Supabase, or visit our platform and use the "Forgot Password" option to set up your password.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${originUrl || 'http://localhost:3000'}" 
             style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Access Platform
          </a>
        </div>
      `}
      
      <p>If you have any questions, please contact your administrator.</p>
      
      <p>Best regards,<br>The ${orgName} Team</p>
      
      <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">
        This is an automated security email. Please do not reply.<br>
        If you didn't expect this email, please contact your administrator immediately.
      </p>
    </div>
  `
}

// Enhanced email sending service with React Email templates
export class EmailService {
  private isConfigured: boolean
  private enhancedServiceUrl: string
  
  constructor() {
    this.isConfigured = !!resend
    this.enhancedServiceUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/enhanced-email-service`
  }

  async sendWelcomeEmail(
    person: ImportRequest['people'][0], 
    context: EmailContext,
    verificationToken?: string | null
  ): Promise<EmailResult> {
    if (!this.isConfigured) {
      console.log(`Skipping email for ${person.email} - Resend not configured`)
      return { success: true } // Don't fail import if email isn't configured
    }

    try {
      // Use shared email service for direct sending
      const emailData = {
        firstName: person.firstName,
        lastName: person.lastName,
        email: person.email,
        jobTitle: person.jobTitle,
        department: person.department,
        division: person.division,
        orgName: context.orgName,
        verificationUrl: verificationToken 
          ? `${context.originUrl || 'http://localhost:3000'}/verify-email?token=${verificationToken}`
          : undefined,
        loginUrl: context.originUrl || 'http://localhost:3000'
      }

      // Try enhanced email service via HTTP first (backwards compatibility)
      try {
        const response = await fetch(this.enhancedServiceUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
          },
          body: JSON.stringify({
            template: 'welcome',
            to: person.email,
            data: emailData
          })
        })

        if (response.ok) {
          const result = await response.json()
          console.log(`Enhanced welcome email sent to ${person.email}:`, result.id)
          return { success: true }
        } else {
          throw new Error(`Enhanced service HTTP error: ${response.status}`)
        }
      } catch (enhancedError) {
        console.warn(`Enhanced service failed for ${person.email}, trying shared service:`, enhancedError)
        
        // Use shared email service directly
        const { default: WelcomeEmail } = await import('../_templates/WelcomeEmail.tsx')
        const React = await import('npm:react@18.3.1')
        
        const component = React.createElement(WelcomeEmail, emailData)
        const subject = verificationToken 
          ? `Welcome to ${context.orgName} - Verify Your Email`
          : `Welcome to ${context.orgName} - Get Started`
        
        const result = await sharedEmailService.sendTemplatedEmail(component, person.email, subject, context.orgName)
        
        if (result.success) {
          console.log(`Shared service email sent to ${person.email}:`, result.id)
          return { success: true }
        } else {
          throw new Error(`Shared service error: ${result.error}`)
        }
      }
    } catch (error) {
      console.error(`Error sending email to ${person.email}:`, error)
      
      // Fallback to legacy HTML email only if enabled
      if (EMAIL_FALLBACK_ENABLED) {
        try {
          const emailHTML = createWelcomeEmailHTML(person, context, verificationToken)
          const subject = verificationToken 
            ? `Welcome to ${context.orgName} - Verify Your Email`
            : `Welcome to ${context.orgName} - Complete Your Account Setup`;
          
          const fromAddress = sharedEmailService.getFromAddress(context.orgName)

          await resend!.emails.send({
            from: fromAddress,
            to: [person.email],
            subject: subject,
            html: emailHTML
          })
          
          console.log(`Fallback email sent to ${person.email}`)
          return { success: true }
        } catch (fallbackError) {
          console.error(`Fallback email also failed for ${person.email}:`, fallbackError)
          return { success: false, error: fallbackError.message }
        }
      } else {
        return { success: false, error: error.message }
      }
    }
  }

  async sendBatchWelcomeEmails(
    people: ImportRequest['people'], 
    context: EmailContext,
    verificationTokens?: Record<string, string | null>
  ): Promise<Array<{ email: string; result: EmailResult }>> {
    const results: Array<{ email: string; result: EmailResult }> = []
    
    // Send emails sequentially to avoid rate limiting
    for (const person of people) {
      const verificationToken = verificationTokens?.[person.email] || null;
      const result = await this.sendWelcomeEmail(person, context, verificationToken)
      results.push({ email: person.email, result })
      
      // Small delay between emails to be respectful to email service
      if (people.length > 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    return results
  }

  async sendErrorNotification(
    adminEmail: string, 
    orgName: string, 
    errorDetails: { 
      totalAttempted: number
      successful: number
      failed: number
      errors: Array<{ email: string; error: string }>
    }
  ): Promise<EmailResult> {
    if (!this.isConfigured) {
      return { success: true }
    }

    try {
      // Use shared email service for system notifications
      const emailData = {
        recipientName: 'Administrator',
        orgName: orgName,
        notificationType: errorDetails.failed > 0 ? 'import_error' : 'import_success',
        title: `Import Status Report - ${orgName}`,
        message: `Your employee import for ${orgName} has completed with ${errorDetails.successful} successful and ${errorDetails.failed} failed imports.`,
        actionUrl: `${Deno.env.get('SUPABASE_URL')}/dashboard/admin/employees`,
        actionText: 'View Employee Dashboard',
        details: errorDetails
      }

      // Try enhanced email service via HTTP first (backwards compatibility)
      try {
        const response = await fetch(this.enhancedServiceUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
          },
          body: JSON.stringify({
            template: 'system',
            to: adminEmail,
            data: emailData
          })
        })

        if (response.ok) {
          const result = await response.json()
          console.log(`Enhanced system notification sent to ${adminEmail}:`, result.id)
          return { success: true }
        } else {
          throw new Error(`Enhanced service HTTP error: ${response.status}`)
        }
      } catch (enhancedError) {
        console.warn(`Enhanced service failed for notification to ${adminEmail}, trying shared service:`, enhancedError)
        
        // Use shared email service directly
        const { default: SystemNotificationEmail } = await import('../_templates/SystemNotificationEmail.tsx')
        const React = await import('npm:react@18.3.1')
        
        const component = React.createElement(SystemNotificationEmail, emailData)
        const subject = `Import Status Report - ${orgName}`
        
        const result = await sharedEmailService.sendTemplatedEmail(component, adminEmail, subject, orgName)
        
        if (result.success) {
          console.log(`Shared service notification sent to ${adminEmail}:`, result.id)
          return { success: true }
        } else {
          throw new Error(`Shared service error: ${result.error}`)
        }
      }
    } catch (error) {
      console.error('Error sending notification email:', error)
      
      // Fallback to legacy HTML email only if enabled
      if (EMAIL_FALLBACK_ENABLED) {
        try {
          const errorHTML = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #dc3545;">Import Status Report</h1>
              
              <p>Your employee import for ${orgName} has completed with the following results:</p>
              
              <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <strong>Summary:</strong><br>
                Total Attempted: ${errorDetails.totalAttempted}<br>
                Successful: ${errorDetails.successful}<br>
                Failed: ${errorDetails.failed}
              </div>
              
              ${errorDetails.errors.length > 0 ? `
                <h3>Errors:</h3>
                <ul>
                  ${errorDetails.errors.map(error => `
                    <li><strong>${error.email}:</strong> ${error.error}</li>
                  `).join('')}
                </ul>
              ` : ''}
              
              <p>Please review the failed imports and contact support if you need assistance.</p>
            </div>
          `
          
          const fromAddress = sharedEmailService.getFromAddress('System')

          await resend!.emails.send({
            from: fromAddress,
            to: [adminEmail],
            subject: `Import Status Report - ${orgName}`,
            html: errorHTML
          })
          
          console.log(`Fallback notification email sent to ${adminEmail}`)
          return { success: true }
        } catch (fallbackError) {
          console.error('Fallback notification email also failed:', fallbackError)
          return { success: false, error: fallbackError.message }
        }
      } else {
        return { success: false, error: error.message }
      }
    }
  }

  isEmailConfigured(): boolean {
    return this.isConfigured
  }
}

// Export singleton instance
export const emailService = new EmailService()