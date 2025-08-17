import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { OnboardingData } from '@/components/onboarding/OnboardingTypes';
import { toast } from 'sonner';

interface OnboardingDraft {
  id: string;
  user_id: string;
  organization_id?: string;
  current_step: number;
  entry_method?: string;
  draft_data: OnboardingData;
  last_saved_at: string;
  created_at: string;
  expires_at: string;
}

interface DraftPersistenceResult {
  success: boolean;
  error?: string;
  draftId?: string;
}

export const useDraftPersistence = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

  const saveDraft = useCallback(async (
    currentStep: number,
    onboardingData: OnboardingData,
    organizationId?: string,
    retryCount = 0
  ): Promise<DraftPersistenceResult> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Validate data before saving
    if (!onboardingData.entryMethod) {
      return { success: false, error: 'Entry method is required' };
    }

    setIsLoading(true);
    try {
      const draftPayload = {
        user_id: user.id,
        organization_id: organizationId,
        current_step: currentStep,
        entry_method: onboardingData.entryMethod,
        draft_data: onboardingData as any,
        last_saved_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      };

      let result;
      if (currentDraftId) {
        // Update existing draft with conflict resolution
        result = await supabase
          .from('onboarding_drafts')
          .update(draftPayload)
          .eq('id', currentDraftId)
          .eq('user_id', user.id) // Ensure user owns the draft
          .select()
          .single();
      } else {
        // Upsert to handle race conditions
        result = await supabase
          .from('onboarding_drafts')
          .upsert(draftPayload, {
            onConflict: 'user_id',
            ignoreDuplicates: false
          })
          .select()
          .single();
      }

      if (result.error) {
        console.error('Error saving draft:', result.error);
        
        // Retry on network/temporary errors
        if (retryCount < 2 && (
          result.error.message.includes('network') ||
          result.error.message.includes('timeout') ||
          result.error.code === 'PGRST301' // connection error
        )) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return saveDraft(currentStep, onboardingData, organizationId, retryCount + 1);
        }
        
        return { success: false, error: result.error.message };
      }

      if (result.data && !currentDraftId) {
        setCurrentDraftId(result.data.id);
      }

      return { 
        success: true, 
        draftId: result.data?.id || currentDraftId || undefined 
      };
    } catch (error) {
      console.error('Error saving draft:', error);
      
      // Retry on network errors
      if (retryCount < 2 && error instanceof Error && (
        error.message.includes('fetch') ||
        error.message.includes('network') ||
        error.message.includes('Failed to fetch')
      )) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return saveDraft(currentStep, onboardingData, organizationId, retryCount + 1);
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error - please check your connection' 
      };
    } finally {
      setIsLoading(false);
    }
  }, [user, currentDraftId]);

  const loadDraft = useCallback(async (): Promise<OnboardingDraft | null> => {
    if (!user) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('get_user_active_draft', { _user_id: user.id });

      if (error) {
        console.error('Error loading draft:', error);
        return null;
      }

      if (data && data.length > 0) {
        const rawDraft = data[0];
        const draft: OnboardingDraft = {
          ...rawDraft,
          draft_data: rawDraft.draft_data as unknown as OnboardingData
        };
        setCurrentDraftId(draft.id);
        return draft;
      }

      return null;
    } catch (error) {
      console.error('Error loading draft:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const deleteDraft = useCallback(async (draftId?: string): Promise<boolean> => {
    if (!user) return false;

    const idToDelete = draftId || currentDraftId;
    if (!idToDelete) return false;

    try {
      const { error } = await supabase
        .from('onboarding_drafts')
        .delete()
        .eq('id', idToDelete);

      if (error) {
        console.error('Error deleting draft:', error);
        return false;
      }

      if (idToDelete === currentDraftId) {
        setCurrentDraftId(null);
      }

      return true;
    } catch (error) {
      console.error('Error deleting draft:', error);
      return false;
    }
  }, [user, currentDraftId]);

  const cleanupExpiredDrafts = useCallback(async (): Promise<void> => {
    try {
      await supabase.rpc('cleanup_expired_drafts');
    } catch (error) {
      console.error('Error cleaning up expired drafts:', error);
    }
  }, []);

  return {
    saveDraft,
    loadDraft,
    deleteDraft,
    cleanupExpiredDrafts,
    isLoading,
    currentDraftId
  };
};