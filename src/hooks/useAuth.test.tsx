import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { vi } from 'vitest';

vi.mock('@/integrations/supabase/client', () => {
  return {
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        signUp: vi.fn().mockResolvedValue({ data: 'signup', error: null }),
        signInWithPassword: vi.fn().mockResolvedValue({ data: 'signin', error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
      },
    },
  };
});

describe('useAuth', () => {
  it('returns unauthenticated state by default', async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => !result.current.loading);
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('calls signOut on supabase', async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => !result.current.loading);
    await act(async () => {
      await result.current.signOut();
    });
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});
