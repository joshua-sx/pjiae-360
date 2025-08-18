import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatCard } from "@/components/ui/stat-card";
import { 
  Building2, 
  Users, 
  UserCog, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Info
} from "lucide-react";
import { OnboardingStepProps } from "./OnboardingTypes";
import OnboardingStepLayout from "./components/OnboardingStepLayout";

export default function OnboardingOverview({ data, onBack, onNext }: OnboardingStepProps) {
  // Validation checks
  const hasPeople = data.people.length > 0;
  const hasOrgName = data.orgName.trim().length > 0;
  const hasAppraisalCycle = data.appraisalCycle || data.reviewCycle;
  
  const isValid = hasPeople && hasOrgName;

  // Role counts
  const roleCounts = {
    directors: data.roles.directors.length,
    managers: data.roles.managers.length,
    supervisors: data.roles.supervisors.length,
    employees: data.roles.employees.length
  };

  return (
    <OnboardingStepLayout
      onBack={onBack}
      onNext={onNext}
      nextLabel="Confirm and complete"
      nextDisabled={!isValid}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Review & Complete</h1>
          <p className="text-muted-foreground mt-2">
            Review your setup before completing the onboarding process
          </p>
        </div>

        {/* Validation Status */}
        {!isValid && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please complete all required sections before proceeding:
              {!hasOrgName && " Organization name is required."}
              {!hasPeople && " At least one team member is required."}
            </AlertDescription>
          </Alert>
        )}

        {isValid && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              Your setup is complete and ready to be finalized!
            </AlertDescription>
          </Alert>
        )}

        {/* Organization & People Summary */}
        <Card padding="spacious">
          <CardHeader padding="spacious">
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-blue-600" />
              </div>
              Organization & People
            </CardTitle>
          </CardHeader>
          <CardContent padding="spacious" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Organization</span>
                <p className="text-base font-medium">{data.orgName || "Not specified"}</p>
              </div>
              {data.orgProfile?.industry && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Industry</span>
                  <p className="text-base font-medium">{data.orgProfile.industry}</p>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-foreground">Team Members</span>
                <Badge variant="secondary" className="text-xs">{data.people.length}</Badge>
              </div>
              {data.people.length > 0 ? (
                <ScrollArea className="h-72 pr-2">
                  <div className="space-y-0 border rounded-lg divide-y divide-border">
                    {data.people.map((person, index) => (
                      <div key={index} className="flex items-center justify-between p-3">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm">{person.firstName} {person.lastName}</div>
                          <div className="text-muted-foreground text-xs">{person.email}</div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground ml-4">
                          <div>{person.jobTitle}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-sm text-muted-foreground">No team members added yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Roles Summary */}
        <Card padding="spacious">
          <CardHeader padding="spacious">
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <UserCog className="h-4 w-4 text-purple-600" />
              </div>
              Role Assignments
            </CardTitle>
          </CardHeader>
          <CardContent padding="spacious">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <StatCard
                title="Directors"
                value={roleCounts.directors}
                icon={Users}
                iconColor="text-blue-600"
              />
              <StatCard
                title="Managers"
                value={roleCounts.managers}
                icon={Users}
                iconColor="text-green-600"
              />
              <StatCard
                title="Supervisors"
                value={roleCounts.supervisors}
                icon={Users}
                iconColor="text-orange-600"
              />
              <StatCard
                title="Employees"
                value={roleCounts.employees}
                icon={Users}
                iconColor="text-gray-600"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Team roles define reporting structure and access permissions
            </p>
          </CardContent>
        </Card>

        {/* Appraisal Cycle Summary */}
        <Card padding="spacious">
          <CardHeader padding="spacious">
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
              Appraisal Configuration
            </CardTitle>
          </CardHeader>
          <CardContent padding="spacious">
            {hasAppraisalCycle ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Frequency</p>
                      <p className="text-sm text-muted-foreground">
                        {(data.appraisalCycle as any)?.frequency || data.reviewCycle?.frequency || 'Not specified'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Start Date</p>
                      <p className="text-sm text-muted-foreground">
                        {(data.appraisalCycle as any)?.startDate 
                          ? new Date((data.appraisalCycle as any).startDate).toLocaleDateString()
                          : data.reviewCycle?.startDate 
                            ? new Date(data.reviewCycle.startDate).toLocaleDateString()
                            : 'Not specified'
                        }
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Performance reviews configured</p>
                    <p>Your appraisal cycle will automatically track goal progress and schedule review periods according to your settings.</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Appraisal cycle configuration not completed yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Final Message */}
        <div className="text-center p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Once you confirm, your organization setup will be finalized and you'll be redirected to the main dashboard.
          </p>
        </div>
      </div>
    </OnboardingStepLayout>
  );
}