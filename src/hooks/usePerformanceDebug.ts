
import { useState, useEffect } from 'react';
import { performanceMonitor } from '@/lib/performance-monitor';

export function usePerformanceDebug() {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    setIsEnabled(localStorage.getItem('perf_debug') === 'true');
  }, []);

  const toggleDebug = () => {
    if (isEnabled) {
      performanceMonitor.disable();
      setIsEnabled(false);
    } else {
      performanceMonitor.enable();
      setIsEnabled(true);
    }
  };

  return {
    isEnabled,
    toggleDebug
  };
}
