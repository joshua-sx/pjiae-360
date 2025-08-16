import { useState } from 'react';
import { FileUploadCard } from './FileUploadCard';
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
  csvText: _csvText,
  setCsvText: _setCsvText,
  onFileUpload,
  onPasteData: _onPasteData,
  onManualAdd,
  onChangeFile,
}: UploadSectionProps) {
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <FileUploadCard
        uploadMethod={uploadMethod}
        onUpload={onFileUpload}
        onMethodChange={(method) => setUploadMethod(method)}
        uploadedFile={uploadedFile || undefined}
        onChangeFile={onChangeFile}
        isCompleted={uploadMethod === 'upload' && uploadedFile !== null}
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

