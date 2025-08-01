
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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

  const handleImport = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to continue",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    
    try {
      // Initialize email status for all valid entries
      const initialEmailStatus = validEntries.reduce((acc, person) => {
        acc[person.email] = 'pending';
        return acc;
      }, {} as Record<string, 'pending' | 'sent' | 'failed'>);
      setEmailStatus(initialEmailStatus);

      toast({
        title: "Starting import...",
        description: `Importing ${validEntries.length} employees and sending welcome emails`,
      });

      // Call the import-employees edge function directly
      const { data: result, error } = await supabase.functions.invoke('import-employees', {
        body: {
          orgName: data.orgName || "Your Organization",
          people: validEntries,
          adminInfo: data.adminInfo || {
            name: user.user_metadata?.first_name ? 
              `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim() : 
              "Admin User",
            email: user.email || "admin@company.com",
            role: "Administrator"
          },
        },
      });

      if (error) {
        throw new Error(`Import failed: ${error.message}`);
      }

      // Update email status based on results
      if (result?.imported > 0) {
        const updatedEmailStatus = { ...initialEmailStatus };
        validEntries.forEach(person => {
          updatedEmailStatus[person.email] = 'sent';
        });
        setEmailStatus(updatedEmailStatus);

        toast({
          title: "Import successful!",
          description: `Successfully imported ${result.imported} employees and sent welcome emails`,
        });
      }

      if (result?.failed > 0 && result?.errors) {
        const updatedEmailStatus = { ...initialEmailStatus };
        result.errors.forEach((error: any) => {
          if (error.email) {
            updatedEmailStatus[error.email] = 'failed';
          }
        });
        setEmailStatus(updatedEmailStatus);

        toast({
          title: "Partial import",
          description: `${result.imported} successful, ${result.failed} failed. Check the details below.`,
          variant: "destructive"
        });
      }

      // Prepare data for next step
      const importStats = {
        total: previewData.length,
        successful: result?.imported || 0,
        errors: result?.failed || 0
      };

      const orgStructure = extractOrgStructureFromPeople(validEntries);

      onDataChange({
        people: validEntries,
        orgStructure: orgStructure,
        importStats
      });

      onNext();

    } catch (error: any) {
      console.error('Import error:', error);
      
      // Mark all emails as failed
      const failedEmailStatus = validEntries.reduce((acc, person) => {
        acc[person.email] = 'failed';
        return acc;
      }, {} as Record<string, 'pending' | 'sent' | 'failed'>);
      setEmailStatus(failedEmailStatus);

      toast({
        title: "Import failed",
        description: error.message || "An error occurred during import. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <OnboardingStepLayout
      onBack={onBack}
      onNext={handleImport}
      nextLabel={isImporting ? "Importing..." : `Import ${validEntries.length} People →`}
      nextDisabled={validEntries.length === 0 || isImporting}
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
