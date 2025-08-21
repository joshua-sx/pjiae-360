import React, { useEffect } from 'react';
import { useCurrentOrganization } from '@/hooks/useCurrentOrganization';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Building2, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logger } from '@/lib/logger';

interface OrganizationGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireActiveOrg?: boolean;
}

/**
 * Organization context guard that ensures users have proper organizational access
 * before accessing organization-scoped features
 */
export function OrganizationGuard({ 
  children, 
  fallback, 
  requireActiveOrg = true 
}: OrganizationGuardProps) {
  const { id: organizationId } = useCurrentOrganization();
  const { isDemoMode } = useDemoMode();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !isDemoMode) {
      if (requireActiveOrg && !organizationId) {
        logger.warn('User accessing org-scoped content without organization context', {
          userId: user?.id,
          route: window.location.pathname,
          timestamp: new Date().toISOString()
        });
      }
    }
  }, [isAuthenticated, isDemoMode, organizationId, requireActiveOrg, user?.id]);

  // Skip guard in demo mode
  if (isDemoMode) {
    return <>{children}</>;
  }

  // Show fallback if no organization and fallback provided
  if (requireActiveOrg && !organizationId && fallback) {
    return <>{fallback}</>;
  }

  // Show default fallback if no organization
  if (requireActiveOrg && !organizationId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Building2 className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl font-bold">
              Organization Required
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-center text-muted-foreground">
              You need to be part of an organization to access this feature.
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => navigate('/onboarding')}
                className="w-full"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create Organization
              </Button>
              
              <Button 
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>

            <div className="pt-4 border-t text-xs text-center text-muted-foreground">
              Contact your administrator if you should have access
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Higher-order component for wrapping components with organization guard
 */
export function withOrganizationGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    requireActiveOrg?: boolean;
    fallback?: React.ReactNode;
  } = {}
) {
  const { requireActiveOrg = true, fallback } = options;
  
  return function WrappedComponent(props: P) {
    return (
      <OrganizationGuard 
        requireActiveOrg={requireActiveOrg}
        fallback={fallback}
      >
        <Component {...props} />
      </OrganizationGuard>
    );
  };
}