import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';

export function LegacyRouteRedirect() {
  const location = useLocation();
  const { redirectLegacyRoute, isLoading } = useRoleBasedNavigation();

  useEffect(() => {
    if (!isLoading) {
      redirectLegacyRoute(location.pathname);
    }
  }, [location.pathname, isLoading, redirectLegacyRoute]);

  return null;
}