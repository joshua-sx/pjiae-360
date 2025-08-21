
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getActionDefinition, formatObjectName, getObjectTypeChip } from "@/lib/audit/taxonomy";
import { EnhancedAuditLogEntry } from "@/types/audit";

export const enhancedAuditColumns: ColumnDef<EnhancedAuditLogEntry>[] = [
  {
    accessorKey: "occurred_at",
    header: "Timestamp",
    size: 160,
    cell: ({ row }) => {
      // Use created_at as fallback for occurred_at
      const date = new Date(row.original.occurred_at || row.original.created_at);
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
    accessorKey: "actor_name",
    header: "Actor",
    size: 180,
    cell: ({ row }) => {
      const entry = row.original;
      const actorName = entry.actor_name;
      const actorEmail = entry.actor_email;
      const userId = entry.user_id;
      
      // Determine display name with fallbacks
      const displayName = actorName || actorEmail || (userId ? `${userId.slice(0, 8)}...` : 'System');
      const initials = actorName 
        ? actorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : actorEmail 
        ? actorEmail[0].toUpperCase() 
        : userId
        ? userId.slice(0, 2).toUpperCase()
        : 'SY';
      
      return (
        <div className="flex items-center space-x-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={""} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">
              {displayName}
            </div>
            {actorName && actorEmail && (
              <div className="text-xs text-muted-foreground truncate">
                {actorEmail}
              </div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "actor_role_name",
    header: "Role",
    size: 120,
    cell: ({ row }) => {
      const roleName = row.getValue("actor_role_name") as string;
      return (
        <div className="text-sm">
          {roleName ? (
            <Badge variant="outline" className="text-xs">
              {roleName}
            </Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "actor_division_name",
    header: "Division",
    size: 140,
    cell: ({ row }) => {
      const divisionName = row.getValue("actor_division_name") as string;
      return (
        <div className="text-sm text-muted-foreground">
          {divisionName || "—"}
        </div>
      );
    },
  },
  {
    accessorKey: "actor_department_name", 
    header: "Department",
    size: 140,
    cell: ({ row }) => {
      const departmentName = row.getValue("actor_department_name") as string;
      return (
        <div className="text-sm text-muted-foreground">
          {departmentName || "—"}
        </div>
      );
    },
  },
  {
    accessorKey: "action_code",
    header: "Action",
    size: 200,
    cell: ({ row }) => {
      const entry = row.original;
      const actionCode = entry.action_code || entry.event_type;
      const actionDef = getActionDefinition(actionCode);
      const detail = actionDef.detailRule?.(entry.metadata || entry.event_details);
      
      const getActionVariant = (severity: string) => {
        switch (severity) {
          case 'success': return 'default';
          case 'warning': return 'secondary';
          case 'danger': return 'destructive';
          default: return 'outline';
        }
      };
      
      return (
        <div className="space-y-1">
          <Badge variant={getActionVariant(actionDef.severity)} className="text-xs">
            {actionDef.label}
          </Badge>
          {detail && (
            <div className="text-xs text-muted-foreground">
              {detail}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "object_name",
    header: "Object",
    size: 200,
    cell: ({ row }) => {
      const entry = row.original;
      const objectType = entry.object_type;
      const objectName = entry.object_name;
      const objectId = entry.object_id;
      
      if (!objectType && !objectName) {
        return <span className="text-muted-foreground text-sm">—</span>;
      }
      
      if (objectType) {
        const typeChip = getObjectTypeChip(objectType);
        const displayName = formatObjectName(objectType, objectName, objectId);
        
        return (
          <div className="flex items-center space-x-2">
            <Badge variant={typeChip.variant as any} className="text-xs">
              {typeChip.label}
            </Badge>
            <span className="text-sm truncate" title={displayName}>
              {displayName}
            </span>
          </div>
        );
      }
      
      // Fallback for when we don't have structured object data
      return (
        <span className="text-sm text-muted-foreground">
          {objectName || "—"}
        </span>
      );
    },
  },
  {
    accessorKey: "outcome",
    header: "Outcome",
    size: 100,
    cell: ({ row }) => {
      const entry = row.original;
      const outcome = entry.outcome;
      const isSuccess = outcome === 'success' || (outcome === null && entry.success);
      const ipAddress = entry.ip_address;
      const userAgent = entry.user_agent;
      
      const badge = (
        <Badge 
          variant={isSuccess ? "default" : "destructive"} 
          className="text-xs"
        >
          {isSuccess ? "Success" : "Failed"}
        </Badge>
      );
      
      // Show IP/user agent tooltip for admins only (controlled by parent component)
      if (ipAddress || userAgent) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-1 cursor-help">
                  {badge}
                  <Info className="h-3 w-3 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs space-y-1">
                  {ipAddress && <div>IP: {ipAddress.toString()}</div>}
                  {userAgent && <div>Agent: {userAgent.toString().slice(0, 50)}...</div>}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
      
      return badge;
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
