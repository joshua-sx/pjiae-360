
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { extractOrgStructureFromPeople } from '@/components/onboarding/utils/orgStructureExtractor';
import { useToast } from '@/hooks/use-toast';

interface CreateStructureFromDataParams {
  peopleData: Array<{
    division?: string;
    department?: string;
  }>;
}

function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, '_');
}

export function useOrgStructureFromOnboarding() {
  const { toast } = useToast();

  const createFromData = useMutation({
    mutationFn: async ({ peopleData }: CreateStructureFromDataParams) => {
      // Extract organizational structure
      const orgStructure = extractOrgStructureFromPeople(peopleData);
      
      // Separate divisions and departments
      const divisions = orgStructure.filter(item => item.type === 'division');
      const departments = orgStructure.filter(item => item.type === 'department');

      // Get current organization ID
      const { data: orgId, error: orgError } = await supabase.rpc('get_current_user_org_id');
      if (orgError) throw orgError;

      const results = {
        divisionsCreated: 0,
        departmentsCreated: 0,
        errors: [] as string[]
      };

      // Create divisions first
      for (const division of divisions) {
        try {
          const { error } = await supabase
            .from('divisions')
            .insert({
              organization_id: orgId,
              name: division.name,
              normalized_name: normalizeText(division.name)
            });
          
          if (!error) {
            results.divisionsCreated++;
          } else {
            results.errors.push(`Division "${division.name}": ${error.message}`);
          }
        } catch (err) {
          results.errors.push(`Division "${division.name}": ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      // Create departments with division mapping
      for (const department of departments) {
        try {
          let divisionId = null;
          
          if (department.parent) {
            // Find the division by name
            const parentDivision = divisions.find(d => d.id === department.parent);
            if (parentDivision) {
              const { data: divisionData } = await supabase
                .from('divisions')
                .select('id')
                .eq('organization_id', orgId)
                .eq('normalized_name', normalizeText(parentDivision.name))
                .single();
              
              divisionId = divisionData?.id;
            }
          }

          const { error } = await supabase
            .from('departments')
            .insert({
              organization_id: orgId,
              name: department.name,
              normalized_name: normalizeText(department.name),
              division_id: divisionId
            });
          
          if (!error) {
            results.departmentsCreated++;
          } else {
            results.errors.push(`Department "${department.name}": ${error.message}`);
          }
        } catch (err) {
          results.errors.push(`Department "${department.name}": ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      return results;
    },
    onSuccess: (results) => {
      const { divisionsCreated, departmentsCreated, errors } = results;
      
      if (errors.length === 0) {
        toast({
          title: "Organizational Structure Created",
          description: `Created ${divisionsCreated} divisions and ${departmentsCreated} departments from your data`,
        });
      } else {
        toast({
          title: "Partial Success",
          description: `Created ${divisionsCreated} divisions and ${departmentsCreated} departments. ${errors.length} items had errors.`,
          variant: "destructive",
        });
      }
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
    createFromData: createFromData.mutate,
    isCreating: createFromData.isPending,
  };
}
