import { useEffect, useRef, useCallback } from 'react';

interface UseInactivityTimerOptions {
  timeout: number; // in milliseconds
  onTimeout: () => void;
  enabled?: boolean;
}

export const useInactivityTimer = ({ timeout, onTimeout, enabled = true }: UseInactivityTimerOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isEnabledRef = useRef(enabled);
  
  // Update enabled state
  useEffect(() => {
    isEnabledRef.current = enabled;
  }, [enabled]);

  const resetTimer = useCallback(() => {
    if (!isEnabledRef.current) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      if (isEnabledRef.current) {
        onTimeout();
      }
    }, timeout);
  }, [timeout, onTimeout]);

  const stopTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (isEnabledRef.current) {
      resetTimer();
    }
  }, [resetTimer]);

  useEffect(() => {
    if (!enabled) {
      stopTimer();
      return;
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetTimer();
    };

    // Start the timer initially
    resetTimer();

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      // Cleanup
      stopTimer();
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [enabled, resetTimer, stopTimer]);

  return {
    resetTimer,
    stopTimer,
    startTimer
  };
};