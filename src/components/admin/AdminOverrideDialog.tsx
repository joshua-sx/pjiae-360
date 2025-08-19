import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, AlertTriangle, Lock } from 'lucide-react';
import { sanitizeTextArea } from '@/lib/sanitization';
import { adminOverrideSchema, validateForm } from '@/lib/validation';
import { usePermissions } from '@/features/access-control/hooks/usePermissions';

interface AdminOverrideDialogProps {
  recordType: 'appraisal' | 'goal';
  recordId: string;
  currentStatus: string;
  children: React.ReactNode;
}

const AdminOverrideDialog = ({ recordType, recordId, currentStatus, children }: AdminOverrideDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [justification, setJustification] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin, loading: permissionsLoading } = usePermissions();

  const statusOptions = recordType === 'appraisal' 
    ? [
        { value: 'draft', label: 'Draft' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'under_review', label: 'Under Review' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
      ]
    : [
        { value: 'draft', label: 'Draft' },
        { value: 'assigned', label: 'Assigned' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
      ];

  const handleOverride = async () => {
    // Critical security check: Verify admin permissions
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You must have administrator privileges to perform overrides",
        variant: "destructive"
      });
      return;
    }

    // Sanitize inputs
    const sanitizedJustification = sanitizeTextArea(justification);
    
    // Validate form data
    const validation = validateForm(adminOverrideSchema, {
      recordType,
      recordId,
      newStatus,
      justification: sanitizedJustification
    });

    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: Object.values(validation.errors || {})[0] || "Please check your inputs",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const tableName = recordType === 'appraisal' ? 'appraisals' : 'goals';
      
      // Update the record status with sanitized data
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ 
          status: validation.data!.newStatus,
          admin_override_reason: validation.data!.justification,
          admin_override_at: new Date().toISOString()
        })
        .eq('id', recordId);

      if (updateError) throw updateError;

      // Note: Audit logging is handled automatically by database triggers

      toast({
        title: "Override Applied",
        description: `${recordType} status updated successfully`
      });

      // Refresh relevant queries
      queryClient.invalidateQueries({ queryKey: [recordType === 'appraisal' ? 'appraisals' : 'goals'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });

      setIsOpen(false);
      setNewStatus('');
      setJustification('');
    } catch (error) {
      console.error('Override error:', error);
      toast({
        title: "Error",
        description: "Failed to apply admin override",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If user doesn't have admin permissions, show access denied state
  if (!permissionsLoading && !isAdmin) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-destructive" />
              Access Denied
            </DialogTitle>
            <DialogDescription>
              Administrator privileges are required to perform record overrides.
            </DialogDescription>
          </DialogHeader>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You do not have sufficient permissions to access this functionality. 
              Please contact your administrator if you believe this is an error.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-600" />
            Admin Override
          </DialogTitle>
          <DialogDescription>
            Override the current status of this {recordType}. This action will be logged in the audit trail.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This is an administrative override that bypasses normal workflow rules. 
            Use with caution and provide detailed justification.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label>Current Status</Label>
            <div className="mt-1">
              <Badge variant="secondary" className="capitalize">
                {currentStatus.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          <div>
            <Label htmlFor="new-status">New Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="justification">Justification *</Label>
            <Textarea
              id="justification"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Provide detailed justification for this override..."
              className="min-h-20"
              sanitize
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleOverride}
              disabled={isLoading || !newStatus || !justification.trim() || !isAdmin}
              variant="destructive"
            >
              {isLoading ? 'Applying...' : 'Apply Override'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminOverrideDialog;