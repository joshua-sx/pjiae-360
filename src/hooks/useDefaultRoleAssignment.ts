import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DefaultRoleAssignmentResult {
  processed: number;
  assigned: number;
  errors: number;
}

export const useDefaultRoleAssignment = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const assignDefaultRoles = useMutation({
    mutationFn: async (): Promise<DefaultRoleAssignmentResult> => {
      // Get all employees with user_id but no roles in current organization
      const { data: employeesWithoutRoles, error: queryError } = await supabase
        .from('employee_info')
        .select(`
          id,
          user_id,
          organization_id
        `)
        .not('user_id', 'is', null)
        .eq('status', 'active');

      if (queryError) throw queryError;

      if (!employeesWithoutRoles || employeesWithoutRoles.length === 0) {
        return { processed: 0, assigned: 0, errors: 0 };
      }

      // Filter out employees who already have roles
      const userIds = employeesWithoutRoles.map(emp => emp.user_id).filter(Boolean);
      const { data: existingRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('user_id', userIds)
        .eq('is_active', true);

      const usersWithRoles = new Set(existingRoles?.map(r => r.user_id) || []);
      const employeesNeedingRoles = employeesWithoutRoles.filter(
        emp => emp.user_id && !usersWithRoles.has(emp.user_id)
      );

      let assigned = 0;
      let errors = 0;

      // Assign default "employee" role to each user
      for (const employee of employeesNeedingRoles) {
        try {
          const { data, error } = await supabase.rpc('assign_user_role_secure', {
            _target_user_id: employee.user_id,
            _role: 'employee',
            _reason: 'Default role assignment for active employee'
          });

          if (error) throw error;

          const result = data as { success: boolean; error?: string };
          if (result.success) {
            assigned++;
          } else {
            console.error(`Failed to assign default role to user ${employee.user_id}:`, result.error);
            errors++;
          }
        } catch (err) {
          console.error(`Error assigning default role to user ${employee.user_id}:`, err);
          errors++;
        }
      }

      return {
        processed: employeesNeedingRoles.length,
        assigned,
        errors
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['organization-employee-roles'] });
      queryClient.invalidateQueries({ queryKey: ['role-statistics'] });
      
      if (result.assigned > 0) {
        toast({
          title: "Default Roles Assigned",
          description: `Assigned default employee role to ${result.assigned} users`,
        });
      }

      if (result.errors > 0) {
        toast({
          title: "Some Assignments Failed",
          description: `${result.errors} role assignments failed. Check console for details.`,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign default roles",
        variant: "destructive",
      });
    },
  });

  return {
    assignDefaultRoles: assignDefaultRoles.mutate,
    isAssigning: assignDefaultRoles.isPending,
  };
};