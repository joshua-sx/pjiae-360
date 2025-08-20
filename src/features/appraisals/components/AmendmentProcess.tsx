import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  FileEdit, 
  History, 
  Lock, 
  Unlock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AppraisalData, Employee } from '../types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface AmendmentProcessProps {
  appraisalData: AppraisalData;
  employee: Employee;
  onAmendmentCreated: (newAppraisalId: string) => void;
  canInitiateAmendment: boolean;
}

interface AmendmentHistory {
  id: string;
  version: number;
  amendmentReason: string;
  createdAt: string;
  status: string;
}

export function AmendmentProcess({ 
  appraisalData, 
  employee, 
  onAmendmentCreated,
  canInitiateAmendment 
}: AmendmentProcessProps) {
  const [showAmendmentDialog, setShowAmendmentDialog] = useState(false);
  const [amendmentReason, setAmendmentReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amendmentHistory, setAmendmentHistory] = useState<AmendmentHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();

  const loadAmendmentHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('appraisals')
        .select('id, version, amendment_reason, created_at, status')
        .or(`id.eq.${appraisalData.employeeId},parent_appraisal_id.eq.${appraisalData.employeeId}`)
        .order('version', { ascending: false });

      if (error) throw error;

      const formattedHistory: AmendmentHistory[] = (data || []).map(item => ({
        id: item.id,
        version: item.version,
        amendmentReason: item.amendment_reason || '',
        createdAt: item.created_at,
        status: item.status
      }));

      setAmendmentHistory(formattedHistory);
      setShowHistory(true);
    } catch (error) {
      console.error('Error loading amendment history:', error);
      toast({
        title: "Error",
        description: "Failed to load amendment history.",
        variant: "destructive",
      });
    }
  };

  const handleCreateAmendment = async () => {
    if (!amendmentReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for the amendment.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // First, lock the current appraisal for amendment
      const { error: lockError } = await supabase
        .from('appraisals')
        .update({ locked_for_amendment: true })
        .eq('id', appraisalData.employeeId);

      if (lockError) throw lockError;

      // Create new amendment version
      const newVersion = (appraisalData.version || 1) + 1;
      
      const { data: newAppraisal, error: createError } = await supabase
        .from('appraisals')
        .insert({
          employee_id: employee.id,
          cycle_id: appraisalData.employeeId, // This should be the cycle_id from original
          organization_id: employee.department, // This should be organization_id
          phase: 'goal_setting',
          status: 'draft',
          version: newVersion,
          parent_appraisal_id: appraisalData.employeeId,
          amendment_reason: amendmentReason,
          locked_for_amendment: false
        })
        .select()
        .single();

      if (createError) throw createError;

      // Log the amendment in audit trail
      await supabase
        .from('audit_logs')
        .insert({
          appraisal_id: newAppraisal.id,
          action: 'amendment_created',
          details: `Amendment created: ${amendmentReason}`
        });

      toast({
        title: "Amendment Created",
        description: `New version ${newVersion} has been created for editing.`,
      });

      setShowAmendmentDialog(false);
      setAmendmentReason('');
      onAmendmentCreated(newAppraisal.id);
    } catch (error) {
      console.error('Error creating amendment:', error);
      toast({
        title: "Error",
        description: "Failed to create amendment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      case 'locked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Amendment Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileEdit className="h-5 w-5" />
            Amendment Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current Version: {appraisalData.version || 1}</p>
              {appraisalData.locked_for_amendment && (
                <div className="flex items-center gap-2 mt-1">
                  <Lock className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">Locked for Amendment</span>
                </div>
              )}
              {!appraisalData.locked_for_amendment && (
                <div className="flex items-center gap-2 mt-1">
                  <Unlock className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Available for Amendment</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadAmendmentHistory}
              >
                <History className="h-4 w-4 mr-2" />
                View History
              </Button>
              {canInitiateAmendment && !appraisalData.locked_for_amendment && (
                <Dialog open={showAmendmentDialog} onOpenChange={setShowAmendmentDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <FileEdit className="h-4 w-4 mr-2" />
                      Create Amendment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create Amendment</DialogTitle>
                      <DialogDescription>
                        Create a new version of this appraisal for editing. 
                        The current version will be locked and preserved.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Reason for Amendment</label>
                        <Textarea
                          placeholder="Please explain why this amendment is necessary..."
                          value={amendmentReason}
                          onChange={(e) => setAmendmentReason(e.target.value)}
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div className="text-sm text-amber-800">
                          <p className="font-medium">Important Notice</p>
                          <p>Creating an amendment will lock the current version and create a new editable copy. This action cannot be undone.</p>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowAmendmentDialog(false)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateAmendment}
                        disabled={isSubmitting || !amendmentReason.trim()}
                      >
                        {isSubmitting ? "Creating..." : "Create Amendment"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {appraisalData.amendment_reason && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm font-medium text-blue-800">Amendment Reason:</p>
              <p className="text-sm text-blue-700 mt-1">{appraisalData.amendment_reason}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Amendment History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Amendment History</DialogTitle>
            <DialogDescription>
              View all versions and amendments for this appraisal
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {amendmentHistory.map((amendment) => (
              <motion.div
                key={amendment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Version {amendment.version}</span>
                    <Badge className={getStatusColor(amendment.status)}>
                      {amendment.status}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(amendment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {amendment.amendmentReason && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Reason:</strong> {amendment.amendmentReason}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  {amendment.status === 'complete' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-orange-500" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {amendment.status === 'complete' ? 'Completed' : 'In Progress'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}