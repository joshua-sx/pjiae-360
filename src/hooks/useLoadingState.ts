import { useState, useCallback } from 'react';

export interface LoadingStateOptions {
  defaultLoading?: boolean;
  onLoadingChange?: (loading: boolean) => void;
}

/**
 * Hook for managing loading states with utilities
 */
export function useLoadingState(options: LoadingStateOptions = {}) {
  const { defaultLoading = false, onLoadingChange } = options;
  const [isLoading, setIsLoading] = useState(defaultLoading);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    onLoadingChange?.(true);
  }, [onLoadingChange]);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    onLoadingChange?.(false);
  }, [onLoadingChange]);

  const toggleLoading = useCallback(() => {
    setIsLoading(prev => {
      const newState = !prev;
      onLoadingChange?.(newState);
      return newState;
    });
  }, [onLoadingChange]);

  /**
   * Wrapper for async operations with automatic loading state
   */
  const withLoading = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    startLoading();
    try {
      const result = await operation();
      return result;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    withLoading,
    setLoading: setIsLoading,
  };
}

/**
 * Hook for multiple loading states
 */
export function useMultipleLoadingStates<T extends string>(
  keys: readonly T[]
): Record<T, boolean> & {
  setLoading: (key: T, loading: boolean) => void;
  isAnyLoading: boolean;
} {
  const [loadingStates, setLoadingStates] = useState<Record<T, boolean>>(
    {} as Record<T, boolean>
  );

  const setLoading = useCallback((key: T, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading,
    }));
  }, []);

  const isAnyLoading = Object.values(loadingStates).some(Boolean);

  return {
    ...loadingStates,
    setLoading,
    isAnyLoading,
  };
}