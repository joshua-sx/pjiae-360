import { ReactNode } from 'react';
import { usePermissions } from '../hooks/usePermissions';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback = null }: AuthGuardProps) {
  const { loading } = usePermissions();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return <>{children}</>;
}