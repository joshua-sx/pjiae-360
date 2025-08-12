import { renderHook } from '@testing-library/react';
import { useRequirePermission } from './useRequirePermission';
import { vi, describe, it, beforeEach, expect } from 'vitest';

const mockNavigate = vi.fn();
const mockUsePermissions = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('./usePermissions', () => ({
  usePermissions: () => mockUsePermissions(),
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}));

describe('useRequirePermission', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockUsePermissions.mockReset();
  });

  it('redirects when user lacks required role', () => {
    mockUsePermissions.mockReturnValue({
      hasAnyRole: () => false,
      hasPermission: () => false,
      loading: false,
    });
    renderHook(() => useRequirePermission({ roles: ['admin'] }));
    expect(mockNavigate).toHaveBeenCalledWith('/unauthorized', { replace: true });
  });

  it('allows access when user has role', () => {
    mockUsePermissions.mockReturnValue({
      hasAnyRole: () => true,
      hasPermission: () => true,
      loading: false,
    });
    const { result } = renderHook(() => useRequirePermission({ roles: ['admin'] }));
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(result.current.hasAccess).toBe(true);
  });
});

