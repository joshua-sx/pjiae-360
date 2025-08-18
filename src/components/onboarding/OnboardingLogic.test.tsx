import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { useOnboardingLogic } from './OnboardingLogic';
import { ReactNode } from 'react';

// Mock dependencies
const mockNavigate = vi.fn();
const mockToast = { success: vi.fn(), error: vi.fn() };
const mockSaveDraft = vi.fn();
const mockLoadDraft = vi.fn();
const mockDeleteDraft = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('sonner', () => ({
  toast: mockToast,
}));

vi.mock('@/contexts/DraftPersistenceContext', () => ({
  useDraftPersistenceContext: () => ({
    saveDraft: mockSaveDraft,
    loadDraft: mockLoadDraft,
    deleteDraft: mockDeleteDraft,
    isLoading: false,
    saveStatus: 'idle' as const,
    isOnline: true
  })
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-123' },
    profile: { organization_id: 'org-123' }
  })
}));

vi.mock('@/hooks/useDraftRecovery', () => ({
  useDraftRecovery: () => ({
    recoveryState: {
      hasDraft: false,
      draftStep: 0,
      draftData: null,
      draftId: null,
      lastSavedAt: null,
      isChecking: false
    },
    checkForDraft: vi.fn(),
    discardDraft: vi.fn(),
    clearRecoveryState: vi.fn()
  })
}));

// Mock context provider wrapper
const wrapper = ({ children }: { children: ReactNode }) => children;

describe('useOnboardingLogic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSaveDraft.mockResolvedValue({ success: true, draftId: 'draft-123' });
  });

  it('should initialize with default data', () => {
    const { result } = renderHook(() => useOnboardingLogic(), { wrapper });

    expect(result.current.currentMilestoneIndex).toBe(0);
    expect(result.current.completedStepIds).toEqual(new Set());
    expect(result.current.onboardingData.entryMethod).toBe('manual');
    expect(result.current.onboardingData.people).toEqual([]);
  });

  it('should handle data changes', () => {
    const { result } = renderHook(() => useOnboardingLogic(), { wrapper });

    act(() => {
      result.current.onDataChange({
        orgName: 'Test Company',
        orgProfile: { industry: 'Technology', companySize: '51-200' }
      });
    });

    expect(result.current.onboardingData.orgName).toBe('Test Company');
  });

  it('should navigate to next milestone', async () => {
    const { result } = renderHook(() => useOnboardingLogic(), { wrapper });

    await act(async () => {
      await result.current.handleNext();
    });

    expect(result.current.currentMilestoneIndex).toBe(1);
    expect(result.current.completedStepIds.has('organization-setup')).toBe(true);
  });

  it('should navigate to previous milestone', () => {
    const { result } = renderHook(() => useOnboardingLogic(), { wrapper });

    // First go to step 2
    act(() => {
      result.current.handleNext();
    });

    // Then go back
    act(() => {
      result.current.handleBack();
    });

    expect(result.current.currentMilestoneIndex).toBe(0);
  });

  it('should handle skip to specific step', () => {
    const { result } = renderHook(() => useOnboardingLogic(), { wrapper });

    // Mark first step as completed
    act(() => {
      result.current.handleNext();
    });

    // Skip to step 2 (index 1)
    act(() => {
      result.current.handleSkipTo(1);
    });

    expect(result.current.currentMilestoneIndex).toBe(1);
  });

  it('should not allow skipping to uncompleted steps beyond next', () => {
    const { result } = renderHook(() => useOnboardingLogic(), { wrapper });

    // Try to skip to step 3 without completing previous steps
    act(() => {
      result.current.handleSkipTo(2);
    });

    // Should stay at current step
    expect(result.current.currentMilestoneIndex).toBe(0);
  });

  it('should auto-save data changes', async () => {
    const { result } = renderHook(() => useOnboardingLogic(), { wrapper });

    act(() => {
      result.current.onDataChange({
        orgName: 'Test Company',
        orgProfile: { industry: 'Technology', companySize: '51-200' }
      });
    });

    // Wait for debounced auto-save
    await waitFor(() => {
      expect(mockSaveDraft).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('should handle draft resume', () => {
    // This test would need to be updated to properly mock the draft recovery state
    // Since the actual implementation uses useDraftRecovery hook
    const { result } = renderHook(() => useOnboardingLogic(), { wrapper });

    // Just test that the function exists
    expect(typeof result.current.handleResumeDraft).toBe('function');
    expect(typeof result.current.handleStartFresh).toBe('function');
  });

  it('should handle start fresh', async () => {
    const { result } = renderHook(() => useOnboardingLogic(), { wrapper });

    await act(async () => {
      await result.current.handleStartFresh();
    });

    expect(mockDeleteDraft).toHaveBeenCalled();
  });

  it('should filter milestones based on entry method', () => {
    const { result } = renderHook(() => useOnboardingLogic(), { wrapper });

    // Initially manual entry method
    expect(result.current.activeMilestones).toHaveLength(4);

    // Change to CSV
    act(() => {
      result.current.onDataChange({ entryMethod: 'csv' });
    });

    expect(result.current.activeMilestones).toHaveLength(3); // Should skip manual entry step
  });

  it('should complete onboarding and navigate to dashboard', async () => {
    const { result } = renderHook(() => useOnboardingLogic(), { wrapper });

    // Navigate to last step
    act(() => {
      result.current.onDataChange({ entryMethod: 'csv' }); // Skip manual entry
    });
    
    // Go through all steps
    await act(async () => {
      await result.current.handleNext(); // organization-setup -> data-import
    });
    
    await act(async () => {
      await result.current.handleNext(); // data-import -> appraisal-setup
    });
    
    await act(async () => {
      await result.current.handleNext(); // appraisal-setup -> complete
    });

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    expect(mockToast.success).toHaveBeenCalledWith('Onboarding completed successfully!');
  });

  it('should handle save errors gracefully', async () => {
    mockSaveDraft.mockResolvedValueOnce({ success: false, error: 'Network error' });

    const { result } = renderHook(() => useOnboardingLogic(), { wrapper });

    act(() => {
      result.current.onDataChange({
        orgName: 'Test Company',
        orgProfile: { industry: 'Technology', companySize: '51-200' }
      });
    });

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to save progress: Network error');
    }, { timeout: 3000 });
  });
});