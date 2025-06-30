
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { OnboardingMilestone, OnboardingData } from "./OnboardingTypes";
import WelcomeIdentityMilestone from "../../components/onboarding/WelcomeIdentityMilestone";
import StructureOrg from "../../components/onboarding/StructureOrg";
import AddYourPeople from "../../components/onboarding/AddYourPeople";
import AssignRoles from "../../components/onboarding/AssignRoles";
import ReviewCycles from "../../components/onboarding/ReviewCycles";
import PreviewConfirm from "../../components/onboarding/PreviewConfirm";
import SuccessDashboard from "../../components/onboarding/SuccessDashboard";

interface OnboardingRendererProps {
  milestone: OnboardingMilestone;
  data: OnboardingData;
  onDataChange: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkipTo: (index: number) => void;
  isLoading: boolean;
}

export const OnboardingRenderer = ({
  milestone,
  data,
  onDataChange,
  onNext,
  onBack,
  onSkipTo,
  isLoading
}: OnboardingRendererProps) => {
  const renderMilestone = () => {
    switch (milestone.id) {
      case 'welcome':
        return (
          <WelcomeIdentityMilestone
            data={data}
            onDataChange={onDataChange}
            onNext={onNext}
            onBack={onBack}
            onSkipTo={onSkipTo}
            isLoading={isLoading}
          />
        );
      case 'structure':
        return (
          <StructureOrg
            data={data}
            onDataChange={onDataChange}
            onNext={onNext}
            onBack={onBack}
            onSkipTo={onSkipTo}
            isLoading={isLoading}
          />
        );
      case 'people':
        return (
          <AddYourPeople
            data={data}
            onDataChange={onDataChange}
            onNext={onNext}
            onBack={onBack}
            onSkipTo={onSkipTo}
            isLoading={isLoading}
          />
        );
      case 'roles':
        return (
          <AssignRoles
            data={data}
            onDataChange={onDataChange}
            onNext={onNext}
            onBack={onBack}
            onSkipTo={onSkipTo}
            isLoading={isLoading}
          />
        );
      case 'cycles':
        return (
          <ReviewCycles
            data={data}
            onDataChange={onDataChange}
            onNext={onNext}
            onBack={onBack}
            onSkipTo={onSkipTo}
            isLoading={isLoading}
          />
        );
      case 'preview':
        return (
          <PreviewConfirm
            data={data}
            onDataChange={onDataChange}
            onNext={onNext}
            onBack={onBack}
            onSkipTo={onSkipTo}
            isLoading={isLoading}
          />
        );
      case 'success':
        return (
          <SuccessDashboard
            data={data}
            onDataChange={onDataChange}
            onNext={onNext}
            onBack={onBack}
            onSkipTo={onSkipTo}
            isLoading={isLoading}
          />
        );
      default:
        return <div>Unknown milestone</div>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="flex-1"
    >
      <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="p-0">
          {renderMilestone()}
        </CardContent>
      </Card>
    </motion.div>
  );
};
