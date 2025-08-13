import { useDemoMode } from '@/contexts/DemoModeContext';
import { useAuth } from '@/hooks/useAuth';

export interface DataAccessGuardResult {
  isDemoMode: boolean;
  isAuthenticated: boolean;
  authLoading: boolean;
  readyForDb: boolean; // true when it's safe to call Supabase (not demo, auth ready and authenticated)
}

export function useDataAccessGuard(): DataAccessGuardResult {
  const { isDemoMode } = useDemoMode();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Only ready for DB when not in demo mode, auth is not loading, and user is authenticated
  const readyForDb = !isDemoMode && !authLoading && isAuthenticated;

  return {
    isDemoMode,
    isAuthenticated,
    authLoading,
    readyForDb,
  };
}
