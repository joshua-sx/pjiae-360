
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OnboardingData } from "./OnboardingTypes";
import PeopleHeader from "./components/PeopleHeader";
import RequiredColumnsInfo from "./components/RequiredColumnsInfo";
import FileUploadCard from "./components/FileUploadCard";
import AddManuallyCard from "./components/AddManuallyCard";
import ManualAddPeopleModal from "./components/ManualAddPeopleModal";
import OnboardingStepLayout from "./components/OnboardingStepLayout";

interface AddYourPeopleProps {
  data: OnboardingData;
  onDataChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkipTo?: (stepIndex: number) => void;
}

const AddYourPeople = ({ data, onDataChange, onNext, onBack, onSkipTo }: AddYourPeopleProps) => {
  const [uploadMethod, setUploadMethod] = useState<'upload' | 'manual' | null>(
    data.csvData.headers.length > 0 ? 'upload' : 
    data.people.length > 0 ? 'manual' : null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null);

  const parseCsvData = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return { headers: [], rows: [] };

    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => 
      line.split(',').map(cell => cell.trim())
    );

    return { headers, rows };
  };

  const handleCsvUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      const { headers, rows } = parseCsvData(csvText);
      
      // Clear manual data and set CSV data (mutual exclusivity)
      onDataChange({
        entryMethod: 'csv',
        people: [], // Clear manual entries
        csvData: {
          rawData: csvText,
          headers,
          rows,
          columnMapping: {}
        },
        importStats: {
          total: rows.length,
          successful: 0,
          errors: 0
        }
      });

      setUploadedFile({
        name: file.name,
        size: file.size
      });
      setUploadMethod('upload');
    };
    reader.readAsText(file);
  };

  const handleManualAdd = () => {
    // Clear CSV data when switching to manual (mutual exclusivity)
    if (data.csvData.headers.length > 0) {
      onDataChange({
        csvData: {
          rawData: "",
          headers: [],
          rows: [],
          columnMapping: {}
        },
        entryMethod: 'manual'
      });
      setUploadedFile(null);
    }
    
    setUploadMethod('manual');
    setIsModalOpen(true);
  };

  const handleManualSave = (people: Array<{firstName: string; lastName: string; email: string; jobTitle: string; department: string; division: string}>) => {
    const processedPeople = people.map((person, index) => ({
      id: crypto.randomUUID(),
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      jobTitle: person.jobTitle,
      department: person.department,
      division: person.division,
      role: 'Employee'
    }));

    onDataChange({
      entryMethod: 'manual',
      people: [...data.people, ...processedPeople],
      importStats: {
        total: data.people.length + processedPeople.length,
        successful: data.people.length + processedPeople.length,
        errors: 0
      }
    });
  };

  const handleChangeFile = () => {
    onDataChange({
      csvData: {
        rawData: "",
        headers: [],
        rows: [],
        columnMapping: {}
      }
    });
    setUploadedFile(null);
    setUploadMethod(null);
  };

  const canContinue = data.csvData.headers.length > 0 || data.people.length > 0;

  return (
    <OnboardingStepLayout
      onBack={onBack}
      onNext={onNext}
      nextLabel="Next →"
      nextDisabled={!canContinue}
      maxWidth="6xl"
    >
      <PeopleHeader />
      <RequiredColumnsInfo />

      {/* Main Options */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <FileUploadCard
          uploadMethod={uploadMethod}
          onUpload={handleCsvUpload}
          onMethodChange={() => setUploadMethod('upload')}
          uploadedFile={uploadedFile}
          onChangeFile={handleChangeFile}
          isCompleted={data.csvData.headers.length > 0}
        />

        <AddManuallyCard
          uploadMethod={uploadMethod}
          onMethodChange={handleManualAdd}
          manualUsers={data.people}
        />
      </div>

      <ManualAddPeopleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleManualSave}
      />
    </OnboardingStepLayout>
  );
};

export default AddYourPeople;
