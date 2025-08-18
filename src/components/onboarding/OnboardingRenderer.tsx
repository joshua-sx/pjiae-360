
import WelcomeIdentityMilestone from "./WelcomeIdentityMilestone";
import AddYourPeople from "./AddYourPeople";
import ColumnMapping from "./ColumnMapping";
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
      // Show ColumnMapping if CSV method and in mapping stage, otherwise show AddYourPeople
      if (commonProps.data.entryMethod === 'csv' && commonProps.data.uiState?.peopleStage === 'mapping') {
        return <ColumnMapping {...commonProps} />;
      }
      return <AddYourPeople {...commonProps} />;
    case 'mapping':
      return <ColumnMapping {...commonProps} />;
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
