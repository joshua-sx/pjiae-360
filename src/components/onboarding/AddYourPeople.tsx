
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OnboardingData } from "./OnboardingTypes";
import PeopleHeader from "./components/PeopleHeader";
import RequiredColumnsInfo from "./components/RequiredColumnsInfo";
import FileUploadCard from "./components/FileUploadCard";
import PasteDataCard from "./components/PasteDataCard";
import AlternativeOptions from "./components/AlternativeOptions";

interface AddYourPeopleProps {
  data: OnboardingData;
  onDataChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkipTo?: (stepIndex: number) => void;
}

const AddYourPeople = ({ data, onDataChange, onNext, onBack, onSkipTo }: AddYourPeopleProps) => {
  const [csvData, setCsvData] = useState(data.csvData.rawData);
  const [uploadMethod, setUploadMethod] = useState<'upload' | 'paste' | 'manual'>('upload');

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
      setCsvData(csvText);
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

  const handleTextParse = () => {
    if (csvData.trim()) {
      const { headers, rows } = parseCsvData(csvData);
      onDataChange({
        csvData: {
          rawData: csvData,
          headers,
          rows,
          columnMapping: {}
        }
      });
      onNext();
    }
  };

  const handleManualEntry = () => {
    if (onSkipTo) {
      onSkipTo(4);
    }
  };

  const handleSkip = () => {
    if (onSkipTo) {
      onSkipTo(5);
    }
  };

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

              <PasteDataCard
                uploadMethod={uploadMethod}
                csvData={csvData}
                onDataChange={setCsvData}
                onMethodChange={setUploadMethod}
                onParse={handleTextParse}
              />
            </div>

            <AlternativeOptions
              onManualEntry={handleManualEntry}
              onSkip={handleSkip}
            />
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
            disabled={!data.csvData.headers.length}
            className="flex-1"
          >
            Continue to Mapping →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddYourPeople;
