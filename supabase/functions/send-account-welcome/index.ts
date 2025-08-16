import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0'
import { createResponse, createErrorResponse, handleOptions } from "../_shared/security-headers.ts";

interface AccountWelcomeRequest {
  email: string
  firstName: string
  lastName: string
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleOptions()
  }

  if (req.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405)
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { email, firstName, lastName }: AccountWelcomeRequest = await req.json()

    if (!email || !firstName || !lastName) {
      return createErrorResponse('Missing required fields: email, firstName, lastName', 400)
    }

    console.log(`Sending account welcome email to: ${email}`)

    // Get the frontend URL from environment, fallback to production domain
    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://pjiae360.com'

    // Generate verification link for the user
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email,
      options: {
        redirectTo: `${frontendUrl}/verify-email`
      }
    })

    let verificationUrl = `${frontendUrl}/verify-email?email=${encodeURIComponent(email)}`
    
    if (linkData?.properties?.action_link && !linkError) {
      verificationUrl = linkData.properties.action_link
      console.log('Generated verification link successfully')
    } else {
      console.warn('Failed to generate verification link, using fallback:', linkError)
    }

    // Call the enhanced email service
    const emailResponse = await supabase.functions.invoke('enhanced-email-service', {
      body: {
        template: 'account_welcome',
        to: email,
        data: {
          firstName,
          lastName,
          email,
          verificationUrl,
          loginUrl: `${frontendUrl}/log-in`,
          supportEmail: 'support@pjiae360.com'
        }
      }
    })

    if (emailResponse.error) {
      console.error('Failed to send welcome email:', emailResponse.error)

      // Try to map known Resend/domain verification issues to a 403 for clarity
      const msg = emailResponse.error.message || 'Unknown error from enhanced-email-service'
      const domainIssue = msg.includes('verify a domain') || msg.includes('own email address') || msg.includes('domain not verified')

      const payload = {
        success: false,
        error: 'Failed to send welcome email',
        details: msg,
      }

      return createErrorResponse(payload.error, domainIssue ? 403 : 500)
    }

    console.log('Welcome email sent successfully')

    return createResponse({ 
      success: true, 
      message: 'Welcome email sent successfully' 
    })

  } catch (error: any) {
    console.error('Error in send-account-welcome:', error)
    
    return createErrorResponse(error.message)
  }
}

serve(handler)