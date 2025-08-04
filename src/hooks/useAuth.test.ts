import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';
import { vi } from 'vitest';

// Use hoisted mocks so they are available to the factory
const { mockGetSession, mockSignInWithPassword, mockSignUp, mockSignOut } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockSignInWithPassword: vi.fn(),
  mockSignUp: vi.fn(),
  mockSignOut: vi.fn(),
}));

let authStateCallback: ((event: any, session: any) => void) | null = null;

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: (cb: any) => {
        authStateCallback = cb;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      },
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
    },
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    auth: {
      debug: vi.fn(),
      error: vi.fn(),
    },
  },
}));

describe('useAuth', () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: '123' } } },
      error: null,
    });
    mockSignInWithPassword.mockResolvedValue({ data: {}, error: null });
    mockSignUp.mockResolvedValue({ data: {}, error: null });
    mockSignOut.mockResolvedValue({ error: null });
  });

  it('initializes with session', async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user?.id).toBe('123');
    expect(mockGetSession).toHaveBeenCalled();
  });

  it('signs in with email and password', async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.signIn('test@example.com', 'password');
    });
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
  });

  it('signs out and clears user', async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.signOut();
      authStateCallback && authStateCallback('SIGNED_OUT', null);
    });
    expect(mockSignOut).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
  });
});

