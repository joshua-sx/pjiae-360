
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, AlertCircle, CheckCircle, Sparkles } from "lucide-react";
import { OnboardingData } from "./OnboardingTypes";
import OnboardingStepLayout from "./components/OnboardingStepLayout";

interface ColumnMappingProps {
  data: OnboardingData;
  onDataChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isFinalStep?: boolean;
}

const requiredFields = [
  { key: 'firstName', label: 'First Name', required: true },
  { key: 'lastName', label: 'Last Name', required: true },
  { key: 'email', label: 'Email Address', required: true },
  { key: 'jobTitle', label: 'Job Title', required: false },
  { key: 'division', label: 'Division', required: false },
  { key: 'department', label: 'Department', required: false }
];

// Auto-mapping logic for common column names
const getAutoMapping = (headers: string[]): Record<string, string> => {
  const mapping: Record<string, string> = {};
  
  headers.forEach(header => {
    const lowerHeader = header.toLowerCase().trim();
    
    // Prioritize required fields first
    // First Name mapping - PRIORITY
    if (['first name', 'firstname', 'fname', 'given name', 'first'].includes(lowerHeader)) {
      mapping[header] = 'firstName';
    }
    // Last Name mapping - PRIORITY  
    else if (['last name', 'lastname', 'lname', 'surname', 'family name', 'last'].includes(lowerHeader)) {
      mapping[header] = 'lastName';
    }
    // Email mapping - PRIORITY
    else if (['email', 'email address', 'e-mail', 'mail'].includes(lowerHeader)) {
      mapping[header] = 'email';
    }
    // Division mapping (including legacy "Org Unit Type")
    else if (['division', 'div', 'business unit', 'bu', 'org unit type', 'organization unit type', 'organizational unit type'].includes(lowerHeader)) {
      mapping[header] = 'division';
    }
    // Department mapping (including legacy "Org Unit Name")
    else if (['department', 'dept', 'dep', 'org unit name', 'organization unit name', 'organizational unit name'].includes(lowerHeader)) {
      mapping[header] = 'department';
    }
    // Job Title mapping - LOWER PRIORITY
    else if (['job title', 'jobtitle', 'title', 'position', 'role', 'job', 'job_title'].includes(lowerHeader)) {
      mapping[header] = 'jobTitle';
    }
  });
  
  return mapping;
};

const ColumnMapping = ({ data, onDataChange, onNext, onBack, isFinalStep = false }: ColumnMappingProps) => {
  const [mappings, setMappings] = useState<Record<string, string>>(data.csvData.columnMapping || {});
  const [errors, setErrors] = useState<string[]>([]);
  const [isAutoMapped, setIsAutoMapped] = useState(false);

  useEffect(() => {
    if (data.csvData.headers.length > 0) {
      const hasExistingMapping = Object.keys(data.csvData.columnMapping).length > 0;
      const mappingToUse = hasExistingMapping
        ? data.csvData.columnMapping
        : getAutoMapping(data.csvData.headers);

      setMappings(mappingToUse);

      // Check if we have all required fields mapped
      const requiredMapped = requiredFields.filter(field => field.required);
      const allRequiredMapped = requiredMapped.every(field =>
        Object.values(mappingToUse).includes(field.key)
      );

      setIsAutoMapped(allRequiredMapped);

      if (!hasExistingMapping) {
        onDataChange({
          csvData: {
            ...data.csvData,
            columnMapping: mappingToUse
          }
        });
      }
    }
  }, [data.csvData.headers, data.csvData.columnMapping, data.csvData, onDataChange]);

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
    setIsAutoMapped(false);

    onDataChange({
      csvData: {
        ...data.csvData,
        columnMapping: newMappings
      }
    });
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
      <OnboardingStepLayout
        onBack={onBack}
        onNext={() => {}}
        nextDisabled={true}
        isFinalStep={false}
      >
        <div className="flex items-center justify-center min-h-96">
          <Card className="max-w-md border-orange-200">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No CSV Data Found</h3>
              <p className="text-slate-600 mb-4">Please go back and upload a CSV file first.</p>
              <Button onClick={onBack} variant="outline">Go Back</Button>
            </CardContent>
          </Card>
        </div>
      </OnboardingStepLayout>
    );
  }

  return (
    <OnboardingStepLayout
      onBack={onBack}
      onNext={handleNext}
      nextDisabled={errors.length > 0}
      isFinalStep={isFinalStep}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Map Your Columns
        </h1>
        <p className="text-lg text-slate-600">
          {isAutoMapped 
            ? "We've matched your CSV columns for you. Please verify below."
            : "Match your CSV columns to the required fields"
          }
        </p>
      </div>

      {/* Auto-mapping success message */}
      {isAutoMapped && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <Sparkles className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Great! We've automatically matched your CSV columns. If everything looks good, click Next to continue.
          </AlertDescription>
        </Alert>
      )}

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
            {data.csvData.headers.map((header, index) => {
              // Display user-friendly names for legacy column headers
              const getDisplayName = (header: string) => {
                const lowerHeader = header.toLowerCase().trim();
                if (lowerHeader === 'org unit type') return 'Division';
                if (lowerHeader === 'org unit name') return 'Department';
                return header;
              };
              
              return (
                <div key={index} className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl bg-white">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{getDisplayName(header)}</p>
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
              );
            })}
          </div>
        </CardContent>
      </Card>
    </OnboardingStepLayout>
  );
};

export default ColumnMapping;
