import React, { createContext, useContext } from 'react';
import { useDraftPersistence, SaveStatus } from '@/hooks/useDraftPersistence';
import { OnboardingData } from '@/components/onboarding/OnboardingTypes';

interface DraftPersistenceResult {
  success: boolean;
  error?: string;
  draftId?: string;
}

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

interface DraftPersistenceContextType {
  saveDraft: (
    currentStep: number,
    onboardingData: OnboardingData,
    organizationId?: string,
    retryCount?: number
  ) => Promise<DraftPersistenceResult>;
  loadDraft: () => Promise<OnboardingDraft | null>;
  deleteDraft: (draftId?: string) => Promise<boolean>;
  cleanupExpiredDrafts: () => Promise<void>;
  isLoading: boolean;
  currentDraftId: string | null;
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  isOnline: boolean;
}

const DraftPersistenceContext = createContext<DraftPersistenceContextType | null>(null);

export const DraftPersistenceProvider = ({ children }: { children: React.ReactNode }) => {
  const draftPersistence = useDraftPersistence();

  return (
    <DraftPersistenceContext.Provider value={draftPersistence}>
      {children}
    </DraftPersistenceContext.Provider>
  );
};

export const useDraftPersistenceContext = () => {
  const context = useContext(DraftPersistenceContext);
  if (!context) {
    throw new Error('useDraftPersistenceContext must be used within a DraftPersistenceProvider');
  }
  return context;
};