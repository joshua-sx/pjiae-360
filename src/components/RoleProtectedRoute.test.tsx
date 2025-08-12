import { render, screen } from '@testing-library/react';
import RoleProtectedRoute from './RoleProtectedRoute';
import { vi, describe, it, beforeEach, expect } from 'vitest';

const mockUsePermissions = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => mockUsePermissions(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('RoleProtectedRoute', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockUsePermissions.mockReturnValue({
      hasAnyRole: () => true,
      hasPermission: (p: string) => p === 'manage_employees' || p === 'view_reports',
      loading: false,
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when permissions are loading', () => {
      mockUsePermissions.mockReturnValue({
        loading: true,
      });

      render(
        <RoleProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </RoleProtectedRoute>
      );

      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('Role-Based Access', () => {
    it('renders children when user has required role', () => {
      mockUsePermissions.mockReturnValue({
        hasAnyRole: vi.fn(() => true),
        loading: false,
      });

      render(
        <RoleProtectedRoute requiredRoles={['admin']}>
          <div data-testid="protected-content">Protected Content</div>
        </RoleProtectedRoute>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('redirects when user lacks required role', () => {
      mockUsePermissions.mockReturnValue({
        hasAnyRole: vi.fn(() => false),
        loading: false,
      });

      render(
        <RoleProtectedRoute requiredRoles={['admin']}>
          <div data-testid="protected-content">Protected Content</div>
        </RoleProtectedRoute>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/unauthorized');
    });

    it('allows access when no roles required', () => {
      render(
        <RoleProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </RoleProtectedRoute>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('uses custom fallback path', () => {
      mockUsePermissions.mockReturnValue({
        hasAnyRole: vi.fn(() => false),
        loading: false,
      });

      render(
        <RoleProtectedRoute requiredRoles={['admin']} fallbackPath="/access-denied">
          <div data-testid="protected-content">Protected Content</div>
        </RoleProtectedRoute>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/access-denied');
    });
  });

  describe('Permission-Based Access', () => {
    it('renders children when user has required permissions', () => {
      mockUsePermissions.mockReturnValue({
        hasAnyRole: () => true,
        hasPermission: (p: string) => p === 'manage_employees' || p === 'view_reports',
        loading: false,
      });

      render(
        <RoleProtectedRoute requiredPermissions={['manage_employees']}>
          <div data-testid="protected-content">Protected Content</div>
        </RoleProtectedRoute>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('redirects when user lacks required permissions', () => {
      mockUsePermissions.mockReturnValue({
        hasAnyRole: () => true,
        hasPermission: (p: string) => p === 'view_reports',
        loading: false,
      });

      render(
        <RoleProtectedRoute requiredPermissions={['manage_employees']}>
          <div data-testid="protected-content">Protected Content</div>
        </RoleProtectedRoute>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/unauthorized');
    });

    it('requires all specified permissions', () => {
      mockUsePermissions.mockReturnValue({
        hasAnyRole: () => true,
        hasPermission: (p: string) => p === 'manage_employees',
        loading: false,
      });

      render(
        <RoleProtectedRoute requiredPermissions={['manage_employees', 'view_reports']}>
          <div data-testid="protected-content">Protected Content</div>
        </RoleProtectedRoute>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/unauthorized');
    });

    it('allows access when no permissions required', () => {
      render(
        <RoleProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </RoleProtectedRoute>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Combined Role and Permission Checks', () => {
    it('requires both role and permission to be satisfied', () => {
      mockUsePermissions.mockReturnValue({
        hasAnyRole: vi.fn(() => true),
        hasPermission: (p: string) => p === 'manage_employees',
        loading: false,
      });

      render(
        <RoleProtectedRoute 
          requiredRoles={['admin']} 
          requiredPermissions={['manage_employees']}
        >
          <div data-testid="protected-content">Protected Content</div>
        </RoleProtectedRoute>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('redirects when role is missing but permission exists', () => {
      mockUsePermissions.mockReturnValue({
        hasAnyRole: vi.fn(() => false),
        hasPermission: (p: string) => p === 'manage_employees',
        loading: false,
      });

      render(
        <RoleProtectedRoute 
          requiredRoles={['admin']} 
          requiredPermissions={['manage_employees']}
        >
          <div data-testid="protected-content">Protected Content</div>
        </RoleProtectedRoute>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/unauthorized');
    });

    it('redirects when permission is missing but role exists', () => {
      mockUsePermissions.mockReturnValue({
        hasAnyRole: vi.fn(() => true),
        hasPermission: (p: string) => false,
        loading: false,
      });

      render(
        <RoleProtectedRoute 
          requiredRoles={['admin']} 
          requiredPermissions={['manage_employees']}
        >
          <div data-testid="protected-content">Protected Content</div>
        </RoleProtectedRoute>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/unauthorized');
    });
  });

  describe('Access Denied Display', () => {
    it('shows access denied message before redirect', () => {
      mockUsePermissions.mockReturnValue({
        hasAnyRole: vi.fn(() => false),
        loading: false,
      });

      render(
        <RoleProtectedRoute requiredRoles={['admin']}>
          <div data-testid="protected-content">Protected Content</div>
        </RoleProtectedRoute>
      );

      expect(screen.getByText(/You don't have permission to access this page/)).toBeInTheDocument();
      expect(screen.getByText(/You will be redirected shortly/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing permissions gracefully', () => {
      mockUsePermissions.mockReturnValue({
        hasAnyRole: () => true,
        hasPermission: () => false,
        loading: false,
        // Missing legacy boolean properties on purpose
      });

      render(
        <RoleProtectedRoute requiredPermissions={['manage_employees']}>
          <div data-testid="protected-content">Protected Content</div>
        </RoleProtectedRoute>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/unauthorized');
    });

    it('handles empty arrays correctly', () => {
      render(
        <RoleProtectedRoute requiredRoles={[]} requiredPermissions={[]}>
          <div data-testid="protected-content">Protected Content</div>
        </RoleProtectedRoute>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('handles hasAnyRole function correctly with multiple roles', () => {
      const mockHasAnyRole = vi.fn((roles) => 
        roles.includes('manager') // User has manager role
      );

      mockUsePermissions.mockReturnValue({
        hasAnyRole: mockHasAnyRole,
        loading: false,
      });

      render(
        <RoleProtectedRoute requiredRoles={['admin', 'manager']}>
          <div data-testid="protected-content">Protected Content</div>
        </RoleProtectedRoute>
      );

      expect(mockHasAnyRole).toHaveBeenCalledWith(['admin', 'manager']);
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });
});