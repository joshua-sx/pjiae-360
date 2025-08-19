import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PendingInvitation {
  id: string;
  employee_id: string;
  organization_id: string;
  email: string;
  created_at: string;
  status: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Starting invite reminders job...');

    // Find pending invitations that haven't been accepted
    const { data: pendingInvitations, error: inviteError } = await supabase
      .from('employee_invitations')
      .select('id, employee_id, organization_id, email, created_at, status')
      .eq('status', 'pending')
      .lt('expires_at', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()); // Not expiring within 24h

    if (inviteError) {
      console.error('❌ Error fetching pending invitations:', inviteError);
      throw inviteError;
    }

    if (!pendingInvitations || pendingInvitations.length === 0) {
      console.log('✅ No pending invitations found');
      return new Response(JSON.stringify({ message: 'No pending invitations to process' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`📧 Found ${pendingInvitations.length} pending invitations`);

    let remindersSent = 0;
    let remindersSkipped = 0;

    for (const invitation of pendingInvitations) {
      const daysSinceCreated = Math.floor((Date.now() - new Date(invitation.created_at).getTime()) / (1000 * 60 * 60 * 24));
      
      // Define reminder schedule: 3, 7, 14 days
      const reminderDays = [3, 7, 14];
      let shouldSendReminder = false;
      let reminderType = '';

      for (const reminderDay of reminderDays) {
        if (daysSinceCreated >= reminderDay) {
          // Check if we already sent this specific reminder
          const { data: existingSend, error: sendError } = await supabase
            .from('invitation_sends')
            .select('id')
            .eq('invitation_id', invitation.id)
            .eq('email_type', `reminder_${reminderDay}d`)
            .limit(1);

          if (sendError) {
            console.error(`❌ Error checking existing sends for invitation ${invitation.id}:`, sendError);
            continue;
          }

          if (!existingSend || existingSend.length === 0) {
            shouldSendReminder = true;
            reminderType = `reminder_${reminderDay}d`;
            break;
          }
        }
      }

      if (!shouldSendReminder) {
        console.log(`⏭️  Skipping invitation ${invitation.id} - no reminder needed`);
        remindersSkipped++;
        continue;
      }

      try {
        // Get the invitation token for the reminder email
        const { data: tokenData, error: tokenError } = await supabase
          .from('employee_invitations')
          .select('token')
          .eq('id', invitation.id)
          .single();

        if (tokenError || !tokenData) {
          console.error(`❌ Error getting token for invitation ${invitation.id}:`, tokenError);
          continue;
        }

        // Send reminder email via send-branded-email function
        const emailResponse = await supabase.functions.invoke('send-branded-email', {
          body: {
            type: 'employee_invite_reminder',
            to: invitation.email,
            data: {
              invitation_token: tokenData.token,
              organization_id: invitation.organization_id,
              reminder_type: reminderType,
              days_since_invite: daysSinceCreated
            }
          }
        });

        if (emailResponse.error) {
          console.error(`❌ Error sending reminder email for invitation ${invitation.id}:`, emailResponse.error);
          
          // Log failed send
          await supabase.from('invitation_sends').insert({
            invitation_id: invitation.id,
            status: 'failed',
            email_type: reminderType,
            error_message: emailResponse.error.message || 'Unknown error'
          });
          continue;
        }

        // Log successful send
        await supabase.from('invitation_sends').insert({
          invitation_id: invitation.id,
          status: 'sent',
          email_type: reminderType,
          provider_message_id: emailResponse.data?.message_id || null
        });

        console.log(`✅ Reminder sent for invitation ${invitation.id} (${reminderType})`);
        remindersSent++;

      } catch (error) {
        console.error(`❌ Error processing invitation ${invitation.id}:`, error);
        
        // Log error
        await supabase.from('invitation_sends').insert({
          invitation_id: invitation.id,
          status: 'failed',
          email_type: reminderType,
          error_message: error.message || 'Unknown error'
        });
      }
    }

    const result = {
      processed: pendingInvitations.length,
      remindersSent,
      remindersSkipped,
      timestamp: new Date().toISOString()
    };

    console.log('✅ Invite reminders job completed:', result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Invite reminders job failed:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);