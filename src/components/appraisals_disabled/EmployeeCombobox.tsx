
"use client";

import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Search, User, ChevronDown, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Employee } from './types';

interface EmployeeComboboxProps {
  employees: Employee[];
  selectedEmployee: Employee | null;
  onEmployeeSelect: (employee: Employee) => void;
}

export function EmployeeCombobox({
  employees,
  selectedEmployee,
  onEmployeeSelect
}: EmployeeComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleSelect = (employee: Employee) => {
    onEmployeeSelect(employee);
    setOpen(false);
    setSearchValue("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-1 bg-gradient-to-b from-gray-700 to-black rounded-full"></div>
        <h3 className="text-xl font-semibold text-gray-900">Select Employee</h3>
      </div>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full h-12 bg-white border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200 focus:border-gray-300 focus:ring-2 focus:ring-gray-200/50 justify-between text-base",
              open && "border-gray-300 ring-2 ring-gray-200/50"
            )}
          >
            <div className="flex items-center gap-3 flex-1">
              {selectedEmployee ? (
                <>
                  <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      {selectedEmployee.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedEmployee.position} • {selectedEmployee.department}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                  <span className="text-muted-foreground">Select an employee...</span>
                </>
              )}
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 text-gray-500 transition-transform duration-200",
              open && "transform rotate-180"
            )} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white border border-gray-200 shadow-lg rounded-lg" align="start">
          <Command className="rounded-lg">
            <div className="flex items-center border-b border-gray-100 px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
              <CommandInput
                placeholder="Search employees..."
                value={searchValue}
                onValueChange={setSearchValue}
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0"
              />
            </div>
            <CommandList>
              <ScrollArea className="h-72">
                <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                  No employees found.
                </CommandEmpty>
                <CommandGroup>
                  {employees.map((employee) => (
                    <CommandItem
                      key={employee.id}
                      value={`${employee.name} ${employee.position} ${employee.department}`}
                      onSelect={() => handleSelect(employee)}
                      className="rounded-md p-3 hover:bg-gray-50 transition-colors duration-150 cursor-pointer border-0 aria-selected:bg-gray-50"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900 text-sm">
                            {employee.name}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span>{employee.position}</span>
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            <span>{employee.department}</span>
                          </div>
                        </div>
                        {selectedEmployee?.id === employee.id && (
                          <Check className="h-4 w-4 text-gray-700" />
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </ScrollArea>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
