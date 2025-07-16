import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, UserPlus } from "lucide-react";
import { FileUploadCard } from "./import/FileUploadCard";
import { PasteDataCard } from "./import/PasteDataCard";
import { AddManuallyCard } from "./import/AddManuallyCard";
import { ManualAddEmployeeModal } from "./import/ManualAddEmployeeModal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmployeeData {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  division: string;
}

export default function EmployeeImportPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [uploadMethod, setUploadMethod] = useState<'upload' | 'paste' | 'manual' | null>(null);
  const [csvData, setCsvData] = useState("");
  const [parsedData, setParsedData] = useState<{ headers: string[]; rows: string[][] }>({ headers: [], rows: [] });
  const [manualEmployees, setManualEmployees] = useState<EmployeeData[]>([]);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const parseCsvData = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return { headers: [], rows: [] };
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows = lines.slice(1).map(line => line.split(',').map(cell => cell.trim()));
    
    return { headers, rows };
  };

  const handleCsvUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCsvData(text);
      setParsedData(parsed);
      setUploadedFile({ name: file.name, size: file.size });
      setUploadMethod('upload');
    };
    reader.readAsText(file);
  };

  const handlePasteData = () => {
    if (!csvData.trim()) return;
    const parsed = parseCsvData(csvData);
    setParsedData(parsed);
    setUploadMethod('paste');
  };

  const handleManualAdd = () => {
    setIsModalOpen(true);
    setUploadMethod('manual');
  };

  const handleManualSave = (employees: EmployeeData[]) => {
    setManualEmployees(prev => [...prev, ...employees]);
    setIsModalOpen(false);
  };

  const handleChangeFile = () => {
    setUploadedFile(null);
    setCsvData("");
    setParsedData({ headers: [], rows: [] });
    setUploadMethod(null);
  };

  const processEmployeeData = (data: EmployeeData[]) => {
    return data.map(emp => ({
      first_name: emp.firstName,
      last_name: emp.lastName,
      email: emp.email.toLowerCase(),
      job_title: emp.jobTitle,
      department: emp.department,
      division: emp.division,
      status: 'invited' as const,
      invitation_token: crypto.randomUUID()
    }));
  };

  const createEmployeesInDatabase = async (employees: EmployeeData[]) => {
    try {
      // Get current user's organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile) throw new Error('Organization not found');

      const processedEmployees = processEmployeeData(employees);
      
      // Add organization_id to each employee
      const employeesToInsert = processedEmployees.map(emp => ({
        ...emp,
        organization_id: profile.organization_id
      }));

      const { error } = await supabase
        .from('profiles')
        .insert(employeesToInsert);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error creating employees:', error);
      return { success: false, error };
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    
    try {
      let employeesToImport: EmployeeData[] = [];

      if (uploadMethod === 'manual') {
        employeesToImport = manualEmployees;
      } else if (uploadMethod === 'upload' || uploadMethod === 'paste') {
        // Convert parsed CSV data to employee objects
        const { headers, rows } = parsedData;
        
        employeesToImport = rows.map(row => {
          const employee: any = {};
          headers.forEach((header, index) => {
            const value = row[index] || '';
            switch (header) {
              case 'first name':
              case 'firstname':
                employee.firstName = value;
                break;
              case 'last name':
              case 'lastname':
                employee.lastName = value;
                break;
              case 'email':
                employee.email = value;
                break;
              case 'job title':
              case 'jobtitle':
              case 'position':
                employee.jobTitle = value;
                break;
              case 'department':
                employee.department = value;
                break;
              case 'division':
                employee.division = value;
                break;
            }
          });
          return employee as EmployeeData;
        }).filter(emp => emp.firstName && emp.lastName && emp.email);
      }

      if (employeesToImport.length === 0) {
        toast({
          title: "No employees to import",
          description: "Please add employees or check your data format.",
          variant: "destructive"
        });
        return;
      }

      const result = await createEmployeesInDatabase(employeesToImport);
      
      if (result.success) {
        toast({
          title: "Import successful",
          description: `Successfully imported ${employeesToImport.length} employee(s).`
        });
        navigate('/admin/employees');
      } else {
        toast({
          title: "Import failed",
          description: "Failed to import employees. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Import failed",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const canImport = 
    (uploadMethod === 'manual' && manualEmployees.length > 0) ||
    (uploadMethod === 'upload' && parsedData.rows.length > 0) ||
    (uploadMethod === 'paste' && parsedData.rows.length > 0);

  const breadcrumbs = [
    { label: "Employees", href: "/admin/employees" },
    { label: "Import" }
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/employees')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Employees
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Import Employees</h1>
            <p className="text-muted-foreground">
              Add new employees to your organization via CSV upload or manual entry
            </p>
          </div>
        </div>

        {/* Import Options */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <FileUploadCard
            uploadMethod={uploadMethod}
            onUpload={handleCsvUpload}
            onMethodChange={() => setUploadMethod('upload')}
            uploadedFile={uploadedFile}
            onChangeFile={handleChangeFile}
            isCompleted={uploadMethod === 'upload' && !!uploadedFile}
          />
          
          <PasteDataCard
            uploadMethod={uploadMethod}
            csvData={csvData}
            onDataChange={setCsvData}
            onMethodChange={() => setUploadMethod('paste')}
            onParse={handlePasteData}
          />
          
          <AddManuallyCard
            uploadMethod={uploadMethod}
            onMethodChange={handleManualAdd}
            manualEmployees={manualEmployees}
          />
        </div>

        {/* Data Preview */}
        {(parsedData.rows.length > 0 || manualEmployees.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Import Preview
              </CardTitle>
              <CardDescription>
                Review the data before importing
              </CardDescription>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={handleChangeFile}>
                  Reset
                </Button>
                <Button 
                  onClick={handleImport} 
                  disabled={!canImport || isImporting}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isImporting ? 'Importing...' : 'Import Employees'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-4">
                {uploadMethod === 'manual' 
                  ? `${manualEmployees.length} employee(s) ready to import`
                  : `${parsedData.rows.length} employee(s) found in data`
                }
              </div>
              
              {/* Scrollable Employee List */}
              <div className="border rounded-lg h-96 overflow-y-auto bg-muted/30">
                <div className="grid grid-cols-4 gap-4 p-3 border-b bg-muted/50 sticky top-0 font-medium text-sm">
                  <span>Name</span>
                  <span>Email</span>
                  <span>Job Title</span>
                  <span>Department</span>
                </div>
                <div className="divide-y">
                  {uploadMethod === 'manual' ? (
                    manualEmployees.map((employee, index) => (
                      <div key={index} className="grid grid-cols-4 gap-4 p-3 text-sm hover:bg-muted/50">
                        <span className="font-medium">{employee.firstName} {employee.lastName}</span>
                        <span className="text-muted-foreground">{employee.email}</span>
                        <span>{employee.jobTitle || 'N/A'}</span>
                        <span>{employee.department || 'N/A'}</span>
                      </div>
                    ))
                  ) : (
                    parsedData.rows.map((row, index) => {
                      const employee: any = {};
                      parsedData.headers.forEach((header, headerIndex) => {
                        const value = row[headerIndex] || '';
                        switch (header) {
                          case 'first name':
                          case 'firstname':
                            employee.firstName = value;
                            break;
                          case 'last name':
                          case 'lastname':
                            employee.lastName = value;
                            break;
                          case 'email':
                            employee.email = value;
                            break;
                          case 'job title':
                          case 'jobtitle':
                          case 'position':
                            employee.jobTitle = value;
                            break;
                          case 'department':
                            employee.department = value;
                            break;
                        }
                      });
                      
                      return (
                        <div key={index} className="grid grid-cols-4 gap-4 p-3 text-sm hover:bg-muted/50">
                          <span className="font-medium">{employee.firstName} {employee.lastName}</span>
                          <span className="text-muted-foreground">{employee.email}</span>
                          <span>{employee.jobTitle || 'N/A'}</span>
                          <span>{employee.department || 'N/A'}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manual Add Modal */}
        <ManualAddEmployeeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleManualSave}
        />
      </div>
    </DashboardLayout>
  );
}