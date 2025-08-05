import { render, screen } from '@testing-library/react';
import OnboardingProtectedRoute from './OnboardingProtectedRoute';
import { vi, describe, it, beforeEach, expect } from 'vitest';

const mockUseAuth = vi.fn();
const mockUseOnboardingStatus = vi.fn();
const mockDetermineOnboardingState = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/hooks/useOnboardingStatus', () => ({
  useOnboardingStatus: () => mockUseOnboardingStatus(),
}));

vi.mock('@/lib/onboarding-utils', () => ({
  determineOnboardingState: (...args: any[]) => mockDetermineOnboardingState(...args),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('./ui/navigation-loader', () => ({
  RouteLoader: () => <div data-testid="loader" />,
}));

describe('OnboardingProtectedRoute', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('shows loader while determining status', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });
    mockUseOnboardingStatus.mockReturnValue({ onboardingCompleted: null, loading: true });
    mockDetermineOnboardingState.mockReturnValue({ isLoading: true });
    render(<OnboardingProtectedRoute>child</OnboardingProtectedRoute>);
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', async () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    mockUseOnboardingStatus.mockReturnValue({ onboardingCompleted: null, loading: false });
    mockDetermineOnboardingState.mockReturnValue({
      isLoading: false,
      shouldRedirectToDashboard: false,
      canAccessOnboarding: false,
    });
    render(<OnboardingProtectedRoute>child</OnboardingProtectedRoute>);
    expect(mockNavigate).toHaveBeenCalledWith('/log-in');
  });

  it('redirects to dashboard when onboarding complete', () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' }, loading: false });
    mockUseOnboardingStatus.mockReturnValue({ onboardingCompleted: true, loading: false });
    mockDetermineOnboardingState.mockReturnValue({
      isLoading: false,
      shouldRedirectToDashboard: true,
      canAccessOnboarding: false,
    });
    render(<OnboardingProtectedRoute>child</OnboardingProtectedRoute>);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('renders children when access allowed', () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' }, loading: false });
    mockUseOnboardingStatus.mockReturnValue({ onboardingCompleted: false, loading: false });
    mockDetermineOnboardingState.mockReturnValue({
      isLoading: false,
      shouldRedirectToDashboard: false,
      canAccessOnboarding: true,
    });
    render(
      <OnboardingProtectedRoute>
        <div data-testid="child" />
      </OnboardingProtectedRoute>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});

