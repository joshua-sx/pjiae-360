import { useState, useEffect } from 'react';
import { Plus, Settings, Play, Square, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { useDemoAppraisalStore } from '@/stores/demoAppraisalStore';
import { CycleFormDialog } from '../components/CycleFormDialog';
import { CycleActivationDialog } from '../components/CycleActivationDialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function CycleListPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'activate' | 'close' | null>(null);
  
  const { 
    cycles, 
    loading, 
    initializeData, 
    deleteCycle, 
    activateCycle, 
    closeCycle,
    getAppraisalsForCycle 
  } = useDemoAppraisalStore();
  
  const { toast } = useToast();

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCycle(id);
      toast({
        title: 'Success',
        description: 'Appraisal cycle deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete appraisal cycle.',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async () => {
    if (!selectedCycleId || !actionType) return;
    
    try {
      if (actionType === 'activate') {
        await activateCycle(selectedCycleId);
        toast({
          title: 'Success',
          description: 'Appraisal cycle activated successfully.',
        });
      } else {
        await closeCycle(selectedCycleId);
        toast({
          title: 'Success',
          description: 'Appraisal cycle closed successfully.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${actionType} appraisal cycle.`,
        variant: 'destructive',
      });
    } finally {
      setSelectedCycleId(null);
      setActionType(null);
    }
  };

  if (loading && cycles.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Appraisal Cycles"
          description="Manage performance review cycles"
        />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appraisal Cycles"
        description="Manage performance review cycles"
      >
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Cycle
        </Button>
      </PageHeader>

      <div className="grid gap-4">
        {cycles.map((cycle) => {
          const appraisalCount = getAppraisalsForCycle(cycle.id).length;
          
          return (
            <Card key={cycle.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {cycle.name}
                      <Badge className={getStatusColor(cycle.status)}>
                        {cycle.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{cycle.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {cycle.status === 'draft' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCycleId(cycle.id);
                          setActionType('activate');
                        }}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Activate
                      </Button>
                    )}
                    {cycle.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCycleId(cycle.id);
                          setActionType('close');
                        }}
                      >
                        <Square className="mr-2 h-4 w-4" />
                        Close
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(cycle.id)}
                      disabled={cycle.status === 'active'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Period</p>
                    <p>{format(cycle.startDate, 'MMM d')} - {format(cycle.endDate, 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Self Assessment Due</p>
                    <p>{format(cycle.selfAssessmentDeadline, 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Manager Review Due</p>
                    <p>{format(cycle.managerReviewDeadline, 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Participants</p>
                    <p>{appraisalCount} employees</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {cycles.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Appraisal Cycles</h3>
            <p className="text-muted-foreground text-center mb-6">
              Create your first appraisal cycle to get started with performance reviews.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Cycle
            </Button>
          </CardContent>
        </Card>
      )}

      <CycleFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <CycleActivationDialog
        open={!!selectedCycleId && !!actionType}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCycleId(null);
            setActionType(null);
          }
        }}
        cycleId={selectedCycleId}
        actionType={actionType}
        onConfirm={handleStatusChange}
      />
    </div>
  );
}