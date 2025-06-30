
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OnboardingData } from "./OnboardingTypes";
import PeopleHeader from "./components/PeopleHeader";
import RequiredColumnsInfo from "./components/RequiredColumnsInfo";
import FileUploadCard from "./components/FileUploadCard";
import AddManuallyCard from "./components/AddManuallyCard";
import ManualAddPeopleModal from "./components/ManualAddPeopleModal";

interface AddYourPeopleProps {
  data: OnboardingData;
  onDataChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkipTo?: (stepIndex: number) => void;
}

const AddYourPeople = ({ data, onDataChange, onNext, onBack, onSkipTo }: AddYourPeopleProps) => {
  const [uploadMethod, setUploadMethod] = useState<'upload' | 'manual'>('manual');
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
    const processedPeople = people.map((person, index) => ({
      id: `manual-${index}`,
      name: person.name,
      email: person.email,
      department: person.department || undefined,
      role: undefined
    }));

    onDataChange({
      people: processedPeople
    });
  };

  const canContinue = data.csvData.headers.length > 0 || data.people.length > 0;

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <ScrollArea className="flex-1">
        <div className="px-6 py-8">
          <div className="max-w-4xl mx-auto">
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
          </div>
        </div>
      </ScrollArea>

      {/* Navigation Footer - Fixed at bottom */}
      <div className="border-t bg-white px-6 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex gap-4">
          <Button onClick={onBack} variant="outline" className="flex-1">
            ← Back
          </Button>
          <Button 
            onClick={onNext}
            disabled={!canContinue}
            className="flex-1"
          >
            Next →
          </Button>
        </div>
      </div>

      <ManualAddPeopleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleManualSave}
      />
    </div>
  );
};

export default AddYourPeople;
