
/**
 * Performance monitoring utilities for query performance tracking
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface PerformanceMetrics {
  queryName: string;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private isEnabled: boolean = true;
  private metrics: PerformanceMetrics[] = [];
  private batchSize: number = 10;
  private flushInterval: number = 30000; // 30 seconds
  private flushTimer?: NodeJS.Timeout;

  constructor() {
    this.startBatchFlush();
  }

  /**
   * Track a database query performance
   */
  async trackQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    if (!this.isEnabled) {
      return await queryFn();
    }

    const startTime = performance.now();
    
    try {
      const result = await queryFn();
      const duration = Math.round(performance.now() - startTime);
      
      this.recordMetric({
        queryName,
        duration,
        timestamp: new Date(),
        metadata: {
          ...metadata,
          success: true
        }
      });

      return result;
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      
      this.recordMetric({
        queryName,
        duration,
        timestamp: new Date(),
        metadata: {
          ...metadata,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      throw error;
    }
  }

  /**
   * Record a performance metric
   */
  private recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      logger.performanceLog(
        `Query: ${metric.queryName}`,
        metric.duration,
        metric.metadata
      );
    }

    // Flush immediately if batch is full
    if (this.metrics.length >= this.batchSize) {
      this.flushMetrics();
    }
  }

  /**
   * Flush accumulated metrics to database
   */
  private async flushMetrics(): Promise<void> {
    if (this.metrics.length === 0) return;

    const metricsToFlush = [...this.metrics];
    this.metrics = [];

    try {
      // Send metrics in batches to avoid overwhelming the database
      for (const metric of metricsToFlush) {
        await supabase.rpc('log_query_performance', {
          _name: metric.queryName,
          _duration_ms: metric.duration,
          _extra: metric.metadata || {}
        });
      }
    } catch (error) {
      logger.error('Failed to flush performance metrics', { 
        metricsCount: metricsToFlush.length,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Re-add failed metrics to retry later
      this.metrics.unshift(...metricsToFlush);
    }
  }

  /**
   * Start automatic batch flushing
   */
  private startBatchFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flushMetrics();
    }, this.flushInterval);
  }

  /**
   * Manually flush all pending metrics
   */
  async flush(): Promise<void> {
    await this.flushMetrics();
  }

  /**
   * Enable or disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Get current metrics buffer size
   */
  getPendingMetricsCount(): number {
    return this.metrics.length;
  }

  /**
   * Cleanup timer on shutdown
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushMetrics();
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Convenience wrapper for tracking Supabase queries
export async function trackSupabaseQuery<T>(
  queryName: string,
  queryFn: () => Promise<{ data: T | null; error: any }>,
  metadata?: Record<string, any>
): Promise<{ data: T | null; error: any }> {
  return performanceMonitor.trackQuery(queryName, queryFn, metadata);
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    performanceMonitor.destroy();
  });
}
