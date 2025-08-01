
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

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
  emailStatus?: Record<string, 'pending' | 'sent' | 'failed'>;
}

export default function DataPreviewTable({ previewData, emailStatus }: DataPreviewTableProps) {
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
                {emailStatus && <TableHead className="font-semibold">Email Status</TableHead>}
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
                  {emailStatus && (
                    <TableCell>
                      {emailStatus[entry.email] && (
                        <div className="flex items-center gap-2">
                          {emailStatus[entry.email] === 'sent' && (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                Sent
                              </Badge>
                            </>
                          )}
                          {emailStatus[entry.email] === 'failed' && (
                            <>
                              <XCircle className="h-4 w-4 text-red-600" />
                              <Badge variant="destructive" className="text-xs">
                                Failed
                              </Badge>
                            </>
                          )}
                          {emailStatus[entry.email] === 'pending' && (
                            <>
                              <Clock className="h-4 w-4 text-yellow-600" />
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                Sending...
                              </Badge>
                            </>
                          )}
                        </div>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
