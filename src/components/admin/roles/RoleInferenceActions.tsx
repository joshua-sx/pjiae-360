import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useRoleInference } from '@/hooks/useRoleInference';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { PERMISSIONS } from '@/features/access-control/permissions';

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
    isSingleInferenceLoading 
  } = useRoleInference();

  const handleSingleInference = () => {
    if (employeeId) {
      applySingleInference(employeeId);
    }
  };

  if (variant === 'single' && employeeId) {
    return (
      <PermissionGuard permissions={[PERMISSIONS.MANAGE_ROLES]} showFallback={false}>
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

  return null;
}