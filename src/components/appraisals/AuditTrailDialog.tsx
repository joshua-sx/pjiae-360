
"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AuditLogEntry } from './types';

interface AuditTrailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  auditLog: AuditLogEntry[];
}

export default function AuditTrailDialog({
  open,
  onOpenChange,
  auditLog
}: AuditTrailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Audit Trail</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {auditLog.map(entry => (
              <div key={entry.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{entry.action}</h4>
                    <span className="text-xs text-muted-foreground">
                      {entry.timestamp.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{entry.details}</p>
                  <p className="text-xs text-muted-foreground">by {entry.user}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
