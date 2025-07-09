import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Clock, 
  Target, 
  Bell, 
  Eye, 
  Star, 
  Mail,
  Users,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { CycleData } from "../types";
import { ValidationErrors } from "../validation";
import { format } from "date-fns";

interface PreviewStepProps {
  data: CycleData;
  onDataChange: (updates: Partial<CycleData>) => void;
  errors: ValidationErrors;
}

export const PreviewStep = ({ data, errors }: PreviewStepProps) => {
  const sortedGoalWindows = [...data.goalSettingWindows].sort((a, b) => 
    a.startDate.getTime() - b.startDate.getTime()
  );

  const sortedReviewPeriods = [...data.reviewPeriods].sort((a, b) => 
    a.startDate.getTime() - b.startDate.getTime()
  );

  const enabledCompetencies = data.competencyCriteria.competencies?.filter(
    comp => comp.applicable !== false
  ) || [];

  const getGoalWindowName = (id: string) => {
    return data.goalSettingWindows.find(window => window.id === id)?.name || 'Unknown';
  };

  const scoringSystemName = {
    '5-point-scale': '5-Point Scale',
    '4-point-scale': '4-Point Scale', 
    '3-point-scale': '3-Point Scale',
    'percentage': 'Percentage'
  }[data.competencyCriteria.scoringSystem] || 'Unknown';

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-primary" />
            Configuration Preview
          </CardTitle>
          <p className="text-muted-foreground">
            Review your appraisal cycle configuration before completing setup
          </p>
        </CardHeader>
      </Card>

      {/* Validation Status */}
      {hasErrors ? (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive mb-3">
              <AlertCircle className="w-5 h-5" />
              <h4 className="font-medium">Configuration Issues</h4>
            </div>
            <ul className="text-sm space-y-1">
              {Object.entries(errors).map(([field, fieldErrors]) => (
                <li key={field}>
                  <strong>{field}:</strong> {fieldErrors.join(', ')}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Configuration Valid</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              All settings are properly configured and ready to use
            </p>
          </CardContent>
        </Card>
      )}

      {/* Basic Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Basic Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Cycle Name</Label>
              <p className="text-base font-medium">{data.cycleName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Frequency</Label>
              <p className="text-base font-medium capitalize">{data.frequency.replace('-', ' ')}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Start Date</Label>
              <p className="text-base font-medium">
                {data.startDate ? format(new Date(data.startDate), 'PPP') : 'Not set'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Visibility</Label>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <p className="text-base font-medium">
                  {data.visibility ? 'Visible to employees' : 'Admin only'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goal Setting Windows */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Goal Setting Windows
            <Badge variant="outline">{data.goalSettingWindows.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedGoalWindows.map((window, index) => (
              <div key={window.id} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{window.name}</h4>
                  <Badge variant="secondary">
                    {Math.ceil((window.endDate.getTime() - window.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{format(window.startDate, 'MMM d, yyyy')}</span>
                  <span>to</span>
                  <span>{format(window.endDate, 'MMM d, yyyy')}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Review Periods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Review Periods
            <Badge variant="outline">{data.reviewPeriods.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedReviewPeriods.map((period, index) => (
              <div key={period.id} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{period.name}</h4>
                  <Badge variant="secondary">
                    {Math.ceil((period.endDate.getTime() - period.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-1">
                  <span>{format(period.startDate, 'MMM d, yyyy')}</span>
                  <span>to</span>
                  <span>{format(period.endDate, 'MMM d, yyyy')}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Linked to: {getGoalWindowName(period.goalWindowId)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Competency Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Competency Evaluation
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.competencyCriteria.enabled ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="default">Enabled</Badge>
                <span className="text-sm text-muted-foreground">
                  Using {scoringSystemName} scoring system
                </span>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Selected Competencies ({enabledCompetencies.length})
                </Label>
                <div className="flex flex-wrap gap-2">
                  {enabledCompetencies.map((comp, index) => (
                    <Badge key={`${comp.name}-${index}`} variant="outline">
                      {comp.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Disabled</Badge>
              <span className="text-sm text-muted-foreground">
                Competency evaluation is not included in reviews
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.notifications.enabled ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="default">Enabled</Badge>
                {data.notifications.email && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Email
                  </Badge>
                )}
              </div>

              {data.notifications.email && data.notifications.emailAddress && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
                  <p className="text-base font-medium">{data.notifications.emailAddress}</p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Notification Types
                </Label>
                <div className="flex flex-wrap gap-2">
                  {data.notifications.reminders && (
                    <Badge variant="outline">Reminder Notifications</Badge>
                  )}
                  {data.notifications.deadlines && (
                    <Badge variant="outline">Deadline Notifications</Badge>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Disabled</Badge>
              <span className="text-sm text-muted-foreground">
                No notifications will be sent
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Experience Preview */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Employee Experience Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p className="font-medium">What employees will see:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>
                  {data.visibility 
                    ? "Full visibility into their review status and feedback" 
                    : "Limited visibility - only what admins share"
                  }
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>
                  Goal setting opportunities during {data.goalSettingWindows.length} configured window{data.goalSettingWindows.length !== 1 ? 's' : ''}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>
                  {data.reviewPeriods.length} review period{data.reviewPeriods.length !== 1 ? 's' : ''} throughout the cycle
                </span>
              </li>
              {data.competencyCriteria.enabled && (
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>
                    Competency evaluation using {scoringSystemName} across {enabledCompetencies.length} competenc{enabledCompetencies.length !== 1 ? 'ies' : 'y'}
                  </span>
                </li>
              )}
              {data.notifications.enabled && (
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>
                    Timely notifications about deadlines and important activities
                  </span>
                </li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper component for labels
const Label = ({ className, children, ...props }: { className?: string; children: React.ReactNode }) => (
  <div className={className} {...props}>{children}</div>
);