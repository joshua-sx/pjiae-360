import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEmployeeInvitation } from './useEmployeeInvitation';

const { mockGetUser, mockFrom, mockInvoke } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
  mockInvoke: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: { getUser: mockGetUser },
    from: mockFrom,
    functions: { invoke: mockInvoke },
  },
}));

describe('useEmployeeInvitation', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockFrom.mockReset();
    mockInvoke.mockReset();
  });

  it('invites employee and sends email', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user1' } }, error: null });

    const profileChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { organization_id: 'org1' }, error: null }),
    };

    const insertChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { invitation_token: 'token123' }, error: null }),
    };

    mockFrom
      .mockReturnValueOnce(profileChain)
      .mockReturnValueOnce(insertChain);

    mockInvoke.mockResolvedValue({ data: { success: true }, error: null });

    const { result } = renderHook(() => useEmployeeInvitation());
    let res;
    await act(async () => {
      res = await result.current.inviteEmployee({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: 'Engineer',
      });
    });

    expect(res.success).toBe(true);
    expect(mockInvoke).toHaveBeenCalledWith('send-account-welcome', {
      body: { email: 'test@example.com', firstName: 'John', lastName: 'Doe' },
    });
  });

  it('fails to claim profile when token expired', async () => {
    const expiredChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 'emp1', invited_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), user_id: null },
        error: null,
      }),
    };

    mockFrom.mockReturnValueOnce(expiredChain);

    const { result } = renderHook(() => useEmployeeInvitation());
    let res;
    await act(async () => {
      res = await result.current.claimProfile('token123', 'user1');
    });

    expect(res.success).toBe(false);
    expect(res.error).toMatch(/expired/i);
  });

  it('fails to claim profile with invalid token', async () => {
    const invalidChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
    };

    mockFrom.mockReturnValueOnce(invalidChain);

    const { result } = renderHook(() => useEmployeeInvitation());
    let res;
    await act(async () => {
      res = await result.current.claimProfile('badtoken', 'user1');
    });

    expect(res.success).toBe(false);
    expect(res.error).toMatch(/invalid/i);
  });
});
