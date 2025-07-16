import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, AlertCircle, CheckCircle, Sparkles, ArrowLeft } from "lucide-react";
import { EmployeeImportData } from "./types";

interface EmployeeColumnMappingProps {
  data: EmployeeImportData;
  onDataChange: (updates: Partial<EmployeeImportData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const requiredFields = [
  { key: 'firstName', label: 'First Name', required: true },
  { key: 'lastName', label: 'Last Name', required: true },
  { key: 'email', label: 'Email Address', required: true },
  { key: 'jobTitle', label: 'Job Title', required: false },
  { key: 'department', label: 'Department', required: false },
  { key: 'division', label: 'Division', required: false }
];

// Auto-mapping logic for common column names
const getAutoMapping = (headers: string[]): Record<string, string> => {
  const mapping: Record<string, string> = {};
  
  headers.forEach(header => {
    const lowerHeader = header.toLowerCase().trim();
    
    // First Name mapping
    if (['first name', 'firstname', 'fname', 'given name', 'first'].includes(lowerHeader)) {
      mapping[header] = 'firstName';
    }
    // Last Name mapping  
    else if (['last name', 'lastname', 'lname', 'surname', 'family name', 'last'].includes(lowerHeader)) {
      mapping[header] = 'lastName';
    }
    // Email mapping
    else if (['email', 'email address', 'e-mail', 'mail'].includes(lowerHeader)) {
      mapping[header] = 'email';
    }
    // Job Title mapping
    else if (['job title', 'jobtitle', 'title', 'position', 'role', 'job', 'job_title'].includes(lowerHeader)) {
      mapping[header] = 'jobTitle';
    }
    // Department mapping
    else if (['department', 'dept', 'dep'].includes(lowerHeader)) {
      mapping[header] = 'department';
    }
    // Division mapping
    else if (['division', 'div', 'business unit', 'bu'].includes(lowerHeader)) {
      mapping[header] = 'division';
    }
  });
  
  return mapping;
};

export function EmployeeColumnMapping({ data, onDataChange, onNext, onBack }: EmployeeColumnMappingProps) {
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [isAutoMapped, setIsAutoMapped] = useState(false);

  useEffect(() => {
    if (data.csvData.headers.length > 0) {
      const autoMapping = getAutoMapping(data.csvData.headers);
      setMappings(autoMapping);
      
      // Check if we have all required fields mapped
      const requiredMapped = requiredFields.filter(field => field.required);
      const allRequiredMapped = requiredMapped.every(field => 
        Object.values(autoMapping).includes(field.key)
      );
      
      setIsAutoMapped(allRequiredMapped);
    }
  }, [data.csvData.headers]);

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
    
    // Remove any existing mapping for this field
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
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Column Mapping</h1>
            <p className="text-muted-foreground">Map your CSV columns to employee fields</p>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-96">
          <Card className="max-w-md border-orange-200">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No CSV Data Found</h3>
              <p className="text-muted-foreground mb-4">Please go back and upload a CSV file first.</p>
              <Button onClick={onBack} variant="outline">Go Back</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Map Your Columns</h1>
          <p className="text-muted-foreground">
            {isAutoMapped 
              ? "We've matched your CSV columns for you. Please verify below."
              : "Match your CSV columns to the required employee fields"
            }
          </p>
        </div>
      </div>

      {/* Auto-mapping success message */}
      {isAutoMapped && (
        <Alert className="border-green-200 bg-green-50">
          <Sparkles className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Great! We've automatically matched your CSV columns. If everything looks good, click Next to continue.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {errors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* Mapping Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Column Mapping
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.csvData.headers.map((header, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="flex-1">
                  <p className="font-medium">{header}</p>
                  <p className="text-sm text-muted-foreground">
                    Sample: {data.csvData.rows[0]?.[index] || 'No data'}
                  </p>
                </div>
                <div className="flex-1">
                  <Select
                    value={mappings[header] || 'skip'}
                    onValueChange={(value) => handleMappingChange(header, value)}
                  >
                    <SelectTrigger>
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

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to Upload
        </Button>
        <Button onClick={handleNext} disabled={errors.length > 0}>
          Continue to Preview
        </Button>
      </div>
    </div>
  );
}