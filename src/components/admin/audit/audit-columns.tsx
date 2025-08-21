import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export interface AuditLogEntry {
  id: string;
  user_id: string | null;
  organization_id: string | null;
  event_type: string;
  event_details: any;
  success: boolean;
  created_at: string;
}

export const auditColumns: ColumnDef<AuditLogEntry>[] = [
  {
    accessorKey: "created_at",
    header: "Timestamp",
    size: 180,
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return (
        <div className="text-sm">
          <div className="font-medium">
            {format(date, "MMM dd, yyyy")}
          </div>
          <div className="text-muted-foreground text-xs">
            {format(date, "HH:mm:ss")}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "user_id",
    header: "Actor",
    size: 120,
    cell: ({ row }) => {
      const userId = row.getValue("user_id") as string;
      return (
        <div className="text-sm">
          {userId ? (
            <span className="font-medium">{userId.slice(0, 8)}...</span>
          ) : (
            <span className="text-muted-foreground">System</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "event_type",
    header: "Action",
    size: 160,
    cell: ({ row }) => {
      const eventType = row.getValue("event_type") as string;
      const success = row.original.success;
      
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
        <Badge variant={getActionVariant(eventType, success)} className="text-xs">
          {eventType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
        </Badge>
      );
    },
  },
  {
    accessorKey: "organization_id",
    header: "Target",
    size: 120,
    cell: ({ row }) => {
      const orgId = row.getValue("organization_id") as string;
      return (
        <div className="text-sm text-muted-foreground">
          {orgId ? `${orgId.slice(0, 8)}...` : "—"}
        </div>
      );
    },
  },
  {
    accessorKey: "event_details",
    header: "Details",
    cell: ({ row }) => {
      const details = row.getValue("event_details");
      const detailsText = details ? JSON.stringify(details) : "";
      const truncated = detailsText.length > 80 ? `${detailsText.slice(0, 80)}...` : detailsText;
      
      return (
        <div className="max-w-xs">
          <span className="text-sm text-muted-foreground truncate block">
            {truncated || "No details"}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "",
    size: 50,
    cell: ({ row }) => {
      return (
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      );
    },
  },
];