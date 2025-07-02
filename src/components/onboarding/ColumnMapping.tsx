
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, AlertCircle, CheckCircle } from "lucide-react";
import { OnboardingData } from "./OnboardingTypes";
import OnboardingStepLayout from "./components/OnboardingStepLayout";

interface ColumnMappingProps {
  data: OnboardingData;
  onDataChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const requiredFields = [
  { key: 'firstName', label: 'First Name', required: true },
  { key: 'lastName', label: 'Last Name', required: true },
  { key: 'email', label: 'Email Address', required: true },
  { key: 'jobTitle', label: 'Job Title', required: true },
  { key: 'department', label: 'Department', required: true },
  { key: 'division', label: 'Division', required: true },
  { key: 'employeeId', label: 'Employee ID', required: false }
];

const ColumnMapping = ({ data, onDataChange, onNext, onBack }: ColumnMappingProps) => {
  const [mappings, setMappings] = useState<Record<string, string>>(data.csvData.columnMapping);
  const [errors, setErrors] = useState<string[]>([]);

  const validateMappings = () => {
    const newErrors: string[] = [];
    const requiredMapped = requiredFields.filter(field => field.required);
    
    requiredMapped.forEach(field => {
      const isMapped = Object.values(mappings).includes(field.key);
      if (!isMapped) {
        newErrors.push(`${field.label} must be mapped to a column`);
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleMappingChange = (csvColumn: string, fieldKey: string) => {
    const newMappings = { ...mappings };
    
    Object.keys(newMappings).forEach(key => {
      if (newMappings[key] === fieldKey) {
        delete newMappings[key];
      }
    });
    
    if (fieldKey !== 'skip') {
      newMappings[csvColumn] = fieldKey;
    }
    
    setMappings(newMappings);
  };

  const handleNext = () => {
    if (validateMappings()) {
      onDataChange({
        csvData: {
          ...data.csvData,
          columnMapping: mappings
        }
      });
      onNext();
    }
  };

  useEffect(() => {
    validateMappings();
  }, [mappings]);

  if (!data.csvData.headers.length) {
    return (
      <div className="flex-1 flex flex-col bg-slate-50">
        <div className="flex-1 flex items-center justify-center px-6">
          <Card className="max-w-md border-orange-200">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No CSV Data Found</h3>
              <p className="text-slate-600 mb-4">Please go back and upload a CSV file first.</p>
              <Button onClick={onBack} variant="outline">Go Back</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <OnboardingStepLayout
      onBack={onBack}
      onNext={handleNext}
      nextLabel="Continue to Preview →"
      nextDisabled={errors.length > 0}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Map Your Columns
        </h1>
        <p className="text-lg text-slate-600">
          Match your CSV columns to the required fields
        </p>
      </div>

      {/* Error Alert */}
      {errors.length > 0 && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* Mapping Interface */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            Column Mapping
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.csvData.headers.map((header, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl bg-white">
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{header}</p>
                  <p className="text-sm text-slate-500">
                    Sample: {data.csvData.rows[0]?.[index] || 'No data'}
                  </p>
                </div>
                <div className="flex-1">
                  <Select
                    value={mappings[header] || 'skip'}
                    onValueChange={(value) => handleMappingChange(header, value)}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skip">Skip this column</SelectItem>
                      {requiredFields.map(field => (
                        <SelectItem key={field.key} value={field.key}>
                          {field.label} {field.required && '*'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </OnboardingStepLayout>
  );
};

export default ColumnMapping;
