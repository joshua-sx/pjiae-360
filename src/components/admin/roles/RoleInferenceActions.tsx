import { Button } from '@/components/ui/button';
import { Zap, User, UserPlus } from 'lucide-react';
import { useRoleInference } from '@/hooks/useRoleInference';
import { useDefaultRoleAssignment } from '@/hooks/useDefaultRoleAssignment';
import { PermissionGuard } from '@/components/common/PermissionGuard';

interface RoleInferenceActionsProps {
  employeeId?: string;
  variant?: 'single' | 'bulk';
  size?: 'default' | 'sm' | 'lg';
}

export function RoleInferenceActions({ 
  employeeId, 
  variant = 'bulk',
  size = 'default' 
}: RoleInferenceActionsProps) {
  const { 
    applySingleInference, 
    applyBulkInference, 
    isSingleInferenceLoading, 
    isBulkInferenceLoading 
  } = useRoleInference();
  
  const { 
    assignDefaultRoles, 
    isAssigning: isAssigningDefaults 
  } = useDefaultRoleAssignment();

  const handleSingleInference = () => {
    if (employeeId) {
      applySingleInference(employeeId);
    }
  };

  const handleBulkInference = () => {
    applyBulkInference();
  };

  const handleAssignDefaults = () => {
    assignDefaultRoles();
  };

  if (variant === 'single' && employeeId) {
    return (
      <PermissionGuard roles={['admin', 'director', 'manager']} showFallback={false}>
        <Button
          variant="ghost"
          size={size}
          onClick={handleSingleInference}
          disabled={isSingleInferenceLoading}
          className="gap-2"
        >
          <User className="h-4 w-4" />
          {isSingleInferenceLoading ? 'Inferring...' : 'Infer Role'}
        </Button>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard roles={['admin', 'director']} showFallback={false}>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size={size}
          onClick={handleAssignDefaults}
          disabled={isAssigningDefaults}
          className="gap-2"
        >
          <UserPlus className="h-4 w-4" />
          {isAssigningDefaults ? 'Assigning...' : 'Assign Missing Roles'}
        </Button>
        <Button
          variant="outline"
          size={size}
          onClick={handleBulkInference}
          disabled={isBulkInferenceLoading}
          className="gap-2"
        >
          <Zap className="h-4 w-4" />
          {isBulkInferenceLoading ? 'Applying...' : 'Reapply All Roles'}
        </Button>
      </div>
    </PermissionGuard>
  );
}