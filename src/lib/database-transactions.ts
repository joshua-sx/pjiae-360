import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

// Database transaction utilities for critical operations
export class DatabaseTransaction {
  private operations: Array<() => Promise<any>> = [];
  private rollbackOperations: Array<() => Promise<any>> = [];
  private transactionId: string;

  constructor() {
    this.transactionId = crypto.randomUUID();
  }

  // Add an operation with its rollback
  addOperation(
    operation: () => Promise<any>,
    rollback: () => Promise<any>
  ) {
    this.operations.push(operation);
    this.rollbackOperations.unshift(rollback); // Reverse order for rollback
  }

  // Execute all operations with rollback on failure
  async execute(): Promise<{ success: boolean; error?: Error; results?: any[] }> {
    const results: any[] = [];
    let completedOperations = 0;

    try {
      logger.auth.debug('Starting database transaction', { transactionId: this.transactionId });

      for (const operation of this.operations) {
        const result = await operation();
        results.push(result);
        completedOperations++;
      }

      logger.auth.info('Transaction completed successfully', { 
        transactionId: this.transactionId,
        operationsCount: completedOperations 
      });

      return { success: true, results };
    } catch (error) {
      logger.auth.error('Transaction failed, starting rollback', { 
        transactionId: this.transactionId,
        error: error instanceof Error ? error.message : 'Unknown error',
        completedOperations 
      });

      // Rollback completed operations
      await this.rollback(completedOperations);
      
      return { success: false, error: error instanceof Error ? error : new Error('Transaction failed') };
    }
  }

  // Rollback operations that were completed
  private async rollback(operationsToRollback: number): Promise<void> {
    const rollbacksToPerform = this.rollbackOperations.slice(0, operationsToRollback);
    
    for (const rollback of rollbacksToPerform) {
      try {
        await rollback();
      } catch (rollbackError) {
        logger.auth.error('Rollback operation failed', { 
          transactionId: this.transactionId,
          error: rollbackError instanceof Error ? rollbackError.message : 'Unknown rollback error'
        });
      }
    }

    logger.auth.info('Rollback completed', { 
      transactionId: this.transactionId,
      rolledBackOperations: rollbacksToPerform.length 
    });
  }
}

// Onboarding transaction - handles organization setup with rollback
export class OnboardingTransaction extends DatabaseTransaction {
  private organizationId?: string;
  private profileId?: string;
  private employeeIds: string[] = [];

  async setupOrganization(organizationData: {
    name: string;
    description?: string;
    logo_url?: string;
  }) {
    this.addOperation(
      async () => {
        const { data, error } = await supabase
          .from('organizations')
          .insert(organizationData)
          .select()
          .single();
        
        if (error) throw error;
        this.organizationId = data.id;
        return data;
      },
      async () => {
        if (this.organizationId) {
          await supabase
            .from('organizations')
            .delete()
            .eq('id', this.organizationId);
        }
      }
    );
  }

  async createProfile(profileData: {
    user_id: string;
    organization_id: string;
    first_name: string;
    last_name: string;
    email: string;
  }) {
    this.addOperation(
      async () => {
        const { data, error } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single();
        
        if (error) throw error;
        this.profileId = data.id;
        return data;
      },
      async () => {
        if (this.profileId) {
          await supabase
            .from('profiles')
            .delete()
            .eq('id', this.profileId);
        }
      }
    );
  }

  async assignAdminRole(userId: string) {
    this.addOperation(
      async () => {
        // Use secure RPC function for role assignment
        const { data, error } = await supabase.rpc('assign_user_role_secure', {
          _target_user_id: userId,
          _role: 'admin',
          _reason: 'Initial organization setup'
        });
        
        if (error) throw error;
        if (!(data as any).success) throw new Error((data as any).error || 'Role assignment failed');
        return data;
      },
      async () => {
        // Rollback would need to be handled by admin manually
        // since secure function doesn't allow direct role deletion
        console.warn('Role assignment rollback requires manual admin intervention');
      }
    );
  }

  async importEmployees(employees: Array<{
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
    job_title?: string;
    department?: string;
    division?: string;
  }>) {
    this.addOperation(
      async () => {
        const employeeData = employees.map(emp => ({
          user_id: emp.user_id,
          organization_id: this.organizationId!,
          job_title: emp.job_title,
          status: 'pending' as const
        }));

        // Use the correct table name from Supabase schema
        const { data, error } = await supabase
          .from('employee_info')
          .insert(employeeData)
          .select();
        
        if (error) throw error;
        this.employeeIds = data.map(emp => emp.id);
        return data;
      },
      async () => {
        if (this.employeeIds.length > 0) {
          await supabase
            .from('employee_info')
            .delete()
            .in('id', this.employeeIds);
        }
      }
    );
  }
}

// Employee import transaction with partial failure recovery
export class EmployeeImportTransaction extends DatabaseTransaction {
  private importedEmployeeIds: string[] = [];
  private invitationIds: string[] = [];

  async importBatch(employees: any[], organizationId: string, batchSize: number = 50) {
    // Process in batches to avoid overwhelming the database
    const batches = [];
    for (let i = 0; i < employees.length; i += batchSize) {
      batches.push(employees.slice(i, i + batchSize));
    }

    for (const [batchIndex, batch] of batches.entries()) {
      this.addOperation(
        async () => {
          const employeeData = batch.map(emp => ({
            user_id: emp.user_id,
            organization_id: organizationId,
            job_title: emp.job_title,
            status: 'pending' as const
          }));

          const { data, error } = await supabase
            .from('employee_info')
            .insert(employeeData)
            .select();
          
          if (error) throw error;
          
          const batchIds = data.map(emp => emp.id);
          this.importedEmployeeIds.push(...batchIds);
          
          logger.auth.info('Employee batch imported', { 
            batchIndex, 
            batchSize: batch.length,
            totalImported: this.importedEmployeeIds.length 
          });
          
          return data;
        },
        async () => {
          // Rollback this batch
          const startIndex = batchIndex * batchSize;
          const endIndex = startIndex + batch.length;
          const batchIdsToRemove = this.importedEmployeeIds.slice(startIndex, endIndex);
          
          if (batchIdsToRemove.length > 0) {
            await supabase
              .from('employee_info')
              .delete()
              .in('id', batchIdsToRemove);
          }
        }
      );
    }
  }

  async sendInvitations(employeeEmails: string[]) {
    this.addOperation(
      async () => {
        // Send invitations via edge function
        const { data, error } = await supabase.functions.invoke('enhanced-email-service', {
          body: {
            type: 'bulk_employee_invitation',
            emails: employeeEmails
          }
        });
        
        if (error) throw error;
        this.invitationIds = data?.invitationIds || [];
        return data;
      },
      async () => {
        // Mark invitations as cancelled (can't unsend emails)
        if (this.invitationIds.length > 0) {
          // Since email_invitations table doesn't exist, just log the rollback
          logger.auth.info('Email invitations rollback - marking as cancelled', {
            invitationIds: this.invitationIds
          });
        }
      }
    );
  }
}

// Utility function to handle common database operations with retry
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt === maxRetries) {
        logger.auth.error('Operation failed after all retries', { 
          attempts: maxRetries,
          error: lastError.message 
        });
        throw lastError;
      }
      
      logger.auth.debug('Operation failed, retrying', { 
        attempt, 
        maxRetries,
        delayMs,
        error: lastError.message 
      });
      
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }
  
  throw lastError!;
}

// Health check for database operations
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  issues: string[];
  responseTime: number;
}> {
  const startTime = Date.now();
  const issues: string[] = [];
  
  try {
    // Test basic connectivity
    const { error: connectionError } = await supabase
      .from('organizations')
      .select('id')
      .limit(1);
    
    if (connectionError) {
      issues.push('Database connection failed');
    }
    
    // Test authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      issues.push('Authentication service unavailable');
    }
    
    const responseTime = Date.now() - startTime;
    
    return {
      healthy: issues.length === 0,
      issues,
      responseTime
    };
  } catch (error) {
    return {
      healthy: false,
      issues: ['Database health check failed'],
      responseTime: Date.now() - startTime
    };
  }
}