import { render, screen } from '@testing-library/react';
import { PermissionGuard, PermissionCheck, withPermissions } from './PermissionGuard';
import { vi, describe, it, beforeEach, expect } from 'vitest';

const mockUsePermissions = vi.fn();
const mockCheckPermission = vi.fn();

vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => mockUsePermissions(),
}));

vi.mock('@/hooks/useRequirePermission', () => ({
  checkPermission: (...args: any[]) => mockCheckPermission(...args),
}));

describe('PermissionGuard', () => {
  beforeEach(() => {
    mockUsePermissions.mockReturnValue({
      loading: false,
      isAdmin: false,
      isManager: false,
    });
    mockCheckPermission.mockReturnValue(true);
  });

  describe('Loading State', () => {
    it('shows loading spinner when permissions are loading', () => {
      mockUsePermissions.mockReturnValue({
        loading: true,
      });

      render(
        <PermissionGuard roles={['admin']}>
          <div data-testid="protected-content">Protected Content</div>
        </PermissionGuard>
      );

      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('Access Control', () => {
    it('renders children when user has required permissions', () => {
      mockCheckPermission.mockReturnValue(true);

      render(
        <PermissionGuard roles={['admin']}>
          <div data-testid="protected-content">Protected Content</div>
        </PermissionGuard>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('hides children when user lacks required permissions', () => {
      mockCheckPermission.mockReturnValue(false);

      render(
        <PermissionGuard roles={['admin']}>
          <div data-testid="protected-content">Protected Content</div>
        </PermissionGuard>
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('shows default access denied message when no fallback provided', () => {
      mockCheckPermission.mockReturnValue(false);

      render(
        <PermissionGuard roles={['admin']}>
          <div data-testid="protected-content">Protected Content</div>
        </PermissionGuard>
      );

      expect(screen.getByText(/You don't have permission to access this feature/)).toBeInTheDocument();
      expect(screen.getByText(/Required role\(s\): admin/)).toBeInTheDocument();
    });

    it('shows custom fallback when provided', () => {
      mockCheckPermission.mockReturnValue(false);

      render(
        <PermissionGuard 
          roles={['admin']} 
          fallback={<div data-testid="custom-fallback">Access Denied</div>}
        >
          <div data-testid="protected-content">Protected Content</div>
        </PermissionGuard>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('renders nothing when showFallback is false and no access', () => {
      mockCheckPermission.mockReturnValue(false);

      render(
        <PermissionGuard roles={['admin']} showFallback={false}>
          <div data-testid="protected-content">Protected Content</div>
        </PermissionGuard>
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.queryByText(/You don't have permission/)).not.toBeInTheDocument();
    });
  });

  describe('Role and Permission Checking', () => {
    it('passes correct roles to checkPermission', () => {
      render(
        <PermissionGuard roles={['admin', 'manager']}>
          <div>Content</div>
        </PermissionGuard>
      );

      expect(mockCheckPermission).toHaveBeenCalledWith(
        expect.any(Object),
        { roles: ['admin', 'manager'], permissions: [] }
      );
    });

    it('passes correct permissions to checkPermission', () => {
      render(
        <PermissionGuard permissions={['canManageEmployees', 'canViewReports']}>
          <div>Content</div>
        </PermissionGuard>
      );

      expect(mockCheckPermission).toHaveBeenCalledWith(
        expect.any(Object),
        { roles: [], permissions: ['canManageEmployees', 'canViewReports'] }
      );
    });

    it('handles both roles and permissions', () => {
      render(
        <PermissionGuard roles={['admin']} permissions={['canManageEmployees']}>
          <div>Content</div>
        </PermissionGuard>
      );

      expect(mockCheckPermission).toHaveBeenCalledWith(
        expect.any(Object),
        { roles: ['admin'], permissions: ['canManageEmployees'] }
      );
    });
  });

  describe('Multiple Roles in Fallback Message', () => {
    it('shows multiple required roles in access denied message', () => {
      mockCheckPermission.mockReturnValue(false);

      render(
        <PermissionGuard roles={['admin', 'manager', 'director']}>
          <div>Content</div>
        </PermissionGuard>
      );

      expect(screen.getByText(/Required role\(s\): admin, manager, director/)).toBeInTheDocument();
    });

    it('does not show roles message when no roles specified', () => {
      mockCheckPermission.mockReturnValue(false);

      render(
        <PermissionGuard permissions={['canManageEmployees']}>
          <div>Content</div>
        </PermissionGuard>
      );

      expect(screen.queryByText(/Required role\(s\):/)).not.toBeInTheDocument();
    });
  });
});

describe('PermissionCheck', () => {
  beforeEach(() => {
    mockUsePermissions.mockReturnValue({
      loading: false,
    });
    mockCheckPermission.mockReturnValue(true);
  });

  it('calls children function with access status', () => {
    const mockChildren = vi.fn(() => <div>Content</div>);
    mockCheckPermission.mockReturnValue(true);

    render(
      <PermissionCheck roles={['admin']}>
        {mockChildren}
      </PermissionCheck>
    );

    expect(mockChildren).toHaveBeenCalledWith(true, false);
  });

  it('calls children function with loading state', () => {
    const mockChildren = vi.fn(() => <div>Content</div>);
    mockUsePermissions.mockReturnValue({
      loading: true,
    });

    render(
      <PermissionCheck roles={['admin']}>
        {mockChildren}
      </PermissionCheck>
    );

    expect(mockChildren).toHaveBeenCalledWith(false, true);
  });

  it('returns false access when loading', () => {
    const mockChildren = vi.fn(() => <div>Content</div>);
    mockUsePermissions.mockReturnValue({
      loading: true,
    });
    mockCheckPermission.mockReturnValue(true);

    render(
      <PermissionCheck roles={['admin']}>
        {mockChildren}
      </PermissionCheck>
    );

    expect(mockChildren).toHaveBeenCalledWith(false, true);
  });
});

describe('withPermissions', () => {
  const TestComponent = ({ text }: { text: string }) => (
    <div data-testid="test-component">{text}</div>
  );

  beforeEach(() => {
    mockUsePermissions.mockReturnValue({
      loading: false,
    });
    mockCheckPermission.mockReturnValue(true);
  });

  it('wraps component with permission guard', () => {
    const WrappedComponent = withPermissions(TestComponent, {
      roles: ['admin'],
    });

    render(<WrappedComponent text="Test Content" />);

    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('blocks access when permissions not met', () => {
    mockCheckPermission.mockReturnValue(false);
    
    const WrappedComponent = withPermissions(TestComponent, {
      roles: ['admin'],
    });

    render(<WrappedComponent text="Test Content" />);

    expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
    expect(screen.getByText(/You don't have permission/)).toBeInTheDocument();
  });

  it('forwards props correctly to wrapped component', () => {
    const WrappedComponent = withPermissions(TestComponent, {
      roles: ['admin'],
    });

    render(<WrappedComponent text="Forwarded Props" />);

    expect(screen.getByText('Forwarded Props')).toBeInTheDocument();
  });

  it('applies custom fallback from requirements', () => {
    mockCheckPermission.mockReturnValue(false);
    
    const WrappedComponent = withPermissions(TestComponent, {
      roles: ['admin'],
      fallback: <div data-testid="hoc-fallback">HOC Access Denied</div>,
    });

    render(<WrappedComponent text="Test Content" />);

    expect(screen.getByTestId('hoc-fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
  });
});