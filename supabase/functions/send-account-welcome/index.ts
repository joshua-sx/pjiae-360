import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AccountWelcomeRequest {
  email: string
  firstName: string
  lastName: string
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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { email, firstName, lastName }: AccountWelcomeRequest = await req.json()

    if (!email || !firstName || !lastName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, firstName, lastName' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Sending account welcome email to: ${email}`)

    // Call the enhanced email service
    const emailResponse = await supabase.functions.invoke('enhanced-email-service', {
      body: {
        template: 'account_welcome',
        to: email,
        data: {
          firstName,
          lastName,
          email,
          verificationUrl: `https://567bec84-bf31-4c4f-a226-9795b193895b.lovableproject.com/verify-email`,
          loginUrl: `https://567bec84-bf31-4c4f-a226-9795b193895b.lovableproject.com/log-in`,
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

      return new Response(
        JSON.stringify(payload),
        {
          status: domainIssue ? 403 : 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Welcome email sent successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Welcome email sent successfully' 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error: any) {
    console.error('Error in send-account-welcome:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

serve(handler)