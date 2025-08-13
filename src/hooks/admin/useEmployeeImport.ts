import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EmployeeData, ImportStep } from '@/components/admin/employees/import/types';
import { guardAgainstDemoMode } from '@/lib/demo-mode-guard';

interface ImportResult {
  success: boolean;
  message: string;
  imported: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
  organizationId?: string;
}

export const useEmployeeImport = () => {
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [uploadMethod, setUploadMethod] = useState<'upload' | 'paste' | 'manual' | null>(null);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [employeesToImport, setEmployeesToImport] = useState<EmployeeData[]>([]);
  const [manualEmployees, setManualEmployees] = useState<EmployeeData[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null);
  const [csvText, setCsvText] = useState('');

  const handleCsvUpload = (data: string[][]) => {
    if (data.length === 0) return;
    const [headerRow, ...dataRows] = data;
    setHeaders(headerRow);
    setCsvData(dataRows);
    setCurrentStep('mapping');
  };

  const handleFileUpload = (file: File) => {
    setUploadedFile({ name: file.name, size: file.size });
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter((line) => line.trim());
      const data = lines.map((line) => {
        const matches = line.match(/(?:^|,)("(?:[^"]+|"")*"|[^,]*)/g);
        return matches
          ? matches.map((match) =>
              match.replace(/^,/, '').replace(/^"|"$/g, '').replace(/""/g, '"'),
            )
          : [];
      });
      handleCsvUpload(data);
      setUploadMethod('upload');
    };
    reader.readAsText(file);
  };

  const handlePasteData = (pastedData: string) => {
    setCsvText(pastedData);
    const lines = pastedData.trim().split('\n');
    const data = lines.map((line) => {
      const matches = line.match(/(?:^|,)("(?:[^"]+|"")*"|[^,]*)/g);
      return matches
        ? matches.map((match) => match.replace(/^,/, '').replace(/^"|"$/g, '').replace(/""/g, '"'))
        : [];
    });
    handleCsvUpload(data);
    setUploadMethod('paste');
  };

  const handleManualAdd = (employees: EmployeeData[]) => {
    setManualEmployees(employees);
    setEmployeesToImport(employees);
    setUploadMethod('manual');
    setCurrentStep('preview');
  };

  const processCSVData = (mapping: Record<string, string>) => {
    const employees = csvData
      .map((row) => {
        const employee: EmployeeData = {
          firstName: '',
          lastName: '',
          email: '',
          department: '',
          division: '',
          jobTitle: '',
          employeeId: '',
          phoneNumber: '',
        };

        Object.entries(mapping).forEach(([columnName, fieldName]) => {
          const columnIndex = headers.indexOf(columnName);
          if (columnIndex !== -1 && row[columnIndex]) {
            const value = row[columnIndex].trim();
            if (fieldName in employee) {
              (employee as any)[fieldName] = value;
            }
          }
        });

        return employee;
      })
      .filter((emp) => emp.firstName && emp.lastName && emp.email);
    return employees;
  };

  const handleMappingComplete = (importData: any) => {
    const mapping = importData.csvData.columnMapping;
    setColumnMapping(mapping);
    const employees = processCSVData(mapping);
    setEmployeesToImport(employees);
    setCurrentStep('preview');
  };

  const handlePreviewNext = () => {
    setCurrentStep('role-assignment');
  };

  const confirmImport = async () => {
    if (employeesToImport.length === 0) {
      toast({
        title: 'No employees to import',
        description: 'Please add some employees first.',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      guardAgainstDemoMode('employee.import');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const orgId = await supabase.rpc('get_current_user_org_id');
      if (!orgId.data) throw new Error('User organization not found');

      const { data: employeeInfo, error: employeeError } = await supabase
        .from('employee_info')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();
      if (employeeError || !employeeInfo) {
        throw new Error('Unable to find organization for user');
      }

      const organizationId = employeeInfo.organization_id;
      if (!organizationId) throw new Error('Organization not found for user');

      const { data: org } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', organizationId)
        .single();
      const orgName = org?.name || 'Default Organization';

      const importData = {
        orgName,
        people: employeesToImport.map((emp) => {
          const cleanEmployee: any = {
            id: crypto.randomUUID(),
            firstName: emp.firstName.trim(),
            lastName: emp.lastName.trim(),
            email: emp.email.trim(),
            jobTitle: emp.jobTitle?.trim() || '',
            department: emp.department?.trim() || '',
            division: emp.division?.trim() || '',
            role: emp.role?.toLowerCase() || 'employee',
          };
          const employeeIdNum = emp.employeeId ? parseInt(emp.employeeId.toString().trim()) : null;
          if (employeeIdNum && !isNaN(employeeIdNum)) {
            cleanEmployee.employeeId = employeeIdNum;
          }
          return cleanEmployee;
        }),
        adminInfo: {
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin',
          email: user.email || '',
          role: 'admin',
        },
      };

      const { data: result, error } = await supabase.functions.invoke('import-employees', {
        body: importData,
      });

      if (error) {
        throw new Error(error.message || 'Import failed');
      }

      setImportResult(result);

      if (result.success) {
        toast({
          title: 'Import completed!',
          description: result.message,
        });
        setTimeout(() => {
          resetImportState();
        }, 5000);
      } else {
        toast({
          title: 'Import completed with errors',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleRoleAssignmentComplete = async (updatedEmployees: EmployeeData[]) => {
    setEmployeesToImport(updatedEmployees);
    setCurrentStep('importing');
    await confirmImport();
  };

  const resetImportState = () => {
    setCurrentStep('upload');
    setUploadMethod(null);
    setCsvData([]);
    setHeaders([]);
    setColumnMapping({});
    setEmployeesToImport([]);
    setManualEmployees([]);
    setUploadedFile(null);
    setCsvText('');
    setImportResult(null);
  };

  const handleChangeFile = () => {
    setUploadedFile(null);
    setUploadMethod(null);
    setCsvData([]);
    setHeaders([]);
    setCurrentStep('upload');
  };

  return {
    currentStep,
    setCurrentStep,
    uploadMethod,
    setUploadMethod,
    csvData,
    headers,
    columnMapping,
    employeesToImport,
    manualEmployees,
    isImporting,
    importResult,
    uploadedFile,
    csvText,
    setCsvText,
    handleFileUpload,
    handlePasteData,
    handleManualAdd,
    handleMappingComplete,
    handlePreviewNext,
    handleRoleAssignmentComplete,
    confirmImport,
    resetImportState,
    handleChangeFile,
  };
};

