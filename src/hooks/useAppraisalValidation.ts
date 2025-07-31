import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';

export interface AppraisalValidationResult {
  canCreateAppraisal: boolean;
  canEditAppraisal: boolean;
  canViewAppraisal: boolean;
  canAssignAppraisers: boolean;
  canSubmitAppraisal: boolean;
  reasons: string[];
}

export function useAppraisalValidation() {
  const { hasRole, hasAnyRole } = usePermissions();

  const validateAppraisalAccess = useCallback(async (
    appraisalId?: string,
    employeeId?: string,
    appraisalStatus?: string
  ): Promise<AppraisalValidationResult> => {
    const result: AppraisalValidationResult = {
      canCreateAppraisal: false,
      canEditAppraisal: false,
      canViewAppraisal: false,
      canAssignAppraisers: false,
      canSubmitAppraisal: false,
      reasons: []
    };

    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        result.reasons.push('User not authenticated');
        return result;
      }

      // Get current user's employee info
      const { data: userEmployee, error: userError } = await supabase
        .from('employee_info')
        .select('id, organization_id, manager_id')
        .eq('user_id', currentUser.user.id)
        .single();

      if (userError || !userEmployee) {
        result.reasons.push('User employee profile not found');
        return result;
      }

      // Admin and directors have full access
      if (hasAnyRole(['admin', 'director'])) {
        result.canCreateAppraisal = true;
        result.canEditAppraisal = true;
        result.canViewAppraisal = true;
        result.canAssignAppraisers = true;
        result.canSubmitAppraisal = true;
        return result;
      }

      // Managers can manage appraisals for their direct reports
      if (hasRole('manager')) {
        result.canCreateAppraisal = true;
        result.canAssignAppraisers = true;
        result.canViewAppraisal = true;

        // Check if this is for their direct report
        if (employeeId) {
          const { data: employee } = await supabase
            .from('employee_info')
            .select('manager_id')
            .eq('id', employeeId)
            .single();

          if (employee?.manager_id === userEmployee.id) {
            result.canEditAppraisal = true;
            result.canSubmitAppraisal = true;
          } else {
            result.reasons.push('Can only manage appraisals for direct reports');
          }
        } else {
          result.canEditAppraisal = true;
          result.canSubmitAppraisal = true;
        }
      }

      // Check if user is assigned as an appraiser
      if (appraisalId) {
        const { data: assignment } = await supabase
          .from('appraisal_appraisers')
          .select('role, is_primary')
          .eq('appraisal_id', appraisalId)
          .eq('appraiser_id', userEmployee.id)
          .single();

        if (assignment) {
          result.canViewAppraisal = true;
          result.canEditAppraisal = true;
          
          // Primary appraiser can submit
          if (assignment.is_primary) {
            result.canSubmitAppraisal = true;
          }
        }
      }

      // Check if user is viewing their own appraisal
      if (employeeId === userEmployee.id) {
        result.canViewAppraisal = true;
        // Employees cannot edit their own appraisals
        result.reasons.push('Employees cannot edit their own appraisals');
      }

      // Status-based validations
      if (appraisalStatus) {
        if (appraisalStatus === 'completed') {
          result.canEditAppraisal = false;
          result.canSubmitAppraisal = false;
          result.reasons.push('Cannot edit completed appraisals');
        }
        
        if (appraisalStatus === 'awaiting_secondary' && !hasAnyRole(['admin', 'director'])) {
          // Only secondary appraiser can edit when awaiting secondary review
          if (appraisalId) {
            const { data: assignment } = await supabase
              .from('appraisal_appraisers')
              .select('role, is_primary')
              .eq('appraisal_id', appraisalId)
              .eq('appraiser_id', userEmployee.id)
              .single();

            if (!assignment || assignment.is_primary) {
              result.canEditAppraisal = false;
              result.canSubmitAppraisal = false;
              result.reasons.push('Appraisal is awaiting secondary appraiser review');
            }
          }
        }
      }

      return result;
    } catch (error) {
      console.error('Error validating appraisal access:', error);
      result.reasons.push('Error validating access');
      return result;
    }
  }, [hasRole, hasAnyRole]);

  const validateAppraisalCompletion = useCallback((appraisalData: {
    goals: Array<{ rating?: number }>;
    competencies: Array<{ rating?: number }>;
  }) => {
    const result = {
      canSubmit: true,
      missingItems: [] as string[]
    };

    // Check if all goals have ratings
    const unratedGoals = appraisalData.goals.filter(goal => goal.rating === undefined);
    if (unratedGoals.length > 0) {
      result.canSubmit = false;
      result.missingItems.push(`${unratedGoals.length} goal(s) need ratings`);
    }

    // Check if all competencies have ratings
    const unratedCompetencies = appraisalData.competencies.filter(comp => comp.rating === undefined);
    if (unratedCompetencies.length > 0) {
      result.canSubmit = false;
      result.missingItems.push(`${unratedCompetencies.length} competenc(ies) need ratings`);
    }

    return result;
  }, []);

  const validateStatusTransition = useCallback((
    currentStatus: string,
    newStatus: string,
    userRole: string[]
  ) => {
    const validTransitions: Record<string, string[]> = {
      'draft': ['in_progress'],
      'in_progress': ['awaiting_secondary', 'completed'],
      'awaiting_secondary': ['completed'],
      'completed': [] // No transitions from completed
    };

    const allowedNextStatuses = validTransitions[currentStatus] || [];
    
    if (!allowedNextStatuses.includes(newStatus)) {
      return {
        valid: false,
        reason: `Cannot transition from ${currentStatus} to ${newStatus}`
      };
    }

    // Role-based transition validation
    if (newStatus === 'completed' && !userRole.some(role => ['admin', 'director', 'manager'].includes(role))) {
      return {
        valid: false,
        reason: 'Only managers and above can mark appraisals as completed'
      };
    }

    return { valid: true, reason: null };
  }, []);

  return {
    validateAppraisalAccess,
    validateAppraisalCompletion,
    validateStatusTransition
  };
}