import { useState } from "react";
import Papa from "papaparse";
import { OnboardingData } from "./OnboardingTypes";
import PeopleHeader from "./components/PeopleHeader";
import FileUploadCard from "./components/FileUploadCard";
import AddManuallyCard from "./components/AddManuallyCard";
import ManualAddPeopleModal from "./components/ManualAddPeopleModal";
import OnboardingStepLayout from "./components/OnboardingStepLayout";
import { extractOrgStructureFromPeople } from "./utils/orgStructureExtractor";

interface AddYourPeopleProps {
  data: OnboardingData;
  onDataChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkipTo?: (stepIndex: number) => void;
  isFinalStep?: boolean;
}

const AddYourPeople = ({ data, onDataChange, onNext, onBack, onSkipTo, isFinalStep = false }: AddYourPeopleProps) => {
  const [uploadMethod, setUploadMethod] = useState<"upload" | "manual" | null>(
    data.csvData.headers.length > 0 ? "upload" : data.people.length > 0 ? "manual" : null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const parseCsvData = (csvText: string) => {
    const result = Papa.parse<string[]>(csvText, {
      delimiter: "",
      skipEmptyLines: true,
    });
    const [headers, ...rows] = result.data;
    return { headers: headers ?? [], rows: rows as string[][], errors: result.errors };
  };

  const handleCsvUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      const { headers, rows, errors } = parseCsvData(csvText);

      if (errors.length > 0 || headers.length === 0 || rows.length === 0) {
        setParseError(errors[0]?.message || "Invalid CSV file");
        return;
      }

      setParseError(null);

      // Clear manual data and set CSV data (mutual exclusivity)
      onDataChange({
        entryMethod: "csv",
        people: [], // Clear manual entries
        csvData: {
          rawData: csvText,
          headers,
          rows,
          columnMapping: {},
        },
        uiState: {
          peopleStage: 'entry',
          mappingReviewed: false
        },
        importStats: {
          total: rows.length,
          successful: 0,
          errors: 0,
        },
      });

      setUploadedFile({
        name: file.name,
        size: file.size,
      });
      setUploadMethod("upload");
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
          columnMapping: {},
        },
        entryMethod: "manual",
      });
      setUploadedFile(null);
    }

    setParseError(null);
    setUploadMethod("manual");
    setIsModalOpen(true);
  };

  const handleManualSave = (
    people: Array<{
      firstName: string;
      lastName: string;
      email: string;
      jobTitle: string;
      department: string;
      division: string;
    }>
  ) => {
    const processedPeople = people.map((person, index) => ({
      id: crypto.randomUUID(),
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      jobTitle: person.jobTitle,
      department: person.department,
      division: person.division,
      role: "Employee",
    }));

    // Extract organizational structure from all people (existing + new)
    const allPeople = [...data.people, ...processedPeople];
    const orgStructure = extractOrgStructureFromPeople(allPeople);

    onDataChange({
      entryMethod: "manual",
      people: allPeople,
      orgStructure: orgStructure,
      importStats: {
        total: allPeople.length,
        successful: allPeople.length,
        errors: 0,
      },
    });
  };

  const handleChangeFile = () => {
    onDataChange({
      csvData: {
        rawData: "",
        headers: [],
        rows: [],
        columnMapping: {},
      },
    });
    setUploadedFile(null);
    setUploadMethod(null);
    setParseError(null);
  };

  const canContinue = data.csvData.headers.length > 0 || data.people.length > 0;

  return (
    <OnboardingStepLayout
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!canContinue}
      isFinalStep={isFinalStep}
      maxWidth="6xl"
    >
      <PeopleHeader />

      {/* Main Options */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <FileUploadCard
          uploadMethod={uploadMethod}
          onUpload={handleCsvUpload}
          onMethodChange={() => setUploadMethod("upload")}
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

      {parseError && <p className="text-red-600 text-sm mb-8">{parseError}</p>}

      <ManualAddPeopleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleManualSave}
      />
    </OnboardingStepLayout>
  );
};

export default AddYourPeople;
