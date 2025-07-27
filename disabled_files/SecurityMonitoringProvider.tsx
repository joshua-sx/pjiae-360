import { ReactNode } from 'react';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';

interface SecurityMonitoringProviderProps {
  children: ReactNode;
}

export function SecurityMonitoringProvider({ children }: SecurityMonitoringProviderProps) {
  // Initialize security monitoring for the entire app
  useSecurityMonitoring();
  
  return <>{children}</>;
}