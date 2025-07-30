import { useState, useEffect, useCallback } from 'react';
import { useDraftPersistence } from './useDraftPersistence';
import { OnboardingData } from '@/components/onboarding/OnboardingTypes';

interface DraftRecoveryState {
  hasDraft: boolean;
  draftStep: number;
  draftData: OnboardingData | null;
  draftId: string | null;
  lastSavedAt: string | null;
  isChecking: boolean;
}

export const useDraftRecovery = () => {
  const { loadDraft, deleteDraft, cleanupExpiredDrafts } = useDraftPersistence();
  const [recoveryState, setRecoveryState] = useState<DraftRecoveryState>({
    hasDraft: false,
    draftStep: 0,
    draftData: null,
    draftId: null,
    lastSavedAt: null,
    isChecking: true
  });

  const checkForDraft = useCallback(async () => {
    setRecoveryState(prev => ({ ...prev, isChecking: true }));
    
    try {
      // Clean up expired drafts first
      await cleanupExpiredDrafts();
      
      // Check for active draft
      const draft = await loadDraft();
      
      if (draft) {
        setRecoveryState({
          hasDraft: true,
          draftStep: draft.current_step,
          draftData: draft.draft_data,
          draftId: draft.id,
          lastSavedAt: draft.last_saved_at,
          isChecking: false
        });
      } else {
        setRecoveryState({
          hasDraft: false,
          draftStep: 0,
          draftData: null,
          draftId: null,
          lastSavedAt: null,
          isChecking: false
        });
      }
    } catch (error) {
      console.error('Error checking for draft:', error);
      setRecoveryState(prev => ({ ...prev, isChecking: false }));
    }
  }, [loadDraft, cleanupExpiredDrafts]);

  const discardDraft = useCallback(async () => {
    if (recoveryState.draftId) {
      const success = await deleteDraft(recoveryState.draftId);
      if (success) {
        setRecoveryState({
          hasDraft: false,
          draftStep: 0,
          draftData: null,
          draftId: null,
          lastSavedAt: null,
          isChecking: false
        });
      }
      return success;
    }
    return false;
  }, [recoveryState.draftId, deleteDraft]);

  const clearRecoveryState = useCallback(() => {
    setRecoveryState({
      hasDraft: false,
      draftStep: 0,
      draftData: null,
      draftId: null,
      lastSavedAt: null,
      isChecking: false
    });
  }, []);

  // Auto-check for drafts on mount
  useEffect(() => {
    checkForDraft();
  }, [checkForDraft]);

  return {
    ...recoveryState,
    checkForDraft,
    discardDraft,
    clearRecoveryState
  };
};