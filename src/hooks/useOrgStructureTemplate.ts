
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TemplateResult {
  template: string;
  divisions_upserted: number;
  departments_upserted: number;
}

export function useOrgStructureTemplate() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const applyTemplate = useMutation({
    mutationFn: async (template: string = 'airport_basic'): Promise<TemplateResult> => {
      // For now, we'll create a basic airport template structure manually
      // until the RPC function is properly added to the types
      
      const { data: orgId, error: orgError } = await supabase.rpc('get_current_user_org_id');
      if (orgError) throw orgError;

      let divisionsCreated = 0;
      let departmentsCreated = 0;

      // Basic airport template structure
      const divisions = [
        { name: 'Operations', normalized_name: 'operations' },
        { name: 'Security', normalized_name: 'security' },
        { name: 'Customer Service', normalized_name: 'customer_service' }
      ];

      const departments = [
        { name: 'Flight Operations', normalized_name: 'flight_operations', division: 'operations' },
        { name: 'Ground Handling', normalized_name: 'ground_handling', division: 'operations' },
        { name: 'Airport Security', normalized_name: 'airport_security', division: 'security' },
        { name: 'Check-in', normalized_name: 'check_in', division: 'customer_service' }
      ];

      // Create divisions
      for (const division of divisions) {
        const { error } = await supabase
          .from('divisions')
          .insert({
            organization_id: orgId,
            name: division.name,
            normalized_name: division.normalized_name
          });
        
        if (!error) divisionsCreated++;
      }

      // Create departments
      for (const department of departments) {
        // Find the division ID
        const { data: divisionData } = await supabase
          .from('divisions')
          .select('id')
          .eq('organization_id', orgId)
          .eq('normalized_name', department.division)
          .single();

        const { error } = await supabase
          .from('departments')
          .insert({
            organization_id: orgId,
            name: department.name,
            normalized_name: department.normalized_name,
            division_id: divisionData?.id
          });
        
        if (!error) departmentsCreated++;
      }

      return {
        template,
        divisions_upserted: divisionsCreated,
        departments_upserted: departmentsCreated
      };
    },
    onSuccess: (data) => {
      toast({
        title: "Template Applied",
        description: `Successfully created ${data.divisions_upserted} divisions and ${data.departments_upserted} departments`,
      });
      
      // Invalidate related queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['divisions'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    applyTemplate: applyTemplate.mutate,
    isApplying: applyTemplate.isPending,
  };
}
