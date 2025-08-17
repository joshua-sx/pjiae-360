import { Navigate } from 'react-router-dom';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { RouteLoader } from '@/components/ui/navigation-loader';

interface RoleAwareRedirectProps {
  to: string;
}

export function RoleAwareRedirect({ to }: RoleAwareRedirectProps) {
  const { getRolePageUrl, isLoading } = useRoleBasedNavigation();
  const { onboardingCompleted, loading: onboardingLoading } = useOnboardingStatus();

  if (isLoading || onboardingLoading) {
    return <RouteLoader />;
  }

  // If onboarding is not completed, redirect to onboarding
  if (onboardingCompleted === false) {
    return <Navigate to="/onboarding" replace />;
  }

  const roleSpecificUrl = getRolePageUrl(to);
  
  return <Navigate to={roleSpecificUrl} replace />;
}