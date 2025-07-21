
import { useState } from 'react';
import { Shield, ChevronDown, RotateCcw, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRoleMimicking } from '@/contexts/RoleMimickingContext';
import { useToast } from '@/hooks/use-toast';
import type { AppRole } from '@/hooks/usePermissions';

const roleLabels: Record<AppRole, string> = {
  admin: 'Administrator',
  director: 'Director',
  manager: 'Manager',
  supervisor: 'Supervisor',
  employee: 'Employee',
};

const roleIcons: Record<AppRole, React.ComponentType<{ className?: string }>> = {
  admin: Shield,
  director: User,
  manager: User,
  supervisor: User,
  employee: User,
};

export function RoleSwitcher() {
  const { mimickedRole, originalRole, isMimicking, switchToRole, resetToOriginalRole } = useRoleMimicking();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  if (!originalRole) {
    return null;
  }

  const currentRole = mimickedRole || originalRole;
  const allRoles: AppRole[] = ['admin', 'director', 'manager', 'supervisor', 'employee'];

  const handleRoleSwitch = (role: AppRole) => {
    if (role === originalRole) {
      resetToOriginalRole();
      toast({
        title: 'Role Reset',
        description: `Switched back to your original ${roleLabels[originalRole]} role.`,
      });
    } else {
      switchToRole(role);
      toast({
        title: 'Role Mimicking Active',
        description: `Now viewing as ${roleLabels[role]}. This is for testing purposes only.`,
      });
    }
    setOpen(false);
  };

  const CurrentRoleIcon = roleIcons[currentRole];

  return (
    <div className="flex items-center gap-2">
      {isMimicking && (
        <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
          Testing Mode
        </Badge>
      )}
      
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <CurrentRoleIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{roleLabels[currentRole]}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
            Switch Role View
          </div>
          <DropdownMenuSeparator />
          
          {allRoles.map((role) => {
            const RoleIcon = roleIcons[role];
            const isActive = role === currentRole;
            const isOriginal = role === originalRole;
            
            return (
              <DropdownMenuItem
                key={role}
                onClick={() => handleRoleSwitch(role)}
                className="gap-2"
              >
                <RoleIcon className="h-4 w-4" />
                <span className="flex-1">{roleLabels[role]}</span>
                {isOriginal && (
                  <Badge variant="outline" className="text-xs">
                    Original
                  </Badge>
                )}
                {isActive && role !== originalRole && (
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                )}
              </DropdownMenuItem>
            );
          })}
          
          {isMimicking && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleRoleSwitch(originalRole)}
                className="gap-2 text-blue-600"
              >
                <RotateCcw className="h-4 w-4" />
                Reset to Original
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
