import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import React from 'npm:react@18.3.1'
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { EmployeeInviteEmail } from './_templates/employee-invite.tsx'
import { ImportSummaryEmail } from './_templates/import-summary.tsx'

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'employee_invite' | 'import_summary';
  to: string;
  correlationId?: string;
  data: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to, correlationId, data }: EmailRequest = await req.json();
    
    console.log(`📧 Sending ${type} email to ${to}`, { correlationId });
    
    let html: string;
    let subject: string;
    let fromEmail: string = "noreply@lovable.app";
    let fromName: string = data.companyName || "HR Platform";
    
    // Generate email content based on type
    switch (type) {
      case 'employee_invite':
        html = await renderAsync(
          React.createElement(EmployeeInviteEmail, {
            employeeName: data.employeeName,
            companyName: data.companyName,
            inviteUrl: data.inviteUrl,
            adminName: data.adminName,
            jobTitle: data.jobTitle,
          })
        );
        subject = `Welcome to ${data.companyName} - Complete your setup`;
        break;
        
      case 'import_summary':
        html = await renderAsync(
          React.createElement(ImportSummaryEmail, {
            adminName: data.adminName,
            companyName: data.companyName,
            totalRecords: data.totalRecords,
            successfulRecords: data.successfulRecords,
            failedRecords: data.failedRecords,
            dashboardUrl: data.dashboardUrl,
            hasErrors: data.hasErrors,
          })
        );
        subject = `Employee import completed - ${data.companyName}`;
        break;
        
      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    // Send email with Resend
    const emailResponse = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject,
      html,
    });

    console.log("✅ Email sent successfully:", emailResponse);

    // Log email send to database if invitation-related
    if (type === 'employee_invite' && data.invitationId) {
      await supabase
        .from('invitation_sends')
        .insert({
          invitation_id: data.invitationId,
          correlation_id: correlationId,
          email_type: 'initial',
          status: 'sent',
          provider_message_id: emailResponse.data?.id,
        });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id,
      correlationId 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("❌ Error sending email:", error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);