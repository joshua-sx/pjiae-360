import React from 'react';
import { format } from 'date-fns';
import { Clock, User } from 'lucide-react';
import { GoalAuditEntry } from '@/stores/demoGoalStore';

interface GoalAuditTimelineProps {
  entries: GoalAuditEntry[];
}

export function GoalAuditTimeline({ entries }: GoalAuditTimelineProps) {
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
  );

  return (
    <div className="space-y-4">
      <h3 className="font-medium flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Activity Timeline
      </h3>
      
      <div className="space-y-3">
        {sortedEntries.map((entry, index) => (
          <div 
            key={entry.id} 
            className="flex gap-3 pb-3 border-b border-border last:border-b-0"
          >
            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{entry.action}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(entry.performedAt), 'MMM dd, h:mm a')}
                </p>
              </div>
              
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{entry.performedBy}</span>
              </div>
              
              {entry.details && (
                <p className="text-xs text-muted-foreground mt-1">
                  {entry.details}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}