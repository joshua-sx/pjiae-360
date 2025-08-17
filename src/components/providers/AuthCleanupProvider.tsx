import React from 'react';
import { useAuthCleanup } from '@/hooks/useAuthCleanup';

interface AuthCleanupProviderProps {
  children: React.ReactNode;
}

/**
 * Provider that handles auth state cleanup
 */
export const AuthCleanupProvider = ({ children }: AuthCleanupProviderProps) => {
  useAuthCleanup();
  return <>{children}</>;
};