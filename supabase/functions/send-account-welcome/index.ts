import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0'
import { createResponse, createErrorResponse, handleOptions } from "../_shared/security-headers.ts";

interface AccountWelcomeRequest {
  email: string
  firstName: string
  lastName: string
  organizationId?: string
  intendedRole?: string
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

    const { email, firstName, lastName, organizationId, intendedRole }: AccountWelcomeRequest = await req.json()

    if (!email || !firstName || !lastName) {
      return createErrorResponse('Missing required fields: email, firstName, lastName', 400)
    }

    console.log(`🚀 Sending account welcome email to: ${email}`)

    // Get the frontend URL from environment, fallback to production domain
    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://pjiae360.com'

    // Get user ID from email - for invites, the user might not exist yet
    const { data: userData, error: userError } = await supabase.auth.admin
      .listUsers();
    
    const user = userData?.users?.find(u => u.email === email);
    
    // For employee invitations, the user might not exist yet - that's OK
    if (!user && !organizationId) {
      console.error('❌ User not found for email and no organization context:', email);
      return createErrorResponse('User not found for direct welcome email', 404)
    }
    
    console.log(user ? `✅ Found existing user: ${email}` : `📧 Sending invite email for future user: ${email}`)

    let verificationUrl = `${frontendUrl}/verify-email?email=${encodeURIComponent(email)}`;

    // Generate magic link for seamless sign-in
    try {
      const redirectTo = organizationId 
        ? `${frontendUrl}/auth/confirm?organizationId=${organizationId}&intendedRole=${encodeURIComponent(intendedRole || 'employee')}`
        : `${frontendUrl}/verify-email`;

      console.log(`🔗 Generating magic link with redirect to: ${redirectTo}`);

      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
        options: {
          redirectTo: redirectTo
        }
      });

      if (linkError) {
        console.warn('⚠️ Failed to generate magic link:', linkError);
        // Fall back to basic verification URL
      } else if (linkData?.properties?.action_link) {
        verificationUrl = linkData.properties.action_link;
        console.log('✅ Generated magic link successfully');
      }
    } catch (error) {
      console.warn('⚠️ Error generating magic link:', error);
    }

    // Create verification token for organization context (as backup/additional data)
    if (organizationId) {
      try {
        const { data: tokenData, error: tokenError } = await supabase
          .from('verification_tokens')
          .insert({
            user_id: user?.id || null, // Allow null for invited users who don't exist yet
            organization_id: organizationId,
            email: email,
            intended_role: (intendedRole as any) || 'employee',
            ip_address: req.headers.get('x-forwarded-for') || null,
            user_agent: req.headers.get('user-agent') || null
          })
          .select('token')
          .single();

        if (tokenError) {
          console.warn('⚠️ Failed to create verification token:', tokenError);
        } else {
          console.log('✅ Created verification token for organized signup');
        }
      } catch (error) {
        console.warn('⚠️ Error creating verification token:', error);
      }
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