import React from 'react';
import { format } from 'date-fns';
import { FileText, User } from 'lucide-react';
import { GoalProgressEntry } from '@/stores/demoGoalStore';

interface ProgressJournalProps {
  entries: GoalProgressEntry[];
}

export function ProgressJournal({ entries }: ProgressJournalProps) {
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      <h3 className="font-medium flex items-center gap-2">
        <FileText className="h-4 w-4" />
        Progress Journal
      </h3>
      
      <div className="space-y-4">
        {sortedEntries.map((entry) => (
          <div 
            key={entry.id} 
            className="bg-muted/50 rounded-lg p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{entry.createdBy}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(entry.createdAt), 'MMM dd, h:mm a')}
              </p>
            </div>
            
            <p className="text-sm leading-relaxed">
              {entry.note}
            </p>
          </div>
        ))}
        
        {sortedEntries.length === 0 && (
          <p className="text-sm text-muted-foreground italic">
            No progress updates yet.
          </p>
        )}
      </div>
    </div>
  );
}