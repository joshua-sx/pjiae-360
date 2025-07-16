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
import { EmployeePreviewTable } from "./EmployeePreviewTable";
import { EmployeeColumnMapping } from "./import/EmployeeColumnMapping";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EmployeeImportData, EmployeeData, ImportPhase } from "./import/types";

export default function EmployeeImportPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentPhase, setCurrentPhase] = useState<ImportPhase>('upload');
  const [importData, setImportData] = useState<EmployeeImportData>({
    uploadMethod: null,
    csvData: {
      rawData: "",
      headers: [],
      rows: [],
      columnMapping: {}
    },
    uploadedFile: null,
    manualEmployees: []
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isImporting, setIsImporting] = useState(false);

  const updateImportData = (updates: Partial<EmployeeImportData>) => {
    setImportData(prev => ({ ...prev, ...updates }));
  };

  const parseCsvData = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return { headers: [], rows: [] };
    
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => line.split(',').map(cell => cell.trim()));
    
    return { headers, rows };
  };

  const handleCsvUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCsvData(text);
      updateImportData({
        uploadMethod: 'upload',
        csvData: {
          rawData: text,
          headers: parsed.headers,
          rows: parsed.rows,
          columnMapping: {}
        },
        uploadedFile: { name: file.name, size: file.size }
      });
      
      // Move to mapping phase if we have CSV data
      if (parsed.headers.length > 0) {
        setCurrentPhase('mapping');
      }
    };
    reader.readAsText(file);
  };

  const handlePasteData = (csvText: string) => {
    if (!csvText.trim()) return;
    const parsed = parseCsvData(csvText);
    updateImportData({
      uploadMethod: 'paste',
      csvData: {
        rawData: csvText,
        headers: parsed.headers,
        rows: parsed.rows,
        columnMapping: {}
      }
    });
    
    // Move to mapping phase if we have CSV data
    if (parsed.headers.length > 0) {
      setCurrentPhase('mapping');
    }
  };

  const handleManualAdd = () => {
    setIsModalOpen(true);
    updateImportData({ uploadMethod: 'manual' });
  };

  const handleManualSave = (employees: EmployeeData[]) => {
    updateImportData({
      manualEmployees: [...importData.manualEmployees, ...employees]
    });
    setIsModalOpen(false);
    setCurrentPhase('preview'); // Skip mapping for manual entry
  };

  const handleReset = () => {
    setImportData({
      uploadMethod: null,
      csvData: {
        rawData: "",
        headers: [],
        rows: [],
        columnMapping: {}
      },
      uploadedFile: null,
      manualEmployees: []
    });
    setCurrentPhase('upload');
  };

  const processEmployeeData = (data: EmployeeData[]) => {
    return data.map(emp => ({
      first_name: emp.firstName || '',
      last_name: emp.lastName || '',
      email: emp.email?.toLowerCase() || '',
      job_title: emp.jobTitle || '',
      // Store department and division as text for now
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

  const getEmployeesToImport = (): EmployeeData[] => {
    if (importData.uploadMethod === 'manual') {
      return importData.manualEmployees;
    } else if (importData.uploadMethod === 'upload' || importData.uploadMethod === 'paste') {
      // Convert parsed CSV data to employee objects using column mapping
      const { headers, rows, columnMapping } = importData.csvData;
      
      const result = rows.map(row => {
        const employee: any = {
          employeeId: '',
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          jobTitle: '',
          department: '',
          division: ''
        };
        
        Object.entries(columnMapping).forEach(([csvColumn, fieldKey]) => {
          const columnIndex = headers.indexOf(csvColumn);
          if (columnIndex !== -1 && columnIndex < row.length) {
            employee[fieldKey] = row[columnIndex]?.trim() || '';
          }
        });
        
        return employee as EmployeeData;
      }).filter(emp => emp.firstName && emp.lastName && emp.email);

      console.log('Processed employees from CSV:', result);
      return result;
    }
    return [];
  };

  const handleImport = async () => {
    setIsImporting(true);
    
    try {
      const employeesToImport = getEmployeesToImport();

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
    (importData.uploadMethod === 'manual' && importData.manualEmployees.length > 0) ||
    ((importData.uploadMethod === 'upload' || importData.uploadMethod === 'paste') && 
     importData.csvData.rows.length > 0 && 
     Object.keys(importData.csvData.columnMapping).length > 0);

  const breadcrumbs = [
    { label: "Employees", href: "/admin/employees" },
    { label: "Import" }
  ];

  // Render different phases
  if (currentPhase === 'mapping') {
    return (
      <DashboardLayout breadcrumbs={breadcrumbs}>
        <EmployeeColumnMapping
          data={importData}
          onDataChange={updateImportData}
          onNext={() => setCurrentPhase('preview')}
          onBack={() => setCurrentPhase('upload')}
        />
      </DashboardLayout>
    );
  }

  if (currentPhase === 'preview') {
    const employeesToPreview = getEmployeesToImport();
    
    return (
      <DashboardLayout breadcrumbs={breadcrumbs}>
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPhase(importData.uploadMethod === 'manual' ? 'upload' : 'mapping')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Import Preview</h1>
              <p className="text-muted-foreground">
                Review the employee data before importing
              </p>
            </div>
          </div>

          {/* Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Employee Preview
              </CardTitle>
              <CardDescription>
                {employeesToPreview.length === 1 
                  ? "1 employee ready to import"
                  : `${employeesToPreview.length} employees ready to import`
                }
              </CardDescription>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={handleReset}>
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
              <EmployeePreviewTable employees={employeesToPreview} />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Upload phase (default)
  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="max-w-4xl mx-auto space-y-6">
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
            uploadMethod={importData.uploadMethod}
            onUpload={handleCsvUpload}
            onMethodChange={() => updateImportData({ uploadMethod: 'upload' })}
            uploadedFile={importData.uploadedFile}
            onChangeFile={handleReset}
            isCompleted={importData.uploadMethod === 'upload' && !!importData.uploadedFile}
          />
          
          <PasteDataCard
            uploadMethod={importData.uploadMethod}
            csvData={importData.csvData.rawData}
            onDataChange={(data) => updateImportData({ csvData: { ...importData.csvData, rawData: data } })}
            onMethodChange={() => updateImportData({ uploadMethod: 'paste' })}
            onParse={handlePasteData}
          />
          
          <AddManuallyCard
            uploadMethod={importData.uploadMethod}
            onMethodChange={handleManualAdd}
            manualEmployees={importData.manualEmployees}
          />
        </div>

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