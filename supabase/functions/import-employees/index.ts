import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { validateRequestSecurity, validateImportRequest } from './validation.ts';
import { DatabaseService } from './database-service.ts';
import { EmailService } from './email-service.ts';
import { ImportRequest, ImportResult, SecurityContext, DatabaseContext } from './types.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const emailService = new EmailService();
const activeImports = new Set<string>();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const createSecureErrorResponse = (message: string, status: number = 400, correlationId?: string) => {
  console.error(`❌ [${correlationId}] Error:`, message);
  return new Response(JSON.stringify({ 
    success: false, 
    message,
    correlationId 
  }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const securityContext: SecurityContext = {
    userId: '',
    clientIP: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
    startTime: Date.now()
  };

  const correlationId = crypto.randomUUID();
  console.log(`🚀 [${correlationId}] Starting import request from IP: ${securityContext.clientIP}`);

  // Implement request timeout
  const timeoutSignal = AbortSignal.timeout(300000); // 5 minutes

  try {
    // Security validation
    const securityValidation = await validateRequestSecurity(req, securityContext);
    if (!securityValidation.valid) {
      return createSecureErrorResponse(securityValidation.error!, 403, correlationId);
    }

    // Get authenticated user
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return createSecureErrorResponse('Authorization header required', 401, correlationId);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error(`🚫 [${correlationId}] Authentication failed:`, authError);
      return createSecureErrorResponse('Authentication failed', 401, correlationId);
    }

    securityContext.userId = user.id;
    console.log(`👤 [${correlationId}] Authenticated user: ${user.id}`);

    // Parse and validate request
    const requestBody = await req.json();
    const validationResult = validateImportRequest(requestBody);
    if (!validationResult.valid) {
      return createSecureErrorResponse(validationResult.error!, 400, correlationId);
    }

    const importRequest: ImportRequest = requestBody;

    // Validate user access to organization
    const { data: employeeInfo } = await supabase
      .from('employee_info')
      .select('organization_id, id')
      .eq('user_id', user.id)
      .eq('organization_id', importRequest.organizationId)
      .single();

    if (!employeeInfo) {
      console.error(`🚫 [${correlationId}] User ${user.id} not authorized for org ${importRequest.organizationId}`);
      return createSecureErrorResponse('User not authorized for this organization', 403, correlationId);
    }

    // Prevent concurrent imports for same organization
    const orgLockKey = `import_${importRequest.organizationId}`;
    if (activeImports.has(orgLockKey)) {
      return createSecureErrorResponse('Import already in progress for this organization', 409, correlationId);
    }

    activeImports.add(orgLockKey);
    console.log(`🔒 [${correlationId}] Acquired import lock for org: ${importRequest.organizationId}`);

    try {
      // Initialize database service
      const dbService = new DatabaseService(supabase);
      const dbContext: DatabaseContext = await dbService.initializeContext(importRequest.organizationId);

      // Create import batch record
      const { data: batchRecord, error: batchError } = await supabase
        .from('import_batches')
        .insert({
          organization_id: importRequest.organizationId,
          uploaded_by: user.id,
          total_records: importRequest.people.length,
          status: 'processing',
          correlation_id: correlationId,
          started_at: new Date().toISOString(),
          detailed_status: { phase: 'starting', processed: 0 }
        })
        .select('id')
        .single();

      if (batchError || !batchRecord) {
        throw new Error(`Failed to create import batch: ${batchError?.message}`);
      }

      const batchId = batchRecord.id;
      console.log(`📋 [${correlationId}] Created import batch: ${batchId}`);

      // Process employees in batches
      const batchSize = 10;
      const results: ImportResult = {
        success: true,
        message: 'Import completed successfully',
        imported: 0,
        failed: 0,
        errors: [],
        organizationId: importRequest.organizationId,
        successDetails: []
      };

      for (let i = 0; i < importRequest.people.length; i += batchSize) {
        const batch = importRequest.people.slice(i, i + batchSize);
        console.log(`⚙️ [${correlationId}] Processing batch ${Math.floor(i/batchSize) + 1}, records ${i + 1}-${Math.min(i + batchSize, importRequest.people.length)}`);
        
        // Update batch status
        await supabase
          .from('import_batches')
          .update({
            detailed_status: { 
              phase: 'processing', 
              processed: i,
              total: importRequest.people.length,
              currentBatch: Math.floor(i/batchSize) + 1
            }
          })
          .eq('id', batchId);

        const batchResult = await dbService.processEmployeeBatch(
          batch, 
          dbContext, 
          employeeInfo.id,
          batchId,
          i // row offset for error tracking
        );
        
        results.imported += batchResult.imported;
        results.failed += batchResult.failed;
        results.errors.push(...batchResult.errors);
        results.successDetails.push(...batchResult.successDetails);

        // Small delay to prevent overwhelming the system
        if (i + batchSize < importRequest.people.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Update final batch status
      await supabase
        .from('import_batches')
        .update({
          successful_records: results.imported,
          failed_records: results.failed,
          status: results.failed > 0 ? 'completed_with_errors' : 'completed',
          completed_at: new Date().toISOString(),
          detailed_status: { 
            phase: 'completed', 
            processed: importRequest.people.length,
            total: importRequest.people.length 
          }
        })
        .eq('id', batchId);

      console.log(`✅ [${correlationId}] Import completed: ${results.imported} imported, ${results.failed} failed`);

      // Send welcome emails to successful imports (background task)
      if (results.successDetails.length > 0 && emailService.isEmailConfigured()) {
        EdgeRuntime.waitUntil(
          emailService.sendBatchWelcomeEmails(
            results.successDetails, 
            { 
              organizationName: dbContext.organizationName,
              adminEmail: importRequest.adminInfo.email,
              adminName: importRequest.adminInfo.name
            },
            {}
          ).catch(error => {
            console.error(`📧 [${correlationId}] Email sending failed:`, error);
          })
        );
      }

      // Send import summary email to admin
      if (emailService.isEmailConfigured()) {
        EdgeRuntime.waitUntil(
          supabase.functions.invoke('send-branded-email', {
            body: {
              type: 'import_summary',
              to: importRequest.adminInfo.email,
              correlationId,
              data: {
                adminName: importRequest.adminInfo.name,
                companyName: dbContext.organizationName,
                totalRecords: results.imported + results.failed,
                successfulRecords: results.imported,
                failedRecords: results.failed,
                dashboardUrl: `${Deno.env.get('FRONTEND_URL') || 'https://app.lovable.dev'}/admin/dashboard`,
                hasErrors: results.failed > 0
              }
            }
          }).catch(error => {
            console.error(`📧 [${correlationId}] Summary email failed:`, error);
          })
        );
      }

      return new Response(JSON.stringify({
        ...results,
        correlationId,
        batchId
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } finally {
      activeImports.delete(orgLockKey);
      console.log(`🔓 [${correlationId}] Released import lock for org: ${importRequest.organizationId}`);
    }

  } catch (error: any) {
    console.error(`💥 [${correlationId}] Unexpected error:`, error);
    
    // Log error to audit
    if (securityContext.userId) {
      await supabase
        .from('security_audit_log')
        .insert({
          user_id: securityContext.userId,
          event_type: 'import_error',
          event_details: { 
            error: error.message, 
            correlationId,
            duration: Date.now() - securityContext.startTime
          },
          success: false,
          ip_address: securityContext.clientIP
        })
        .catch(auditError => {
          console.error(`📝 [${correlationId}] Audit logging failed:`, auditError);
        });
    }

    return createSecureErrorResponse('Internal server error occurred', 500, correlationId);
  }
};

serve(handler);