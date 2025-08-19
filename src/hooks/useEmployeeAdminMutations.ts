import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useEmployeeAdminMutations = () => {
  const { toast } = useToast();
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
      toast({
        title: "Success",
        description: "Employee updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update employee",
        variant: "destructive",
      });
    },
  });

  return {
    updateEmployee: updateEmployee.mutate,
    isUpdating: updateEmployee.isPending,
  };
};