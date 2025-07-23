
import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import { OnboardingRenderer } from "./OnboardingRenderer";
import { useOnboardingLogic } from "./OnboardingLogic";
import MilestoneHeader from "./MilestoneHeader";

const OnboardingFlow = () => {
  const {
    currentMilestoneIndex,
    isLoading,
    onboardingData,
    completedSteps,
    activeMilestones,
    onDataChange,
    handleNext,
    handleBack,
    handleSkipTo
  } = useOnboardingLogic();

  const currentMilestone = useMemo(
    () => activeMilestones[currentMilestoneIndex],
    [activeMilestones, currentMilestoneIndex]
  )

  const progress = useMemo(
    () => ((currentMilestoneIndex + 1) / activeMilestones.length) * 100,
    [currentMilestoneIndex, activeMilestones.length]
  )

  const commonProps = useMemo(
    () => ({
      data: onboardingData,
      onDataChange,
      onNext: handleNext,
      onBack: handleBack,
      onSkipTo: handleSkipTo,
      isLoading,
    }),
    [onboardingData, onDataChange, handleNext, handleBack, handleSkipTo, isLoading]
  )

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Header */}
      <MilestoneHeader
        milestone={currentMilestone}
        progress={progress}
        currentStep={currentMilestoneIndex + 1}
        totalSteps={activeMilestones.length}
        completedSteps={completedSteps}
        onStepClick={handleSkipTo}
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

