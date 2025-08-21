import React from "react";
import { ResponsiveDataTable } from "@/components/ui/responsive-data-table";
import { auditColumns, AuditLogEntry } from "./audit-columns";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface AuditTableMemoProps {
  auditEntries: AuditLogEntry[];
  isLoading: boolean;
  table?: any;
  onAuditEntryClick?: (entry: AuditLogEntry) => void;
}

const AuditEntryCard = ({ entry, onAction }: { 
  entry: AuditLogEntry; 
  onAction?: (entry: AuditLogEntry) => void; 
}) => {
  const getActionVariant = (type: string, success: boolean) => {
    if (!success) return "destructive";
    
    switch (type) {
      case "role_assignment":
      case "role_granted":
        return "default";
      case "role_activated":
        return "secondary";
      case "role_deactivated":
        return "outline";
      case "unauthorized_access":
      case "user_creation_error":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors cursor-pointer"
         onClick={() => onAction?.(entry)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="text-sm font-medium">
            {format(new Date(entry.created_at), "MMM dd, yyyy")}
          </div>
          <div className="text-xs text-muted-foreground">
            {format(new Date(entry.created_at), "HH:mm:ss")}
          </div>
        </div>
        <Badge variant={getActionVariant(entry.event_type, entry.success)} className="text-xs">
          {entry.event_type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
        </Badge>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Actor:</span>
          <span className="font-medium">
            {entry.user_id ? `${entry.user_id.slice(0, 8)}...` : "System"}
          </span>
        </div>
        
        {entry.event_details && (
          <div>
            <span className="text-muted-foreground">Details:</span>
            <div className="text-xs text-muted-foreground mt-1 truncate">
              {JSON.stringify(entry.event_details).slice(0, 100)}...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const AuditTableMemo = React.memo(({ 
  auditEntries, 
  isLoading, 
  table, 
  onAuditEntryClick 
}: AuditTableMemoProps) => {
  return (
    <ResponsiveDataTable
      data={auditEntries}
      columns={auditColumns}
      table={table}
      onRowClick={onAuditEntryClick}
      enableHorizontalScroll={true}
      stickyColumns={["created_at", "event_type"]}
      enableFiltering={false}
      mobileCardRenderer={(entry, index) => (
        <AuditEntryCard
          key={entry.id}
          entry={entry}
          onAction={onAuditEntryClick}
        />
      )}
      searchKey="event_type"
      searchPlaceholder="Search audit entries..."
      className="w-full max-w-full min-w-0 table-container"
      emptyMessage="No audit entries found"
      isLoading={isLoading}
    />
  );
});

AuditTableMemo.displayName = "AuditTableMemo";