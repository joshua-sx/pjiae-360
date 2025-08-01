import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import React from 'npm:react@18.3.1'

// Import email templates
import WelcomeEmail from '../_templates/WelcomeEmail.tsx'
import AppraisalNotificationEmail from '../_templates/AppraisalNotificationEmail.tsx'
import SystemNotificationEmail from '../_templates/SystemNotificationEmail.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  template: 'welcome' | 'appraisal' | 'system'
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

async function renderTemplate(template: string, data: any): Promise<string> {
  try {
    switch (template) {
      case 'welcome':
        return await renderAsync(React.createElement(WelcomeEmail, data as WelcomeEmailData))
      
      case 'appraisal':
        return await renderAsync(React.createElement(AppraisalNotificationEmail, data as AppraisalEmailData))
      
      case 'system':
        return await renderAsync(React.createElement(SystemNotificationEmail, data as SystemEmailData))
      
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
      return new Response(
        JSON.stringify({ error: 'Missing required fields: template, to, data' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
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

    // Send the email
    const subject = getEmailSubject(template, data)
    const recipients = Array.isArray(to) ? to : [to]
    
    console.log(`Sending email to ${recipients.length} recipient(s): ${recipients.join(', ')}`)
    
    const emailResponse = await resend.emails.send({
      from: 'Performance Team <onboarding@resend.dev>',
      to: recipients,
      subject: subject,
      html: html,
    })

    console.log('Email sent successfully:', emailResponse)

    return new Response(
      JSON.stringify({ 
        success: true, 
        id: emailResponse.data?.id,
        message: `Email sent to ${recipients.length} recipient(s)` 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error: any) {
    console.error('Error in enhanced-email-service:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

serve(handler)