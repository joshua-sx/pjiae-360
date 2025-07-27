import React, { useState } from 'react';
import { Check, ChevronsUpDown, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Employee } from '../types';

interface EmployeeComboboxProps {
  employees: Employee[];
  selectedEmployee: Employee | null;
  onEmployeeSelect: (employee: Employee | null) => void;
  placeholder?: string;
}

export function EmployeeCombobox({
  employees,
  selectedEmployee,
  onEmployeeSelect,
  placeholder = "Select employee..."
}: EmployeeComboboxProps): JSX.Element {
  const [open, setOpen] = useState(false);

  const handleSelect = (employee: Employee) => {
    onEmployeeSelect(selectedEmployee?.id === employee.id ? null : employee);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedEmployee ? (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <div className="flex flex-col items-start">
                <span className="font-medium">{selectedEmployee.name}</span>
                <span className="text-xs text-muted-foreground">
                  {selectedEmployee.role} • {selectedEmployee.department}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search employees..." />
          <CommandList>
            <CommandEmpty>No employee found.</CommandEmpty>
            <CommandGroup>
              {employees.map((employee) => (
                <CommandItem
                  key={employee.id}
                  value={`${employee.name} ${employee.role} ${employee.department}`}
                  onSelect={() => handleSelect(employee)}
                  className="flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">{employee.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {employee.role} • {employee.department}
                    </span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedEmployee?.id === employee.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}