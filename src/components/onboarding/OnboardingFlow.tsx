
import { motion, AnimatePresence } from "framer-motion";
import MilestoneHeader from "./MilestoneHeader";
import { OnboardingRenderer } from "./OnboardingRenderer";
import { useOnboardingLogic } from "./OnboardingLogic";
import { milestones } from "./OnboardingMilestones";

const OnboardingFlow = () => {
  const {
    currentMilestoneIndex,
    isLoading,
    onboardingData,
    onDataChange,
    handleNext,
    handleBack,
    handleSkipTo
  } = useOnboardingLogic();

  const currentMilestone = milestones[currentMilestoneIndex];
  const progress = ((currentMilestoneIndex + 1) / milestones.length) * 100;

  const commonProps = {
    data: onboardingData,
    onDataChange,
    onNext: handleNext,
    onBack: handleBack,
    onSkipTo: handleSkipTo,
    isLoading
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <MilestoneHeader
        milestone={currentMilestone}
        progress={progress}
        currentStep={currentMilestoneIndex + 1}
        totalSteps={milestones.length}
      />

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMilestone.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-1 min-h-0 flex flex-col"
        >
          <OnboardingRenderer milestone={currentMilestone} {...commonProps} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OnboardingFlow;
