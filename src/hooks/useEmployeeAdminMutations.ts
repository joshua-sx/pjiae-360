import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { createMutationErrorHandler, createMutationSuccessHandler } from '@/lib/utils/mutationUtils';

export const useEmployeeAdminMutations = () => {
  const queryClient = useQueryClient();

  const updateEmployee = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: { job_title?: string } }) => {
      const { data, error } = await supabase
        .from('employee_info')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-roles'] });
      createMutationSuccessHandler({ entityName: 'Employee', operation: 'update' })();
    },
    onError: createMutationErrorHandler({
      entityName: 'employee',
      operation: 'update'
    }),
  });

  const updateProfile = useMutation({
    mutationFn: async ({ user_id, updates }: { user_id: string; updates: { first_name?: string; last_name?: string; email?: string } }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-roles'] });
      createMutationSuccessHandler({ entityName: 'Profile', operation: 'update' })();
    },
    onError: createMutationErrorHandler({
      entityName: 'profile',
      operation: 'update'
    }),
  });

  return {
    updateEmployee: updateEmployee.mutate,
    isUpdating: updateEmployee.isPending,
    updateProfile: updateProfile.mutate,
    isUpdatingProfile: updateProfile.isPending,
  };
};