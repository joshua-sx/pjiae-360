import React, { useState } from 'react';
import { Check, ChevronsUpDown, Shield, Users, UserCheck, Eye, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { AppRole } from '@/hooks/usePermissions';

const roleConfig = {
  admin: { icon: Shield, label: 'Admin' },
  director: { icon: Users, label: 'Director' },
  manager: { icon: UserCheck, label: 'Manager' },
  supervisor: { icon: Eye, label: 'Supervisor' },
  employee: { icon: User, label: 'Employee' },
};

export function DemoRoleCombobox() {
  const { demoRole, setDemoRole, availableRoles } = useDemoMode();
  const [open, setOpen] = useState(false);

  const currentRole = roleConfig[demoRole];
  const CurrentIcon = currentRole.icon;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-left font-normal px-2 h-8"
        >
          <div className="flex items-center gap-2">
            <CurrentIcon className="w-4 h-4" />
            <span className="truncate">{currentRole.label}</span>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search roles..." className="h-9" />
          <CommandList>
            <CommandEmpty>No role found.</CommandEmpty>
            <CommandGroup>
              {availableRoles.map((role) => {
                const config = roleConfig[role];
                const IconComponent = config.icon;
                
                return (
                  <CommandItem
                    key={role}
                    value={role}
                    onSelect={() => {
                      setDemoRole(role);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4" />
                      <span>{config.label}</span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        demoRole === role ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}