import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateDivisionData {
  name: string;
}

interface UpdateDivisionData {
  id: string;
  name: string;
}

export function useDivisionMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (data: CreateDivisionData) => {
      const { data: orgResponse, error: orgError } = await supabase
        .from('employee_info')
        .select('organization_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (orgError) throw orgError;

      const { data: division, error } = await supabase
        .from('divisions')
        .insert({
          name: data.name,
          organization_id: orgResponse.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return division;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['divisions'] });
      toast({
        title: 'Success',
        description: `Division "${data.name}" created successfully`,
      });
    },
    onError: (error: any) => {
      const message = error.message.includes('unique_division_name_per_org')
        ? 'A division with this name already exists in your organization'
        : `Failed to create division: ${error.message}`;
      
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
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
      toast({
        title: 'Success',
        description: `Division "${data.name}" updated successfully`,
      });
    },
    onError: (error: any) => {
      const message = error.message.includes('unique_division_name_per_org')
        ? 'A division with this name already exists in your organization'
        : `Failed to update division: ${error.message}`;
      
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('divisions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['divisions'] });
      toast({
        title: 'Success',
        description: 'Division deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete division: ${error.message}`,
        variant: 'destructive',
      });
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