import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EmailConfigStatus {
  isResendConfigured: boolean;
  isServiceRoleConfigured: boolean;
  isFullyConfigured: boolean;
  domainVerificationNeeded: boolean;
  loading: boolean;
  error?: string;
}

export function useEmailConfiguration(): EmailConfigStatus {
  const [status, setStatus] = useState<EmailConfigStatus>({
    isResendConfigured: false,
    isServiceRoleConfigured: false,
    isFullyConfigured: false,
    domainVerificationNeeded: true,
    loading: true
  });

  useEffect(() => {
    checkEmailConfiguration();
  }, []);

  const checkEmailConfiguration = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true, error: undefined }));

      // Test if email service is configured by calling a simple test
      const { data, error } = await supabase.functions.invoke('enhanced-email-service', {
        body: {
          template: 'account_welcome',
          to: 'test@example.com',
          preview: true,
          data: {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            verificationUrl: 'https://example.com',
            loginUrl: 'https://example.com',
            supportEmail: 'support@example.com'
          }
        }
      });

      // If we get HTML back, the service is working
      const isResendConfigured = !error && typeof data === 'string' && data.includes('<!DOCTYPE html>');
      
      // Test service role by making a simple database query
      let isServiceRoleConfigured = false;
      try {
        const { error: dbError } = await supabase.from('organizations').select('id').limit(1);
        isServiceRoleConfigured = !dbError;
      } catch {
        isServiceRoleConfigured = false;
      }

      const isFullyConfigured = isResendConfigured && isServiceRoleConfigured;
      
      // Domain verification is likely needed if we get specific error patterns
      const domainVerificationNeeded = error?.message?.includes('verify a domain') || 
                                      error?.message?.includes('domain not verified') ||
                                      error?.message?.includes('own email address');

      setStatus({
        isResendConfigured,
        isServiceRoleConfigured,
        isFullyConfigured,
        domainVerificationNeeded: domainVerificationNeeded ?? true,
        loading: false,
        error: error?.message
      });

    } catch (error: any) {
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: error.message,
        isResendConfigured: false,
        isServiceRoleConfigured: false,
        isFullyConfigured: false,
        domainVerificationNeeded: true
      }));
    }
  };

  return status;
}