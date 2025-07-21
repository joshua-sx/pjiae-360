
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRoleMimicking } from '@/contexts/RoleMimickingContext';

const roleLabels: Record<string, string> = {
  admin: 'Administrator',
  director: 'Director',
  manager: 'Manager',
  supervisor: 'Supervisor',
  employee: 'Employee',
};

export function TestingModeBanner() {
  const { mimickedRole, originalRole, isMimicking, resetToOriginalRole } = useRoleMimicking();

  if (!isMimicking || !mimickedRole || !originalRole) {
    return null;
  }

  return (
    <Alert className="border-orange-200 bg-orange-50 mb-4">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-orange-800">
          <strong>Testing Mode:</strong> You are viewing as {roleLabels[mimickedRole]}. 
          Your actual role is {roleLabels[originalRole]}.
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={resetToOriginalRole}
          className="gap-2 border-orange-200 text-orange-700 hover:bg-orange-100"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </AlertDescription>
    </Alert>
  );
}
