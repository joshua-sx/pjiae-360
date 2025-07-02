
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { OnboardingData } from "./OnboardingTypes";
import PreviewHeader from "./components/PreviewHeader";
import StatsCards from "./components/StatsCards";
import DataPreviewTable from "./components/DataPreviewTable";
import ErrorWarning from "./components/ErrorWarning";

interface PreviewConfirmProps {
  data: OnboardingData;
  onDataChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const PreviewConfirm = ({ data, onDataChange, onNext, onBack }: PreviewConfirmProps) => {
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
    const processedData = data.csvData.rows.map((row, index) => {
      const employee: any = {
        id: `emp_${Date.now()}_${index}`,
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
      if (!employee.jobTitle) {
        employee.errors.push('Missing job title');
      }
      if (!employee.department) {
        employee.errors.push('Missing department');
      }
      if (!employee.division) {
        employee.errors.push('Missing division');
      }

      return employee;
    });

    setPreviewData(processedData);
  }, [data.csvData]);

  const validEntries = previewData.filter(entry => entry.errors.length === 0);
  const invalidEntries = previewData.filter(entry => entry.errors.length > 0);

  const handleImport = () => {
    const importStats = {
      total: previewData.length,
      successful: validEntries.length,
      errors: invalidEntries.length
    };

    onDataChange({
      people: validEntries,
      importStats
    });
    onNext();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="max-w-6xl w-full">
          <PreviewHeader />
          
          <StatsCards
            totalEntries={previewData.length}
            validEntries={validEntries.length}
            invalidEntries={invalidEntries.length}
          />

          <DataPreviewTable previewData={previewData} />

          <ErrorWarning invalidCount={invalidEntries.length} />
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="border-t bg-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex gap-4">
          <Button onClick={onBack} variant="outline" className="flex-1">
            ← Back to Mapping
          </Button>
          <Button 
            onClick={handleImport} 
            className="flex-1"
            disabled={validEntries.length === 0}
          >
            Import {validEntries.length} People →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PreviewConfirm;
