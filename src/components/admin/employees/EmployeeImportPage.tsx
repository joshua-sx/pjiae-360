import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Upload, FileText, CheckCircle, ArrowLeft, AlertTriangle, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EmployeeData, ImportStep } from "./import/types";
import { FileUploadCard } from "./import/FileUploadCard";
import { PasteDataCard } from "./import/PasteDataCard";
import { AddManuallyCard } from "./import/AddManuallyCard";
import { EmployeeColumnMapping } from "./import/EmployeeColumnMapping";
import { EmployeePreviewTable } from "./EmployeePreviewTable";
import { ManualAddEmployeeModal } from "./import/ManualAddEmployeeModal";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface ImportResult {
  success: boolean;
  message: string;
  imported: number;
  failed: number;
  errors: Array<{
    email: string;
    error: string;
  }>;
  organizationId?: string;
}

const EmployeeImportPage = () => {
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [uploadMethod, setUploadMethod] = useState<'upload' | 'paste' | 'manual' | null>(null);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [employeesToImport, setEmployeesToImport] = useState<EmployeeData[]>([]);
  const [manualEmployees, setManualEmployees] = useState<EmployeeData[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const { toast } = useToast();

  const handleCsvUpload = (data: string[][]) => {
    if (data.length === 0) return;
    
    console.log('Raw CSV data:', data);
    const [headerRow, ...dataRows] = data;
    setHeaders(headerRow);
    setCsvData(dataRows);
    setUploadMethod('upload');
    setCurrentStep('mapping');
  };

  const handleFileUpload = (file: File) => {
    setUploadedFile({ name: file.name, size: file.size });
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const data = lines.map(line => {
        // Handle CSV parsing with proper quote handling
        const matches = line.match(/(?:^|,)("(?:[^"]+|"")*"|[^,]*)/g);
        return matches ? matches.map(match => 
          match.replace(/^,/, '').replace(/^"|"$/g, '').replace(/""/g, '"')
        ) : [];
      });
      handleCsvUpload(data);
    };
    reader.readAsText(file);
  };

  const handlePasteData = (pastedData: string) => {
    setCsvText(pastedData);
    setUploadMethod('paste');
    const lines = pastedData.trim().split('\n');
    const data = lines.map(line => {
      const matches = line.match(/(?:^|,)("(?:[^"]+|"")*"|[^,]*)/g);
      return matches ? matches.map(match => match.replace(/^,/, '').replace(/^"|"$/g, '').replace(/""/g, '"')) : [];
    });
    handleCsvUpload(data);
  };

  const handleManualAdd = (employees: EmployeeData[]) => {
    setManualEmployees(employees);
    setEmployeesToImport(employees);
    setUploadMethod('manual');
    setCurrentStep('preview');
    setIsManualModalOpen(false);
  };

  const processCSVData = (mapping: Record<string, string>) => {
    console.log('Processing CSV data with mapping:', mapping);
    console.log('CSV data rows:', csvData);
    
    const employees = csvData.map((row, index) => {
      const employee: EmployeeData = {
        firstName: '',
        lastName: '',
        email: '',
        department: '',
        division: '',
        jobTitle: '',
        employeeId: '',
        phoneNumber: ''
      };

      // Process mapping - mapping should be { columnName: fieldName }
      Object.entries(mapping).forEach(([columnName, fieldName]) => {
        const columnIndex = headers.indexOf(columnName);
        if (columnIndex !== -1 && row[columnIndex]) {
          const value = row[columnIndex].trim();
          if (fieldName in employee) {
            (employee as any)[fieldName] = value;
          }
        }
      });

      console.log(`Employee ${index + 1}:`, employee);
      return employee;
    }).filter(emp => emp.firstName && emp.lastName && emp.email);

    console.log('Processed employees:', employees);
    return employees;
  };

  const handleMappingComplete = (importData: any) => {
    console.log('Mapping complete with data:', importData);
    const mapping = importData.csvData.columnMapping;
    setColumnMapping(mapping);
    const employees = processCSVData(mapping);
    setEmployeesToImport(employees);
    setCurrentStep('preview');
  };

  const handleConfirmImport = async () => {
    if (employeesToImport.length === 0) {
      toast({
        title: "No employees to import",
        description: "Please add some employees first.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setImportResult(null);
    
    try {
      // Get current user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, first_name, last_name, name')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('User profile not found');

      // Get organization name
      const { data: org } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', profile.organization_id)
        .single();

      const orgName = org?.name || 'Default Organization';

      // Prepare data for the enhanced edge function
      const importData = {
        orgName,
        people: employeesToImport.map((emp, index) => ({
          id: `temp-${index}`,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          jobTitle: emp.jobTitle || '',
          department: emp.department || '',
          division: emp.division || '',
          employeeId: parseInt(emp.employeeId) || undefined,
          role: 'employee' // Default role, will be determined by sync_user_roles
        })),
        adminInfo: {
          name: profile.name || `${profile.first_name} ${profile.last_name}`.trim(),
          email: user.email || '',
          role: 'admin'
        }
      };

      console.log('Sending enhanced import request:', importData);

      // Call the enhanced edge function
      const { data: result, error } = await supabase.functions.invoke('import-employees', {
        body: importData
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Import failed');
      }

      console.log('Import result:', result);
      setImportResult(result);

      if (result.success) {
        toast({
          title: "Import completed!",
          description: result.message,
        });
        
        // Reset form after successful import
        setTimeout(() => {
          resetImportState();
        }, 5000);
      } else {
        toast({
          title: "Import completed with errors",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const resetImportState = () => {
    setCurrentStep('upload');
    setUploadMethod(null);
    setCsvData([]);
    setHeaders([]);
    setColumnMapping({});
    setEmployeesToImport([]);
    setManualEmployees([]);
    setUploadedFile(null);
    setCsvText("");
    setImportResult(null);
  };

  const handleChangeFile = () => {
    setUploadedFile(null);
    setUploadMethod(null);
    setCsvData([]);
    setHeaders([]);
    setCurrentStep('upload');
  };

  const stats = [
    {
      title: "Ready to Import",
      value: employeesToImport.length.toString(),
      description: "Employees processed",
      icon: Users
    },
    {
      title: "Current Step",
      value: currentStep === 'upload' ? '1' : currentStep === 'mapping' ? '2' : '3',
      description: "of 3 steps",
      icon: FileText
    }
  ];

  // Show import results if available
  if (importResult && (importResult.imported > 0 || importResult.failed > 0)) {
    return (
      <div className="space-y-6 overflow-x-hidden">
        <PageHeader
          title="Import Results"
          description="Review the results of your employee import"
        >
          <Button onClick={resetImportState}>
            Import More Employees
          </Button>
        </PageHeader>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Successfully Imported"
            value={importResult.imported.toString()}
            description="Employees created with auth accounts"
            icon={CheckCircle}
            iconColor="text-green-600"
          />
          <StatCard
            title="Failed Imports"
            value={importResult.failed.toString()}
            description="Employees that couldn't be imported"
            icon={AlertTriangle}
            iconColor="text-red-600"
          />
          <StatCard
            title="Invitations Sent"
            value={importResult.imported.toString()}
            description="Welcome emails sent to new users"
            icon={Mail}
            iconColor="text-blue-600"
          />
        </div>

        {importResult.failed > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Import Errors
              </CardTitle>
              <CardDescription>
                The following employees could not be imported
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {importResult.errors.map((error, index) => (
                  <Alert key={index} variant="destructive">
                    <AlertDescription>
                      <strong>{error.email}:</strong> {error.error}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {importResult.success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              {importResult.message}. 
              {importResult.imported > 0 && " Invitation emails have been sent to all new employees."}
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      <PageHeader
        title="Import Employees"
        description="Upload employee data from CSV files or add them manually. New employees will receive invitation emails with account setup instructions."
      >
        {currentStep !== 'upload' && !isImporting && (
          <Button
            variant="outline"
            onClick={() => {
              if (currentStep === 'mapping') setCurrentStep('upload');
              if (currentStep === 'preview') {
                if (uploadMethod === 'manual') {
                  setCurrentStep('upload');
                } else {
                  setCurrentStep('mapping');
                }
              }
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {isImporting && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Import...</CardTitle>
            <CardDescription>
              Creating user accounts and sending invitation emails
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={undefined} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                This may take a few moments depending on the number of employees...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isImporting && currentStep === 'upload' && (
        <div className="grid gap-6 md:grid-cols-3">
          <FileUploadCard 
            uploadMethod={uploadMethod}
            onUpload={handleFileUpload}
            onMethodChange={(method) => setUploadMethod(method)}
            uploadedFile={uploadedFile}
            onChangeFile={handleChangeFile}
            isCompleted={uploadMethod === 'upload' && uploadedFile !== null}
          />
          <PasteDataCard 
            uploadMethod={uploadMethod}
            csvData={csvText}
            onDataChange={setCsvText}
            onMethodChange={(method) => setUploadMethod(method)}
            onParse={handlePasteData}
          />
          <AddManuallyCard 
            uploadMethod={uploadMethod}
            onMethodChange={() => setIsManualModalOpen(true)}
            manualEmployees={manualEmployees}
          />
        </div>
      )}

      {!isImporting && currentStep === 'mapping' && (
        <EmployeeColumnMapping
          data={{
            uploadMethod: uploadMethod || 'upload',
            csvData: {
              rawData: '',
              headers,
              rows: csvData,
              columnMapping
            },
            uploadedFile,
            manualEmployees: []
          }}
          onDataChange={() => {}}
          onNext={handleMappingComplete}
          onBack={() => setCurrentStep('upload')}
        />
      )}

      {!isImporting && currentStep === 'preview' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Preview & Import
              </CardTitle>
              <CardDescription>
                Review the employee data before importing. Auth users will be created and invitation emails sent.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    Each employee will receive an invitation email with instructions to access their account.
                  </AlertDescription>
                </Alert>

                <EmployeePreviewTable employees={employeesToImport} />
                
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (uploadMethod === 'manual') {
                        setCurrentStep('upload');
                      } else {
                        setCurrentStep('mapping');
                      }
                    }}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleConfirmImport}
                    disabled={employeesToImport.length === 0}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Import {employeesToImport.length} Employees
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <ManualAddEmployeeModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSave={handleManualAdd}
      />
    </div>
  );
};

export default EmployeeImportPage;
