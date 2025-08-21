
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { EnhancedAuditLogEntry } from "@/types/audit";
import { getActionDefinition } from "@/lib/audit/taxonomy";
import { usePermissions } from "@/features/access-control/hooks/usePermissions";

interface AuditDetailsDrawerProps {
  entry: EnhancedAuditLogEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuditDetailsDrawer({ entry, open, onOpenChange }: AuditDetailsDrawerProps) {
  const { canViewAudit } = usePermissions();
  
  if (!entry || !canViewAudit) return null;

  const actionDef = getActionDefinition(entry.action_code || entry.event_type);
  const isSuccess = entry.outcome === 'success' || (entry.outcome === null && entry.success);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Activity Details</SheetTitle>
          <SheetDescription>
            Detailed information about this audit log entry
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Event Summary */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Event Summary</h3>
              <Badge variant={isSuccess ? "default" : "destructive"} className="text-xs">
                {isSuccess ? "Success" : "Failed"}
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Action:</span>
                <span className="font-medium">{actionDef.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span>
                  {format(new Date(entry.occurred_at || entry.created_at), "PPpp")}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actor Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Actor Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span>{entry.actor_name || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>{entry.actor_email || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role:</span>
                <span>{entry.actor_role_name || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Division:</span>
                <span>{entry.actor_division_name || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department:</span>
                <span>{entry.actor_department_name || "—"}</span>
              </div>
              {entry.user_id && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User ID:</span>
                  <span className="font-mono text-xs">{entry.user_id}</span>
                </div>
              )}
            </div>
          </div>

          {/* Object Information */}
          {(entry.object_type || entry.object_name) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Object Information</h3>
                <div className="space-y-2 text-sm">
                  {entry.object_type && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span>{entry.object_type}</span>
                    </div>
                  )}
                  {entry.object_name && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span>{entry.object_name}</span>
                    </div>
                  )}
                  {entry.object_id && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID:</span>
                      <span className="font-mono text-xs">{entry.object_id}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Technical Details */}
          {(entry.ip_address || entry.user_agent) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Technical Details</h3>
                <div className="space-y-2 text-sm">
                  {entry.ip_address && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IP Address:</span>
                      <span className="font-mono text-xs">{entry.ip_address.toString()}</span>
                    </div>
                  )}
                  {entry.user_agent && (
                    <div>
                      <span className="text-muted-foreground">User Agent:</span>
                      <p className="mt-1 text-xs break-all">{entry.user_agent.toString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Event Details */}
          {(entry.event_details || entry.metadata) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Event Details</h3>
                <div className="bg-muted/50 rounded-lg p-3">
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(entry.event_details || entry.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            </>
          )}

          {/* Raw Data (collapsed) */}
          <Separator />
          <details className="space-y-4">
            <summary className="text-sm font-medium cursor-pointer hover:text-foreground/80">
              Raw JSON Data
            </summary>
            <div className="bg-muted/50 rounded-lg p-3">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(entry, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      </SheetContent>
    </Sheet>
  );
}
