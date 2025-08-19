import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConfirmMembershipRequest {
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }

  try {
    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { token }: ConfirmMembershipRequest = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('🔑 Validating verification token:', token.substring(0, 8) + '...');

    // Validate the token using the database function
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .rpc('validate_verification_token', { _token: token });

    if (tokenError) {
      console.error('❌ Token validation error:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Failed to validate token' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    const tokenResult = tokenData?.[0];
    if (!tokenResult?.is_valid) {
      console.log('❌ Invalid token:', tokenResult?.error_message);
      return new Response(
        JSON.stringify({ 
          error: tokenResult?.error_message || 'Invalid verification token',
          code: 'INVALID_TOKEN'
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('✅ Token validated successfully for user:', tokenResult.user_id);

    // Activate the user's membership
    const { data: activationData, error: activationError } = await supabaseAdmin
      .rpc('activate_user_membership', {
        _user_id: tokenResult.user_id,
        _organization_id: tokenResult.organization_id,
        _intended_role: tokenResult.intended_role
      });

    if (activationError) {
      console.error('❌ Membership activation error:', activationError);
      return new Response(
        JSON.stringify({ error: 'Failed to activate membership' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    if (!activationData?.success) {
      console.error('❌ Membership activation failed:', activationData?.error);
      return new Response(
        JSON.stringify({ error: activationData?.error || 'Failed to activate membership' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Check onboarding status
    const { data: onboardingData, error: onboardingError } = await supabaseAdmin
      .rpc('check_onboarding_status', { _user_id: tokenResult.user_id });

    if (onboardingError) {
      console.error('❌ Onboarding status check error:', onboardingError);
    }

    const onboardingStatus = onboardingData || { completed: false, is_admin: false };

    console.log('🎉 Membership activated successfully:', {
      user_id: tokenResult.user_id,
      role: tokenResult.intended_role,
      onboarding_completed: onboardingStatus.completed,
      is_admin: onboardingStatus.is_admin
    });

    // Generate authentication session for the user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin
      .generateLink({
        type: 'magiclink',
        email: tokenResult.email,
        options: {
          redirectTo: `${Deno.env.get('FRONTEND_URL') || 'https://pjiae360.com'}/auth/confirmed?success=true`
        }
      });

    let authUrl = null;
    if (authData?.properties?.action_link && !authError) {
      authUrl = authData.properties.action_link;
      console.log('🔗 Generated authentication link');
    } else {
      console.warn('⚠️ Failed to generate auth link:', authError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: tokenResult.user_id,
        organization_id: tokenResult.organization_id,
        role: tokenResult.intended_role,
        onboarding_completed: onboardingStatus.completed,
        is_admin: onboardingStatus.is_admin,
        auth_url: authUrl,
        redirect_to: onboardingStatus.completed 
          ? '/dashboard' 
          : (onboardingStatus.is_admin ? '/onboarding' : '/dashboard')
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('💥 Confirm membership error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
};

serve(handler);