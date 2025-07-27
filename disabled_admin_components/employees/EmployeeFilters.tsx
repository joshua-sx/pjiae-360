import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import type { EmployeeFilters } from "./types";

interface EmployeeFiltersProps {
  filters: EmployeeFilters;
  onFiltersChange: (filters: EmployeeFilters) => void;
  roles: Array<{ id: string; name: string }>;
  divisions: Array<{ id: string; name: string }>;
  departments: Array<{ id: string; name: string }>;
}

export function EmployeeFilters({ 
  filters, 
  onFiltersChange, 
  roles = [], 
  divisions = [], 
  departments = [] 
}: EmployeeFiltersProps) {
  const updateFilter = (key: keyof EmployeeFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Search Input - Full Width */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search employees..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-10 h-11"
        />
      </div>
      
      {/* Filter Selects - Mobile Friendly */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3">
        <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="invited">Invited</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="on_leave">On Leave</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filters.role} onValueChange={(value) => updateFilter("role", value)}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filters.division} onValueChange={(value) => updateFilter("division", value)}>
          <SelectTrigger className="h-11 xs:col-span-2 lg:col-span-1">
            <SelectValue placeholder="All Divisions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Divisions</SelectItem>
            {divisions.map((division) => (
              <SelectItem key={division.id} value={division.id}>
                {division.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}