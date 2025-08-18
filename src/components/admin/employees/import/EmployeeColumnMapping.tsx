
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
  onNext: (data: EmployeeImportData) => void;
  onBack: () => void;
}

const requiredFields = [
  { key: 'firstName', label: 'First Name', required: true },
  { key: 'lastName', label: 'Last Name', required: true },
  { key: 'email', label: 'Email Address', required: true },
  { key: 'jobTitle', label: 'Job Title', required: false },
  { key: 'division', label: 'Division', required: false },
  { key: 'department', label: 'Department', required: false },
  { key: 'phoneNumber', label: 'Phone Number', required: false },
  { key: 'section', label: 'Section', required: false },
  { key: 'rankLevel', label: 'Rank Level', required: false }
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
    // Job Title mapping
    else if (['job title', 'jobtitle', 'title', 'position', 'role', 'job', 'job_title'].includes(lowerHeader)) {
      mapping[header] = 'jobTitle';
    }
    // Division mapping
    else if (['division', 'div', 'business unit', 'bu'].includes(lowerHeader)) {
      mapping[header] = 'division';
    }
    // Department mapping
    else if (['department', 'dept', 'dep'].includes(lowerHeader)) {
      mapping[header] = 'department';
    }
    // Phone Number mapping
    else if (['phone', 'phone number', 'phonenumber', 'mobile', 'telephone', 'phone_number', 'contact'].includes(lowerHeader)) {
      mapping[header] = 'phoneNumber';
    }
    // Section mapping
    else if (['section', 'unit', 'team', 'group', 'squad'].includes(lowerHeader)) {
      mapping[header] = 'section';
    }
    // Rank Level mapping
    else if (['rank', 'rank level', 'level', 'grade', 'seniority', 'ranking', 'tier'].includes(lowerHeader)) {
      mapping[header] = 'rankLevel';
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
      const updatedData = {
        ...data,
        csvData: {
          ...data.csvData,
          columnMapping: mappings
        }
      };
      onNext(updatedData);
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
    <div className="max-w-4xl mx-auto space-y-6">
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
            {(() => {
              // Field priority order: firstName, lastName, email, jobTitle, division, department, then optional fields
              const fieldPriority = {
                'firstName': 1, 'lastName': 2, 'email': 3,
                'jobTitle': 4, 'division': 5, 'department': 6,
                'phoneNumber': 7, 'section': 8, 'rankLevel': 9
              };
              
              // Helper function to get semantic field key for any header regardless of current mapping
              const getSemanticFieldKey = (header: string): string => {
                const lowerHeader = header.toLowerCase().trim();
                
                if (['first name', 'firstname', 'fname', 'given name', 'first'].includes(lowerHeader)) {
                  return 'firstName';
                } else if (['last name', 'lastname', 'lname', 'surname', 'family name', 'last'].includes(lowerHeader)) {
                  return 'lastName';
                } else if (['email', 'email address', 'e-mail', 'mail'].includes(lowerHeader)) {
                  return 'email';
                } else if (['job title', 'jobtitle', 'title', 'position', 'role', 'job', 'job_title'].includes(lowerHeader)) {
                  return 'jobTitle';
                } else if (['division', 'div', 'business unit', 'bu'].includes(lowerHeader)) {
                  return 'division';
                } else if (['department', 'dept', 'dep'].includes(lowerHeader)) {
                  return 'department';
                } else if (['phone', 'phone number', 'phonenumber', 'mobile', 'telephone', 'phone_number', 'contact'].includes(lowerHeader)) {
                  return 'phoneNumber';
                } else if (['section', 'unit', 'team', 'group', 'squad'].includes(lowerHeader)) {
                  return 'section';
                } else if (['rank', 'rank level', 'level', 'grade', 'seniority', 'ranking', 'tier'].includes(lowerHeader)) {
                  return 'rankLevel';
                }
                return 'unknown';
              };
              
              // Filter out any "reports to" columns entirely
              const filteredHeaders = data.csvData.headers.filter(header => {
                const lowerHeader = header.toLowerCase().trim();
                return !['reports to', 'reportsto', 'reports_to', 'manager', 'supervisor', 'direct_reports'].includes(lowerHeader);
              });
              
              // Sort headers based on semantic priority
              const sortedHeaders = [...filteredHeaders].sort((a, b) => {
                const aFieldKey = getSemanticFieldKey(a);
                const bFieldKey = getSemanticFieldKey(b);
                
                const aPriority = fieldPriority[aFieldKey as keyof typeof fieldPriority] || 999;
                const bPriority = fieldPriority[bFieldKey as keyof typeof fieldPriority] || 999;
                
                if (aPriority !== bPriority) {
                  return aPriority - bPriority;
                }
                
                // If same priority, maintain original order
                return data.csvData.headers.indexOf(a) - data.csvData.headers.indexOf(b);
              });

              return sortedHeaders.map((header) => {
                const index = data.csvData.headers.indexOf(header);
                
                return (
                  <div key={header} className="flex items-center gap-6 p-4 border rounded-lg bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{header}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        Sample: {data.csvData.rows[0]?.[index] || 'No data'}
                      </p>
                    </div>
                    <div className="w-80">
                      <Select
                        value={mappings[header] || 'skip'}
                        onValueChange={(value) => handleMappingChange(header, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent className="z-50 bg-white">
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
              });
            })()}
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
