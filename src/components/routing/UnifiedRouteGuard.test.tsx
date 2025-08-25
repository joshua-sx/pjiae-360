import { render, screen } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { UnifiedRouteGuard } from './UnifiedRouteGuard';

const mockNavigate = vi.fn();
const mockAuth = vi.fn();
const mockOnboardingStatus = vi.fn();
const mockPermissions = vi.fn();
const mockLoadingCoordinator = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockAuth(),
}));

vi.mock('@/hooks/useOnboardingStatus', () => ({
  useOnboardingStatus: () => mockOnboardingStatus(),
}));

vi.mock('@/features/access-control/hooks/usePermissions', () => ({
  usePermissions: () => mockPermissions(),
}));

vi.mock('@/hooks/useLoadingCoordinator', () => ({
  useLoadingCoordinator: () => mockLoadingCoordinator(),
}));

vi.mock('@/components/ui/navigation-loader', () => ({
  RouteLoader: () => <div data-testid="route-loader">Loading...</div>,
}));

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>;
}

describe('UnifiedRouteGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockReturnValue({ isAuthenticated: true });
    mockOnboardingStatus.mockReturnValue({ 
      onboardingCompleted: true, 
      onboardingState: 'completed' 
    });
    mockPermissions.mockReturnValue({ 
      hasAnyRole: () => true,
      hasPermission: () => true,
      roles: ['user']
    });
    mockLoadingCoordinator.mockReturnValue({
      isInitializing: false,
      canProceed: true
    });
  });

  it('shows loading component when initializing', () => {
    mockLoadingCoordinator.mockReturnValue({
      isInitializing: true,
      canProceed: false
    });

    render(
      <TestWrapper>
        <UnifiedRouteGuard>
          <div>Protected Content</div>
        </UnifiedRouteGuard>
      </TestWrapper>
    );

    expect(screen.getByTestId('route-loader')).toBeInTheDocument();
  });

  it('renders children when all conditions are met', () => {
    render(
      <TestWrapper>
        <UnifiedRouteGuard>
          <div>Protected Content</div>
        </UnifiedRouteGuard>
      </TestWrapper>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('navigates to login when authentication is required but user is not authenticated', () => {
    mockAuth.mockReturnValue({ isAuthenticated: false });

    render(
      <TestWrapper>
        <UnifiedRouteGuard requireAuth={true}>
          <div>Protected Content</div>
        </UnifiedRouteGuard>
      </TestWrapper>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/log-in');
  });

  it('navigates to onboarding when user has no roles', () => {
    mockPermissions.mockReturnValue({ 
      hasAnyRole: () => true,
      hasPermission: () => true,
      roles: []
    });

    render(
      <TestWrapper>
        <UnifiedRouteGuard requireAuth={true}>
          <div>Protected Content</div>
        </UnifiedRouteGuard>
      </TestWrapper>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/onboarding');
  });

  it('navigates to fallback path when user lacks required roles', () => {
    mockPermissions.mockReturnValue({ 
      hasAnyRole: () => false,
      hasPermission: () => true,
      roles: ['user']
    });

    render(
      <TestWrapper>
        <UnifiedRouteGuard 
          requiredRoles={['admin']}
          fallbackPath="/custom-unauthorized"
        >
          <div>Protected Content</div>
        </UnifiedRouteGuard>
      </TestWrapper>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/custom-unauthorized');
  });

  it('navigates to fallback path when user lacks required permissions', () => {
    mockPermissions.mockReturnValue({ 
      hasAnyRole: () => true,
      hasPermission: () => false,
      roles: ['user']
    });

    render(
      <TestWrapper>
        <UnifiedRouteGuard 
          requiredPermissions={['admin:read']}
        >
          <div>Protected Content</div>
        </UnifiedRouteGuard>
      </TestWrapper>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/unauthorized');
  });

  it('shows access denied message before redirecting', () => {
    mockPermissions.mockReturnValue({ 
      hasAnyRole: () => false,
      hasPermission: () => true,
      roles: ['user']
    });

    render(
      <TestWrapper>
        <UnifiedRouteGuard requiredRoles={['admin']}>
          <div>Protected Content</div>
        </UnifiedRouteGuard>
      </TestWrapper>
    );

    expect(screen.getByText(/You don't have permission to access this page/)).toBeInTheDocument();
  });

  it('handles onboarding state checks correctly', () => {
    mockOnboardingStatus.mockReturnValue({ 
      onboardingCompleted: false, 
      onboardingState: 'pre-onboarding' 
    });

    render(
      <TestWrapper>
        <UnifiedRouteGuard onboardingState="completed">
          <div>Protected Content</div>
        </UnifiedRouteGuard>
      </TestWrapper>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/onboarding');
  });

  it('renders children when onboarding state matches', () => {
    mockOnboardingStatus.mockReturnValue({ 
      onboardingCompleted: false, 
      onboardingState: 'pre-onboarding' 
    });

    render(
      <TestWrapper>
        <UnifiedRouteGuard onboardingState="pre-onboarding">
          <div>Onboarding Content</div>
        </UnifiedRouteGuard>
      </TestWrapper>
    );

    expect(screen.getByText('Onboarding Content')).toBeInTheDocument();
  });
});