import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle } from 'lucide-react';
import { useRoleAssignment } from '@/hooks/useRoleAssignment';
import { usePermissions, type AppRole } from '@/hooks/usePermissions';

interface Employee {
  id: string;
  name: string;
  email: string;
  job_title?: string;
  current_roles?: AppRole[];
}

interface RoleAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  employees?: Employee[];
  onSuccess?: () => void;
  mode?: 'single' | 'bulk';
}

const ROLE_DESCRIPTIONS = {
  admin: 'Full system access and organization management',
  director: 'Division oversight and strategic planning',
  manager: 'Team leadership and operational management',
  supervisor: 'Direct team supervision and coordination',
  employee: 'Standard employee access'
} as const;

const SENSITIVE_ROLES: AppRole[] = ['admin', 'director'];

export function RoleAssignmentDialog({ 
  open, 
  onOpenChange, 
  employee,
  employees = [],
  onSuccess,
  mode = 'single'
}: RoleAssignmentDialogProps) {
  const [selectedRole, setSelectedRole] = useState<AppRole | ''>('');
  const [reason, setReason] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const { assignRole, bulkAssignRoles, isAssigning, canAssignRole } = useRoleAssignment();
  const { roles: userRoles } = usePermissions();

  const isBulkMode = mode === 'bulk' && employees.length > 0;
  const targetEmployee = employee;
  const targetEmployees = employees;

  const handleAssign = async () => {
    if (!selectedRole || !reason.trim()) return;

    // Show confirmation for sensitive roles
    if (SENSITIVE_ROLES.includes(selectedRole)) {
      setShowConfirmation(true);
      return;
    }

    await performAssignment();
  };

  const performAssignment = async () => {
    if (!selectedRole) return;

    if (isBulkMode) {
      // Bulk assignment
      const assignments = targetEmployees.map(emp => ({
        profileId: emp.id,
        role: selectedRole
      }));

      const result = await bulkAssignRoles({
        assignments,
        reason: reason.trim()
      });

      if (result.success) {
        onOpenChange(false);
        setSelectedRole('');
        setReason('');
        onSuccess?.();
      }
    } else {
      // Single assignment
      if (!targetEmployee) return;

      const result = await assignRole({
        profileId: targetEmployee.id,
        role: selectedRole,
        reason: reason.trim()
      });

      if (result.success) {
        onOpenChange(false);
        setSelectedRole('');
        setReason('');
        onSuccess?.();
      }
    }

    setShowConfirmation(false);
  };

  const handleCancel = () => {
    setSelectedRole('');
    setReason('');
    setShowConfirmation(false);
    onOpenChange(false);
  };

  const availableRoles: AppRole[] = ['admin', 'director', 'manager', 'supervisor', 'employee']
    .filter((role) => canAssignRole(role as AppRole)) as AppRole[];

  const isRoleAlreadyAssigned = isBulkMode 
    ? false 
    : targetEmployee?.current_roles?.includes(selectedRole as AppRole);
  const isSensitiveRole = selectedRole && SENSITIVE_ROLES.includes(selectedRole);

  const getDialogTitle = () => {
    if (isBulkMode) {
      return `Assign Role to ${targetEmployees.length} Employees`;
    }
    return 'Assign Role';
  };

  const getDialogDescription = () => {
    if (isBulkMode) {
      return `Assign a role to ${targetEmployees.length} selected employees`;
    }
    return `Assign a role to ${targetEmployee?.name} (${targetEmployee?.email})`;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {getDialogTitle()}
            </DialogTitle>
            <DialogDescription>
              {getDialogDescription()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {isBulkMode ? (
              <div>
                <Label className="text-sm font-medium">Selected Employees</Label>
                <div className="max-h-32 overflow-y-auto bg-muted/30 rounded-md p-2 mt-1">
                  {targetEmployees.map((emp, index) => (
                    <div key={emp.id} className="text-sm py-1">
                      {index + 1}. {emp.name} ({emp.email})
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              targetEmployee?.current_roles && targetEmployee.current_roles.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Current Roles</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {targetEmployee.current_roles.map((role) => (
                      <Badge key={role} variant="secondary">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )
            )}

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as AppRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      <div className="flex items-center justify-between w-full">
                        <span className="capitalize">{role}</span>
                        {SENSITIVE_ROLES.includes(role) && (
                          <AlertTriangle className="h-3 w-3 text-amber-500 ml-2" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRole && (
                <p className="text-xs text-muted-foreground">
                  {ROLE_DESCRIPTIONS[selectedRole]}
                </p>
              )}
              {isRoleAlreadyAssigned && !isBulkMode && (
                <p className="text-xs text-amber-600">
                  This user already has the {selectedRole} role
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">{isBulkMode ? 'Reason for Bulk Assignment' : 'Reason for Assignment'} *</Label>
              <Textarea
                id="reason"
                placeholder={isBulkMode 
                  ? "Explain why this role is being assigned to multiple employees..." 
                  : "Explain why this role is being assigned..."
                }
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                This will be recorded in the audit log
              </p>
            </div>

            {isSensitiveRole && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800">Sensitive Role Assignment</p>
                    <p className="text-amber-700">
                      This role provides elevated privileges. Additional confirmation will be required.
                      {isBulkMode && ` This will affect ${targetEmployees.length} employees.`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} disabled={isAssigning}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssign} 
              disabled={!selectedRole || !reason.trim() || isAssigning}
            >
              {isAssigning 
                ? (isBulkMode ? 'Assigning to All...' : 'Assigning...') 
                : (isBulkMode ? `Assign to ${targetEmployees.length} Employees` : 'Assign Role')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Sensitive Role Assignment
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  You are about to assign the <strong>{selectedRole}</strong> role to{' '}
                  {isBulkMode 
                    ? <strong>{targetEmployees.length} employees</strong>
                    : <strong>{targetEmployee?.name}</strong>
                  }.
                </p>
                <p>
                  This role provides elevated system privileges. Please confirm this action.
                </p>
                <div className="bg-slate-100 rounded p-2 mt-3">
                  <p className="text-sm font-medium">Reason:</p>
                  <p className="text-sm text-slate-700">{reason}</p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmation(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={performAssignment} disabled={isAssigning}>
              {isAssigning 
                ? (isBulkMode ? 'Assigning to All...' : 'Assigning...') 
                : (isBulkMode ? `Confirm Bulk Assignment` : 'Confirm Assignment')
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}