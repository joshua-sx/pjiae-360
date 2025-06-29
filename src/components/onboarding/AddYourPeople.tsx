
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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

  const requiredColumns = [
    'Name (Full Name, First Name + Last Name)',
    'Email (Email Address, Work Email)',
    'Department (Optional - can be mapped later)'
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <ScrollArea className="flex-1">
        <div className="px-6 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Add Your People
              </h1>
              <p className="text-lg text-slate-600">
                Import your team members to get started
              </p>
            </div>

            {/* Required Columns Info */}
            <Card className="mb-8 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Required CSV Columns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {requiredColumns.map((column, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <p className="text-slate-700 text-sm">{column}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-600 mt-3">
                  💡 Column names are flexible - we'll help you map them in the next step
                </p>
              </CardContent>
            </Card>

            {/* Main Options */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* File Upload */}
              <Card className={`cursor-pointer transition-all border-2 ${uploadMethod === 'upload' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary" />
                    Upload CSV File
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-primary/50 transition-colors relative"
                    onClick={() => setUploadMethod('upload')}
                  >
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto">
                        <Upload className="w-6 h-6 text-slate-500" />
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
              <Card className={`transition-all border-2 ${uploadMethod === 'paste' ? 'border-primary bg-primary/5' : 'border-slate-200'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
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
                      className="h-24 font-mono text-sm resize-none"
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
                className="h-12 flex items-center gap-2 border-slate-300"
              >
                <Plus className="w-4 h-4" />
                Add People Manually
              </Button>
              
              <Button
                onClick={handleSkip}
                variant="ghost"
                className="h-12 text-slate-600 hover:text-slate-800"
              >
                Skip for Now
              </Button>
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
