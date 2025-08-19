import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { 
  FileUp, 
  RefreshCw, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Eye,
  Users,
  UserCheck,
  UserX
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface ImportBatch {
  id: string;
  total_records: number;
  successful_records: number;
  failed_records: number;
  status: string;
  uploaded_at: string;
  started_at?: string;
  completed_at?: string;
  detailed_status?: any;
  file_path?: string;
  correlation_id?: string;
}

interface ImportError {
  id: string;
  row_number: number;
  field_name?: string;
  field_value?: string;
  error_message: string;
  error_code: string;
  email?: string;
}

interface ImportMapping {
  id: string;
  csv_column: string;
  field_name: string;
}

const ImportsPage = () => {
  const [selectedBatch, setSelectedBatch] = useState<ImportBatch | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch import batches
  const { data: batches, isLoading, refetch } = useQuery({
    queryKey: ["admin-import-batches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('import_batches')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      return data as ImportBatch[];
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch errors for selected batch
  const { data: errors } = useQuery({
    queryKey: ["import-errors", selectedBatch?.id],
    queryFn: async () => {
      if (!selectedBatch?.id) return [];
      
      const { data, error } = await supabase
        .from('import_errors')
        .select('*')
        .eq('batch_id', selectedBatch.id)
        .order('row_number', { ascending: true });

      if (error) throw error;
      return data as ImportError[];
    },
    enabled: !!selectedBatch?.id
  });

  // Fetch mappings for selected batch
  const { data: mappings } = useQuery({
    queryKey: ["import-mappings", selectedBatch?.id],
    queryFn: async () => {
      if (!selectedBatch?.id) return [];
      
      const { data, error } = await supabase
        .from('import_mappings')
        .select('*')
        .eq('batch_id', selectedBatch.id)
        .order('csv_column', { ascending: true });

      if (error) throw error;
      return data as ImportMapping[];
    },
    enabled: !!selectedBatch?.id
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      case 'processing':
        return <Badge variant="secondary" className="animate-pulse">Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getProgressPercentage = (batch: ImportBatch) => {
    if (batch.status === 'completed') return 100;
    if (batch.status === 'failed' || batch.status === 'processing') {
      if (batch.total_records === 0) return 0;
      return Math.round(((batch.successful_records + batch.failed_records) / batch.total_records) * 100);
    }
    return 0;
  };

  const formatDuration = (startAt?: string, endAt?: string) => {
    if (!startAt) return 'Not started';
    if (!endAt) return 'In progress...';
    
    const start = new Date(startAt);
    const end = new Date(endAt);
    const durationMs = end.getTime() - start.getTime();
    const seconds = Math.round(durationMs / 1000);
    
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const downloadCsvFile = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('employee-imports')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() || 'import.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Import History"
          description="View and manage employee import operations"
        />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedBatches = batches?.filter(b => b.status === 'completed') || [];
  const processingBatches = batches?.filter(b => b.status === 'processing') || [];
  const failedBatches = batches?.filter(b => b.status === 'failed') || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Import History"
        description="Monitor employee import operations and view detailed results"
      >
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Imports</p>
                <p className="text-2xl font-bold">{batches?.length || 0}</p>
              </div>
              <FileUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedBatches.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold">{processingBatches.length}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold">{failedBatches.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import Batches Table */}
      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
          <CardDescription>
            View detailed information about all employee import operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!batches || batches.length === 0 ? (
            <div className="text-center py-8">
              <FileUp className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No imports found</h3>
              <p className="text-muted-foreground">No employee imports have been performed yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((batch) => {
                  const progressPercentage = getProgressPercentage(batch);
                  const successRate = batch.total_records > 0 
                    ? Math.round((batch.successful_records / batch.total_records) * 100)
                    : 0;

                  return (
                    <TableRow key={batch.id}>
                      <TableCell>
                        <div className="space-y-2">
                          {getStatusBadge(batch.status)}
                          {batch.status === 'processing' && (
                            <Progress value={progressPercentage} className="w-20" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{batch.total_records} total</div>
                          <div className="text-sm text-muted-foreground">
                            <span className="text-success">{batch.successful_records} ✓</span>
                            {batch.failed_records > 0 && (
                              <span className="ml-2 text-destructive">{batch.failed_records} ✗</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{successRate}%</div>
                          {batch.status === 'completed' && batch.failed_records > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {batch.failed_records} errors
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDuration(batch.started_at, batch.completed_at)}
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(batch.uploaded_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog 
                            open={showDetails && selectedBatch?.id === batch.id}
                            onOpenChange={(open) => {
                              if (!open) {
                                setShowDetails(false);
                                setSelectedBatch(null);
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedBatch(batch);
                                  setShowDetails(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                                Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Import Details</DialogTitle>
                                <DialogDescription>
                                  Detailed information for import batch {batch.id.slice(0, 8)}...
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-6">
                                {/* Summary */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="text-center p-4 border rounded">
                                    <Users className="h-8 w-8 mx-auto text-primary" />
                                    <div className="mt-2 font-semibold">{batch.total_records}</div>
                                    <div className="text-sm text-muted-foreground">Total Records</div>
                                  </div>
                                  <div className="text-center p-4 border rounded">
                                    <UserCheck className="h-8 w-8 mx-auto text-success" />
                                    <div className="mt-2 font-semibold">{batch.successful_records}</div>
                                    <div className="text-sm text-muted-foreground">Successful</div>
                                  </div>
                                  <div className="text-center p-4 border rounded">
                                    <UserX className="h-8 w-8 mx-auto text-destructive" />
                                    <div className="mt-2 font-semibold">{batch.failed_records}</div>
                                    <div className="text-sm text-muted-foreground">Failed</div>
                                  </div>
                                  <div className="text-center p-4 border rounded">
                                    <CheckCircle className="h-8 w-8 mx-auto text-info" />
                                    <div className="mt-2 font-semibold">{successRate}%</div>
                                    <div className="text-sm text-muted-foreground">Success Rate</div>
                                  </div>
                                </div>

                                {/* Column Mappings */}
                                {mappings && mappings.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold mb-3">Column Mappings</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {mappings.map((mapping) => (
                                        <div key={mapping.id} className="flex justify-between p-2 bg-muted rounded">
                                          <span className="font-mono text-sm">{mapping.csv_column}</span>
                                          <span className="text-sm">→ {mapping.field_name}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Errors */}
                                {errors && errors.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold mb-3">Import Errors ({errors.length})</h4>
                                    <div className="max-h-60 overflow-y-auto border rounded">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Row</TableHead>
                                            <TableHead>Field</TableHead>
                                            <TableHead>Value</TableHead>
                                            <TableHead>Error</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {errors.map((error) => (
                                            <TableRow key={error.id}>
                                              <TableCell>{error.row_number}</TableCell>
                                              <TableCell>{error.field_name || '-'}</TableCell>
                                              <TableCell className="max-w-32 truncate">
                                                {error.field_value || '-'}
                                              </TableCell>
                                              <TableCell className="text-destructive">
                                                {error.error_message}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          {batch.file_path && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadCsvFile(batch.file_path!)}
                            >
                              <Download className="h-4 w-4" />
                              CSV
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportsPage;