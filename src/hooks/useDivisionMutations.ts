import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { createMutationErrorHandler, createMutationSuccessHandler } from '@/lib/utils/mutationUtils';

interface CreateDivisionData {
  name: string;
}

interface UpdateDivisionData {
  id: string;
  name: string;
}

export function useDivisionMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: CreateDivisionData) => {
      // Get current user's organization through secure function
      const { data: orgData, error: orgError } = await supabase.rpc('get_current_user_org_id');
      if (orgError || !orgData) {
        throw new Error('Could not find user organization');
      }

      const { data: division, error } = await supabase
        .from('divisions')
        .insert({
          name: data.name,
          normalized_name: data.name.toLowerCase().trim(),
          organization_id: orgData,
        })
        .select()
        .single();

      if (error) throw error;
      return division;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['divisions'] });
      createMutationSuccessHandler({ entityName: 'Division', operation: 'create' })(data);
    },
    onError: createMutationErrorHandler({
      entityName: 'division',
      operation: 'create',
      uniqueConstraintKey: 'unique_division_name_per_org'
    }),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateDivisionData) => {
      const { data: division, error } = await supabase
        .from('divisions')
        .update({
          name: data.name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;
      return division;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['divisions'] });
      createMutationSuccessHandler({ entityName: 'Division', operation: 'update' })(data);
    },
    onError: createMutationErrorHandler({
      entityName: 'division',
      operation: 'update',
      uniqueConstraintKey: 'unique_division_name_per_org'
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (data: { id: string; handleEmployees?: 'unassign' | 'block' }) => {
      const { id, handleEmployees = 'block' } = data;
      
      // Check for assigned employees
      const { count: employeeCount, error: countError } = await supabase
        .from('employee_info')
        .select('*', { count: 'exact', head: true })
        .eq('division_id', id);

      if (countError) throw countError;

      if (employeeCount && employeeCount > 0 && handleEmployees === 'block') {
        throw new Error(`Cannot delete division: ${employeeCount} employee(s) are assigned to this division. Please reassign them first.`);
      }

      // If unassign option is chosen, remove division assignment from employees
      if (handleEmployees === 'unassign' && employeeCount && employeeCount > 0) {
        const { error: unassignError } = await supabase
          .from('employee_info')
          .update({ division_id: null })
          .eq('division_id', id);

        if (unassignError) throw unassignError;
      }

      // Delete the division
      const { error } = await supabase
        .from('divisions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['divisions'] });
      queryClient.invalidateQueries({ queryKey: ['employee-counts'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      
      const action = variables.handleEmployees === 'unassign' ? ' and employees unassigned' : '';
      createMutationSuccessHandler({ 
        entityName: 'Division', 
        operation: 'delete',
        customMessage: `Division deleted successfully${action}`
      })();
    },
    onError: (error) => {
      const isEmployeeAssignmentError = error.message.includes('employee(s) are assigned');
      if (isEmployeeAssignmentError) {
        createMutationErrorHandler({
          entityName: 'division',
          operation: 'delete',
          customMessages: { default: error.message }
        })(error);
      } else {
        createMutationErrorHandler({
          entityName: 'division',
          operation: 'delete'
        })(error);
      }
    },
  });

  return {
    createDivision: createMutation.mutate,
    updateDivision: updateMutation.mutate,
    deleteDivision: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}