import { renderHook, act, waitFor } from '@testing-library/react';
import { usePermissions } from '@/features/access-control/hooks/usePermissions';
import { useRoleAssignment } from '@/hooks/useRoleAssignment';
import { vi, describe, it, beforeEach, expect } from 'vitest';

// Integration test for role transitions and cross-organizational isolation
const { mockSupabase, mockUseAuth } = vi.hoisted(() => ({
  mockSupabase: {
    rpc: vi.fn(),
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  },
  mockUseAuth: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/hooks/useOnboardingStatus', () => ({
  useOnboardingStatus: () => ({ onboardingCompleted: true }),
}));

vi.mock('@/contexts/DemoModeContext', () => ({
  useDemoMode: () => ({ isDemoMode: false, demoRole: null }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryFn, enabled }: any) => {
    if (!enabled) return { data: undefined, isLoading: true };
    return { data: queryFn() || [], isLoading: false };
  },
}));

describe('Role Transitions Integration', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-123' },
      loading: false,
    });
    mockSupabase.rpc.mockResolvedValue({
      data: [{ role: 'employee' }],
      error: null,
    });
  });

  describe('Role Progression Scenarios', () => {
    it('handles employee to supervisor promotion', async () => {
      // Start as employee
      mockSupabase.rpc.mockResolvedValueOnce({
        data: [{ role: 'employee' }],
        error: null,
      });

      const { result: permissionsResult } = renderHook(() => usePermissions());
      const { result: roleAssignmentResult } = renderHook(() => useRoleAssignment());

      // Verify initial employee permissions
      expect(permissionsResult.current.isEmployee).toBe(true);
      expect(permissionsResult.current.canCreateAppraisals).toBe(false);

      // Simulate promotion to supervisor
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: { user_id: 'user-123' },
        error: null,
      });
      
      mockSupabase.rpc.mockResolvedValueOnce({
        data: { success: true },
        error: null,
      });

      await act(async () => {
        await roleAssignmentResult.current.assignRole({
          profileId: 'profile-123',
          role: 'supervisor',
          reason: 'Performance promotion',
        });
      });

      // Update permissions query to return supervisor
      mockSupabase.rpc.mockResolvedValue({
        data: [{ role: 'supervisor' }],
        error: null,
      });

      // Verify new supervisor permissions
      await waitFor(() => {
        expect(permissionsResult.current.isSupervisor).toBe(true);
        expect(permissionsResult.current.canCreateAppraisals).toBe(true);
      });
    });

    it('enforces organizational isolation', async () => {
      // Mock cross-org access attempt
      mockSupabase.rpc.mockRejectedValue({
        message: 'User not in target organization',
      });

      const { result } = renderHook(() => useRoleAssignment());

      await act(async () => {
        const response = await result.current.assignRole({
          profileId: 'other-org-profile',
          role: 'manager',
          reason: 'Cross-org promotion attempt',
        });

        expect(response.success).toBe(false);
      });
    });
  });

  describe('Bulk Role Assignment Integration', () => {
    it('processes bulk assignments with mixed success', async () => {
      mockSupabase.from().select().eq().single
        .mockResolvedValueOnce({ data: { user_id: 'user-1' }, error: null })
        .mockResolvedValueOnce({ data: { user_id: 'user-2' }, error: null });

      mockSupabase.rpc
        .mockResolvedValueOnce({ data: { success: true }, error: null })
        .mockResolvedValueOnce({ data: { success: false, error: 'Role conflict' }, error: null });

      const { result } = renderHook(() => useRoleAssignment());

      await act(async () => {
        const response = await result.current.bulkAssignRoles({
          assignments: [
            { profileId: 'profile-1', role: 'supervisor' },
            { profileId: 'profile-2', role: 'manager' },
          ],
          reason: 'Quarterly promotions',
        });

        expect(response.success).toBe(false);
        expect(response.successCount).toBe(1);
        expect(response.failureCount).toBe(1);
      });
    });
  });
});