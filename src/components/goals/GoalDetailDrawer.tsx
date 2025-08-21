import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, Target, Clock, Archive, CheckCircle, Play, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { DemoGoal, useDemoGoalStore } from '@/stores/demoGoalStore';
import { GoalAuditTimeline } from './GoalAuditTimeline';
import { ProgressJournal } from './ProgressJournal';
import { ProgressModal } from './ProgressModal';
import { useAuth } from '@/hooks/useAuth';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useToast } from '@/hooks/use-toast';

interface GoalDetailDrawerProps {
  goalId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getStatusColor = (status: DemoGoal['status']) => {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800';
    case 'published': return 'bg-blue-100 text-blue-800';
    case 'acknowledged': return 'bg-purple-100 text-purple-800';
    case 'active': return 'bg-green-100 text-green-800';
    case 'completed': return 'bg-emerald-100 text-emerald-800';
    case 'archived': return 'bg-gray-100 text-gray-600';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export function GoalDetailDrawer({ goalId, open, onOpenChange }: GoalDetailDrawerProps) {
  const { user } = useAuth();
  const { demoRole } = useDemoMode();
  const { toast } = useToast();
  const [showProgressModal, setShowProgressModal] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  
  const { 
    getGoalById, 
    publishGoal, 
    acknowledgeGoal, 
    markCompleted, 
    archiveGoal 
  } = useDemoGoalStore();
  
  const goal = goalId ? getGoalById(goalId) : null;
  
  if (!goal) return null;
  
  const isManager = demoRole === 'manager' || demoRole === 'director';
  const isEmployee = demoRole === 'employee';
  const isGoalEmployee = user?.user_metadata?.full_name === goal.employeeName;
  const isGoalManager = user?.user_metadata?.full_name === goal.managerName;
  
  const canPublish = isManager && isGoalManager && goal.status === 'draft';
  const canAcknowledge = isEmployee && isGoalEmployee && goal.status === 'published';
  const canAddProgress = (isEmployee && isGoalEmployee && goal.status === 'active');
  const canComplete = isManager && isGoalManager && goal.status === 'active';
  const canArchive = isManager && isGoalManager && goal.status === 'completed';
  
  const handleAction = async (action: string) => {
    if (!user?.user_metadata?.full_name) return;
    
    setIsLoading(true);
    try {
      const userName = user.user_metadata.full_name;
      
      switch (action) {
        case 'publish':
          await publishGoal(goal.id, userName);
          toast({ title: 'Goal published successfully' });
          break;
        case 'acknowledge':
          await acknowledgeGoal(goal.id, userName);
          toast({ title: 'Goal acknowledged successfully' });
          break;
        case 'complete':
          await markCompleted(goal.id, userName);
          toast({ title: 'Goal marked as completed' });
          break;
        case 'archive':
          await archiveGoal(goal.id, userName);
          toast({ title: 'Goal archived successfully' });
          break;
      }
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to perform action. Please try again.',
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="space-y-4">
            <div className="flex items-start justify-between">
              <SheetTitle className="text-xl font-semibold pr-4">
                {goal.title}
              </SheetTitle>
              <div className="flex gap-2 flex-shrink-0">
                <Badge className={getStatusColor(goal.status)}>
                  {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                </Badge>
                <Badge className={getPriorityColor(goal.priority)}>
                  {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
                </Badge>
              </div>
            </div>
          </SheetHeader>
          
          <div className="space-y-6 mt-6">
            {/* Description */}
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {goal.description}
              </p>
            </div>
            
            {/* Goal Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Employee</p>
                    <p className="text-sm text-muted-foreground">{goal.employeeName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Type</p>
                    <p className="text-sm text-muted-foreground">{goal.type}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Due Date</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(goal.dueDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Weight</p>
                    <p className="text-sm text-muted-foreground">{goal.weight}%</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tags */}
            {goal.tags.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {goal.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <Separator />
            
            {/* Actions */}
            <div className="space-y-3">
              <h3 className="font-medium">Actions</h3>
              <div className="flex flex-wrap gap-2">
                {canPublish && (
                  <Button 
                    onClick={() => handleAction('publish')}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Publish Goal
                  </Button>
                )}
                
                {canAcknowledge && (
                  <Button 
                    onClick={() => handleAction('acknowledge')}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Acknowledge Goal
                  </Button>
                )}
                
                {canAddProgress && (
                  <Button 
                    onClick={() => setShowProgressModal(true)}
                    variant="outline"
                    className="gap-2"
                  >
                    <Target className="h-4 w-4" />
                    Add Progress
                  </Button>
                )}
                
                {canComplete && (
                  <Button 
                    onClick={() => handleAction('complete')}
                    disabled={isLoading}
                    variant="outline"
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark Complete
                  </Button>
                )}
                
                {canArchive && (
                  <Button 
                    onClick={() => handleAction('archive')}
                    disabled={isLoading}
                    variant="outline"
                    className="gap-2"
                  >
                    <Archive className="h-4 w-4" />
                    Archive Goal
                  </Button>
                )}
              </div>
            </div>
            
            <Separator />
            
            {/* Progress Journal */}
            {goal.progress.length > 0 && (
              <ProgressJournal entries={goal.progress} />
            )}
            
            <Separator />
            
            {/* Audit Timeline */}
            <GoalAuditTimeline entries={goal.auditLog} />
          </div>
        </SheetContent>
      </Sheet>
      
      <ProgressModal
        goalId={goal.id}
        open={showProgressModal}
        onOpenChange={setShowProgressModal}
      />
    </>
  );
}