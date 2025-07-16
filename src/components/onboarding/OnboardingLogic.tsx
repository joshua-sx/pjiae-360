
import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { OnboardingData } from "./OnboardingTypes";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useOnboardingPersistence } from "@/hooks/useOnboardingPersistence";
import { milestones } from "./OnboardingMilestones";
import { toast } from "sonner";

export const useOnboardingLogic = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { markOnboardingComplete } = useOnboardingStatus();
  const { saveOnboardingData } = useOnboardingPersistence();
  const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  
  // Scroll to top whenever milestone changes
  useScrollToTop(currentMilestoneIndex);
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    orgName: "",
    logo: null,
    entryMethod: null,
    adminInfo: {
      name: user ? `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || "Admin User" : "Admin User",
      email: user?.email || "admin@company.com",
      role: "Administrator"
    },
    csvData: {
      rawData: "",
      headers: [],
      rows: [],
      columnMapping: {}
    },
    people: [],
    orgStructure: [],
    roles: {
      directors: [],
      managers: [],
      supervisors: [],
      employees: []
    },
    reviewCycle: {
      frequency: "quarterly",
      startDate: new Date().toISOString().split('T')[0],
      visibility: true
    },
    importStats: {
      total: 0,
      successful: 0,
      errors: 0
    }
  });

  // Get filtered milestones based on entry method
  const getActiveMilestones = () => {
    if (onboardingData.entryMethod === 'manual') {
      // Manual flow: skip mapping step
      return milestones.filter(milestone => milestone.id !== 'mapping');
    }
    // CSV flow: include all steps
    return milestones;
  };

  const activeMilestones = getActiveMilestones();

  const onDataChange = useCallback((updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
  }, []);

  const handleNext = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Mark current step as completed
      setCompletedSteps(prev => new Set([...prev, currentMilestoneIndex]));
      
      // Move to next step in active milestones
      if (currentMilestoneIndex < activeMilestones.length - 1) {
        setCurrentMilestoneIndex(prev => prev + 1);
      } else {
        // Save all onboarding data before marking complete
        toast.info("Saving your setup...");
        const saveResult = await saveOnboardingData(onboardingData);
        
        if (!saveResult.success) {
          toast.error(`Failed to save onboarding data: ${saveResult.error}`);
          setIsLoading(false);
          return;
        }
        
        toast.success("Setup saved successfully!");
        
        // Mark onboarding as complete when reaching the end
        const markResult = await markOnboardingComplete();
        if (!markResult.success) {
          toast.error("Failed to complete onboarding. Please try again.");
          setIsLoading(false);
          return;
        }
        
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error proceeding to next milestone:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [currentMilestoneIndex, navigate, activeMilestones.length, markOnboardingComplete, saveOnboardingData, onboardingData]);

  const handleBack = useCallback(() => {
    if (currentMilestoneIndex > 0) {
      setCurrentMilestoneIndex(prev => prev - 1);
    }
  }, [currentMilestoneIndex]);

  const handleSkipTo = useCallback((stepIndex: number) => {
    // Only allow navigation to completed steps or the next step
    if (completedSteps.has(stepIndex) || stepIndex === currentMilestoneIndex + 1) {
      setCurrentMilestoneIndex(stepIndex);
    }
  }, [completedSteps, currentMilestoneIndex]);

  return {
    currentMilestoneIndex,
    isLoading,
    onboardingData,
    completedSteps,
    activeMilestones,
    onDataChange,
    handleNext,
    handleBack,
    handleSkipTo
  };
};
