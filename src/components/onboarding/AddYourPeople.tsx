
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Users, CheckCircle } from "lucide-react";
import { OnboardingData } from "./OnboardingFlow";

interface AddYourPeopleProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
}

const AddYourPeople = ({ data, updateData, onNext }: AddYourPeopleProps) => {
  const [csvData, setCsvData] = useState("");
  const [previewEmployees, setPreviewEmployees] = useState<Array<{
    id: string;
    name: string;
    email: string;
    department?: string;
    role: string;
  }>>([]);
  const [showPreview, setShowPreview] = useState(false);

  const parseCsvData = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const employees = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const employee = {
        id: `emp_${Date.now()}_${i}`,
        name: values[headers.indexOf('name')] || values[headers.indexOf('full name')] || values[0],
        email: values[headers.indexOf('email')] || values[headers.indexOf('email address')] || values[1],
        department: values[headers.indexOf('department')] || values[headers.indexOf('dept')] || undefined,
        role: 'Employee' as const
      };
      
      if (employee.name && employee.email) {
        employees.push(employee);
      }
    }

    return employees;
  };

  const handleCsvUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      setCsvData(csvText);
      const parsed = parseCsvData(csvText);
      setPreviewEmployees(parsed);
      setShowPreview(true);
    };
    reader.readAsText(file);
  };

  const handleTextParse = () => {
    if (csvData.trim()) {
      const parsed = parseCsvData(csvData);
      setPreviewEmployees(parsed);
      setShowPreview(true);
    }
  };

  const confirmEmployees = () => {
    updateData({ people: previewEmployees });
    onNext();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Who's on your team?
          </h1>
          <p className="text-slate-600 text-lg">
            Upload a CSV, paste data, or add emails
          </p>
        </div>

        {!showPreview ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* File Upload */}
            <div className="space-y-4">
              <Label className="text-lg font-medium text-slate-700">
                Upload CSV or JSON
              </Label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-slate-400 transition-colors">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-slate-700 font-medium">Drop your file here</p>
                    <p className="text-slate-500 text-sm mt-1">CSV, JSON (10MB max)</p>
                  </div>
                  <input
                    type="file"
                    accept=".csv,.json"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleCsvUpload(file);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Text Input */}
            <div className="space-y-4">
              <Label className="text-lg font-medium text-slate-700">
                Or paste your data
              </Label>
              <Textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder="name,email,department&#10;John Doe,john@company.com,Engineering&#10;Jane Smith,jane@company.com,Marketing"
                className="h-40 font-mono text-sm"
              />
              <Button
                onClick={handleTextParse}
                disabled={!csvData.trim()}
                variant="outline"
                className="w-full"
              >
                Parse Data
              </Button>
            </div>
          </div>
        ) : (
          /* Preview */
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">
                Found {previewEmployees.length} employees with auto-detected fields
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Employee Preview
                </h3>
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                {previewEmployees.map((employee, index) => (
                  <div key={employee.id} className="px-6 py-3 border-b border-slate-100 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{employee.name}</p>
                        <p className="text-sm text-slate-600">{employee.email}</p>
                      </div>
                      <div className="text-right">
                        {employee.department && (
                          <p className="text-sm text-slate-600">{employee.department}</p>
                        )}
                        <p className="text-xs text-slate-500">Role: {employee.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-800 text-sm">
                💡 All users are set as "Employee" by default. You'll be able to change roles later.
              </p>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={() => setShowPreview(false)}
                variant="outline"
                className="flex-1"
              >
                Go Back
              </Button>
              <Button
                onClick={confirmEmployees}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Looks Good →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddYourPeople;
