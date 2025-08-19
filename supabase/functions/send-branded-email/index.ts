import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import React from 'npm:react@18.3.1'
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { sharedEmailService, corsHeaders, createSuccessResponse, createErrorResponse } from '../_shared/email.ts'
import EmployeeInviteEmail from '../_templates/EmployeeInviteEmail.tsx'
import ImportSummaryEmail from '../_templates/ImportSummaryEmail.tsx'

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface EmailRequest {
  type: 'employee_invite' | 'import_summary';
  to: string;
  correlationId?: string;
  data: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Log deprecation warning
  console.warn('⚠️ DEPRECATED: send-branded-email function is deprecated. Use enhanced-email-service instead.')
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to, correlationId, data }: EmailRequest = await req.json();
    
    console.log(`📧 Sending ${type} email to ${to} (via deprecated service)`, { correlationId });
    
    let component: React.ReactElement;
    let subject: string;
    
    // Generate email content based on type using shared service
    switch (type) {
      case 'employee_invite':
        component = React.createElement(EmployeeInviteEmail, {
          employeeName: data.employeeName,
          companyName: data.companyName,
          inviteUrl: data.inviteUrl,
          adminName: data.adminName,
          jobTitle: data.jobTitle,
        });
        subject = `Welcome to ${data.companyName} - Complete your setup`;
        break;
        
      case 'import_summary':
        component = React.createElement(ImportSummaryEmail, {
          adminName: data.adminName,
          companyName: data.companyName,
          totalRecords: data.totalRecords,
          successfulRecords: data.successfulRecords,
          failedRecords: data.failedRecords,
          dashboardUrl: data.dashboardUrl,
          hasErrors: data.hasErrors,
        });
        subject = `Employee import completed - ${data.companyName}`;
        break;
        
      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    // Send email using shared service
    const result = await sharedEmailService.sendTemplatedEmail(
      component, 
      to, 
      subject, 
      data.companyName || "HR Platform"
    );

    if (!result.success) {
      return createErrorResponse(result.error!, 500, result.details);
    }

    console.log("✅ Email sent successfully via shared service:", result.id);

    // Log email send to database if invitation-related
    if (type === 'employee_invite' && data.invitationId) {
      await supabase
        .from('invitation_sends')
        .insert({
          invitation_id: data.invitationId,
          correlation_id: correlationId,
          email_type: 'initial',
          status: 'sent',
          provider_message_id: result.id,
        });
    }

    return createSuccessResponse({ 
      success: true, 
      messageId: result.id,
      correlationId 
    });

  } catch (error: any) {
    console.error("❌ Error sending email:", error);
    return createErrorResponse(error.message, 500);
  }
};

serve(handler);