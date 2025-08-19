import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { usePermissions } from '@/features/access-control/hooks/usePermissions';

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn()
  })),
  auth: {
    getUser: vi.fn()
  }
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

describe('usePermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return correct permissions for admin role', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null
    });

    mockSupabase.from().single.mockResolvedValue({
      data: { role: 'admin', is_active: true },
      error: null
    });

    const { result } = renderHook(() => usePermissions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hasAnyRole(['admin'])).toBe(true);
    expect(result.current.hasPermission('manage_employees')).toBe(true);
    expect(result.current.hasPermission('assign_roles')).toBe(true);
    expect(result.current.hasPermission('manage_appraisals')).toBe(true);
  });

  it('should return correct permissions for manager role', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null
    });

    mockSupabase.from().single.mockResolvedValue({
      data: { role: 'manager', is_active: true },
      error: null
    });

    const { result } = renderHook(() => usePermissions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hasAnyRole(['manager'])).toBe(true);
    expect(result.current.hasPermission('manage_employees')).toBe(true);
    expect(result.current.hasPermission('assign_roles')).toBe(false); // Managers can't assign admin roles
    expect(result.current.hasPermission('view_reports')).toBe(true);
  });

  it('should return correct permissions for employee role', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null
    });

    mockSupabase.from().single.mockResolvedValue({
      data: { role: 'employee', is_active: true },
      error: null
    });

    const { result } = renderHook(() => usePermissions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hasAnyRole(['employee'])).toBe(true);
    expect(result.current.hasPermission('manage_employees')).toBe(false);
    expect(result.current.hasPermission('assign_roles')).toBe(false);
    expect(result.current.hasPermission('view_own_data')).toBe(true);
  });

  it('should handle no role found', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null
    });

    mockSupabase.from().single.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116' } // No rows returned
    });

    const { result } = renderHook(() => usePermissions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hasAnyRole(['admin', 'manager', 'employee'])).toBe(false);
    expect(result.current.hasPermission('manage_employees')).toBe(false);
  });

  it('should handle inactive role', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null
    });

    mockSupabase.from().single.mockResolvedValue({
      data: { role: 'admin', is_active: false },
      error: null
    });

    const { result } = renderHook(() => usePermissions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hasAnyRole(['admin'])).toBe(false);
    expect(result.current.hasPermission('manage_employees')).toBe(false);
  });

  it('should handle authentication errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' }
    });

    const { result } = renderHook(() => usePermissions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hasAnyRole(['admin'])).toBe(false);
    expect(result.current.hasPermission('manage_employees')).toBe(false);
  });

  it('should check multiple roles correctly', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null
    });

    mockSupabase.from().single.mockResolvedValue({
      data: { role: 'supervisor', is_active: true },
      error: null
    });

    const { result } = renderHook(() => usePermissions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hasAnyRole(['admin', 'manager'])).toBe(false);
    expect(result.current.hasAnyRole(['supervisor', 'employee'])).toBe(true);
    expect(result.current.hasAnyRole(['supervisor'])).toBe(true);
  });
});