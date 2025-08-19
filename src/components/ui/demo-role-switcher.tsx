import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { AppRole } from '@/features/access-control/hooks/usePermissions';

const roleLabels: Record<AppRole, string> = {
  admin: 'Administrator',
  director: 'Director',
  manager: 'Manager',
  supervisor: 'Supervisor',
  employee: 'Employee'
};

const roleDescriptions: Record<AppRole, string> = {
  admin: 'Full system access and management',
  director: 'Department oversight and strategy',
  manager: 'Team management and reporting',
  supervisor: 'Team lead and coordination',
  employee: 'Individual contributor view'
};

export function DemoRoleSwitcher() {
  const { isDemoMode, demoRole, setDemoRole, availableRoles } = useDemoMode();

  if (!isDemoMode) return null;

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Demo Role:</span>
      </div>
      
      <Select value={demoRole} onValueChange={setDemoRole}>
        <SelectTrigger className="w-48">
          <SelectValue>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {roleLabels[demoRole]}
              </Badge>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableRoles.map((role) => (
            <SelectItem key={role} value={role}>
              <div className="flex flex-col gap-1">
                <div className="font-medium">{roleLabels[role]}</div>
                <div className="text-xs text-muted-foreground">
                  {roleDescriptions[role]}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}