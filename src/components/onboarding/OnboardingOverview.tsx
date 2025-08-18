import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Building2, 
  Users, 
  UserCog, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Target
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
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your setup is complete and ready to be finalized!
            </AlertDescription>
          </Alert>
        )}

        {/* Organization & People Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Organization & People
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground">Organization Details</h4>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <p><span className="font-medium">Name:</span> {data.orgName || "Not specified"}</p>
                {data.orgProfile?.industry && (
                  <p><span className="font-medium">Industry:</span> {data.orgProfile.industry}</p>
                )}
                {data.orgProfile?.companySize && (
                  <p><span className="font-medium">Size:</span> {data.orgProfile.companySize}</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team Members ({data.people.length})
              </h4>
              {data.people.length > 0 ? (
                <div className="mt-2">
                  <div className="space-y-2">
                    {data.people.slice(0, 5).map((person, index) => (
                      <div key={index} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50">
                        <div>
                          <span className="font-medium">{person.firstName} {person.lastName}</span>
                          <span className="text-muted-foreground ml-2">({person.email})</span>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <div>{person.jobTitle}</div>
                          <div>{person.department} • {person.division}</div>
                        </div>
                      </div>
                    ))}
                    {data.people.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center">
                        ... and {data.people.length - 5} more team members
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">No team members added yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Roles Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-primary" />
              Role Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Directors", count: roleCounts.directors, variant: "secondary" as const },
                { label: "Managers", count: roleCounts.managers, variant: "secondary" as const },
                { label: "Supervisors", count: roleCounts.supervisors, variant: "secondary" as const },
                { label: "Employees", count: roleCounts.employees, variant: "default" as const }
              ].map((role) => (
                <div key={role.label} className="text-center">
                  <Badge variant={role.variant} className="mb-1">
                    {role.count}
                  </Badge>
                  <p className="text-sm text-muted-foreground">{role.label}</p>
                </div>
              ))}
            </div>
            {Object.values(roleCounts).every(count => count === 0) && (
              <p className="text-sm text-muted-foreground text-center">
                No roles have been assigned yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Appraisal Cycle Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Appraisal Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasAppraisalCycle ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Frequency:</span>{' '}
                    <span className="text-muted-foreground">
                      {(data.appraisalCycle as any)?.frequency || data.reviewCycle?.frequency || 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Start Date:</span>{' '}
                    <span className="text-muted-foreground">
                      {(data.appraisalCycle as any)?.startDate 
                        ? new Date((data.appraisalCycle as any).startDate).toLocaleDateString()
                        : data.reviewCycle?.startDate 
                          ? new Date(data.reviewCycle.startDate).toLocaleDateString()
                          : 'Not specified'
                      }
                    </span>
                  </div>
                </div>
                
                {(data.appraisalCycle as any)?.goalWindows?.length > 0 && (
                  <div>
                    <h5 className="font-medium flex items-center gap-1 mb-2">
                      <Target className="h-4 w-4" />
                      Goal Setting Windows ({(data.appraisalCycle as any).goalWindows.length})
                    </h5>
                    <div className="space-y-1">
                      {(data.appraisalCycle as any).goalWindows.slice(0, 3).map((window: any, index: number) => (
                        <div key={index} className="text-xs text-muted-foreground">
                          {window.name} • {new Date(window.startDate).toLocaleDateString()} - {new Date(window.endDate).toLocaleDateString()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(data.appraisalCycle as any)?.reviewPeriods?.length > 0 && (
                  <div>
                    <h5 className="font-medium flex items-center gap-1 mb-2">
                      <Clock className="h-4 w-4" />
                      Review Periods ({(data.appraisalCycle as any).reviewPeriods.length})
                    </h5>
                    <div className="space-y-1">
                      {(data.appraisalCycle as any).reviewPeriods.slice(0, 3).map((period: any, index: number) => (
                        <div key={index} className="text-xs text-muted-foreground">
                          {period.name} • {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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