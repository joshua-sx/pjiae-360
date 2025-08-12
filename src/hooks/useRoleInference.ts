import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InferenceResult {
  success: boolean;
  message: string;
  role?: string;
  error?: string;
}

interface BulkInferenceResult {
  processed: number;
  upgraded: number;
}

export const useRoleInference = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const applySingleInference = useMutation({
    mutationFn: async (employeeId: string): Promise<InferenceResult> => {
      const { data, error } = await supabase.rpc('system_apply_inferred_role', {
        _employee_id: employeeId,
        _reason: 'manual_inference'
      });

      if (error) throw error;
      return data as unknown as InferenceResult;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['role-statistics'] });
      
      if (result.success) {
        toast({
          title: "Role Inference Applied",
          description: result.message,
        });
      } else {
        toast({
          title: "No Changes Made",
          description: result.message,
          variant: "default",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to apply role inference",
        variant: "destructive",
      });
    },
  });

  const applyBulkInference = useMutation({
    mutationFn: async (): Promise<BulkInferenceResult> => {
      const { data, error } = await supabase.rpc('reapply_inferred_roles_for_org');

      if (error) throw error;
      return data as unknown as BulkInferenceResult;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['role-statistics'] });
      
      toast({
        title: "Bulk Role Inference Complete",
        description: `Processed ${result.processed} employees, upgraded ${result.upgraded} roles`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to apply bulk role inference",
        variant: "destructive",
      });
    },
  });

  return {
    applySingleInference: applySingleInference.mutate,
    applyBulkInference: applyBulkInference.mutate,
    isSingleInferenceLoading: applySingleInference.isPending,
    isBulkInferenceLoading: applyBulkInference.isPending,
  };
};