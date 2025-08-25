import { renderHook } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { useLoadingCoordinator } from './useLoadingCoordinator';

const mockAuth = vi.fn();
const mockOnboardingStatus = vi.fn();
const mockPermissions = vi.fn();

vi.mock('./useAuth', () => ({
  useAuth: () => mockAuth(),
}));

vi.mock('./useOnboardingStatus', () => ({
  useOnboardingStatus: () => mockOnboardingStatus(),
}));

vi.mock('@/features/access-control/hooks/usePermissions', () => ({
  usePermissions: () => mockPermissions(),
}));

describe('useLoadingCoordinator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockReturnValue({ loading: false });
    mockOnboardingStatus.mockReturnValue({ loading: false });
    mockPermissions.mockReturnValue({ loading: false });
  });

  it('returns correct loading states when all hooks are not loading', () => {
    const { result } = renderHook(() => useLoadingCoordinator());

    expect(result.current).toEqual({
      isInitializing: false,
      canProceed: true,
      loadingStates: {
        auth: false,
        onboarding: false,
        permissions: false,
      },
    });
  });

  it('returns initializing true when auth is loading', () => {
    mockAuth.mockReturnValue({ loading: true });

    const { result } = renderHook(() => useLoadingCoordinator());

    expect(result.current.isInitializing).toBe(true);
    expect(result.current.canProceed).toBe(false);
    expect(result.current.loadingStates.auth).toBe(true);
  });

  it('returns initializing true when onboarding is loading', () => {
    mockOnboardingStatus.mockReturnValue({ loading: true });

    const { result } = renderHook(() => useLoadingCoordinator());

    expect(result.current.isInitializing).toBe(true);
    expect(result.current.canProceed).toBe(false);
    expect(result.current.loadingStates.onboarding).toBe(true);
  });

  it('returns initializing true when permissions is loading', () => {
    mockPermissions.mockReturnValue({ loading: true });

    const { result } = renderHook(() => useLoadingCoordinator());

    expect(result.current.isInitializing).toBe(true);
    expect(result.current.canProceed).toBe(false);
    expect(result.current.loadingStates.permissions).toBe(true);
  });

  it('returns initializing true when multiple hooks are loading', () => {
    mockAuth.mockReturnValue({ loading: true });
    mockOnboardingStatus.mockReturnValue({ loading: true });

    const { result } = renderHook(() => useLoadingCoordinator());

    expect(result.current.isInitializing).toBe(true);
    expect(result.current.canProceed).toBe(false);
    expect(result.current.loadingStates.auth).toBe(true);
    expect(result.current.loadingStates.onboarding).toBe(true);
  });

  it('tracks individual loading states correctly', () => {
    mockAuth.mockReturnValue({ loading: true });
    mockOnboardingStatus.mockReturnValue({ loading: false });
    mockPermissions.mockReturnValue({ loading: true });

    const { result } = renderHook(() => useLoadingCoordinator());

    expect(result.current.loadingStates).toEqual({
      auth: true,
      onboarding: false,
      permissions: true,
    });
  });
});