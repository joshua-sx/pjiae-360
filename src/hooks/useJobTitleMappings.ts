import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { AppRole } from '@/config/types';

// Use the Supabase-generated database types
type JobTitleRoleMapRow = Database['public']['Tables']['job_title_role_map']['Row'];
type JobTitleRoleMapInsert = Database['public']['Tables']['job_title_role_map']['Insert'];
type JobTitleRoleMapUpdate = Database['public']['Tables']['job_title_role_map']['Update'];

// Import the Database type
import type { Database } from '@/integrations/supabase/types';

export type JobTitleMapping = JobTitleRoleMapRow;

export const useJobTitleMappings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mappings = [], isLoading, error } = useQuery({
    queryKey: ['job-title-mappings'],
    queryFn: async (): Promise<JobTitleMapping[]> => {
      const { data, error } = await supabase
        .from('job_title_role_map')
        .select('*')
        .order('normalized_title');

      if (error) throw error;
      return data || [];
    },
  });

  const createMapping = useMutation({
    mutationFn: async (mapping: Omit<JobTitleMapping, 'id' | 'created_at' | 'organization_id'>) => {
      // Get current user's organization
      const { data: orgData } = await supabase.rpc('get_current_user_org_id');
      
      const { data, error } = await supabase
        .from('job_title_role_map')
        .insert({
          normalized_title: mapping.normalized_title,
          role: mapping.role,
          synonyms: mapping.synonyms || [],
          organization_id: orgData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-title-mappings'] });
      toast({
        title: "Success",
        description: "Job title mapping created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create job title mapping",
        variant: "destructive",
      });
    },
  });

  const updateMapping = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<JobTitleMapping> & { id: string }) => {
      const { data, error } = await supabase
        .from('job_title_role_map')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-title-mappings'] });
      toast({
        title: "Success",
        description: "Job title mapping updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update job title mapping",
        variant: "destructive",
      });
    },
  });

  const deleteMapping = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('job_title_role_map')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-title-mappings'] });
      toast({
        title: "Success",
        description: "Job title mapping deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete job title mapping",
        variant: "destructive",
      });
    },
  });

  return {
    mappings,
    isLoading,
    error,
    createMapping: createMapping.mutate,
    updateMapping: updateMapping.mutate,
    deleteMapping: deleteMapping.mutate,
    isCreating: createMapping.isPending,
    isUpdating: updateMapping.isPending,
    isDeleting: deleteMapping.isPending,
  };
};