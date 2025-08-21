import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Download, Calendar } from "lucide-react";
import { useMobileResponsive } from "@/hooks/use-mobile-responsive";

interface AuditFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  eventTypeFilter: string;
  onEventTypeChange: (value: string) => void;
  successFilter: string;
  onSuccessChange: (value: string) => void;
  onExport?: () => void;
  rightSlot?: React.ReactNode;
}

export function AuditFilters({
  searchQuery,
  onSearchChange,
  eventTypeFilter,
  onEventTypeChange,
  successFilter,
  onSuccessChange,
  onExport,
  rightSlot,
}: AuditFiltersProps) {
  const { isMobile } = useMobileResponsive();

  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
      <div className="flex flex-col sm:flex-row gap-4 flex-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by event, detail, user, or IP..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={eventTypeFilter} onValueChange={onEventTypeChange}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All events</SelectItem>
              <SelectItem value="role_assignment">Role Assignment</SelectItem>
              <SelectItem value="role_granted">Role Granted</SelectItem>
              <SelectItem value="role_activated">Role Activated</SelectItem>
              <SelectItem value="role_deactivated">Role Deactivated</SelectItem>
              <SelectItem value="unauthorized_access">Unauthorized Access</SelectItem>
              <SelectItem value="user_creation_error">User Creation Error</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={successFilter} onValueChange={onSuccessChange}>
            <SelectTrigger className="w-[100px] h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Success</SelectItem>
              <SelectItem value="false">Failed</SelectItem>
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
  );
}