import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateDepartmentData {
  name: string;
  division_id?: string;
}

interface UpdateDepartmentData {
  id: string;
  name: string;
  division_id?: string;
}

export function useDepartmentMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (data: CreateDepartmentData) => {
      const { data: orgResponse, error: orgError } = await supabase
        .from('employee_info')
        .select('organization_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (orgError) throw orgError;

      const { data: department, error } = await supabase
        .from('departments')
        .insert({
          name: data.name,
          organization_id: orgResponse.organization_id,
          division_id: data.division_id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return department;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({
        title: 'Success',
        description: `Department "${data.name}" created successfully`,
      });
    },
    onError: (error: any) => {
      const message = error.message.includes('unique_department_name_per_org')
        ? 'A department with this name already exists in your organization'
        : `Failed to create department: ${error.message}`;
      
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateDepartmentData) => {
      const { data: department, error } = await supabase
        .from('departments')
        .update({
          name: data.name,
          division_id: data.division_id || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;
      return department;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({
        title: 'Success',
        description: `Department "${data.name}" updated successfully`,
      });
    },
    onError: (error: any) => {
      const message = error.message.includes('unique_department_name_per_org')
        ? 'A department with this name already exists in your organization'
        : `Failed to update department: ${error.message}`;
      
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (data: { id: string; handleEmployees?: 'unassign' | 'block' }) => {
      const { id, handleEmployees = 'block' } = data;
      
      // Check for assigned employees
      const { count: employeeCount, error: countError } = await supabase
        .from('employee_info')
        .select('*', { count: 'exact', head: true })
        .eq('department_id', id);

      if (countError) throw countError;

      if (employeeCount && employeeCount > 0 && handleEmployees === 'block') {
        throw new Error(`Cannot delete department: ${employeeCount} employee(s) are assigned to this department. Please reassign them first.`);
      }

      // If unassign option is chosen, remove department assignment from employees
      if (handleEmployees === 'unassign' && employeeCount && employeeCount > 0) {
        const { error: unassignError } = await supabase
          .from('employee_info')
          .update({ department_id: null })
          .eq('department_id', id);

        if (unassignError) throw unassignError;
      }

      // Delete the department
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['employee-counts'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      
      const action = variables.handleEmployees === 'unassign' ? ' and employees unassigned' : '';
      toast({
        title: 'Success',
        description: `Department deleted successfully${action}`,
      });
    },
    onError: (error) => {
      const message = error.message.includes('employee(s) are assigned')
        ? error.message
        : `Failed to delete department: ${error.message}`;
      
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });

  return {
    createDepartment: createMutation.mutate,
    updateDepartment: updateMutation.mutate,
    deleteDepartment: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}