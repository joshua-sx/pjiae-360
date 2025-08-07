import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

interface SecurityAuditLog {
  id: string;
  event_type: string;
  success: boolean;
  event_details: any;
  user_id?: string;
  created_at: string;
}

const getEventIcon = (eventType: string, success: boolean) => {
  if (!success) return <XCircle className="h-4 w-4 text-destructive" />;
  
  if (eventType.includes('role') || eventType.includes('assignment')) {
    return <Shield className="h-4 w-4 text-blue-500" />;
  }
  if (eventType.includes('verification') || eventType.includes('auth')) {
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  }
  if (eventType.includes('violation') || eventType.includes('attempt')) {
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  }
  
  return <CheckCircle className="h-4 w-4 text-green-500" />;
};

const getEventSeverity = (eventType: string, success: boolean) => {
  if (!success) return 'high';
  if (eventType.includes('violation') || eventType.includes('unauthorized')) return 'high';
  if (eventType.includes('attempt') && !eventType.includes('success')) return 'medium';
  return 'low';
};

export const securityColumns: ColumnDef<SecurityAuditLog>[] = [
  {
    accessorKey: "event_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Event" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {getEventIcon(row.original.event_type, row.original.success)}
        <span className="font-medium">
          {row.original.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "success",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const severity = getEventSeverity(row.original.event_type, row.original.success);
      return (
        <Badge 
          variant={row.original.success ? 'default' : 'destructive'}
          className={
            severity === 'high' 
              ? 'border-red-500 text-red-700' 
              : severity === 'medium'
              ? 'border-yellow-500 text-yellow-700'
              : ''
          }
        >
          {row.original.success ? 'Success' : 'Failed'}
        </Badge>
      );
    },
  },
  {
    accessorKey: "event_details",
    header: "Details",
    cell: ({ row }) => (
      <div className="max-w-md">
        <pre className="text-xs text-muted-foreground bg-muted p-2 rounded overflow-auto">
          {JSON.stringify(row.original.event_details, null, 2)}
        </pre>
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "user_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.user_id ? row.original.user_id.substring(0, 8) + '...' : 'System'}
      </span>
    ),
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Time" />
    ),
    cell: ({ row }) => (
      <span className="text-sm">
        {format(new Date(row.original.created_at), 'MMM dd, HH:mm:ss')}
      </span>
    ),
  },
];