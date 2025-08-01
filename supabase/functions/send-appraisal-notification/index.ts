import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AppraisalNotificationRequest {
  userId: string
  appraisalId: string
  notificationType: 'reminder' | 'deadline' | 'completed' | 'assigned'
  message?: string
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
    const { userId, appraisalId, notificationType, message }: AppraisalNotificationRequest = await req.json()

    if (!userId || !appraisalId || !notificationType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, appraisalId, notificationType' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user and appraisal details
    const [userResult, appraisalResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('first_name, email')
        .eq('user_id', userId)
        .single(),
      
      supabase
        .from('appraisals')
        .select('title, due_date, organization_id')
        .eq('id', appraisalId)
        .single()
    ])

    if (userResult.error || !userResult.data) {
      console.error('User not found:', userResult.error)
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (appraisalResult.error || !appraisalResult.data) {
      console.error('Appraisal not found:', appraisalResult.error)
      return new Response(
        JSON.stringify({ error: 'Appraisal not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get organization name
    const { data: orgData } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', appraisalResult.data.organization_id)
      .single()

    const orgName = orgData?.name || 'Your Organization'
    const user = userResult.data
    const appraisal = appraisalResult.data

    // Format due date
    const dueDate = appraisal.due_date 
      ? new Date(appraisal.due_date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : undefined

    // Prepare email data
    const emailData = {
      firstName: user.first_name || 'Team Member',
      orgName: orgName,
      notificationType: notificationType,
      appraisalTitle: appraisal.title,
      dueDate: dueDate,
      actionUrl: `${Deno.env.get('SUPABASE_URL')}/appraisals/${appraisalId}`,
      message: message
    }

    // Send email using enhanced email service
    const emailServiceUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/enhanced-email-service`
    
    const emailResponse = await fetch(emailServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
      },
      body: JSON.stringify({
        template: 'appraisal',
        to: user.email,
        data: emailData
      })
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json()
      throw new Error(`Email service error: ${errorData.error || emailResponse.statusText}`)
    }

    const emailResult = await emailResponse.json()
    console.log(`Appraisal notification sent to ${user.email}:`, emailResult.id)

    // Log the notification in the database
    await supabase
      .from('notification_log')
      .insert({
        user_id: userId,
        type: 'appraisal_notification',
        title: `Appraisal ${notificationType}: ${appraisal.title}`,
        message: message || `Your appraisal "${appraisal.title}" requires attention.`,
        sent_via: 'email',
        metadata: {
          appraisal_id: appraisalId,
          notification_type: notificationType,
          email_id: emailResult.id
        }
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Appraisal notification sent successfully',
        emailId: emailResult.id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error: any) {
    console.error('Error in send-appraisal-notification:', error)
    
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