import { useState } from 'react';
import { FileUploadCard } from './FileUploadCard';
import { PasteDataCard } from './PasteDataCard';
import { AddManuallyCard } from './AddManuallyCard';
import { ManualAddEmployeeModal } from './ManualAddEmployeeModal';
import { EmployeeData } from './types';

interface UploadSectionProps {
  uploadMethod: 'upload' | 'paste' | 'manual' | null;
  setUploadMethod: (method: 'upload' | 'paste' | 'manual') => void;
  uploadedFile: { name: string; size: number } | null;
  manualEmployees: EmployeeData[];
  csvText: string;
  setCsvText: (text: string) => void;
  onFileUpload: (file: File) => void;
  onPasteData: (text: string) => void;
  onManualAdd: (employees: EmployeeData[]) => void;
  onChangeFile: () => void;
}

export function UploadSection({
  uploadMethod,
  setUploadMethod,
  uploadedFile,
  manualEmployees,
  csvText,
  setCsvText,
  onFileUpload,
  onPasteData,
  onManualAdd,
  onChangeFile,
}: UploadSectionProps) {
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <FileUploadCard
        uploadMethod={uploadMethod}
        onUpload={onFileUpload}
        onMethodChange={(method) => setUploadMethod(method)}
        uploadedFile={uploadedFile || undefined}
        onChangeFile={onChangeFile}
        isCompleted={uploadMethod === 'upload' && uploadedFile !== null}
      />
      <PasteDataCard
        uploadMethod={uploadMethod}
        csvData={csvText}
        onDataChange={setCsvText}
        onMethodChange={(method) => setUploadMethod(method)}
        onParse={onPasteData}
      />
      <AddManuallyCard
        uploadMethod={uploadMethod}
        onMethodChange={() => setIsManualModalOpen(true)}
        manualEmployees={manualEmployees}
      />
      <ManualAddEmployeeModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSave={onManualAdd}
      />
    </div>
  );
}

