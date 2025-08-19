import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import React from 'npm:react@18.3.1'

export interface EmailConfig {
  from: string
  to: string | string[]
  subject: string
  html: string
}

export interface EmailResult {
  success: boolean
  id?: string
  error?: string
  details?: any
}

export class SharedEmailService {
  private resend: Resend | null
  private isConfigured: boolean

  constructor() {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    this.resend = resendApiKey ? new Resend(resendApiKey) : null
    this.isConfigured = !!this.resend
  }

  /**
   * Get standardized from address based on environment
   */
  getFromAddress(orgName?: string): string {
    const isProduction = Deno.env.get('ENVIRONMENT') === 'production'
    const verifiedDomain = Deno.env.get('VERIFIED_EMAIL_DOMAIN') || 'resend.dev'
    const senderName = orgName || 'Performance Team'
    
    return isProduction 
      ? `${senderName} <noreply@${verifiedDomain}>`
      : `${senderName} <onboarding@resend.dev>`
  }

  /**
   * Render React Email template to HTML
   */
  async renderTemplate(component: React.ReactElement): Promise<string> {
    try {
      return await renderAsync(component)
    } catch (error) {
      console.error('Error rendering email template:', error)
      throw new Error(`Failed to render email template: ${error.message}`)
    }
  }

  /**
   * Send email with standardized error handling
   */
  async sendEmail(config: EmailConfig): Promise<EmailResult> {
    if (!this.isConfigured) {
      console.log('Skipping email - Resend not configured')
      return { success: true } // Don't fail operations if email isn't configured
    }

    try {
      const recipients = Array.isArray(config.to) ? config.to : [config.to]
      
      console.log(`Sending email to ${recipients.length} recipient(s): ${recipients.join(', ')}`)
      
      const emailResponse = await this.resend!.emails.send({
        from: config.from,
        to: recipients,
        subject: config.subject,
        html: config.html,
      })

      if (emailResponse.error) {
        console.error('Resend API error:', emailResponse.error)
        
        // Handle domain verification errors specifically
        if (emailResponse.error.message?.includes('verify a domain') || 
            emailResponse.error.message?.includes('own email address')) {
          
          return {
            success: false,
            error: 'Email domain not verified. Please verify your domain at https://resend.com/domains or use a verified email address.',
            details: emailResponse.error
          }
        }
        
        return {
          success: false,
          error: `Resend API error: ${emailResponse.error.message}`,
          details: emailResponse.error
        }
      }

      console.log('Email sent successfully:', emailResponse.data?.id)
      
      return {
        success: true,
        id: emailResponse.data?.id
      }
    } catch (error: any) {
      console.error('Error sending email:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Send email with React template
   */
  async sendTemplatedEmail(
    component: React.ReactElement,
    to: string | string[],
    subject: string,
    fromOrgName?: string
  ): Promise<EmailResult> {
    try {
      const html = await this.renderTemplate(component)
      const from = this.getFromAddress(fromOrgName)
      
      return await this.sendEmail({ from, to, subject, html })
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  isEmailConfigured(): boolean {
    return this.isConfigured
  }
}

// Export singleton instance
export const sharedEmailService = new SharedEmailService()

// CORS headers for edge functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Standardized success response
export function createSuccessResponse(data: any) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// Standardized error response
export function createErrorResponse(error: string, status: number = 500, details?: any) {
  return new Response(JSON.stringify({ 
    success: false, 
    error,
    ...(details && { details })
  }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}