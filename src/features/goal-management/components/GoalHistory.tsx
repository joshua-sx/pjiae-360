
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, User, Calendar, Eye, ChevronRight } from 'lucide-react';
import { useGoalVersions } from '../hooks/useGoalVersions';
import { Skeleton } from '@/components/ui/skeleton';

interface GoalHistoryProps {
  goalId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalTitle: string;
}

const getChangeTypeColor = (changeType: string) => {
  switch (changeType) {
    case 'create':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'update':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'delete':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatChangeType = (changeType: string) => {
  switch (changeType) {
    case 'create':
      return 'Created';
    case 'update':
      return 'Updated';
    case 'delete':
      return 'Deleted';
    default:
      return changeType;
  }
};

const getChangedFields = (currentData: any, previousData: any): string[] => {
  if (!previousData) return [];
  
  const changes: string[] = [];
  const keys = [...new Set([...Object.keys(currentData), ...Object.keys(previousData)])];
  
  for (const key of keys) {
    if (currentData[key] !== previousData[key]) {
      changes.push(key);
    }
  }
  
  return changes;
};

export function GoalHistory({ goalId, open, onOpenChange, goalTitle }: GoalHistoryProps) {
  const { versions, loading, error } = useGoalVersions(goalId);

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Goal History - {goalTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Goal History - {goalTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-destructive">Error loading version history: {error}</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Goal History - {goalTitle}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          {versions.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No version history available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((version, index) => {
                const previousVersion = versions[index + 1];
                const changedFields = previousVersion 
                  ? getChangedFields(version.data, previousVersion.data)
                  : [];

                return (
                  <div key={version.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          v{version.versionNumber}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getChangeTypeColor(version.changeType)}>
                          {formatChangeType(version.changeType)}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(version.changedAt).toLocaleString()}
                        </div>
                      </div>
                      
                      {version.changeSummary && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {version.changeSummary}
                        </p>
                      )}
                      
                      {changedFields.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Changed: {changedFields.join(', ')}
                        </div>
                      )}
                    </div>
                    
                    <Button variant="ghost" size="sm" className="flex-shrink-0">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
