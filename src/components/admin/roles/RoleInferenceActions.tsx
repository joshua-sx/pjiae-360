import { Button } from '@/components/ui/button';
import { Zap, User } from 'lucide-react';
import { useRoleInference } from '@/hooks/useRoleInference';
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

  const handleSingleInference = () => {
    if (employeeId) {
      applySingleInference(employeeId);
    }
  };

  const handleBulkInference = () => {
    applyBulkInference();
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
    </PermissionGuard>
  );
}