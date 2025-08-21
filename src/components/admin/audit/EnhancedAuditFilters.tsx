
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Search, Download, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ACTION_TAXONOMY, ACTION_CATEGORIES } from "@/lib/audit/taxonomy";
import { AuditFiltersState } from "@/types/audit";

interface EnhancedAuditFiltersProps {
  filters: AuditFiltersState;
  onFiltersChange: (filters: Partial<AuditFiltersState>) => void;
  onExport?: () => void;
  rightSlot?: React.ReactNode;
  availableRoles?: string[];
  availableDivisions?: string[];
  availableDepartments?: string[];
}

export function EnhancedAuditFilters({
  filters,
  onFiltersChange,
  onExport,
  rightSlot,
  availableRoles = [],
  availableDivisions = [],
  availableDepartments = [],
}: EnhancedAuditFiltersProps) {
  const [dateFromOpen, setDateFromOpen] = React.useState(false);
  const [dateToOpen, setDateToOpen] = React.useState(false);

  const actionOptions = Object.entries(ACTION_TAXONOMY)
    .filter(([key]) => key !== 'DEFAULT')
    .map(([key, def]) => ({ code: key, label: def.label, category: def.category }));

  const groupedActions = ACTION_CATEGORIES.map(category => ({
    category,
    actions: actionOptions.filter(action => action.category === category)
  })).filter(group => group.actions.length > 0);

  const activeFilterCount = [
    filters.search && 'search',
    filters.roles.length > 0 && 'roles',
    filters.divisions.length > 0 && 'divisions', 
    filters.departments.length > 0 && 'departments',
    filters.actions.length > 0 && 'actions',
    filters.dateFrom && 'dateFrom',
    filters.dateTo && 'dateTo',
    filters.outcome !== 'all' && 'outcome'
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      roles: [],
      divisions: [],
      departments: [],
      actions: [],
      dateFrom: '',
      dateTo: '',
      outcome: 'all'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by actor, action, or object..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ search: e.target.value })}
              className="pl-9 h-9"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {/* Role Filter */}
            <Select 
              value={filters.roles.length === 1 ? filters.roles[0] : 'all'} 
              onValueChange={(value) => onFiltersChange({ roles: value === 'all' ? [] : [value] })}
            >
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                {availableRoles.map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Division Filter */}
            <Select 
              value={filters.divisions.length === 1 ? filters.divisions[0] : 'all'} 
              onValueChange={(value) => onFiltersChange({ divisions: value === 'all' ? [] : [value] })}
            >
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Division" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All divisions</SelectItem>
                {availableDivisions.map(division => (
                  <SelectItem key={division} value={division}>{division}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Department Filter */}
            <Select 
              value={filters.departments.length === 1 ? filters.departments[0] : 'all'} 
              onValueChange={(value) => onFiltersChange({ departments: value === 'all' ? [] : [value] })}
            >
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                {availableDepartments.map(department => (
                  <SelectItem key={department} value={department}>{department}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Action Filter */}
            <Select 
              value={filters.actions.length === 1 ? filters.actions[0] : 'all'} 
              onValueChange={(value) => onFiltersChange({ actions: value === 'all' ? [] : [value] })}
            >
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                {groupedActions.map(group => (
                  <div key={group.category}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      {group.category}
                    </div>
                    {group.actions.map(action => (
                      <SelectItem key={action.code} value={action.code}>
                        {action.label}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>

            {/* Date Range */}
            <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateFrom ? format(new Date(filters.dateFrom), "MMM dd") : "From"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
                  onSelect={(date) => {
                    onFiltersChange({ dateFrom: date ? date.toISOString() : '' });
                    setDateFromOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateTo ? format(new Date(filters.dateTo), "MMM dd") : "To"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateTo ? new Date(filters.dateTo) : undefined}
                  onSelect={(date) => {
                    onFiltersChange({ dateTo: date ? date.toISOString() : '' });
                    setDateToOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Outcome Filter */}
            <Select value={filters.outcome} onValueChange={(value) => onFiltersChange({ outcome: value })}>
              <SelectTrigger className="w-[100px] h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failure">Failed</SelectItem>
              </SelectContent>
            </Select>

            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>
        
        {rightSlot && (
          <div className="flex-shrink-0">
            {rightSlot}
          </div>
        )}
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.search}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onFiltersChange({ search: '' })} />
            </Badge>
          )}

          {filters.roles.map(role => (
            <Badge key={role} variant="secondary" className="gap-1">
              Role: {role}
              <X className="h-3 w-3 cursor-pointer" onClick={() => 
                onFiltersChange({ roles: filters.roles.filter(r => r !== role) })
              } />
            </Badge>
          ))}

          {filters.actions.map(action => (
            <Badge key={action} variant="secondary" className="gap-1">
              Action: {ACTION_TAXONOMY[action]?.label || action}
              <X className="h-3 w-3 cursor-pointer" onClick={() => 
                onFiltersChange({ actions: filters.actions.filter(a => a !== action) })
              } />
            </Badge>
          ))}

          {activeFilterCount > 1 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllFilters}
              className="h-6 px-2 text-xs"
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
