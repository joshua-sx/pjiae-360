import { renderHook, waitFor } from '@testing-library/react';
import { usePermissions } from './usePermissions';
import { vi, describe, it, beforeEach, expect } from 'vitest';

// Use hoisted mocks
const { mockGetCurrentUserRoles, mockUseAuth, mockUseOnboardingStatus, mockUseDemoMode } = vi.hoisted(() => ({
  mockGetCurrentUserRoles: vi.fn(),
  mockUseAuth: vi.fn(),
  mockUseOnboardingStatus: vi.fn(),
  mockUseDemoMode: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: vi.fn(() => Promise.resolve({ data: mockGetCurrentUserRoles(), error: null })),
  },
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/hooks/useOnboardingStatus', () => ({
  useOnboardingStatus: () => mockUseOnboardingStatus(),
}));

vi.mock('@/contexts/DemoModeContext', () => ({
  useDemoMode: () => mockUseDemoMode(),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryFn, enabled }: any) => {
    if (!enabled) {
      return { data: undefined, isLoading: true };
    }
    
    try {
      const result = queryFn();
      if (result && typeof result.then === 'function') {
        return { data: [], isLoading: false };
      }
      return { data: result || [], isLoading: false };
    } catch {
      return { data: [], isLoading: false };
    }
  },
}));

describe('usePermissions', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-123' },
      loading: false,
    });
    mockUseOnboardingStatus.mockReturnValue({
      onboardingCompleted: true,
    });
    mockUseDemoMode.mockReturnValue({
      isDemoMode: false,
      demoRole: null,
    });
    mockGetCurrentUserRoles.mockReturnValue([]);
  });

  describe('Role Detection', () => {
    it('correctly identifies admin role', async () => {
      mockGetCurrentUserRoles.mockReturnValue([{ role: 'admin' }]);
      
      const { result } = renderHook(() => usePermissions());
      
      await waitFor(() => {
        expect(result.current.isAdmin).toBe(true);
        expect(result.current.hasRole('admin')).toBe(true);
        expect(result.current.roles).toContain('admin');
      });
    });

    it('correctly identifies multiple roles', async () => {
      mockGetCurrentUserRoles.mockReturnValue([
        { role: 'manager' },
        { role: 'employee' }
      ]);
      
      const { result } = renderHook(() => usePermissions());
      
      await waitFor(() => {
        expect(result.current.isManager).toBe(true);
        expect(result.current.isEmployee).toBe(true);
        expect(result.current.hasAnyRole(['manager', 'admin'])).toBe(true);
        expect(result.current.hasAnyRole(['admin', 'director'])).toBe(false);
      });
    });
  });

  describe('Permission Calculations', () => {
    it('calculates admin permissions correctly', async () => {
      mockGetCurrentUserRoles.mockReturnValue([{ role: 'admin' }]);
      
      const { result } = renderHook(() => usePermissions());
      
      await waitFor(() => {
        expect(result.current.canManageEmployees).toBe(true);
        expect(result.current.canViewReports).toBe(true);
        expect(result.current.canManageRoles).toBe(true);
        expect(result.current.canManageOrganization).toBe(true);
        expect(result.current.canManageAppraisalCycles).toBe(true);
      });
    });

    it('calculates manager permissions correctly', async () => {
      mockGetCurrentUserRoles.mockReturnValue([{ role: 'manager' }]);
      
      const { result } = renderHook(() => usePermissions());
      
      await waitFor(() => {
        expect(result.current.canViewReports).toBe(true);
        expect(result.current.canCreateAppraisals).toBe(true);
        expect(result.current.canManageGoals).toBe(true);
        expect(result.current.canManageEmployees).toBe(false);
        expect(result.current.canManageRoles).toBe(false);
      });
    });

    it('calculates employee permissions correctly', async () => {
      mockGetCurrentUserRoles.mockReturnValue([{ role: 'employee' }]);
      
      const { result } = renderHook(() => usePermissions());
      
      await waitFor(() => {
        expect(result.current.canViewReports).toBe(false);
        expect(result.current.canManageEmployees).toBe(false);
        expect(result.current.canManageRoles).toBe(false);
        expect(result.current.canManageGoals).toBe(false);
      });
    });
  });

  describe('Demo Mode', () => {
    it('uses demo role when in demo mode', async () => {
      mockUseDemoMode.mockReturnValue({
        isDemoMode: true,
        demoRole: 'admin',
      });
      
      const { result } = renderHook(() => usePermissions());
      
      await waitFor(() => {
        expect(result.current.isAdmin).toBe(true);
        expect(result.current.roles).toEqual(['admin']);
      });
    });

    it('ignores database roles when in demo mode', async () => {
      mockUseDemoMode.mockReturnValue({
        isDemoMode: true,
        demoRole: 'employee',
      });
      mockGetCurrentUserRoles.mockReturnValue([{ role: 'admin' }]);
      
      const { result } = renderHook(() => usePermissions());
      
      await waitFor(() => {
        expect(result.current.isEmployee).toBe(true);
        expect(result.current.isAdmin).toBe(false);
        expect(result.current.roles).toEqual(['employee']);
      });
    });
  });

  describe('Onboarding State', () => {
    it('returns empty roles during onboarding', async () => {
      mockUseOnboardingStatus.mockReturnValue({
        onboardingCompleted: false,
      });
      mockGetCurrentUserRoles.mockReturnValue([{ role: 'admin' }]);
      
      const { result } = renderHook(() => usePermissions());
      
      await waitFor(() => {
        expect(result.current.roles).toEqual([]);
        expect(result.current.isInOnboarding).toBe(true);
        expect(result.current.isAdmin).toBe(false);
      });
    });

    it('returns empty roles when onboarding status is null', async () => {
      mockUseOnboardingStatus.mockReturnValue({
        onboardingCompleted: null,
      });
      
      const { result } = renderHook(() => usePermissions());
      
      await waitFor(() => {
        expect(result.current.roles).toEqual([]);
        expect(result.current.isInOnboarding).toBe(true);
      });
    });

    it('fetches roles after onboarding completion', async () => {
      mockUseOnboardingStatus.mockReturnValue({
        onboardingCompleted: true,
      });
      mockGetCurrentUserRoles.mockReturnValue([{ role: 'manager' }]);
      
      const { result } = renderHook(() => usePermissions());
      
      await waitFor(() => {
        expect(result.current.roles).toEqual(['manager']);
        expect(result.current.isInOnboarding).toBe(false);
        expect(result.current.isManager).toBe(true);
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading when auth is loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
      });
      
      const { result } = renderHook(() => usePermissions());
      
      expect(result.current.loading).toBe(true);
    });

    it('stops loading when auth completes', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-123' },
        loading: false,
      });
      
      const { result } = renderHook(() => usePermissions());
      
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('handles database errors gracefully', async () => {
      mockGetCurrentUserRoles.mockImplementation(() => {
        throw new Error('Database error');
      });
      
      const { result } = renderHook(() => usePermissions());
      
      await waitFor(() => {
        expect(result.current.roles).toEqual([]);
        expect(result.current.loading).toBe(false);
      });
    });

    it('handles null user gracefully', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
      });
      
      const { result } = renderHook(() => usePermissions());
      
      expect(result.current.roles).toEqual([]);
      expect(result.current.isAdmin).toBe(false);
    });
  });
});