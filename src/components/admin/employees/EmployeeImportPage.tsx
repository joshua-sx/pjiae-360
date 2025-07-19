import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Upload, FileText, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EmployeeData, ImportStep } from "./import/types";
import { FileUploadCard } from "./import/FileUploadCard";
import { PasteDataCard } from "./import/PasteDataCard";
import { AddManuallyCard } from "./import/AddManuallyCard";
import { EmployeeColumnMapping } from "./import/EmployeeColumnMapping";
import { EmployeePreviewTable } from "./EmployeePreviewTable";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";

const EmployeeImportPage = () => {
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [employeesToImport, setEmployeesToImport] = useState<EmployeeData[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleCsvUpload = (data: string[][]) => {
    if (data.length === 0) return;
    
    console.log('Raw CSV data:', data);
    const [headerRow, ...dataRows] = data;
    setHeaders(headerRow);
    setCsvData(dataRows);
    setCurrentStep('mapping');
  };

  const handlePasteData = (pastedData: string) => {
    const lines = pastedData.trim().split('\n');
    const data = lines.map(line => {
      const matches = line.match(/(?:^|,)("(?:[^"]+|"")*"|[^,]*)/g);
      return matches ? matches.map(match => match.replace(/^,/, '').replace(/^"|"$/g, '').replace(/""/g, '"')) : [];
    });
    handleCsvUpload(data);
  };

  const handleManualAdd = (employees: EmployeeData[]) => {
    setEmployeesToImport(employees);
    setCurrentStep('preview');
  };

  const getEmployeesToImport = () => {
    console.log('Column mapping:', columnMapping);
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

      Object.entries(columnMapping).forEach(([field, columnIndex]) => {
        if (columnIndex && row[parseInt(columnIndex)]) {
          const value = row[parseInt(columnIndex)].trim();
          if (field in employee) {
            (employee as any)[field] = value;
          }
        }
      });

      console.log(`Employee ${index + 1}:`, employee);
      return employee;
    }).filter(emp => emp.firstName && emp.lastName && emp.email);

    console.log('Processed employees:', employees);
    return employees;
  };

  const handleMappingComplete = (mapping: Record<string, string>) => {
    console.log('Mapping complete:', mapping);
    setColumnMapping(mapping);
    const employees = getEmployeesToImport();
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
    
    try {
      // Get the current user's organization ID
      const { data: orgId } = await supabase.rpc('get_user_organization_id');
      
      for (const employee of employeesToImport) {
        const { error } = await supabase
          .from('profiles')
          .insert({
            first_name: employee.firstName,
            last_name: employee.lastName,
            email: employee.email,
            job_title: employee.jobTitle || null,
            status: 'active',
            organization_id: orgId
          });
        
        if (error) {
          console.error('Error importing employee:', error);
          throw error;
        }
      }

      toast({
        title: "Import successful",
        description: `Successfully imported ${employeesToImport.length} employees.`,
      });

      setCurrentStep('upload');
      setCsvData([]);
      setHeaders([]);
      setColumnMapping({});
      setEmployeesToImport([]);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: "There was an error importing the employees. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
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

  return (
    <DashboardLayout
      pageWidth="wide"
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Employees", href: "/admin/employees" },
        { label: "Import Employees" }
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title="Import Employees"
          description="Upload employee data from CSV files or add them manually"
        >
          {currentStep !== 'upload' && (
            <Button
              variant="outline"
              onClick={() => {
                if (currentStep === 'mapping') setCurrentStep('upload');
                if (currentStep === 'preview') setCurrentStep('mapping');
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

        {currentStep === 'upload' && (
          <div className="grid gap-6 md:grid-cols-3">
            <FileUploadCard 
              uploadMethod={null}
              onUpload={(file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const text = e.target?.result as string;
                  const lines = text.split('\n');
                  const data = lines.map(line => line.split(','));
                  handleCsvUpload(data);
                };
                reader.readAsText(file);
              }}
              onMethodChange={() => {}}
            />
            <PasteDataCard 
              uploadMethod={null}
              csvData=""
              onDataChange={() => {}}
              onMethodChange={() => {}}
              onParse={handlePasteData}
            />
            <AddManuallyCard 
              uploadMethod={null}
              onMethodChange={() => {}}
              manualEmployees={[]}
            />
          </div>
        )}

        {currentStep === 'mapping' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Map Columns
              </CardTitle>
              <CardDescription>
                Match your CSV columns to the required employee fields
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmployeeColumnMapping
                data={{
                  uploadMethod: 'upload',
                  csvData: {
                    rawData: '',
                    headers,
                    rows: csvData,
                    columnMapping
                  },
                  uploadedFile: null,
                  manualEmployees: []
                }}
                onDataChange={() => {}}
                onNext={() => {}}
                onBack={() => setCurrentStep('upload')}
              />
            </CardContent>
          </Card>
        )}

        {currentStep === 'preview' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Preview & Import
                </CardTitle>
                <CardDescription>
                  Review the employee data before importing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <EmployeePreviewTable employees={employeesToImport} />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep('mapping')}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Mapping
                    </Button>
                    <Button
                      onClick={handleConfirmImport}
                      disabled={isImporting || employeesToImport.length === 0}
                    >
                      {isImporting ? (
                        <>
                          <Upload className="mr-2 h-4 w-4 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Import {employeesToImport.length} Employees
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EmployeeImportPage;
