import { useState, useEffect } from "react";
import { OnboardingData } from "./OnboardingTypes";
import PreviewHeader from "./components/PreviewHeader";
import StatsCards from "./components/StatsCards";
import DataPreviewTable from "./components/DataPreviewTable";
import ErrorWarning from "./components/ErrorWarning";
import OnboardingStepLayout from "./components/OnboardingStepLayout";
import { ImportDebugPanel } from "@/components/debug/ImportDebugPanel";
import { extractOrgStructureFromPeople } from "./utils/orgStructureExtractor";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface PreviewConfirmProps {
  data: OnboardingData;
  onDataChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const PreviewConfirm = ({ data, onDataChange, onNext, onBack }: PreviewConfirmProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isImporting, setIsImporting] = useState(false);
  const [emailStatus, setEmailStatus] = useState<Record<string, 'pending' | 'sent' | 'failed'>>({});

  const [previewData, setPreviewData] = useState<Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    jobTitle: string;
    department: string;
    division: string;
    employeeId?: number;
    role: string;
    errors: string[];
  }>>([]);

  useEffect(() => {
    // Handle manual entry data
    if (data.entryMethod === 'manual' && data.people.length > 0) {
      const processedData = data.people.map(person => ({
        ...person,
        jobTitle: person.jobTitle || '',
        department: person.department || '',
        division: person.division || '',
        role: person.role || 'Employee',
        errors: []
      }));
      setPreviewData(processedData);
      return;
    }

    // Handle CSV data
    if (data.entryMethod === 'csv' && data.csvData.rows.length > 0) {
      const processedData = data.csvData.rows.map((row, index) => {
        const employee: any = {
          id: crypto.randomUUID(),
          role: 'Employee',
          errors: []
        };

        Object.entries(data.csvData.columnMapping).forEach(([csvColumn, fieldKey]) => {
          const columnIndex = data.csvData.headers.indexOf(csvColumn);
          if (columnIndex !== -1 && columnIndex < row.length) {
            const cellValue = row[columnIndex];
            if (typeof cellValue === 'string') {
              if (fieldKey === 'employeeId') {
                const numValue = parseInt(cellValue.trim());
                if (!isNaN(numValue)) {
                  employee[fieldKey] = numValue;
                }
              } else {
                employee[fieldKey] = cellValue.trim() || '';
              }
            }
          }
        });

        // Set defaults for unmapped fields
        employee.jobTitle = employee.jobTitle || '';
        employee.department = employee.department || '';
        employee.division = employee.division || '';

        // Validation for required fields
        if (!employee.firstName) {
          employee.errors.push('Missing first name');
        }
        if (!employee.lastName) {
          employee.errors.push('Missing last name');
        }
        if (!employee.email || !employee.email.includes('@')) {
          employee.errors.push('Invalid email');
        }

        return employee;
      });

      setPreviewData(processedData);
    }
  }, [data.csvData, data.people, data.entryMethod]);

  const validEntries = previewData.filter(entry => entry.errors.length === 0);
  const invalidEntries = previewData.filter(entry => entry.errors.length > 0);
  const failedEntries = previewData.filter(entry => emailStatus[entry.email] === 'failed');
  const hasFailedImports = failedEntries.length > 0;

  const performImport = async (entries: typeof previewData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to continue",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    const entryEmails = entries.map(e => e.email);

    try {
      const initialEmailStatus = entries.reduce((acc, person) => {
        acc[person.email] = 'pending';
        return acc;
      }, {} as Record<string, 'pending' | 'sent' | 'failed'>);
      setEmailStatus(prev => ({ ...prev, ...initialEmailStatus }));

      toast({
        title: "Starting import...",
        description: `Importing ${entries.length} employees and sending welcome emails`,
      });

      const { data: result, error } = await supabase.functions.invoke('import-employees', {
        body: {
          orgName: data.orgName || "Your Organization",
          people: entries,
          adminInfo: data.adminInfo || {
            name: user.user_metadata?.first_name ?
              `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim() :
              "Admin User",
            email: user.email || "admin@company.com",
            role: "Administrator",
          },
        },
      });

      if (error) {
        throw new Error(`Import failed: ${error.message}`);
      }

      const errorMap = new Map(result?.errors?.map((e: any) => [e.email, e.error]) ?? []);
      const updatedData = previewData.map(entry => {
        if (entryEmails.includes(entry.email)) {
          const errMsg = errorMap.get(entry.email);
          return { ...entry, errors: errMsg ? [String(errMsg)] : [] };
        }
        return entry;
      });

      const updatedEmailStatus = { ...emailStatus };
      entries.forEach(entry => {
        updatedEmailStatus[entry.email] = errorMap.has(entry.email) ? 'failed' : 'sent';
      });

      setPreviewData(updatedData);
      setEmailStatus(updatedEmailStatus);

      if (errorMap.size > 0) {
        toast({
          title: "Partial import",
          description: `${result.imported} successful, ${result.failed} failed. Check the details below.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Import successful!",
          description: `Successfully imported ${result.imported} employees and sent welcome emails`,
        });
      }

      if (!Object.values(updatedEmailStatus).includes('failed')) {
        const successfulEntries = updatedData.filter(entry => entry.errors.length === 0);
        const orgStructure = extractOrgStructureFromPeople(successfulEntries);
        const importStats = {
          total: updatedData.length,
          successful: successfulEntries.length,
          errors: updatedData.length - successfulEntries.length,
        };
        onDataChange({
          people: successfulEntries.map(entry => ({
            ...entry,
            errors: entry.errors?.map(String) || []
          })),
          orgStructure,
          importStats,
        });
        onNext();
      }
    } catch (error: any) {
      console.error('Import error:', error);

      const failedEmailStatus = entries.reduce((acc, person) => {
        acc[person.email] = 'failed';
        return acc;
      }, {} as Record<string, 'pending' | 'sent' | 'failed'>);
      setEmailStatus(prev => ({ ...prev, ...failedEmailStatus }));

      const updatedData = previewData.map(entry => {
        if (entryEmails.includes(entry.email)) {
          return { ...entry, errors: [...entry.errors, error.message || "An error occurred during import. Please try again."] };
        }
        return entry;
      });
      setPreviewData(updatedData);

      toast({
        title: "Import failed",
        description: error.message || "An error occurred during import. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleImport = () => performImport(validEntries);
  const retryFailedImports = () => performImport(failedEntries);

  return (
    <OnboardingStepLayout
      onBack={onBack}
      onNext={hasFailedImports ? retryFailedImports : handleImport}
      nextLabel={
        isImporting
          ? hasFailedImports ? "Retrying..." : "Importing..."
          : hasFailedImports
            ? "Retry failed imports"
            : `Import ${validEntries.length} People →`
      }
      nextDisabled={isImporting || (!hasFailedImports && validEntries.length === 0)}
      maxWidth="xl"
    >
      <PreviewHeader />

      <StatsCards
        totalEntries={previewData.length}
        validEntries={validEntries.length}
        invalidEntries={invalidEntries.length}
      />

      <DataPreviewTable previewData={previewData} emailStatus={emailStatus} />

      <ErrorWarning invalidCount={invalidEntries.length} />

      <ImportDebugPanel isVisible={process.env.NODE_ENV === 'development'} />
    </OnboardingStepLayout>
  );
};

export default PreviewConfirm;
