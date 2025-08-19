import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query';
import { useDemoMode } from '@/contexts/DemoModeContext';

export function useDemoAwareQuery<T>(
  queryKey: QueryKey,
  realDataFn: () => Promise<T>,
  demoDataFn: () => T,
  options?: Omit<UseQueryOptions<T, Error, T, QueryKey>, 'queryKey' | 'queryFn'>
) {
  const { isDemoMode } = useDemoMode();
  
  return useQuery({
    ...options,
    queryKey: [...queryKey, isDemoMode],
    queryFn: async () => {
      if (isDemoMode) {
        return demoDataFn();
      }
      return realDataFn();
    },
    enabled: options?.enabled !== false
  });
}