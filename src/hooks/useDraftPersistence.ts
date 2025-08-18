import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDemoGuard } from '@/lib/demo-mode-guard';
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

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline';

export const useDraftPersistence = () => {
  const { user } = useAuth();
  const { guardDatabaseOperation, isDemoMode } = useDemoGuard();
  const [isLoading, setIsLoading] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Track online/offline status
  useState(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });

  const saveDraft = useCallback(async (
    currentStep: number,
    onboardingData: OnboardingData,
    organizationId?: string,
    retryCount = 0
  ): Promise<DraftPersistenceResult> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Guard against demo mode violations
    try {
      guardDatabaseOperation('save draft');
    } catch (error) {
      console.warn('Demo mode: Skipping draft save');
      setSaveStatus('saved'); // Show as saved in demo mode
      setLastSavedAt(new Date());
      return { success: true, draftId: 'demo-draft-id' };
    }

    // Check if offline
    if (!isOnline) {
      setSaveStatus('offline');
      return { success: false, error: 'Offline - changes will sync when online' };
    }

    // Validate data before saving
    if (!onboardingData.entryMethod) {
      return { success: false, error: 'Entry method is required' };
    }

    setIsLoading(true);
    setSaveStatus('saving');

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
        // Update existing draft by ID for better consistency
        result = await supabase
          .from('onboarding_drafts')
          .update(draftPayload)
          .eq('id', currentDraftId)
          .eq('user_id', user.id) // Security: Ensure user owns the draft
          .select()
          .single();
      } else {
        // Insert new draft
        result = await supabase
          .from('onboarding_drafts')
          .insert(draftPayload)
          .select()
          .single();
      }

      if (result.error) {
        console.error('Error saving draft:', result.error);
        
        // Exponential backoff retry on network/temporary errors
        if (retryCount < 3 && (
          result.error.message.includes('network') ||
          result.error.message.includes('timeout') ||
          result.error.code === 'PGRST301' // connection error
        )) {
          const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          return saveDraft(currentStep, onboardingData, organizationId, retryCount + 1);
        }
        
        setSaveStatus('error');
        return { success: false, error: result.error.message };
      }

      if (result.data && !currentDraftId) {
        setCurrentDraftId(result.data.id);
      }

      setSaveStatus('saved');
      setLastSavedAt(new Date());
      
      // Schedule reset to idle after delay
      setTimeout(() => setSaveStatus('idle'), 2000);

      return { 
        success: true, 
        draftId: result.data?.id || currentDraftId || undefined 
      };
    } catch (error) {
      console.error('Error saving draft:', error);
      
      // Exponential backoff retry on network errors
      if (retryCount < 3 && error instanceof Error && (
        error.message.includes('fetch') ||
        error.message.includes('network') ||
        error.message.includes('Failed to fetch')
      )) {
        const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        return saveDraft(currentStep, onboardingData, organizationId, retryCount + 1);
      }
      
      setSaveStatus('error');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error - please check your connection' 
      };
    } finally {
      setIsLoading(false);
    }
  }, [user, currentDraftId, guardDatabaseOperation, isOnline]);

  const loadDraft = useCallback(async (): Promise<OnboardingDraft | null> => {
    if (!user) return null;

    // Skip in demo mode
    if (isDemoMode) {
      return null;
    }

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
        setLastSavedAt(new Date(draft.last_saved_at));
        return draft;
      }

      return null;
    } catch (error) {
      console.error('Error loading draft:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, isDemoMode]);

  const deleteDraft = useCallback(async (draftId?: string): Promise<boolean> => {
    if (!user) return false;

    // Skip in demo mode
    if (isDemoMode) {
      setCurrentDraftId(null);
      return true;
    }

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
        setLastSavedAt(null);
        setSaveStatus('idle');
      }

      return true;
    } catch (error) {
      console.error('Error deleting draft:', error);
      return false;
    }
  }, [user, currentDraftId, isDemoMode]);

  const cleanupExpiredDrafts = useCallback(async (): Promise<void> => {
    if (isDemoMode) return;
    
    try {
      await supabase.rpc('cleanup_expired_drafts');
    } catch (error) {
      console.error('Error cleaning up expired drafts:', error);
    }
  }, [isDemoMode]);

  return {
    saveDraft,
    loadDraft,
    deleteDraft,
    cleanupExpiredDrafts,
    isLoading,
    currentDraftId,
    saveStatus,
    lastSavedAt,
    isOnline
  };
};