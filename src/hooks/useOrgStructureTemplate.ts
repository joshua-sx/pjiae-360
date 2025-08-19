
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
      const { data, error } = await supabase.rpc('apply_org_structure_template', {
        _template: template
      });
      
      if (error) throw error;
      return data;
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
