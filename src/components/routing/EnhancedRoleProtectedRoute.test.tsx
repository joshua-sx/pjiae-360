import { render, screen } from '@testing-library/react';
import { EnhancedRoleProtectedRoute } from './EnhancedRoleProtectedRoute';
import { vi, describe, it, beforeEach, expect } from 'vitest';

const mockUseAuth = vi.fn();
const mockUsePermissions = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => mockUsePermissions(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock the child components
vi.mock('../ProtectedRoute', () => ({
  default: ({ children }: { children: React.ReactNode }) => {
    const auth = mockUseAuth();
    
    if (auth.loading) {
      return <div data-testid="auth-loading">Loading auth...</div>;
    }
    
    if (!auth.user) {
      return <div data-testid="auth-redirect">Redirecting to login...</div>;
    }
    
    return <>{children}</>;
  },
}));

vi.mock('../RoleProtectedRoute', () => ({
  default: ({ children, requiredRoles, requiredPermissions }: any) => {
    const permissions = mockUsePermissions();
    
    if (permissions.loading) {
      return <div data-testid="role-loading">Loading roles...</div>;
    }
    
    // Simulate role check logic
    const hasRequiredRole = !requiredRoles || requiredRoles.length === 0 || 
      (permissions.hasAnyRole && permissions.hasAnyRole(requiredRoles));
    
    const hasRequiredPermissions = !requiredPermissions || requiredPermissions.length === 0 ||
      requiredPermissions.every((perm: string) => permissions[perm]);
    
    if (!hasRequiredRole || !hasRequiredPermissions) {
      return <div data-testid="role-access-denied">Access denied by role check</div>;
    }
    
    return <>{children}</>;
  },
}));

vi.mock('../ui/navigation-loader', () => ({
  RouteLoader: () => <div data-testid="route-loader">Loading route...</div>,
}));

describe('EnhancedRoleProtectedRoute', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockUseAuth.mockReturnValue({
      user: { id: 'user-123' },
      loading: false,
    });
    mockUsePermissions.mockReturnValue({
      hasAnyRole: () => true,
      loading: false,
      canManageEmployees: true,
      canViewReports: true,
    });
  });

  describe('Authentication Layer', () => {
    it('shows auth loading when authentication is loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
      });

      render(
        <EnhancedRoleProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </EnhancedRoleProtectedRoute>
      );

      expect(screen.getByTestId('auth-loading')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('shows auth redirect when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
      });

      render(
        <EnhancedRoleProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </EnhancedRoleProtectedRoute>
      );

      expect(screen.getByTestId('auth-redirect')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('Role Protection Layer', () => {
    it('shows role loading when permissions are loading', () => {
      mockUsePermissions.mockReturnValue({
        loading: true,
      });

      render(
        <EnhancedRoleProtectedRoute requiredRoles={['admin']}>
          <div data-testid="protected-content">Protected Content</div>
        </EnhancedRoleProtectedRoute>
      );

      expect(screen.getByTestId('role-loading')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('shows role access denied when user lacks required roles', () => {
      mockUsePermissions.mockReturnValue({
        hasAnyRole: vi.fn(() => false),
        loading: false,
      });

      render(
        <EnhancedRoleProtectedRoute requiredRoles={['admin']}>
          <div data-testid="protected-content">Protected Content</div>
        </EnhancedRoleProtectedRoute>
      );

      expect(screen.getByTestId('role-access-denied')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('shows role access denied when user lacks required permissions', () => {
      mockUsePermissions.mockReturnValue({
        hasAnyRole: () => true,
        loading: false,
        canManageEmployees: false,
      });

      render(
        <EnhancedRoleProtectedRoute requiredPermissions={['canManageEmployees']}>
          <div data-testid="protected-content">Protected Content</div>
        </EnhancedRoleProtectedRoute>
      );

      expect(screen.getByTestId('role-access-denied')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('Suspense Layer', () => {
    it('shows route loader when content is lazy loading', () => {
      // Mock a component that throws a promise (Suspense behavior)
      const LazyComponent = () => {
        throw new Promise(() => {}); // Never resolves, simulating loading
      };

      render(
        <EnhancedRoleProtectedRoute>
          <LazyComponent />
        </EnhancedRoleProtectedRoute>
      );

      expect(screen.getByTestId('route-loader')).toBeInTheDocument();
    });
  });

  describe('Successful Access', () => {
    it('renders children when all protection layers pass', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-123' },
        loading: false,
      });
      
      mockUsePermissions.mockReturnValue({
        hasAnyRole: vi.fn(() => true),
        loading: false,
        canManageEmployees: true,
      });

      render(
        <EnhancedRoleProtectedRoute 
          requiredRoles={['admin']} 
          requiredPermissions={['canManageEmployees']}
        >
          <div data-testid="protected-content">Protected Content</div>
        </EnhancedRoleProtectedRoute>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('renders children when no requirements specified', () => {
      render(
        <EnhancedRoleProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </EnhancedRoleProtectedRoute>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  describe('Props Forwarding', () => {
    it('forwards requiredRoles to RoleProtectedRoute', () => {
      mockUsePermissions.mockReturnValue({
        hasAnyRole: vi.fn(() => true),
        loading: false,
      });

      render(
        <EnhancedRoleProtectedRoute requiredRoles={['admin', 'manager']}>
          <div data-testid="protected-content">Protected Content</div>
        </EnhancedRoleProtectedRoute>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('forwards requiredPermissions to RoleProtectedRoute', () => {
      const requiredPermissions = ['canManageEmployees', 'canViewReports'];
      
      mockUsePermissions.mockReturnValue({
        hasAnyRole: () => true,
        loading: false,
        canManageEmployees: true,
        canViewReports: true,
      });

      render(
        <EnhancedRoleProtectedRoute requiredPermissions={requiredPermissions}>
          <div data-testid="protected-content">Protected Content</div>
        </EnhancedRoleProtectedRoute>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  describe('Complex Access Scenarios', () => {
    it('handles multiple roles with mixed permissions', () => {
      mockUsePermissions.mockReturnValue({
        hasAnyRole: vi.fn((roles) => roles.includes('manager')), // User has manager role
        loading: false,
        canManageEmployees: false, // But lacks this permission
        canViewReports: true,
      });

      render(
        <EnhancedRoleProtectedRoute 
          requiredRoles={['admin', 'manager']} 
          requiredPermissions={['canManageEmployees', 'canViewReports']}
        >
          <div data-testid="protected-content">Protected Content</div>
        </EnhancedRoleProtectedRoute>
      );

      expect(screen.getByTestId('role-access-denied')).toBeInTheDocument();
    });

    it('grants access when user exceeds minimum requirements', () => {
      mockUsePermissions.mockReturnValue({
        hasAnyRole: vi.fn(() => true), // User has admin (higher than required manager)
        loading: false,
        canManageEmployees: true,
        canViewReports: true,
        canManageOrganization: true, // Extra permission
      });

      render(
        <EnhancedRoleProtectedRoute 
          requiredRoles={['manager']} 
          requiredPermissions={['canViewReports']}
        >
          <div data-testid="protected-content">Protected Content</div>
        </EnhancedRoleProtectedRoute>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  describe('Loading State Priorities', () => {
    it('prioritizes auth loading over role loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
      });
      
      mockUsePermissions.mockReturnValue({
        loading: true,
      });

      render(
        <EnhancedRoleProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </EnhancedRoleProtectedRoute>
      );

      expect(screen.getByTestId('auth-loading')).toBeInTheDocument();
      expect(screen.queryByTestId('role-loading')).not.toBeInTheDocument();
    });

    it('shows role loading after auth completes', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-123' },
        loading: false,
      });
      
      mockUsePermissions.mockReturnValue({
        loading: true,
      });

      render(
        <EnhancedRoleProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </EnhancedRoleProtectedRoute>
      );

      expect(screen.getByTestId('role-loading')).toBeInTheDocument();
      expect(screen.queryByTestId('auth-loading')).not.toBeInTheDocument();
    });
  });
});