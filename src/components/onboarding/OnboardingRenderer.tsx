
import WelcomeIdentityMilestone from "./WelcomeIdentityMilestone";
import AddYourPeople from "./AddYourPeople";
import ColumnMapping from "./ColumnMapping";
import ImportSummary from "./ImportSummary";
import AssignRoles from "./AssignRoles";
import AppraisalCycleSetup from "./AppraisalCycleSetup";
import SuccessDashboard from "./SuccessDashboard";
import { OnboardingStepProps } from "./OnboardingTypes";
import { Milestone } from "./OnboardingMilestones";

interface OnboardingRendererProps extends OnboardingStepProps {
  milestone: Milestone;
}

export const OnboardingRenderer = ({ milestone, ...commonProps }: OnboardingRendererProps) => {
  switch (milestone.id) {
    case 'welcome':
      return <WelcomeIdentityMilestone {...commonProps} />;
    case 'people':
      return <AddYourPeople {...commonProps} />;
    case 'mapping':
      return <ColumnMapping {...commonProps} />;
    case 'preview':
      // Preview step now goes directly to import since PreviewConfirm was removed
      return <ImportSummary {...commonProps} />;
    case 'import-roles':
      return <AssignRoles {...commonProps} />;
    case 'appraisal-setup':
      return <AppraisalCycleSetup {...commonProps} />;
    case 'success':
      return <SuccessDashboard {...commonProps} />;
    default:
      return null;
  }
};
