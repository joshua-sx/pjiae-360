import { EmployeeColumnMapping } from './EmployeeColumnMapping';
import { EmployeeImportData } from './types';

interface MappingSectionProps {
  uploadMethod: 'upload' | 'paste' | 'manual';
  headers: string[];
  rows: string[][];
  columnMapping: Record<string, string>;
  uploadedFile: { name: string; size: number } | null;
  onComplete: (data: EmployeeImportData) => void;
  onBack: () => void;
}

export function MappingSection({
  uploadMethod,
  headers,
  rows,
  columnMapping,
  uploadedFile,
  onComplete,
  onBack,
}: MappingSectionProps) {
  return (
    <EmployeeColumnMapping
      data={{
        uploadMethod,
        csvData: {
          rawData: '',
          headers,
          rows,
          columnMapping,
        },
        uploadedFile,
        manualEmployees: [],
      }}
      onDataChange={() => {}}
      onNext={onComplete}
      onBack={onBack}
    />
  );
}

