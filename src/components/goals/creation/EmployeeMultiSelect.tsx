import React, { useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Employee } from '../types';

interface EmployeeMultiSelectProps {
  employees: Employee[];
  selectedEmployees: Employee[];
  onSelectionChange: (employees: Employee[]) => void;
  placeholder?: string;
}

export const EmployeeMultiSelect: React.FC<EmployeeMultiSelectProps> = ({
  employees,
  selectedEmployees,
  onSelectionChange,
  placeholder = "Select employees..."
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [filter, setFilter] = useState<'all' | 'selected'>('all');

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                         employee.department.toLowerCase().includes(searchValue.toLowerCase());
    
    if (filter === 'selected') {
      return matchesSearch && selectedEmployees.some(selected => selected.id === employee.id);
    }
    return matchesSearch;
  });

  const handleEmployeeToggle = (employee: Employee) => {
    const isSelected = selectedEmployees.some(selected => selected.id === employee.id);
    
    if (isSelected) {
      onSelectionChange(selectedEmployees.filter(selected => selected.id !== employee.id));
    } else {
      onSelectionChange([...selectedEmployees, employee]);
    }
  };

  const handleSelectAll = () => {
    if (filter === 'all') {
      // Select all filtered employees
      const newSelections = [...selectedEmployees];
      filteredEmployees.forEach(employee => {
        if (!selectedEmployees.some(selected => selected.id === employee.id)) {
          newSelections.push(employee);
        }
      });
      onSelectionChange(newSelections);
    }
  };

  const handleClearAll = () => {
    if (filter === 'selected') {
      onSelectionChange([]);
    } else {
      // Remove all filtered employees from selection
      const remainingSelections = selectedEmployees.filter(selected => 
        !filteredEmployees.some(filtered => filtered.id === selected.id)
      );
      onSelectionChange(remainingSelections);
    }
  };

  const removeEmployee = (employeeId: string) => {
    onSelectionChange(selectedEmployees.filter(emp => emp.id !== employeeId));
  };

  return (
    <div className="w-full">
      {/* Selected employees badges */}
      {selectedEmployees.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedEmployees.map(employee => (
            <Badge key={employee.id} variant="secondary" className="flex items-center gap-1 py-1">
              <Avatar className="w-4 h-4">
                <AvatarImage src={employee.avatar} alt={employee.name} />
                <AvatarFallback className="text-xs">
                  {employee.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">{employee.name}</span>
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => removeEmployee(employee.id)}
              />
            </Badge>
          ))}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="truncate">
              {selectedEmployees.length === 0 
                ? placeholder 
                : `${selectedEmployees.length} employee${selectedEmployees.length === 1 ? '' : 's'} selected`
              }
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Command>
            {/* Filter tabs */}
            <div className="flex border-b">
              <button
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  filter === 'all' 
                    ? 'border-b-2 border-primary text-primary bg-primary/5' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={`flex-1 px-4 py-2 text-sm font-medium relative ${
                  filter === 'selected' 
                    ? 'border-b-2 border-primary text-primary bg-primary/5' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setFilter('selected')}
              >
                Selected
                {selectedEmployees.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 text-xs">
                    {selectedEmployees.length}
                  </Badge>
                )}
              </button>
            </div>

            {/* Search */}
            <div className="flex items-center border-b px-3 py-2">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder="Search employees..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center px-3 py-2 border-b">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs h-7"
              >
                Select All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-xs h-7"
              >
                Clear {filter === 'selected' ? 'All' : 'Filtered'}
              </Button>
            </div>

            <CommandList>
              <ScrollArea className="h-60">
                <CommandGroup>
                  {filteredEmployees.length === 0 ? (
                    <CommandEmpty>No employees found.</CommandEmpty>
                  ) : (
                    filteredEmployees.map((employee) => {
                      const isSelected = selectedEmployees.some(selected => selected.id === employee.id);
                      return (
                        <CommandItem
                          key={employee.id}
                          onSelect={() => handleEmployeeToggle(employee)}
                          className="flex items-center space-x-3 cursor-pointer"
                        >
                          <Checkbox 
                            checked={isSelected}
                            onChange={() => handleEmployeeToggle(employee)}
                          />
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={employee.avatar} alt={employee.name} />
                            <AvatarFallback>
                              {employee.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{employee.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {employee.role} • {employee.department}
                            </p>
                          </div>
                        </CommandItem>
                      );
                    })
                  )}
                </CommandGroup>
              </ScrollArea>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selection count */}
      {selectedEmployees.length > 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          {selectedEmployees.length} employee{selectedEmployees.length === 1 ? '' : 's'} selected
        </p>
      )}
    </div>
  );
};