import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { useDemoAppraisalStore } from '@/stores/demoAppraisalStore';
import { AppraisalReviewForm } from '../components/AppraisalReviewForm';
import { format } from 'date-fns';
import { Clock, CheckCircle2, FileText, User } from 'lucide-react';

export default function ManagerReviewPage() {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedAppraisalId, setSelectedAppraisalId] = useState<string | null>(null);
  
  const { cycles, appraisals, initializeData, loading } = useDemoAppraisalStore();

  // Demo manager ID
  const currentManagerId = 'mgr-1';

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
          label: 'Employee Working',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
          icon: User,
        };
      case 'manager_review':
        return {
          label: 'Ready for Review',
          color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
          icon: FileText,
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

  const myTeamAppraisals = appraisals.filter(a => a.managerId === currentManagerId);
  const activeCycles = cycles.filter(c => c.status === 'active');

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Team Appraisals"
          description="Review and provide feedback on your team's performance"
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

  if (showReviewForm && selectedAppraisalId) {
    const appraisal = appraisals.find(a => a.id === selectedAppraisalId);
    if (!appraisal) return null;

    return (
      <AppraisalReviewForm
        appraisal={appraisal}
        onBack={() => {
          setShowReviewForm(false);
          setSelectedAppraisalId(null);
        }}
      />
    );
  }

  // Group appraisals by status for better organization
  const readyForReview = myTeamAppraisals.filter(a => a.status === 'manager_review');
  const inProgress = myTeamAppraisals.filter(a => a.status === 'self_assessment');
  const completed = myTeamAppraisals.filter(a => a.status === 'complete');
  const notStarted = myTeamAppraisals.filter(a => a.status === 'not_started');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Appraisals"
        description="Review and provide feedback on your team's performance"
      />

      {/* Ready for Review - Priority Section */}
      {readyForReview.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-orange-600">Ready for Your Review</h2>
          <div className="grid gap-4">
            {readyForReview.map((appraisal) => {
              const cycle = cycles.find(c => c.id === appraisal.cycleId);
              if (!cycle) return null;

              const statusInfo = getStatusInfo(appraisal.status);
              const StatusIcon = statusInfo.icon;

              return (
                <Card key={appraisal.id} className="border-orange-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {appraisal.employeeName}
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusInfo.label}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {cycle.name} • {appraisal.employeeEmail}
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => {
                          setSelectedAppraisalId(appraisal.id);
                          setShowReviewForm(true);
                        }}
                      >
                        Review Appraisal
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Employee Self Rating</p>
                        <p className="font-medium">{appraisal.overallSelfRating || 'N/A'}/5</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Submitted</p>
                        <p>{appraisal.selfAssessmentSubmittedAt ? format(appraisal.selfAssessmentSubmittedAt, 'MMM d, yyyy') : 'Not submitted'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Review Due</p>
                        <p className={new Date() > cycle.managerReviewDeadline ? 'text-red-600' : ''}>
                          {format(cycle.managerReviewDeadline, 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* In Progress Section */}
      {inProgress.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">In Progress</h2>
          <div className="grid gap-4">
            {inProgress.map((appraisal) => {
              const cycle = cycles.find(c => c.id === appraisal.cycleId);
              if (!cycle) return null;

              const statusInfo = getStatusInfo(appraisal.status);
              const StatusIcon = statusInfo.icon;

              return (
                <Card key={appraisal.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {appraisal.employeeName}
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusInfo.label}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {cycle.name} • {appraisal.employeeEmail}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Self Assessment Due</p>
                        <p className={new Date() > cycle.selfAssessmentDeadline ? 'text-red-600' : ''}>
                          {format(cycle.selfAssessmentDeadline, 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Goals</p>
                        <p>{appraisal.goals.length} goals to review</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Section */}
      {completed.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Completed</h2>
          <div className="grid gap-4">
            {completed.map((appraisal) => {
              const cycle = cycles.find(c => c.id === appraisal.cycleId);
              if (!cycle) return null;

              const statusInfo = getStatusInfo(appraisal.status);
              const StatusIcon = statusInfo.icon;

              return (
                <Card key={appraisal.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {appraisal.employeeName}
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusInfo.label}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {cycle.name} • {appraisal.employeeEmail}
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedAppraisalId(appraisal.id);
                          setShowReviewForm(true);
                        }}
                      >
                        View Review
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Employee Rating</p>
                        <p className="font-medium">{appraisal.overallSelfRating}/5</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Your Rating</p>
                        <p className="font-medium">{appraisal.overallManagerRating}/5</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Completed</p>
                        <p>{appraisal.managerReviewSubmittedAt ? format(appraisal.managerReviewSubmittedAt, 'MMM d, yyyy') : 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {myTeamAppraisals.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Team Appraisals</h3>
            <p className="text-muted-foreground text-center">
              No appraisals have been assigned to your team members yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}