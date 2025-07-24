import { useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { sessionManager, logSecurityEvent, validateOrganizationContext } from '@/lib/security';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function useSecurityMonitoring() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSessionTimeout = useCallback(async () => {
    await logSecurityEvent('session_timeout', {
      user_id: user?.id,
      forced_logout: true
    });
    
    toast.error('Your session has expired. Please log in again.');
    await signOut();
    navigate('/log-in');
  }, [user?.id, signOut, navigate]);

  const handleSessionWarning = useCallback(() => {
    toast.warning('Your session will expire in 5 minutes. Please save your work.');
  }, []);

  const refreshUserActivity = useCallback(() => {
    if (user) {
      sessionManager.refreshTimeout(handleSessionWarning, handleSessionTimeout);
    }
  }, [user, handleSessionWarning, handleSessionTimeout]);

  // Monitor user activity for session management
  useEffect(() => {
    if (!user) {
      sessionManager.clearTimeout();
      return;
    }

    // Start session timeout monitoring
    sessionManager.startTimeout(handleSessionWarning, handleSessionTimeout);

    // Activity listeners to refresh session
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      refreshUserActivity();
    };

    // Throttle activity monitoring to avoid excessive calls
    let activityTimeout: NodeJS.Timeout;
    const throttledActivity = () => {
      if (activityTimeout) clearTimeout(activityTimeout);
      activityTimeout = setTimeout(handleActivity, 60000); // 1 minute throttle
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, throttledActivity, true);
    });

    return () => {
      sessionManager.clearTimeout();
      if (activityTimeout) clearTimeout(activityTimeout);
      activityEvents.forEach(event => {
        document.removeEventListener(event, throttledActivity, true);
      });
    };
  }, [user, handleSessionWarning, handleSessionTimeout, refreshUserActivity]);

  // Monitor for concurrent sessions
  useEffect(() => {
    if (!user) return;

    const checkConcurrentSessions = async () => {
      try {
        // Check if user still has valid permissions
        const isValid = await validateOrganizationContext();
        if (!isValid) {
          await logSecurityEvent('concurrent_session_detected', {
            user_id: user.id,
            action: 'force_logout'
          });
          
          toast.error('Another session has been detected. You have been logged out for security.');
          await signOut();
          navigate('/log-in');
        }
      } catch (error) {
        console.error('Error checking concurrent sessions:', error);
      }
    };

    // Check every 5 minutes
    const intervalId = setInterval(checkConcurrentSessions, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [user, signOut, navigate]);

  // Monitor page visibility for security
  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logSecurityEvent('tab_hidden', {
          user_id: user.id,
          timestamp: new Date().toISOString()
        });
      } else {
        logSecurityEvent('tab_visible', {
          user_id: user.id,
          timestamp: new Date().toISOString()
        });
        // Refresh session when user returns
        refreshUserActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, refreshUserActivity]);

  return {
    refreshUserActivity,
  };
}