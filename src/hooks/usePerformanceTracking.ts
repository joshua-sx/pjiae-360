
import { useCallback } from 'react';
import { performanceMonitor } from '@/lib/performance-monitor';

export function usePerformanceTracking() {
  const trackQuery = useCallback(async <T>(
    queryName: string,
    queryFn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> => {
    return performanceMonitor.trackQuery(queryName, queryFn, metadata);
  }, []);

  const trackSupabaseQuery = useCallback(async <T>(
    queryName: string,
    queryFn: () => Promise<{ data: T | null; error: any }>,
    metadata?: Record<string, any>
  ): Promise<{ data: T | null; error: any }> => {
    return performanceMonitor.trackQuery(queryName, queryFn, {
      ...metadata,
      queryType: 'supabase'
    });
  }, []);

  return {
    trackQuery,
    trackSupabaseQuery,
    getPendingCount: () => performanceMonitor.getPendingMetricsCount(),
    flush: () => performanceMonitor.flush()
  };
}
