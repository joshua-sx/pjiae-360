
import WelcomeIdentityMilestone from "./WelcomeIdentityMilestone";
import AddYourPeople from "./AddYourPeople";
import ColumnMapping from "./ColumnMapping";
import PreviewConfirm from "./PreviewConfirm";
import ImportSummary from "./ImportSummary";
import AssignRoles from "./AssignRoles";
import StructureOrg from "./StructureOrg";
import ReviewCycles from "./ReviewCycles";
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
      return <PreviewConfirm {...commonProps} />;
    case 'import-roles':
      return <ImportSummary {...commonProps} />;
    case 'structure':
      return <StructureOrg {...commonProps} />;
    case 'review-cycles':
      return <ReviewCycles {...commonProps} />;
    case 'appraisal-setup':
      return <AppraisalCycleSetup {...commonProps} />;
    case 'success':
      return <SuccessDashboard {...commonProps} />;
    default:
      return null;
  }
};
