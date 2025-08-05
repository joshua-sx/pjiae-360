import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

// Loading state types
export interface LoadingState {
  id: string;
  message: string;
  progress?: number;
  type?: 'loading' | 'success' | 'error' | 'info';
  details?: string;
  retryAction?: () => void;
  cancelAction?: () => void;
}

// Performance metrics tracking
export interface PerformanceMetrics {
  operationId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  errors?: string[];
}

interface LoadingContextType {
  loadingStates: LoadingState[];
  addLoading: (state: Omit<LoadingState, 'id'>) => string;
  updateLoading: (id: string, updates: Partial<LoadingState>) => void;
  removeLoading: (id: string) => void;
  clearAll: () => void;
  
  // Performance tracking
  startOperation: (operationId: string) => void;
  endOperation: (operationId: string, success: boolean, errors?: string[]) => void;
  getMetrics: () => PerformanceMetrics[];
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingStates, setLoadingStates] = useState<LoadingState[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics[]>([]);

  const addLoading = useCallback((state: Omit<LoadingState, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    setLoadingStates(prev => [...prev, { ...state, id }]);
    return id;
  }, []);

  const updateLoading = useCallback((id: string, updates: Partial<LoadingState>) => {
    setLoadingStates(prev => 
      prev.map(state => 
        state.id === id ? { ...state, ...updates } : state
      )
    );
  }, []);

  const removeLoading = useCallback((id: string) => {
    setLoadingStates(prev => prev.filter(state => state.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setLoadingStates([]);
  }, []);

  const startOperation = useCallback((operationId: string) => {
    const metric: PerformanceMetrics = {
      operationId,
      startTime: Date.now(),
      success: false
    };
    setPerformanceMetrics(prev => [...prev.filter(m => m.operationId !== operationId), metric]);
  }, []);

  const endOperation = useCallback((operationId: string, success: boolean, errors?: string[]) => {
    setPerformanceMetrics(prev => 
      prev.map(metric => 
        metric.operationId === operationId 
          ? {
              ...metric,
              endTime: Date.now(),
              duration: Date.now() - metric.startTime,
              success,
              errors
            }
          : metric
      )
    );
  }, []);

  const getMetrics = useCallback(() => performanceMetrics, [performanceMetrics]);

  return (
    <LoadingContext.Provider value={{
      loadingStates,
      addLoading,
      updateLoading,
      removeLoading,
      clearAll,
      startOperation,
      endOperation,
      getMetrics
    }}>
      {children}
      <GlobalLoadingOverlay />
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

// Loading indicator component
function LoadingIndicator({ state }: { state: LoadingState }) {
  const getIcon = () => {
    switch (state.type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
    }
  };

  const getCardVariant = () => {
    switch (state.type) {
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800';
      default:
        return 'bg-background border-border';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`w-full max-w-md ${getCardVariant()}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">
                {state.message}
              </div>
              
              {state.details && (
                <div className="text-xs text-muted-foreground mt-1">
                  {state.details}
                </div>
              )}
              
              {typeof state.progress === 'number' && (
                <div className="mt-2">
                  <Progress value={state.progress} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {Math.round(state.progress)}% complete
                  </div>
                </div>
              )}
              
              {(state.retryAction || state.cancelAction) && (
                <div className="flex gap-2 mt-3">
                  {state.retryAction && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={state.retryAction}
                    >
                      Retry
                    </Button>
                  )}
                  {state.cancelAction && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={state.cancelAction}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Global loading overlay
function GlobalLoadingOverlay() {
  const { loadingStates } = useLoading();
  
  if (loadingStates.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute top-4 right-4 space-y-2 pointer-events-auto">
        <AnimatePresence>
          {loadingStates.map(state => (
            <LoadingIndicator key={state.id} state={state} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Hook for managing async operations with loading states
export function useAsyncOperation() {
  const { addLoading, updateLoading, removeLoading, startOperation, endOperation } = useLoading();

  const executeOperation = useCallback(
    async function<T>(
      operation: () => Promise<T>,
      options: {
        loadingMessage: string;
        successMessage?: string;
        errorMessage?: string;
        operationId?: string;
        showProgress?: boolean;
        retryAction?: () => void;
      }
    ): Promise<T> {
      const operationId = options.operationId || Math.random().toString(36);
      const loadingId = addLoading({
        message: options.loadingMessage,
        type: 'loading',
        progress: options.showProgress ? 0 : undefined,
        retryAction: options.retryAction
      });

      startOperation(operationId);

      try {
        // Simulate progress updates if requested
        if (options.showProgress) {
          const progressInterval = setInterval(() => {
            updateLoading(loadingId, { 
              progress: Math.min((Date.now() % 3000) / 30, 90) 
            });
          }, 100);

          const result = await operation();
          
          clearInterval(progressInterval);
          updateLoading(loadingId, { 
            progress: 100,
            type: 'success',
            message: options.successMessage || 'Operation completed successfully'
          });

          setTimeout(() => removeLoading(loadingId), 2000);
          endOperation(operationId, true);
          
          return result;
        } else {
          const result = await operation();
          
          updateLoading(loadingId, {
            type: 'success',
            message: options.successMessage || 'Operation completed successfully'
          });

          setTimeout(() => removeLoading(loadingId), 2000);
          endOperation(operationId, true);
          
          return result;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        updateLoading(loadingId, {
          type: 'error',
          message: options.errorMessage || 'Operation failed',
          details: errorMessage,
          retryAction: options.retryAction
        });

        endOperation(operationId, false, [errorMessage]);
        
        // Keep error visible longer
        setTimeout(() => removeLoading(loadingId), 5000);
        
        throw error;
      }
    },
    [addLoading, updateLoading, removeLoading, startOperation, endOperation]
  );

  return { executeOperation };
}

// Batch operation helper for large datasets
export function useBatchOperation() {
  const { executeOperation } = useAsyncOperation();

  const executeBatch = useCallback(
    async function<T, R>(
      items: T[],
      operation: (item: T) => Promise<R>,
      options: {
        batchSize?: number;
        delayBetweenBatches?: number;
        loadingMessage: string;
        successMessage?: string;
        onProgress?: (completed: number, total: number) => void;
      }
    ): Promise<R[]> {
      const { batchSize = 10, delayBetweenBatches = 100 } = options;
      const results: R[] = [];
      
      return executeOperation(async () => {
        for (let i = 0; i < items.length; i += batchSize) {
          const batch = items.slice(i, i + batchSize);
          const batchResults = await Promise.all(
            batch.map(item => operation(item))
          );
          
          results.push(...batchResults);
          
          // Report progress
          options.onProgress?.(results.length, items.length);
          
          // Delay between batches to prevent overwhelming the system
          if (i + batchSize < items.length && delayBetweenBatches > 0) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
          }
        }
        
        return results;
      }, {
        loadingMessage: options.loadingMessage,
        successMessage: options.successMessage,
        showProgress: true,
        operationId: `batch-${Date.now()}`
      });
    },
    [executeOperation]
  );

  return { executeBatch };
}
