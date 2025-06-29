
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, AlertCircle, CheckCircle, Users } from "lucide-react";
import { OnboardingData } from "./OnboardingFlow";

interface PreviewConfirmProps {
  data: OnboardingData;
  onDataChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const PreviewConfirm = ({ data, onDataChange, onNext, onBack }: PreviewConfirmProps) => {
  const [previewData, setPreviewData] = useState<Array<{
    id: string;
    name: string;
    email: string;
    department?: string;
    role: string;
    errors: string[];
  }>>([]);

  useEffect(() => {
    // Process CSV data with mapping
    const processedData = data.csvData.rows.map((row, index) => {
      const employee: any = {
        id: `emp_${Date.now()}_${index}`,
        role: 'Employee',
        errors: []
      };

      // Apply column mappings
      Object.entries(data.csvData.columnMapping).forEach(([csvColumn, fieldKey]) => {
        const columnIndex = data.csvData.headers.indexOf(csvColumn);
        if (columnIndex !== -1) {
          employee[fieldKey] = row[columnIndex]?.trim() || '';
        }
      });

      // Validate required fields
      if (!employee.name) {
        employee.errors.push('Missing name');
      }
      if (!employee.email || !employee.email.includes('@')) {
        employee.errors.push('Invalid email');
      }

      return employee;
    });

    setPreviewData(processedData);
  }, [data.csvData]);

  const validEntries = previewData.filter(entry => entry.errors.length === 0);
  const invalidEntries = previewData.filter(entry => entry.errors.length > 0);

  const handleImport = () => {
    const importStats = {
      total: previewData.length,
      successful: validEntries.length,
      errors: invalidEntries.length
    };

    onDataChange({
      people: validEntries,
      importStats
    });
    onNext();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Eye className="w-6 h-6 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Preview & Confirm
          </h1>
          <p className="text-slate-600">
            Review your data before importing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{previewData.length}</p>
              <p className="text-sm text-slate-600">Total entries</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{validEntries.length}</p>
              <p className="text-sm text-slate-600">Valid entries</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">{invalidEntries.length}</p>
              <p className="text-sm text-slate-600">Entries with errors</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Data Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((entry) => (
                    <TableRow key={entry.id} className={entry.errors.length > 0 ? 'bg-red-50' : ''}>
                      <TableCell className="font-medium">{entry.name || '-'}</TableCell>
                      <TableCell>{entry.email || '-'}</TableCell>
                      <TableCell>{entry.department || '-'}</TableCell>
                      <TableCell>
                        {entry.errors.length > 0 ? (
                          <div className="space-y-1">
                            {entry.errors.map((error, index) => (
                              <Badge key={index} variant="destructive" className="text-xs">
                                {error}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Valid
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {invalidEntries.length > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <p className="font-medium text-orange-800">
                  {invalidEntries.length} entries have errors and will be skipped
                </p>
              </div>
              <p className="text-sm text-orange-700">
                Only valid entries will be imported. You can add the skipped entries manually later.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          <Button onClick={onBack} variant="outline" className="flex-1">
            Back to Mapping
          </Button>
          <Button 
            onClick={handleImport} 
            className="flex-1"
            disabled={validEntries.length === 0}
          >
            Import {validEntries.length} People →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PreviewConfirm;
