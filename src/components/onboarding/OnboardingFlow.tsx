
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState, useEffect } from "react";
import { OnboardingRenderer } from "./OnboardingRenderer";
import { useOnboardingLogic } from "./OnboardingLogic";
import MilestoneHeader from "./MilestoneHeader";
import { DraftRecoveryModal } from "./DraftRecoveryModal";
import { SaveStatusIndicator } from "./SaveStatusIndicator";
import { useInactivityTimer } from '@/hooks/useInactivityTimer';


const OnboardingFlow = () => {
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [hasPromptedForRecovery, setHasPromptedForRecovery] = useState(() => {
    return sessionStorage.getItem('onboarding-recovery-prompted') === 'true';
  });
  
  const {
    currentMilestoneIndex,
    isLoading,
    onboardingData,
    completedStepIds,
    activeMilestones,
    onDataChange,
    handleNext,
    handleBack,
    handleSkipTo,
    draftRecovery,
    handleResumeDraft,
    handleStartFresh,
    saveStatus,
    lastSavedAt,
    isOnline
  } = useOnboardingLogic();

  // Check if user is returning (has been to onboarding before)
  const isReturningUser = sessionStorage.getItem('onboarding-visited') === 'true';
  
  // Set visited flag
  useEffect(() => {
    sessionStorage.setItem('onboarding-visited', 'true');
  }, []);

  // Handle inactivity timeout - show modal after 10 minutes
  const handleInactivityTimeout = () => {
    if (draftRecovery.hasDraft && !hasPromptedForRecovery) {
      setShowDraftModal(true);
      setHasPromptedForRecovery(true);
      sessionStorage.setItem('onboarding-recovery-prompted', 'true');
    }
  };

  // Set up inactivity timer (10 minutes = 600,000ms)
  const { resetTimer } = useInactivityTimer({
    timeout: 10 * 60 * 1000,
    onTimeout: handleInactivityTimeout,
    enabled: draftRecovery.hasDraft && !hasPromptedForRecovery
  });

  // Show modal immediately for returning users with drafts
  useEffect(() => {
    if (isReturningUser && draftRecovery.hasDraft && !hasPromptedForRecovery) {
      setShowDraftModal(true);
      setHasPromptedForRecovery(true);
      sessionStorage.setItem('onboarding-recovery-prompted', 'true');
    }
  }, [isReturningUser, draftRecovery.hasDraft, hasPromptedForRecovery]);

  const handleResumeDraftAndClose = () => {
    handleResumeDraft();
    setShowDraftModal(false);
  };

  const handleStartFreshAndClose = () => {
    handleStartFresh();
    setShowDraftModal(false);
  };

  const handleCloseDraftModal = () => {
    setShowDraftModal(false);
    // Resume inactivity timer
    resetTimer();
  };

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
    <>
      <div className="h-screen bg-background flex flex-col safe-area-top">
        {/* Progress Header */}
        <div className="flex-shrink-0 relative">
          <MilestoneHeader
            milestone={currentMilestone}
            progress={progress}
            currentStep={currentMilestoneIndex}
            totalSteps={activeMilestones.length}
            completedStepIds={completedStepIds}
            onStepClick={handleSkipTo}
            milestones={activeMilestones}
          />
          <SaveStatusIndicator 
            status={saveStatus}
            lastSaved={lastSavedAt}
            isOnline={isOnline}
            className="hidden lg:block absolute top-2 right-4 pointer-events-none"
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMilestone.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="h-full flex flex-col"
            >
              <OnboardingRenderer milestone={currentMilestone} {...commonProps} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Draft Recovery Modal */}
      {showDraftModal && draftRecovery.hasDraft && (
        <DraftRecoveryModal
          isOpen={showDraftModal}
          onResume={handleResumeDraftAndClose}
          onStartFresh={handleStartFreshAndClose}
          onClose={handleCloseDraftModal}
          draftStep={draftRecovery.draftStep}
          lastSavedAt={draftRecovery.lastSavedAt || ''}
          totalSteps={activeMilestones.length}
        />
      )}
    </>
  );
};

export default OnboardingFlow;

