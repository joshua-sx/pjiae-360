import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Users, FileText, Plus } from "lucide-react";
import { OnboardingData } from "./OnboardingTypes";

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
      onNext(); // Go to column mapping
    }
  };

  const handleManualEntry = () => {
    if (onSkipTo) {
      onSkipTo(4); // Skip to import summary with manual entry
    }
  };

  const handleSkip = () => {
    if (onSkipTo) {
      onSkipTo(5); // Skip to assign roles
    }
  };

  const requiredColumns = [
    'Name (Full Name, First Name + Last Name)',
    'Email (Email Address, Work Email)',
    'Department (Optional - can be mapped later)'
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Add Your People
          </h1>
          <p className="text-slate-600">
            Import your team members to get started
          </p>
        </div>

        {/* Required Columns Info */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Required CSV Columns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {requiredColumns.map((column, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  <p className="text-blue-800 text-sm">{column}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-blue-700 mt-3">
              💡 Column names are flexible - we'll help you map them in the next step
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* File Upload */}
          <Card className={`cursor-pointer transition-all ${uploadMethod === 'upload' ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:border-slate-300'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Upload CSV File
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-slate-400 transition-colors relative"
                onClick={() => setUploadMethod('upload')}
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto">
                    <Upload className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-slate-700 font-medium">Drop your CSV here</p>
                    <p className="text-slate-500 text-sm">or click to browse</p>
                  </div>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadMethod('upload');
                      handleCsvUpload(file);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>

          {/* Paste Data */}
          <Card className={`transition-all ${uploadMethod === 'paste' ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Paste CSV Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Textarea
                  value={csvData}
                  onChange={(e) => {
                    setCsvData(e.target.value);
                    setUploadMethod('paste');
                  }}
                  placeholder="name,email,department&#10;John Doe,john@company.com,Engineering&#10;Jane Smith,jane@company.com,Marketing"
                  className="h-24 font-mono text-sm"
                />
                <Button
                  onClick={handleTextParse}
                  disabled={!csvData.trim()}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  Parse Data →
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alternative Options */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Button
            onClick={handleManualEntry}
            variant="outline"
            className="h-12 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add People Manually
          </Button>
          
          <Button
            onClick={handleSkip}
            variant="ghost"
            className="h-12 text-slate-600"
          >
            Skip for Now
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button onClick={onBack} variant="outline" className="flex-1">
            Back
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
