import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SignatureFlowState {
  signatureStage: 'draft' | 'pending_first_appraiser' | 'pending_second_appraiser' | 'pending_employee' | 'complete';
  currentSignerRole: string | null;
  createdBy: string | null;
  isCurrentUserTurn: boolean;
  canSign: boolean;
  canFinalize: boolean;
  userRole: 'first_appraiser' | 'second_appraiser' | 'employee' | null;
}

export const useAppraisalSignatureFlow = (appraisalId: string | null, employeeUserId?: string) => {
  const [state, setState] = useState<SignatureFlowState>({
    signatureStage: 'draft',
    currentSignerRole: null,
    createdBy: null,
    isCurrentUserTurn: false,
    canSign: false,
    canFinalize: false,
    userRole: null
  });
  const [loading, setLoading] = useState(false);
  const [signatures, setSignatures] = useState<Record<string, boolean>>({
    first_appraiser: false,
    second_appraiser: false,
    employee: false
  });
  const { toast } = useToast();

  // Fetch appraisal signature state
  const fetchSignatureState = useCallback(async () => {
    if (!appraisalId) return;

    setLoading(true);
    try {
      const { data: appraisal, error } = await supabase
        .from('appraisals')
        .select(`
          signature_stage,
          current_signer_role,
          created_by,
          employee_id,
          employee_info!inner(user_id)
        `)
        .eq('id', appraisalId)
        .single();

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      if (!currentUserId) return;

      // Check if user is assigned as second appraiser
      const { data: secondAppraisers } = await supabase
        .from('appraisal_appraisers')
        .select('appraiser_id, employee_info!inner(user_id)')
        .eq('appraisal_id', appraisalId)
        .eq('role', 'secondary');

      const isSecondAppraiser = secondAppraisers?.some(
        (appraiser: any) => appraiser.employee_info.user_id === currentUserId
      );

      // Get existing signatures
      const { data: existingSignatures } = await supabase
        .from('signatures')
        .select('role')
        .eq('appraisal_id', appraisalId);

      const signatureMap = {
        first_appraiser: false,
        second_appraiser: false,
        employee: false
      };

      existingSignatures?.forEach(sig => {
        if (sig.role in signatureMap) {
          signatureMap[sig.role as keyof typeof signatureMap] = true;
        }
      });

      setSignatures(signatureMap);

      // Determine user's role in the signature flow
      let userRole: 'first_appraiser' | 'second_appraiser' | 'employee' | null = null;
      if (currentUserId === appraisal.created_by) {
        userRole = 'first_appraiser';
      } else if (isSecondAppraiser) {
        userRole = 'second_appraiser';
      } else if (currentUserId === appraisal.employee_info.user_id) {
        userRole = 'employee';
      }

      // Determine if it's the current user's turn
      const isCurrentUserTurn = 
        (appraisal.signature_stage === 'pending_first_appraiser' && userRole === 'first_appraiser') ||
        (appraisal.signature_stage === 'pending_second_appraiser' && userRole === 'second_appraiser') ||
        (appraisal.signature_stage === 'pending_employee' && userRole === 'employee');

      const canSign = isCurrentUserTurn && !signatureMap[userRole as keyof typeof signatureMap];
      const canFinalize = appraisal.signature_stage === 'draft' && (
        currentUserId === appraisal.created_by || userRole === 'first_appraiser'
      );

      setState({
        signatureStage: appraisal.signature_stage as any,
        currentSignerRole: appraisal.current_signer_role,
        createdBy: appraisal.created_by,
        isCurrentUserTurn,
        canSign,
        canFinalize,
        userRole
      });

    } catch (error) {
      console.error('Error fetching signature state:', error);
    } finally {
      setLoading(false);
    }
  }, [appraisalId]);

  // Sign appraisal
  const signAppraisal = useCallback(async (signatureData: string) => {
    if (!appraisalId || !state.canSign) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('sign_appraisal', {
        _appraisal_id: appraisalId,
        _signature_data: signatureData
      }) as { data: any; error: any };

      if (error) throw error;

      const result = data as { success: boolean; error?: string; message?: string; next_stage?: string };

      if (!result.success) {
        throw new Error(result.error || 'Failed to sign appraisal');
      }

      toast({
        title: "Signature Recorded",
        description: result.message || "Signature recorded successfully"
      });

      // Refresh state
      await fetchSignatureState();

      return { success: true, nextStage: result.next_stage };

    } catch (error: any) {
      toast({
        title: "Signature Failed",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [appraisalId, state.canSign, toast, fetchSignatureState]);

  // Finalize appraisal (submit for signatures)
  const finalizeAppraisal = useCallback(async () => {
    if (!appraisalId || !state.canFinalize) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('finalize_appraisal', {
        _appraisal_id: appraisalId
      }) as { data: any; error: any };

      if (error) throw error;

      const result = data as { success: boolean; error?: string; message?: string };

      if (!result.success) {
        throw new Error(result.error || 'Failed to finalize appraisal');
      }

      toast({
        title: "Appraisal Submitted",
        description: result.message || "Appraisal submitted successfully"
      });

      // Refresh state
      await fetchSignatureState();

      return { success: true };

    } catch (error: any) {
      toast({
        title: "Finalization Failed",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [appraisalId, state.canFinalize, toast, fetchSignatureState]);

  useEffect(() => {
    fetchSignatureState();
  }, [fetchSignatureState]);

  return {
    state,
    signatures,
    loading,
    signAppraisal,
    finalizeAppraisal,
    refreshState: fetchSignatureState
  };
};