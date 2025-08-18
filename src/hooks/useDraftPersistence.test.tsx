import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { useDraftPersistence } from './useDraftPersistence';
import type { OnboardingData } from '@/components/onboarding/OnboardingTypes';

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    insert: vi.fn().mockResolvedValue({ data: [{ id: 'test-draft-id' }], error: null }),
    update: vi.fn().mockResolvedValue({ data: [{ id: 'test-draft-id' }], error: null }),
    select: vi.fn().mockResolvedValue({ data: [], error: null }),
    delete: vi.fn().mockResolvedValue({ data: [], error: null }),
    lt: vi.fn().mockReturnThis(),
  })),
  auth: {
    getUser: vi.fn().mockResolvedValue({ 
      data: { user: { id: 'test-user-id' } }, 
      error: null 
    })
  }
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

// Mock console to avoid noise in tests
vi.mock('console', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    log: vi.fn(),
  }
}));

describe('useDraftPersistence', () => {
  const mockOnboardingData: OnboardingData = {
    orgName: 'Test Company',
    logo: null,
    entryMethod: 'manual',
    orgProfile: { industry: 'Technology', companySize: '51-200' },
    adminInfo: { name: 'Admin', email: 'admin@company.com', role: 'admin' },
    csvData: { rawData: '', headers: [], rows: [], columnMapping: {} },
    people: [],
    orgStructure: [],
    roles: { directors: [], managers: [], supervisors: [], employees: [] },
    reviewCycle: { frequency: 'annual', startDate: '', visibility: true },
    importStats: { total: 0, successful: 0, errors: 0 }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset localStorage
    localStorage.clear();
  });

  it('should save draft successfully', async () => {
    const { result } = renderHook(() => useDraftPersistence());

    const saveResult = await result.current.saveDraft(1, mockOnboardingData, 'org-123');

    expect(saveResult.success).toBe(true);
    expect(saveResult.draftId).toBe('test-draft-id');
    expect(mockSupabase.from).toHaveBeenCalledWith('onboarding_drafts');
  });

  it('should update existing draft', async () => {
    const { result } = renderHook(() => useDraftPersistence());

    // First save
    await result.current.saveDraft(1, mockOnboardingData, 'org-123');
    
    // Second save should update
    const updateResult = await result.current.saveDraft(2, mockOnboardingData, 'org-123');

    expect(updateResult.success).toBe(true);
    expect(mockSupabase.from().update).toHaveBeenCalled();
  });

  it('should handle save errors gracefully', async () => {
    mockSupabase.from.mockReturnValueOnce({
      insert: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } }),
      update: vi.fn(),
      select: vi.fn(),
      delete: vi.fn(),
      lt: vi.fn()
    });

    const { result } = renderHook(() => useDraftPersistence());

    const saveResult = await result.current.saveDraft(1, mockOnboardingData, 'org-123');

    expect(saveResult.success).toBe(false);
    expect(saveResult.error).toBe('Database error');
  });

  it('should load draft successfully', async () => {
    const mockDraft = {
      id: 'test-draft-id',
      user_id: 'test-user-id',
      current_step: 2,
      draft_data: mockOnboardingData,
      last_saved_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({ data: [mockDraft], error: null }),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      lt: vi.fn()
    });

    const { result } = renderHook(() => useDraftPersistence());

    const draft = await result.current.loadDraft();

    expect(draft).toEqual(mockDraft);
  });

  it('should delete draft successfully', async () => {
    const { result } = renderHook(() => useDraftPersistence());

    const deleteResult = await result.current.deleteDraft('test-draft-id');

    expect(deleteResult).toBe(true);
    expect(mockSupabase.from().delete).toHaveBeenCalled();
  });

  it('should clean up expired drafts', async () => {
    const { result } = renderHook(() => useDraftPersistence());

    await result.current.cleanupExpiredDrafts();

    expect(mockSupabase.from().delete).toHaveBeenCalled();
    expect(mockSupabase.from().lt).toHaveBeenCalledWith('expires_at', expect.any(String));
  });

  it('should fallback to localStorage when offline', async () => {
    // Mock network error
    mockSupabase.from.mockReturnValueOnce({
      insert: vi.fn().mockRejectedValue(new Error('Network error')),
      update: vi.fn(),
      select: vi.fn(),
      delete: vi.fn(),
      lt: vi.fn()
    });

    const { result } = renderHook(() => useDraftPersistence());

    const saveResult = await result.current.saveDraft(1, mockOnboardingData, 'org-123');

    // Should still succeed with localStorage fallback
    expect(saveResult.success).toBe(true);
    expect(localStorage.getItem('onboarding_draft')).toBeTruthy();
  });

  it('should track online/offline status', async () => {
    const { result } = renderHook(() => useDraftPersistence());

    // Initially should be online
    expect(result.current.isOnline).toBe(true);

    // Simulate going offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    window.dispatchEvent(new Event('offline'));

    await waitFor(() => {
      expect(result.current.isOnline).toBe(false);
    });
  });
});