import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Users, FileText, CheckCircle, ArrowLeft, AlertTriangle, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useEmployeeImport } from "@/hooks/admin/useEmployeeImport";
import { UploadSection } from "./import/UploadSection";
import { MappingSection } from "./import/MappingSection";
import { ReviewSection } from "./import/ReviewSection";
import AdminRoleAssignment from "./import/AdminRoleAssignment";

const EmployeeImportPage = () => {
  const {
    currentStep,
    setCurrentStep,
    uploadMethod,
    setUploadMethod,
    csvData,
    headers,
    columnMapping,
    employeesToImport,
    manualEmployees,
    isImporting,
    importResult,
    uploadedFile,
    csvText,
    setCsvText,
    handleFileUpload,
    handlePasteData,
    handleManualAdd,
    handleMappingComplete,
    handlePreviewNext,
    handleRoleAssignmentComplete,
    handleChangeFile,
    resetImportState,
  } = useEmployeeImport();

  const stats = [
    {
      title: "Ready to Import",
      value: employeesToImport.length.toString(),
      description: "Employees processed",
      icon: Users,
    },
    {
      title: "Current Step",
      value:
        currentStep === "upload"
          ? "1"
          : currentStep === "mapping"
          ? "2"
          : currentStep === "preview"
          ? "3"
          : "4",
      description: "of 4 steps",
      icon: FileText,
    },
  ];

  if (importResult && (importResult.imported > 0 || importResult.failed > 0)) {
    return (
      <div className="space-y-6 overflow-x-hidden">
        <PageHeader title="Import Results" description="Review the results of your employee import">
          <Button onClick={resetImportState}>Import More Employees</Button>
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
        {currentStep !== "upload" && !isImporting && currentStep !== "importing" && (
          <Button
            variant="outline"
            onClick={() => {
              if (currentStep === "mapping") setCurrentStep("upload");
              if (currentStep === "preview") {
                if (uploadMethod === "manual") {
                  setCurrentStep("upload");
                } else {
                  setCurrentStep("mapping");
                }
              }
              if (currentStep === "role-assignment") setCurrentStep("preview");
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

      {(isImporting || currentStep === "importing") && (
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

      {!isImporting && currentStep === "upload" && (
        <UploadSection
          uploadMethod={uploadMethod}
          setUploadMethod={(m) => setUploadMethod(m)}
          uploadedFile={uploadedFile}
          manualEmployees={manualEmployees}
          csvText={csvText}
          setCsvText={setCsvText}
          onFileUpload={handleFileUpload}
          onPasteData={handlePasteData}
          onManualAdd={handleManualAdd}
          onChangeFile={handleChangeFile}
        />
      )}

      {!isImporting && currentStep === "mapping" && (
      <MappingSection
        uploadMethod={uploadMethod || 'upload'}
        headers={headers}
        rows={csvData}
        columnMapping={columnMapping}
        uploadedFile={uploadedFile}
        onComplete={handleMappingComplete}
        onBack={() => setCurrentStep('upload')}
      />
      )}

      {!isImporting && currentStep === "preview" && (
        <ReviewSection
          employees={employeesToImport}
          columnMapping={columnMapping}
          onBack={() => {
            if (uploadMethod === "manual") {
              setCurrentStep("upload");
            } else {
              setCurrentStep("mapping");
            }
          }}
          onNext={handlePreviewNext}
        />
      )}

      {!isImporting && currentStep === "role-assignment" && (
        <AdminRoleAssignment
          employees={employeesToImport}
          onEmployeesUpdate={handleRoleAssignmentComplete}
          onNext={() => {}}
          onBack={() => setCurrentStep("preview")}
        />
      )}
    </div>
  );
};

export default EmployeeImportPage;

