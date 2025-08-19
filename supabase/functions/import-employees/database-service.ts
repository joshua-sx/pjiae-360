import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { DatabaseContext, ImportResult } from './types.ts';

export class DatabaseService {
  constructor(private supabase: SupabaseClient) {}

  async initializeContext(organizationId: string): Promise<DatabaseContext> {
    // Get organization details
    const { data: org } = await this.supabase
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .single();

    // Get divisions
    const { data: divisions } = await this.supabase
      .from('divisions')
      .select('id, name, normalized_name')
      .eq('organization_id', organizationId);

    // Get departments
    const { data: departments } = await this.supabase
      .from('departments')
      .select('id, name, normalized_name, division_id')
      .eq('organization_id', organizationId);

    const divisionMap: Record<string, string> = {};
    const departmentMap: Record<string, string> = {};

    divisions?.forEach(div => {
      divisionMap[div.normalized_name.toLowerCase()] = div.id;
    });

    departments?.forEach(dept => {
      departmentMap[dept.normalized_name.toLowerCase()] = dept.id;
    });

    return {
      organizationId,
      organizationName: org?.name || 'Unknown Organization',
      divisionMap,
      departmentMap,
    };
  }

  async processEmployeeBatch(
    people: any[], 
    context: DatabaseContext, 
    adminEmployeeId: string,
    batchId: string,
    rowOffset: number
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      message: 'Batch processed',
      imported: 0,
      failed: 0,
      errors: [],
      organizationId: context.organizationId,
      successDetails: []
    };

    for (let i = 0; i < people.length; i++) {
      const person = people[i];
      const rowNumber = rowOffset + i + 1;
      
      try {
        // Validate required fields
        if (!person.email || !person.firstName || !person.lastName) {
          const error = {
            email: person.email || 'unknown',
            error: 'Missing required fields: email, firstName, lastName'
          };
          result.errors.push(error);
          result.failed++;
          
          // Log detailed error
          await this.logImportError(batchId, rowNumber, person.email, 'VALIDATION_ERROR', error.error);
          continue;
        }

        // Check for existing user
        const { data: existingProfile } = await this.supabase
          .from('profiles')
          .select('user_id, email')
          .eq('email', person.email.toLowerCase())
          .single();

        let userId = existingProfile?.user_id || null;

        // Create or update profile
        if (existingProfile && existingProfile.user_id) {
          // Update existing profile
          await this.supabase
            .from('profiles')
            .update({
              first_name: person.firstName,
              last_name: person.lastName,
              phone_number: person.phoneNumber
            })
            .eq('user_id', existingProfile.user_id);
        } else {
          // Create profile for non-auth user (invitation)
          const { data: newProfile } = await this.supabase
            .from('profiles')
            .upsert({
              email: person.email.toLowerCase(),
              first_name: person.firstName,
              last_name: person.lastName,
              phone_number: person.phoneNumber,
              user_id: userId
            }, { onConflict: 'email' })
            .select('id')
            .single();
        }

        // Find department and division IDs
        let departmentId = null;
        let divisionId = null;

        if (person.department) {
          const normalizedDept = person.department.toLowerCase().trim();
          departmentId = context.departmentMap[normalizedDept];
        }

        if (person.division) {
          const normalizedDiv = person.division.toLowerCase().trim();
          divisionId = context.divisionMap[normalizedDiv];
        }

        // Create or update employee info
        const { data: employeeInfo, error: empError } = await this.supabase
          .from('employee_info')
          .upsert({
            user_id: userId,
            organization_id: context.organizationId,
            employee_number: person.employeeId,
            job_title: person.jobTitle,
            department_id: departmentId,
            division_id: divisionId,
            phone_number: person.phoneNumber,
            status: userId ? 'active' : 'invited',
            hire_date: person.hireDate || null
          }, { 
            onConflict: 'user_id,organization_id',
            ignoreDuplicates: false 
          })
          .select('id')
          .single();

        if (empError) {
          throw new Error(`Employee creation failed: ${empError.message}`);
        }

        // Create invitation if user doesn't exist
        if (!userId) {
          const { data: invitation, error: inviteError } = await this.supabase
            .from('employee_invitations')
            .insert({
              employee_id: employeeInfo!.id,
              organization_id: context.organizationId,
              email: person.email.toLowerCase()
            })
            .select('id, token')
            .single();

          if (inviteError) {
            console.warn(`Invitation creation failed for ${person.email}:`, inviteError.message);
          }

          result.successDetails.push({
            email: person.email,
            userId: null,
            employeeInfoId: employeeInfo!.id,
            invitationId: invitation?.id,
            invitationToken: invitation?.token
          });
        } else {
          result.successDetails.push({
            email: person.email,
            userId: userId,
            employeeInfoId: employeeInfo!.id
          });
        }

        result.imported++;

      } catch (error: any) {
        console.error(`Error processing ${person.email}:`, error);
        
        const errorDetail = {
          email: person.email || 'unknown',
          error: error.message
        };
        result.errors.push(errorDetail);
        result.failed++;

        // Log detailed error
        await this.logImportError(
          batchId, 
          rowNumber, 
          person.email, 
          'PROCESSING_ERROR', 
          error.message
        );
      }
    }

    return result;
  }

  private async logImportError(
    batchId: string,
    rowNumber: number,
    email: string | null,
    errorCode: string,
    errorMessage: string,
    fieldName?: string,
    fieldValue?: string
  ) {
    try {
      await this.supabase
        .from('import_errors')
        .insert({
          batch_id: batchId,
          row_number: rowNumber,
          email: email,
          error_code: errorCode,
          error_message: errorMessage,
          field_name: fieldName,
          field_value: fieldValue
        });
    } catch (error) {
      console.error('Failed to log import error:', error);
    }
  }
}