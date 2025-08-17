import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExportRow {
  table_name: string;
  record_count: number;
  data_json: any;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Set the auth context
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    const { organizationId } = await req.json();

    // Set auth for subsequent requests
    await supabaseClient.auth.setSession({
      access_token: authHeader.replace('Bearer ', ''),
      refresh_token: '',
    });

    console.log(`Initiating tenant export for org: ${organizationId}, user: ${user.id}`);

    // Call the secure export function
    const { data: exportData, error: exportError } = await supabaseClient
      .rpc('export_tenant_data', { 
        _org_id: organizationId 
      });

    if (exportError) {
      console.error('Export error:', exportError);
      
      // Log security violation if it's a cross-org attempt
      if (exportError.message?.includes('Cannot export data for different organization')) {
        await supabaseClient.rpc('log_security_event_server', {
          _event_type: 'tenant_export_violation_via_edge_function',
          _user_id: user.id,
          _event_details: {
            attempted_org_id: organizationId,
            error: exportError.message,
            ip_address: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')
          },
          _success: false
        });
      }

      return new Response(
        JSON.stringify({ 
          error: 'Export failed', 
          details: exportError.message 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!exportData || !Array.isArray(exportData)) {
      return new Response(
        JSON.stringify({ error: 'No data returned from export function' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Structure the export data for download
    const exportResult = {
      export_timestamp: new Date().toISOString(),
      organization_id: organizationId,
      exported_by: user.id,
      tables: {} as Record<string, any>
    };

    exportData.forEach((row: ExportRow) => {
      exportResult.tables[row.table_name] = {
        record_count: row.record_count,
        data: row.data_json
      };
    });

    console.log(`Export completed for org: ${organizationId}, tables: ${Object.keys(exportResult.tables).join(', ')}`);

    return new Response(
      JSON.stringify(exportResult, null, 2),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="tenant-export-${organizationId}-${Date.now()}.json"`
        },
      }
    );

  } catch (error) {
    console.error('Tenant export error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});