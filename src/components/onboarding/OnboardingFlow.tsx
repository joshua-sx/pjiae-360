
import { motion, AnimatePresence } from "framer-motion";
import { OnboardingRenderer } from "./OnboardingRenderer";
import { useOnboardingLogic } from "./OnboardingLogic";
import { milestones } from "./OnboardingMilestones";
import MilestoneHeader from "./MilestoneHeader";

const OnboardingFlow = () => {
  const {
    currentMilestoneIndex,
    isLoading,
    onboardingData,
    completedSteps,
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Header */}
      <MilestoneHeader
        milestone={currentMilestone}
        progress={progress}
        currentStep={currentMilestoneIndex + 1}
        totalSteps={milestones.length}
        completedSteps={completedSteps}
      />

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMilestone.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-1 flex flex-col"
        >
          <OnboardingRenderer milestone={currentMilestone} {...commonProps} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OnboardingFlow;
