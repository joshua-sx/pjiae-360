import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { useSessionValidation } from './useSessionValidation';

const mockAuth = vi.fn();
const mockValidateSessionSecurity = vi.fn();

vi.mock('./useAuth', () => ({
  useAuth: () => mockAuth(),
}));

vi.mock('@/lib/auth/session-security', () => ({
  validateSessionSecurity: () => mockValidateSessionSecurity(),
}));

describe('useSessionValidation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockReturnValue({ 
      session: { access_token: 'token' }, 
      user: { id: 'user-id' } 
    });
    mockValidateSessionSecurity.mockResolvedValue({
      isValid: true,
      issues: [],
      shouldRefresh: false,
    });
  });

  it('returns validation function and session status', () => {
    const { result } = renderHook(() => useSessionValidation());

    expect(result.current.validateSession).toBeInstanceOf(Function);
    expect(result.current.hasValidSession).toBe(true);
  });

  it('returns false for hasValidSession when no session exists', () => {
    mockAuth.mockReturnValue({ session: null, user: null });

    const { result } = renderHook(() => useSessionValidation());

    expect(result.current.hasValidSession).toBe(false);
  });

  it('returns false for hasValidSession when no user exists', () => {
    mockAuth.mockReturnValue({ 
      session: { access_token: 'token' }, 
      user: null 
    });

    const { result } = renderHook(() => useSessionValidation());

    expect(result.current.hasValidSession).toBe(false);
  });

  it('validates session successfully when session and user exist', async () => {
    const { result } = renderHook(() => useSessionValidation());

    let validationResult;
    await act(async () => {
      validationResult = await result.current.validateSession();
    });

    expect(mockValidateSessionSecurity).toHaveBeenCalled();
    expect(validationResult).toEqual({
      isValid: true,
      issues: [],
      shouldRefresh: false,
    });
  });

  it('returns invalid result when no session exists', async () => {
    mockAuth.mockReturnValue({ session: null, user: null });
    const { result } = renderHook(() => useSessionValidation());

    let validationResult;
    await act(async () => {
      validationResult = await result.current.validateSession();
    });

    expect(mockValidateSessionSecurity).not.toHaveBeenCalled();
    expect(validationResult).toEqual({
      isValid: false,
      issues: ['No active session'],
      shouldRefresh: false,
    });
  });

  it('handles validation errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockValidateSessionSecurity.mockRejectedValue(new Error('Validation failed'));

    const { result } = renderHook(() => useSessionValidation());

    let validationResult;
    await act(async () => {
      validationResult = await result.current.validateSession();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Session validation failed:', expect.any(Error));
    expect(validationResult).toEqual({
      isValid: false,
      issues: ['Validation failed'],
      shouldRefresh: true,
    });

    consoleSpy.mockRestore();
  });

  it('returns shouldRefresh true on validation error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockValidateSessionSecurity.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useSessionValidation());

    let validationResult;
    await act(async () => {
      validationResult = await result.current.validateSession();
    });

    expect(validationResult?.shouldRefresh).toBe(true);
    consoleSpy.mockRestore();
  });

  it('updates validation result when session changes', () => {
    const { result, rerender } = renderHook(() => useSessionValidation());

    expect(result.current.hasValidSession).toBe(true);

    mockAuth.mockReturnValue({ session: null, user: null });
    rerender();

    expect(result.current.hasValidSession).toBe(false);
  });
});