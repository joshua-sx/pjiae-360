
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PreviewEntry {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  division: string;
  employeeId?: number;
  role: string;
  errors: string[];
}

interface DataPreviewTableProps {
  previewData: PreviewEntry[];
}

export default function DataPreviewTable({ previewData }: DataPreviewTableProps) {
  return (
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
                <TableHead className="font-semibold">Job Title</TableHead>
                <TableHead className="font-semibold">Department</TableHead>
                <TableHead className="font-semibold">Division</TableHead>
                <TableHead className="font-semibold">Employee ID</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewData.map((entry) => (
                <TableRow key={entry.id} className={entry.errors.length > 0 ? 'bg-red-50' : 'bg-white'}>
                  <TableCell className="font-medium">{`${entry.firstName || ''} ${entry.lastName || ''}`.trim() || '-'}</TableCell>
                  <TableCell>{entry.email || '-'}</TableCell>
                  <TableCell>{entry.jobTitle || '-'}</TableCell>
                  <TableCell>{entry.department || '-'}</TableCell>
                  <TableCell>{entry.division || '-'}</TableCell>
                  <TableCell>{entry.employeeId || '-'}</TableCell>
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
  );
}
