import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { useDemoAppraisalStore } from '@/stores/demoAppraisalStore';
import { SelfAssessmentForm } from '../components/SelfAssessmentForm';
import { usePermissions } from '@/features/access-control/hooks/usePermissions';
import { format } from 'date-fns';
import { Clock, CheckCircle2, FileText } from 'lucide-react';

export default function MyAppraisalPage() {
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [selectedAppraisalId, setSelectedAppraisalId] = useState<string | null>(null);
  
  const { cycles, appraisals, initializeData, loading } = useDemoAppraisalStore();
  const permissions = usePermissions();

  // Get current user ID from permissions (in demo mode)
  const currentUserId = 'emp-1'; // Demo user ID

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'not_started':
        return {
          label: 'Not Started',
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
          icon: Clock,
        };
      case 'self_assessment':
        return {
          label: 'Self Assessment Due',
          color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
          icon: FileText,
        };
      case 'manager_review':
        return {
          label: 'Under Manager Review',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
          icon: Clock,
        };
      case 'complete':
        return {
          label: 'Complete',
          color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
          icon: CheckCircle2,
        };
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
          icon: Clock,
        };
    }
  };

  const myAppraisals = appraisals.filter(a => a.employeeId === currentUserId);
  const activeCycles = cycles.filter(c => c.status === 'active');

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="My Appraisals"
          description="Complete your performance reviews"
        />
        <div className="grid gap-4">
          {[...Array(2)].map((_, i) => (
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

  if (showAssessmentForm && selectedAppraisalId) {
    const appraisal = appraisals.find(a => a.id === selectedAppraisalId);
    if (!appraisal) return null;

    return (
      <SelfAssessmentForm
        appraisal={appraisal}
        onBack={() => {
          setShowAssessmentForm(false);
          setSelectedAppraisalId(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Appraisals"
        description="Complete your performance reviews"
      />

      <div className="grid gap-4">
        {myAppraisals.map((appraisal) => {
          const cycle = cycles.find(c => c.id === appraisal.cycleId);
          if (!cycle) return null;

          const statusInfo = getStatusInfo(appraisal.status);
          const StatusIcon = statusInfo.icon;
          const canStartSelfAssessment = appraisal.status === 'not_started' || appraisal.status === 'self_assessment';

          return (
            <Card key={appraisal.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {cycle.name}
                      <Badge className={statusInfo.color}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statusInfo.label}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Manager: {appraisal.managerName}
                    </CardDescription>
                  </div>
                  {canStartSelfAssessment && (
                    <Button
                      onClick={() => {
                        setSelectedAppraisalId(appraisal.id);
                        setShowAssessmentForm(true);
                      }}
                    >
                      {appraisal.status === 'not_started' ? 'Start Self Assessment' : 'Continue Assessment'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Review Period</p>
                    <p>{format(cycle.startDate, 'MMM d')} - {format(cycle.endDate, 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Self Assessment Due</p>
                    <p className={new Date() > cycle.selfAssessmentDeadline ? 'text-red-600' : ''}>
                      {format(cycle.selfAssessmentDeadline, 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Goals to Review</p>
                    <p>{appraisal.goals.length} goals</p>
                  </div>
                </div>

                {appraisal.status === 'complete' && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Your Overall Rating</p>
                        <p className="font-medium">{appraisal.overallSelfRating}/5</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Manager's Overall Rating</p>
                        <p className="font-medium">{appraisal.overallManagerRating}/5</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {myAppraisals.length === 0 && activeCycles.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Appraisals</h3>
            <p className="text-muted-foreground text-center">
              There are no active performance review cycles at this time.
            </p>
          </CardContent>
        </Card>
      )}

      {myAppraisals.length === 0 && activeCycles.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Appraisal Coming Soon</h3>
            <p className="text-muted-foreground text-center">
              Your manager will assign you to an active review cycle soon.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}