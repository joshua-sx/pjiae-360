import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Shield } from 'lucide-react';
import { RoleAssignmentDialog } from './RoleAssignmentDialog';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import type { AppRole } from '@/features/access-control/hooks/usePermissions';
import { PERMISSIONS } from '@/features/access-control/permissions';

interface Employee {
  id: string;
  name: string;
  email: string;
  job_title?: string;
  current_roles?: AppRole[];
}

interface BulkRoleAssignmentButtonProps {
  selectedEmployees: Employee[];
  onSuccess?: () => void;
  disabled?: boolean;
}

export function BulkRoleAssignmentButton({
  selectedEmployees,
  onSuccess,
  disabled = false
}: BulkRoleAssignmentButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClick = () => {
    if (selectedEmployees.length === 0) return;
    setDialogOpen(true);
  };

  return (
    <PermissionGuard 
      permissions={[PERMISSIONS.MANAGE_ROLES]}
      showFallback={false}
    >
      <Button
        onClick={handleClick}
        disabled={disabled || selectedEmployees.length === 0}
        variant="outline"
        className="gap-2"
      >
        <Shield className="h-4 w-4" />
        Assign Roles
        {selectedEmployees.length > 0 && (
          <Badge variant="secondary" className="ml-1">
            {selectedEmployees.length}
          </Badge>
        )}
      </Button>

      <RoleAssignmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employees={selectedEmployees}
        mode="bulk"
        onSuccess={() => {
          setDialogOpen(false);
          onSuccess?.();
        }}
      />
    </PermissionGuard>
  );
}