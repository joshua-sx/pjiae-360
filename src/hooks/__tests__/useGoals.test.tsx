import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, Mock } from 'vitest';

import { useGoals } from '../useGoals';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '../usePermissions';
import { useDemoMode } from '@/contexts/DemoModeContext';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn() }
}));

vi.mock('../usePermissions', () => ({
  usePermissions: vi.fn()
}));

vi.mock('@/contexts/DemoModeContext', () => ({
  useDemoMode: vi.fn()
}));

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useGoals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (usePermissions as unknown as Mock).mockReturnValue({ roles: ['manager'], loading: false });
    (useDemoMode as unknown as Mock).mockReturnValue({ isDemoMode: false, demoRole: 'manager' });
  });

  it('applies filters and maps goal assignments', async () => {
    const sampleRow = {
      weight: 20,
      progress: 50,
      employee_id: 'emp1',
      goal: {
        id: 'goal1',
        title: 'Goal 1',
        status: 'active',
        cycle_id: 'cycle1',
        due_date: '2024-01-01',
        description: 'desc',
        type: 'manager_assigned',
        year: 2024,
        progress: 60,
        created_at: '2023-01-01',
        updated_at: '2023-02-01'
      },
      employee: {
        id: 'emp1',
        profiles: { first_name: 'John', last_name: 'Doe' }
      }
    };

    const range = vi.fn().mockResolvedValue({ data: [sampleRow], error: null });
    const mockQuery: any = {
      select: vi.fn(() => mockQuery),
      order: vi.fn(() => mockQuery),
      eq: vi.fn(() => mockQuery),
      range
    };

    (supabase.from as unknown as Mock).mockReturnValue(mockQuery);

    const { result } = renderHook(
      () =>
        useGoals({
          status: 'active',
          employeeId: 'emp1',
          cycleId: 'cycle1',
          page: 2,
          pageSize: 5
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(supabase.from).toHaveBeenCalledWith('goal_assignments');
    expect(mockQuery.eq).toHaveBeenCalledWith('goals.status', 'active');
    expect(mockQuery.eq).toHaveBeenCalledWith('employee_id', 'emp1');
    expect(mockQuery.eq).toHaveBeenCalledWith('goals.cycle_id', 'cycle1');
    expect(range).toHaveBeenCalledWith(5, 9);

    expect(result.current.goals[0]).toMatchObject({
      id: 'goal1',
      employeeId: 'emp1',
      employeeName: 'John Doe',
      weight: 20,
      progress: 50
    });
  });

  it('supports year filter and default pagination', async () => {
    const range = vi.fn().mockResolvedValue({ data: [], error: null });
    const mockQuery: any = {
      select: vi.fn(() => mockQuery),
      order: vi.fn(() => mockQuery),
      eq: vi.fn(() => mockQuery),
      range
    };
    (supabase.from as unknown as Mock).mockReturnValue(mockQuery);

    renderHook(() => useGoals({ year: '2024' }), { wrapper: createWrapper() });

    await waitFor(() => expect(range).toHaveBeenCalled());

    expect(mockQuery.eq).toHaveBeenCalledWith('goals.year', 2024);
    expect(range).toHaveBeenCalledWith(0, 19);
  });
});

