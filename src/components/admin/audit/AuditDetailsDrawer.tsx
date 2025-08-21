
import React from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, User, Clock, Target, Settings } from "lucide-react";
import { format } from "date-fns";
import { EnhancedAuditLogEntry } from "@/types/audit";
import { getActionDefinition, formatObjectName, getObjectTypeChip } from "@/lib/audit/taxonomy";
import { usePermissions } from "@/features/access-control/hooks/usePermissions";
import { toast } from "sonner";

interface AuditDetailsDrawerProps {
  entry: EnhancedAuditLogEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuditDetailsDrawer({ entry, open, onOpenChange }: AuditDetailsDrawerProps) {
  const { isAdmin } = usePermissions();
  
  if (!entry) return null;

  const actionDef = getActionDefinition(entry.action_code || entry.event_type);
  const isSuccess = entry.outcome === 'success' || (entry.outcome === null && entry.success);
  const objectChip = entry.object_type ? getObjectTypeChip(entry.object_type) : null;
  
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const renderChangeSet = (metadata: any) => {
    if (!metadata?.changes && !metadata?.previous_value && !metadata?.new_value) {
      return null;
    }

    const changes = metadata.changes || (metadata.previous_value && metadata.new_value ? {
      value: { from: metadata.previous_value, to: metadata.new_value }
    } : {});

    return (
      <div className="space-y-3">
        <h4 className="font-medium text-sm flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Changes
        </h4>
        <div className="space-y-2 text-sm">
          {Object.entries(changes).map(([field, change]: [string, any]) => (
            <div key={field} className="flex justify-between items-center p-2 bg-muted rounded">
              <span className="font-medium">{field}:</span>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">{change.from || 'null'}</span>
                <span>→</span>
                <span className="font-medium">{change.to || 'null'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:w-[600px]">
        <SheetHeader>
          <SheetTitle>Audit Entry Details</SheetTitle>
          <SheetDescription>
            Full details for this audit event
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          <div className="space-y-6">
            {/* Overview */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Event Overview
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-muted-foreground">Timestamp</label>
                  <p>{format(new Date(entry.occurred_at), "PPpp")}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Action</label>
                  <div className="flex items-center gap-2">
                    <Badge variant={actionDef.severity === 'success' ? 'default' : 
                                   actionDef.severity === 'danger' ? 'destructive' : 'secondary'}>
                      {actionDef.label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Category</label>
                  <p>{actionDef.category}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Outcome</label>
                  <Badge variant={isSuccess ? "default" : "destructive"}>
                    {isSuccess ? "Success" : "Failed"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Actor Information */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Actor Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-muted-foreground">Name</label>
                  <p>{entry.actor_name || "—"}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2">
                    <span className="truncate">{entry.actor_email || "—"}</span>
                    {entry.actor_email && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => copyToClipboard(entry.actor_email!, "Email")}
                        className="h-4 w-4 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Role</label>
                  <p>{entry.actor_role_name || "—"}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">User ID</label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">{entry.user_id || "—"}</span>
                    {entry.user_id && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => copyToClipboard(entry.user_id!, "User ID")}
                        className="h-4 w-4 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Division</label>
                  <p>{entry.actor_division_name || "—"}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Department</label>
                  <p>{entry.actor_department_name || "—"}</p>
                </div>
              </div>
            </div>

            {/* Object Information */}
            {entry.object_type && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Object Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-muted-foreground">Type</label>
                    <Badge variant={objectChip?.variant as any}>
                      {objectChip?.label}
                    </Badge>
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground">Name</label>
                    <p>{formatObjectName(entry.object_type, entry.object_name, entry.object_id)}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="font-medium text-muted-foreground">ID</label>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{entry.object_id}</span>
                      {entry.object_id && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => copyToClipboard(entry.object_id!, "Object ID")}
                          className="h-4 w-4 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Change Set */}
            {renderChangeSet(entry.metadata || entry.event_details)}

            {/* Technical Details (Admin Only) */}
            {isAdmin && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Technical Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-muted-foreground">IP Address</label>
                    <p className="font-mono text-xs">{entry.ip_address?.toString() || "—"}</p>
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground">User Agent</label>
                    <p className="text-xs truncate" title={entry.user_agent?.toString()}>
                      {entry.user_agent?.toString() || "—"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <label className="font-medium text-muted-foreground">Event ID</label>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{entry.id}</span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => copyToClipboard(entry.id, "Event ID")}
                        className="h-4 w-4 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Raw JSON (Admin Only) */}
            {isAdmin && (
              <div className="space-y-3">
                <details className="group">
                  <summary className="font-medium text-sm text-muted-foreground cursor-pointer list-none">
                    <span className="group-open:rotate-90 transition-transform inline-block mr-2">▶</span>
                    Raw Event Data
                  </summary>
                  <div className="mt-3 p-3 bg-muted rounded-md">
                    <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify({
                        ...entry,
                        // Format dates for readability
                        occurred_at: entry.occurred_at,
                        created_at: entry.created_at,
                      }, null, 2)}
                    </pre>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => copyToClipboard(JSON.stringify(entry, null, 2), "Raw data")}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy JSON
                    </Button>
                  </div>
                </details>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
