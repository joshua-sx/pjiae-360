import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEmployeeImport } from './useEmployeeImport';
import { EmployeeData } from '@/components/admin/employees/import/types';

const { mockToast, mockGetUser } = vi.hoisted(() => ({
  mockToast: vi.fn(),
  mockGetUser: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: mockGetUser,
    },
    rpc: vi.fn(),
    from: vi.fn().mockReturnValue({ select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn() }),
    functions: { invoke: vi.fn() },
  },
}));

describe('useEmployeeImport', () => {
  beforeEach(() => {
    mockToast.mockReset();
    mockGetUser.mockReset();
  });

  it('parses pasted CSV data', () => {
    const { result } = renderHook(() => useEmployeeImport());
    act(() => {
      result.current.handlePasteData('first,last,email\nJohn,Doe,john@example.com');
    });
    expect(result.current.headers).toEqual(['first', 'last', 'email']);
    expect(result.current.csvData).toEqual([['John', 'Doe', 'john@example.com']]);
    expect(result.current.currentStep).toBe('mapping');
  });

  it('shows error when importing with no employees', async () => {
    const { result } = renderHook(() => useEmployeeImport());
    await act(async () => {
      await result.current.confirmImport();
    });
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'No employees to import',
    }));
  });

  it('handles auth error during import', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const { result } = renderHook(() => useEmployeeImport());
    const employees: EmployeeData[] = [{
      employeeId: '',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phoneNumber: '',
      jobTitle: '',
      department: '',
      division: '',
    }];
    act(() => {
      result.current.handleManualAdd(employees);
    });
    await act(async () => {
      await result.current.confirmImport();
    });
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Import failed',
    }));
  });
});

