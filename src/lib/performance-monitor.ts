
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface PerformanceMetric {
  name: string;
  duration: number;
  extra?: Record<string, any>;
}

class PerformanceMonitor {
  private isEnabled: boolean = false;

  constructor() {
    // Enable in development or with debug flag
    this.isEnabled = import.meta.env?.NODE_ENV === 'development' || 
                    localStorage.getItem('perf_debug') === 'true';
  }

  enable() {
    this.isEnabled = true;
    localStorage.setItem('perf_debug', 'true');
  }

  disable() {
    this.isEnabled = false;
    localStorage.removeItem('perf_debug');
  }

  async measureQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>,
    extra?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await queryFn();
      const duration = Math.round(performance.now() - startTime);
      
      await this.logMetric({
        name: queryName,
        duration,
        extra: {
          ...extra,
          success: true
        }
      });
      
      return result;
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      
      await this.logMetric({
        name: queryName,
        duration,
        extra: {
          ...extra,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      
      throw error;
    }
  }

  private async logMetric(metric: PerformanceMetric) {
    if (!this.isEnabled) return;

    // Log locally in development
    if (import.meta.env?.NODE_ENV === 'development') {
      logger.performanceLog(
        `Query: ${metric.name}`,
        metric.duration,
        { queryName: metric.name, ...metric.extra }
      );
    }

    // Log to database for analysis
    try {
      await supabase.rpc('log_query_performance', {
        _name: metric.name,
        _duration_ms: metric.duration,
        _extra: metric.extra || {}
      });
    } catch (error) {
      logger.warn('Failed to log performance metric to database', {
        queryName: metric.name,
        duration: metric.duration
      }, error instanceof Error ? error : undefined);
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Helper hook for React Query integration
export function withPerformanceMonitoring<T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  extra?: Record<string, any>
) {
  return () => performanceMonitor.measureQuery(queryKey, queryFn, extra);
}
