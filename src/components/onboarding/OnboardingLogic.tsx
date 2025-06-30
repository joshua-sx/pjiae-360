
import { useState, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { OnboardingData } from "./OnboardingTypes";
import { useScrollToTop } from "@/hooks/useScrollToTop";

export const useOnboardingLogic = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  
  // Scroll to top whenever milestone changes
  useScrollToTop(currentMilestoneIndex);
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    orgName: "",
    logo: null,
    adminInfo: {
      name: user?.fullName || "Admin User",
      email: user?.primaryEmailAddress?.emailAddress || "admin@company.com",
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

  const onDataChange = useCallback((updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
  }, []);

  const handleNext = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Mark current step as completed
      setCompletedSteps(prev => new Set([...prev, currentMilestoneIndex]));
      
      // Simulate processing time with meaningful feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (currentMilestoneIndex < 7) { // Updated to 7 since we now have 8 steps instead of 9
        setCurrentMilestoneIndex(prev => prev + 1);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error proceeding to next milestone:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentMilestoneIndex, navigate]);

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
    onDataChange,
    handleNext,
    handleBack,
    handleSkipTo
  };
};
