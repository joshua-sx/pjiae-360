import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';
import { corsHeaders, createResponse, createErrorResponse, handleOptions } from '../_shared/security-headers.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface AuditLogRequest {
  eventType: string;
  userId?: string;
  organizationId?: string;
  eventDetails?: Record<string, any>;
  success?: boolean;
}

async function handler(req: Request): Promise<Response> {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }

  if (req.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }

  try {
    const { eventType, userId, organizationId, eventDetails, success = true }: AuditLogRequest = await req.json();

    if (!eventType) {
      return createErrorResponse('Event type is required', 400);
    }

    // Extract client information and derive user context from JWT
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Get user ID from JWT token for server-side verification
    const authHeader = req.headers.get('authorization');
    let derivedUserId = null;
    let derivedOrgId = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (user) {
          derivedUserId = user.id;
          // Get user's organization ID from employee_info
          const { data: empData } = await supabase
            .from('employee_info')
            .select('organization_id')
            .eq('user_id', user.id)
            .single();
          derivedOrgId = empData?.organization_id || null;
        }
      } catch (error) {
        console.warn('Failed to derive user context from JWT:', error);
      }
    }

    // Log security event using the secure function with server-derived context
    const { data, error } = await supabase.rpc('log_security_event_server', {
      _event_type: eventType,
      _user_id: userId || derivedUserId || null,
      _organization_id: organizationId || derivedOrgId || null,
      _event_details: {
        ...eventDetails,
        timestamp: new Date().toISOString(),
        client_ip: clientIP,
        source: 'edge_function'
      },
      _success: success,
      _ip_address: clientIP,
      _user_agent: userAgent
    });

    if (error) {
      console.error('Failed to log security event:', error);
      return createErrorResponse('Failed to log security event', 500);
    }

    return createResponse({ 
      success: true, 
      logId: data,
      message: 'Security event logged successfully' 
    });

  } catch (error) {
    console.error('Error in secure-audit-log:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

Deno.serve(handler);