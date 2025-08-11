import { renderHook, act, waitFor } from '@testing-library/react';
import { useRoleAssignment } from './useRoleAssignment';
import { vi, describe, it, beforeEach, expect } from 'vitest';

// Use hoisted mocks
const { mockSupabaseFrom, mockSupabaseRpc, mockUsePermissions, mockToast } = vi.hoisted(() => ({
  mockSupabaseFrom: vi.fn(),
  mockSupabaseRpc: vi.fn(),
  mockUsePermissions: vi.fn(),
  mockToast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => mockSupabaseFrom(),
        }),
      }),
    }),
    rpc: mockSupabaseRpc,
  },
}));

vi.mock('./usePermissions', () => ({
  usePermissions: () => mockUsePermissions(),
}));

vi.mock('sonner', () => ({
  toast: mockToast,
}));

describe('useRoleAssignment', () => {
  beforeEach(() => {
    mockUsePermissions.mockReturnValue({
      isAdmin: false,
      isDirector: false,
      isManager: false,
    });
    mockSupabaseFrom.mockResolvedValue({
      data: { user_id: 'user-123' },
      error: null,
    });
    mockSupabaseRpc.mockResolvedValue({
      data: { success: true },
      error: null,
    });
    mockToast.success.mockReset();
    mockToast.error.mockReset();
  });

  describe('canAssignRole', () => {
    it('admin can assign any role', () => {
      mockUsePermissions.mockReturnValue({
        isAdmin: true,
        isDirector: false,
        isManager: false,
      });

      const { result } = renderHook(() => useRoleAssignment());

      expect(result.current.canAssignRole('admin')).toBe(true);
      expect(result.current.canAssignRole('director')).toBe(true);
      expect(result.current.canAssignRole('manager')).toBe(true);
      expect(result.current.canAssignRole('supervisor')).toBe(true);
      expect(result.current.canAssignRole('employee')).toBe(true);
    });

    it('director can assign director and below roles', () => {
      mockUsePermissions.mockReturnValue({
        isAdmin: false,
        isDirector: true,
        isManager: false,
      });

      const { result } = renderHook(() => useRoleAssignment());

      expect(result.current.canAssignRole('admin')).toBe(false);
      expect(result.current.canAssignRole('director')).toBe(true);
      expect(result.current.canAssignRole('manager')).toBe(true);
      expect(result.current.canAssignRole('supervisor')).toBe(true);
      expect(result.current.canAssignRole('employee')).toBe(true);
    });

    it('manager can assign manager and below roles', () => {
      mockUsePermissions.mockReturnValue({
        isAdmin: false,
        isDirector: false,
        isManager: true,
      });

      const { result } = renderHook(() => useRoleAssignment());

      expect(result.current.canAssignRole('admin')).toBe(false);
      expect(result.current.canAssignRole('director')).toBe(false);
      expect(result.current.canAssignRole('manager')).toBe(true);
      expect(result.current.canAssignRole('supervisor')).toBe(true);
      expect(result.current.canAssignRole('employee')).toBe(true);
    });

    it('employee cannot assign any roles', () => {
      mockUsePermissions.mockReturnValue({
        isAdmin: false,
        isDirector: false,
        isManager: false,
      });

      const { result } = renderHook(() => useRoleAssignment());

      expect(result.current.canAssignRole('admin')).toBe(false);
      expect(result.current.canAssignRole('director')).toBe(false);
      expect(result.current.canAssignRole('manager')).toBe(false);
      expect(result.current.canAssignRole('supervisor')).toBe(false);
      expect(result.current.canAssignRole('employee')).toBe(false);
    });
  });

  describe('assignRole', () => {
    beforeEach(() => {
      mockUsePermissions.mockReturnValue({
        isAdmin: true,
        isDirector: false,
        isManager: false,
      });
    });

    it('successfully assigns role with valid permissions', async () => {
      const { result } = renderHook(() => useRoleAssignment());

      await act(async () => {
        const response = await result.current.assignRole({
          profileId: 'profile-123',
          role: 'manager',
          reason: 'Promotion to manager role',
        });

        expect(response.success).toBe(true);
      });

      expect(mockSupabaseRpc).toHaveBeenCalledWith('assign_user_role_secure', {
        _target_user_id: 'user-123',
        _role: 'manager',
        _reason: 'Promotion to manager role',
      });
      expect(mockToast.success).toHaveBeenCalledWith('Successfully assigned manager role');
    });

    it('fails when user lacks permissions', async () => {
      mockUsePermissions.mockReturnValue({
        isAdmin: false,
        isDirector: false,
        isManager: false,
      });

      const { result } = renderHook(() => useRoleAssignment());

      await act(async () => {
        const response = await result.current.assignRole({
          profileId: 'profile-123',
          role: 'admin',
          reason: 'Test reason',
        });

        expect(response.success).toBe(false);
        expect(response.error).toBe('Insufficient permissions');
      });

      expect(mockToast.error).toHaveBeenCalledWith('Insufficient permissions to assign this role');
    });

    it('fails when reason is empty', async () => {
      const { result } = renderHook(() => useRoleAssignment());

      await act(async () => {
        const response = await result.current.assignRole({
          profileId: 'profile-123',
          role: 'manager',
          reason: '',
        });

        expect(response.success).toBe(false);
        expect(response.error).toBe('Reason is required');
      });

      expect(mockToast.error).toHaveBeenCalledWith('Reason is required for role assignment');
    });

    it('handles profile not found error', async () => {
      mockSupabaseFrom.mockResolvedValue({
        data: null,
        error: null,
      });

      const { result } = renderHook(() => useRoleAssignment());

      await act(async () => {
        const response = await result.current.assignRole({
          profileId: 'invalid-profile',
          role: 'manager',
          reason: 'Test reason',
        });

        expect(response.success).toBe(false);
        expect(response.error).toContain('Profile not found');
      });

      expect(mockToast.error).toHaveBeenCalled();
    });

    it('handles database errors gracefully', async () => {
      mockSupabaseRpc.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const { result } = renderHook(() => useRoleAssignment());

      await act(async () => {
        const response = await result.current.assignRole({
          profileId: 'profile-123',
          role: 'manager',
          reason: 'Test reason',
        });

        expect(response.success).toBe(false);
      });

      expect(mockToast.error).toHaveBeenCalled();
    });

    it('updates isAssigning state correctly', async () => {
      const { result } = renderHook(() => useRoleAssignment());

      expect(result.current.isAssigning).toBe(false);

      act(() => {
        result.current.assignRole({
          profileId: 'profile-123',
          role: 'manager',
          reason: 'Test reason',
        });
      });

      await waitFor(() => {
        expect(result.current.isAssigning).toBe(false);
      });
    });
  });

  describe('bulkAssignRoles', () => {
    beforeEach(() => {
      mockUsePermissions.mockReturnValue({
        isAdmin: true,
        isDirector: false,
        isManager: false,
      });
    });

    it('successfully processes bulk assignments', async () => {
      const { result } = renderHook(() => useRoleAssignment());

      const assignments = [
        { profileId: 'profile-1', role: 'manager' as const },
        { profileId: 'profile-2', role: 'supervisor' as const },
      ];

      await act(async () => {
        const response = await result.current.bulkAssignRoles({
          assignments,
          reason: 'Bulk promotion',
        });

        expect(response.success).toBe(true);
        expect(response.successCount).toBe(2);
        expect(response.failureCount).toBe(0);
      });

      expect(mockSupabaseRpc).toHaveBeenCalledTimes(2);
      expect(mockToast.success).toHaveBeenCalledWith('Successfully assigned roles to 2 user(s)');
    });

    it('handles mixed success and failure results', async () => {
      mockSupabaseRpc
        .mockResolvedValueOnce({ data: { success: true }, error: null })
        .mockResolvedValueOnce({ data: { success: false, error: 'Role conflict' }, error: null });

      const { result } = renderHook(() => useRoleAssignment());

      const assignments = [
        { profileId: 'profile-1', role: 'manager' as const },
        { profileId: 'profile-2', role: 'supervisor' as const },
      ];

      await act(async () => {
        const response = await result.current.bulkAssignRoles({
          assignments,
          reason: 'Bulk assignment',
        });

        expect(response.success).toBe(false);
        expect(response.successCount).toBe(1);
        expect(response.failureCount).toBe(1);
      });

      expect(mockToast.success).toHaveBeenCalledWith('Successfully assigned roles to 1 user(s)');
      expect(mockToast.error).toHaveBeenCalledWith('Failed to assign roles to 1 user(s)');
    });

    it('validates permissions for all assignments before processing', async () => {
      mockUsePermissions.mockReturnValue({
        isAdmin: false,
        isDirector: true,
        isManager: false,
      });

      const { result } = renderHook(() => useRoleAssignment());

      const assignments = [
        { profileId: 'profile-1', role: 'manager' as const },
        { profileId: 'profile-2', role: 'admin' as const }, // Should fail permission check
      ];

      await act(async () => {
        const response = await result.current.bulkAssignRoles({
          assignments,
          reason: 'Bulk assignment',
        });

        expect(response.success).toBe(false);
        expect(response.error).toBe('Insufficient permissions');
      });

      expect(mockSupabaseRpc).not.toHaveBeenCalled();
      expect(mockToast.error).toHaveBeenCalledWith('Insufficient permissions for some role assignments');
    });

    it('requires reason for bulk assignments', async () => {
      const { result } = renderHook(() => useRoleAssignment());

      const assignments = [
        { profileId: 'profile-1', role: 'manager' as const },
      ];

      await act(async () => {
        const response = await result.current.bulkAssignRoles({
          assignments,
          reason: '',
        });

        expect(response.success).toBe(false);
        expect(response.error).toBe('Reason is required');
      });

      expect(mockToast.error).toHaveBeenCalledWith('Reason is required for bulk role assignment');
    });
  });
});