import { create } from 'zustand';
import { EmployeeData, EmployeeImportData } from '@/components/admin/employees/import/types';

export type ImportStep = 'upload' | 'mapping' | 'preview' | 'role-assignment' | 'importing';

interface ImportState {
  currentStep: ImportStep;
  importData: EmployeeImportData;
  employeesToImport: EmployeeData[];
  isLoading: boolean;
  error: string | null;
  
  setCurrentStep: (step: ImportStep) => void;
  setImportData: (data: Partial<EmployeeImportData>) => void;
  setEmployeesToImport: (employees: EmployeeData[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetImport: () => void;
}

const initialImportData: EmployeeImportData = {
  uploadMethod: null,
  csvData: {
    rawData: '',
    headers: [],
    rows: [],
    columnMapping: {},
  },
  uploadedFile: null,
  manualEmployees: [],
};

export const useImportStore = create<ImportState>((set, get) => ({
  currentStep: 'upload',
  importData: initialImportData,
  employeesToImport: [],
  isLoading: false,
  error: null,

  setCurrentStep: (step) => set({ currentStep: step }),
  
  setImportData: (data) => set((state) => ({
    importData: { ...state.importData, ...data }
  })),
  
  setEmployeesToImport: (employees) => set({ employeesToImport: employees }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  resetImport: () => set({
    currentStep: 'upload',
    importData: initialImportData,
    employeesToImport: [],
    isLoading: false,
    error: null,
  }),
}));