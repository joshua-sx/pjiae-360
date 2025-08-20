import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useState, useEffect } from "react";
import type { EmployeeFilters } from "./types";

interface EmployeeFiltersProps {
  filters: EmployeeFilters;
  onFiltersChange: (filters: EmployeeFilters) => void;
  roles: Array<{ id: string; name: string }>;
  divisions: Array<{ id: string; name: string }>;
  departments: Array<{ id: string; name: string }>;
  rightSlot?: React.ReactNode;
}

export function EmployeeFilters({ 
  filters, 
  onFiltersChange, 
  roles = [], 
  divisions = [], 
  departments = [],
  rightSlot 
}: EmployeeFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 300);

  // Update filters when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({ ...filters, search: debouncedSearch });
    }
  }, [debouncedSearch, filters, onFiltersChange]);

  // Update search input when external filters change
  useEffect(() => {
    if (filters.search !== searchInput) {
      setSearchInput(filters.search);
    }
  }, [filters.search]);

  const updateFilter = (key: keyof EmployeeFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const updateMultiFilter = (key: keyof EmployeeFilters, value: string) => {
    const currentValue = filters[key] as string;
    if (currentValue === 'all') {
      onFiltersChange({ ...filters, [key]: value });
    } else {
      const values = currentValue ? currentValue.split(',') : [];
      const index = values.indexOf(value);
      if (index === -1) {
        values.push(value);
      } else {
        values.splice(index, 1);
      }
      onFiltersChange({ ...filters, [key]: values.length > 0 ? values.join(',') : 'all' });
    }
  };

  const getSelectedCount = (filterValue: string) => {
    return filterValue === 'all' ? 0 : filterValue.split(',').filter(Boolean).length;
  };

  const getDisplayText = (filterValue: string, placeholder: string) => {
    const count = getSelectedCount(filterValue);
    return count === 0 ? placeholder : `${count} selected`;
  };

  return (
    <div className="flex items-center gap-4 justify-between">
      <div className="flex items-center gap-4 flex-1">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Division Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-between min-w-[150px]">
              {getDisplayText(filters.division, "All Divisions")}
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <div className="p-3 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="all-divisions"
                  checked={filters.division === 'all'}
                  onCheckedChange={() => updateFilter('division', 'all')}
                />
                <label htmlFor="all-divisions" className="text-sm font-medium">
                  All Divisions
                </label>
              </div>
              {divisions.map((division) => {
                const isChecked = filters.division !== 'all' && filters.division.split(',').includes(division.id);
                return (
                  <div key={division.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`division-${division.id}`}
                      checked={isChecked}
                      onCheckedChange={() => updateMultiFilter('division', division.id)}
                    />
                    <label htmlFor={`division-${division.id}`} className="text-sm">
                      {division.name}
                    </label>
                  </div>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* Department Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-between min-w-[150px]">
              {getDisplayText(filters.department, "All Departments")}
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <div className="p-3 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="all-departments"
                  checked={filters.department === 'all'}
                  onCheckedChange={() => updateFilter('department', 'all')}
                />
                <label htmlFor="all-departments" className="text-sm font-medium">
                  All Departments
                </label>
              </div>
              {departments.map((department) => {
                const isChecked = filters.department !== 'all' && filters.department.split(',').includes(department.id);
                return (
                  <div key={department.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`department-${department.id}`}
                      checked={isChecked}
                      onCheckedChange={() => updateMultiFilter('department', department.id)}
                    />
                    <label htmlFor={`department-${department.id}`} className="text-sm">
                      {department.name}
                    </label>
                  </div>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Right slot for additional content like View options */}
      {rightSlot && (
        <div className="flex-shrink-0">
          {rightSlot}
        </div>
      )}
    </div>
  );
}