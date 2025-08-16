import { Navigate } from 'react-router-dom';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { RouteLoader } from '@/components/ui/navigation-loader';

interface RoleAwareRedirectProps {
  to: string;
}

export function RoleAwareRedirect({ to }: RoleAwareRedirectProps) {
  const { getRolePageUrl, isLoading } = useRoleBasedNavigation();

  if (isLoading) {
    return <RouteLoader />;
  }

  const roleSpecificUrl = getRolePageUrl(to);
  
  return <Navigate to={roleSpecificUrl} replace />;
}