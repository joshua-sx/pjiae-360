
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
  const [uploadMethod, setUploadMethod] = useState<'upload' | 'manual' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      
      onDataChange({
        csvData: {
          rawData: csvText,
          headers,
          rows,
          columnMapping: {}
        }
      });
    };
    reader.readAsText(file);
  };

  const handleManualAdd = () => {
    setUploadMethod('manual');
    setIsModalOpen(true);
  };

  const handleManualSave = (people: Array<{name: string; email: string; department: string}>) => {
    const processedPeople = people.map((person, index) => {
      const [firstName, ...lastNameParts] = person.name.split(' ');
      return {
        id: `manual-${index}`,
        firstName: firstName || '',
        lastName: lastNameParts.join(' ') || '',
        email: person.email,
        jobTitle: '',
        department: person.department || '',
        division: '',
        role: undefined
      };
    });

    onDataChange({
      people: processedPeople
    });
  };

  const canContinue = data.csvData.headers.length > 0 || data.people.length > 0;

  return (
    <OnboardingStepLayout
      onBack={onBack}
      onNext={onNext}
      nextLabel="Next →"
      nextDisabled={!canContinue}
    >
      <PeopleHeader />
      <RequiredColumnsInfo />

      {/* Main Options */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <FileUploadCard
          uploadMethod={uploadMethod}
          onUpload={handleCsvUpload}
          onMethodChange={setUploadMethod}
        />

        <AddManuallyCard
          uploadMethod={uploadMethod}
          onMethodChange={handleManualAdd}
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
