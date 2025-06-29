
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, AlertCircle, CheckCircle, Users } from "lucide-react";
import { OnboardingData } from "./OnboardingTypes";

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
    const processedData = data.csvData.rows.map((row, index) => {
      const employee: any = {
        id: `emp_${Date.now()}_${index}`,
        role: 'Employee',
        errors: []
      };

      Object.entries(data.csvData.columnMapping).forEach(([csvColumn, fieldKey]) => {
        const columnIndex = data.csvData.headers.indexOf(csvColumn);
        if (columnIndex !== -1 && columnIndex < row.length) {
          const cellValue = row[columnIndex];
          if (typeof cellValue === 'string') {
            employee[fieldKey] = cellValue.trim() || '';
          }
        }
      });

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Preview & Confirm
            </h1>
            <p className="text-lg text-slate-600">
              Review your data before importing
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-slate-200">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-900">{previewData.length}</p>
                <p className="text-sm text-slate-600">Total entries</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-700">{validEntries.length}</p>
                <p className="text-sm text-green-600">Valid entries</p>
              </CardContent>
            </Card>
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-700">{invalidEntries.length}</p>
                <p className="text-sm text-red-600">Entries with errors</p>
              </CardContent>
            </Card>
          </div>

          {/* Data Preview Table */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Data Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold">Department</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((entry) => (
                      <TableRow key={entry.id} className={entry.errors.length > 0 ? 'bg-red-50' : 'bg-white'}>
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
                            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
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

          {/* Error Warning */}
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
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="border-t bg-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex gap-4">
          <Button onClick={onBack} variant="outline" className="flex-1">
            ← Back to Mapping
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
