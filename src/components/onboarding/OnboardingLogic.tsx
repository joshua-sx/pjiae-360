
import { useState, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { OnboardingData } from "./OnboardingTypes";

export const useOnboardingLogic = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
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
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (currentMilestoneIndex < 8) { // 9 steps, so max index is 8
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
    setCurrentMilestoneIndex(stepIndex);
  }, []);

  return {
    currentMilestoneIndex,
    isLoading,
    onboardingData,
    onDataChange,
    handleNext,
    handleBack,
    handleSkipTo
  };
};
