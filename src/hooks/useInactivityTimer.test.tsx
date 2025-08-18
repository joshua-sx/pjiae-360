import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';
import { useInactivityTimer } from './useInactivityTimer';

describe('useInactivityTimer', () => {
  const mockOnTimeout = vi.fn();
  
  beforeEach(() => {
    vi.useFakeTimers();
    mockOnTimeout.mockReset();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should call onTimeout after specified timeout', () => {
    renderHook(() => 
      useInactivityTimer({ 
        timeout: 5000, 
        onTimeout: mockOnTimeout 
      })
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(mockOnTimeout).toHaveBeenCalledOnce();
  });

  it('should reset timer on user activity', () => {
    renderHook(() => 
      useInactivityTimer({ 
        timeout: 5000, 
        onTimeout: mockOnTimeout 
      })
    );

    // Advance timer partially
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Simulate user activity
    act(() => {
      document.dispatchEvent(new Event('mousedown'));
    });

    // Advance timer again
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    // Should not have timed out yet
    expect(mockOnTimeout).not.toHaveBeenCalled();

    // Complete the timeout period
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockOnTimeout).toHaveBeenCalledOnce();
  });

  it('should not call onTimeout when disabled', () => {
    renderHook(() => 
      useInactivityTimer({ 
        timeout: 5000, 
        onTimeout: mockOnTimeout,
        enabled: false
      })
    );

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(mockOnTimeout).not.toHaveBeenCalled();
  });

  it('should stop timer when disabled dynamically', () => {
    const { rerender } = renderHook(
      ({ enabled }) => useInactivityTimer({ 
        timeout: 5000, 
        onTimeout: mockOnTimeout,
        enabled
      }),
      { initialProps: { enabled: true } }
    );

    // Advance timer partially
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Disable timer
    rerender({ enabled: false });

    // Complete the timeout period
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(mockOnTimeout).not.toHaveBeenCalled();
  });

  it('should provide control functions', () => {
    const { result } = renderHook(() => 
      useInactivityTimer({ 
        timeout: 5000, 
        onTimeout: mockOnTimeout 
      })
    );

    expect(result.current.resetTimer).toBeTypeOf('function');
    expect(result.current.stopTimer).toBeTypeOf('function');
    expect(result.current.startTimer).toBeTypeOf('function');
  });

  it('should stop timer when stopTimer is called', () => {
    const { result } = renderHook(() => 
      useInactivityTimer({ 
        timeout: 5000, 
        onTimeout: mockOnTimeout 
      })
    );

    act(() => {
      result.current.stopTimer();
    });

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(mockOnTimeout).not.toHaveBeenCalled();
  });

  it('should restart timer when startTimer is called', () => {
    const { result } = renderHook(() => 
      useInactivityTimer({ 
        timeout: 5000, 
        onTimeout: mockOnTimeout 
      })
    );

    act(() => {
      result.current.stopTimer();
    });

    act(() => {
      result.current.startTimer();
    });

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(mockOnTimeout).toHaveBeenCalledOnce();
  });
});