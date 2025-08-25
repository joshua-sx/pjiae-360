import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { useEmailConfiguration } from './useEmailConfiguration';

const mockSupabase = {
  functions: {
    invoke: vi.fn(),
  },
  from: vi.fn(),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

describe('useEmailConfiguration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with loading state', () => {
    const { result } = renderHook(() => useEmailConfiguration());

    expect(result.current.loading).toBe(true);
    expect(result.current.isFullyConfigured).toBe(false);
  });

  it('detects fully configured email service', async () => {
    mockSupabase.functions.invoke.mockResolvedValue({
      data: { success: true },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [{ id: 1 }],
        error: null,
      }),
    });

    const { result } = renderHook(() => useEmailConfiguration());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isResendConfigured).toBe(true);
    expect(result.current.isServiceRoleConfigured).toBe(true);
    expect(result.current.isFullyConfigured).toBe(true);
    expect(result.current.domainVerificationNeeded).toBe(false);
  });

  it('detects missing Resend configuration', async () => {
    mockSupabase.functions.invoke.mockResolvedValue({
      data: null,
      error: { message: 'Missing RESEND_API_KEY' },
    });

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [{ id: 1 }],
        error: null,
      }),
    });

    const { result } = renderHook(() => useEmailConfiguration());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isResendConfigured).toBe(false);
    expect(result.current.isServiceRoleConfigured).toBe(true);
    expect(result.current.isFullyConfigured).toBe(false);
  });

  it('detects missing service role configuration', async () => {
    mockSupabase.functions.invoke.mockResolvedValue({
      data: { success: true },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'insufficient_privilege' },
      }),
    });

    const { result } = renderHook(() => useEmailConfiguration());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isResendConfigured).toBe(true);
    expect(result.current.isServiceRoleConfigured).toBe(false);
    expect(result.current.isFullyConfigured).toBe(false);
  });

  it('detects domain verification needed', async () => {
    mockSupabase.functions.invoke.mockResolvedValue({
      data: null,
      error: { message: 'Domain not verified' },
    });

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [{ id: 1 }],
        error: null,
      }),
    });

    const { result } = renderHook(() => useEmailConfiguration());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.domainVerificationNeeded).toBe(true);
    expect(result.current.isFullyConfigured).toBe(false);
  });

  it('handles network errors gracefully', async () => {
    mockSupabase.functions.invoke.mockRejectedValue(new Error('Network error'));
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockRejectedValue(new Error('Database error')),
    });

    const { result } = renderHook(() => useEmailConfiguration());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isResendConfigured).toBe(false);
    expect(result.current.isServiceRoleConfigured).toBe(false);
    expect(result.current.isFullyConfigured).toBe(false);
    expect(result.current.error).toBeTruthy();
  });

  it('sets error when configuration check fails', async () => {
    const error = new Error('Configuration check failed');
    mockSupabase.functions.invoke.mockRejectedValue(error);

    const { result } = renderHook(() => useEmailConfiguration());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Configuration check failed');
  });
});