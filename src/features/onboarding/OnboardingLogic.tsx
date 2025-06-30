
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingData } from './OnboardingTypes';
import { milestones } from './OnboardingMilestones';

export const useOnboardingLogic = () => {
  const navigate = useNavigate();
  const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    organization: {
      name: '',
      logo: null,
      adminFirstName: '',
      adminLastName: '',
      adminEmail: '',
      adminPhone: '',
      industry: '',
      size: '',
      country: '',
      timezone: ''
    },
    structure: {
      divisions: [],
      hierarchy: 'flat'
    },
    people: {
      employees: [],
      importMethod: 'manual',
      csvData: null
    },
    roles: {
      assignments: {}
    },
    cycles: {
      reviewCycles: [],
      settings: {
        defaultCycleLength: 12,
        reviewTypes: ['annual', 'quarterly'],
        selfReviewEnabled: true,
        peerReviewEnabled: false,
        managerReviewEnabled: true
      }
    }
  });

  const onDataChange = useCallback((newData: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({
      ...prev,
      ...newData
    }));
  }, []);

  const handleNext = useCallback(() => {
    setIsLoading(true);
    
    // Mark current step as completed
    setCompletedSteps(prev => {
      if (!prev.includes(currentMilestoneIndex)) {
        return [...prev, currentMilestoneIndex];
      }
      return prev;
    });
    
    // Simulate async operation
    setTimeout(() => {
      if (currentMilestoneIndex === milestones.length - 1) {
        // Last step - navigate to dashboard
        navigate('/dashboard');
      } else {
        setCurrentMilestoneIndex(prev => prev + 1);
      }
      setIsLoading(false);
    }, 1000);
  }, [currentMilestoneIndex, navigate]);

  const handleBack = useCallback(() => {
    if (currentMilestoneIndex > 0) {
      setCurrentMilestoneIndex(prev => prev - 1);
    }
  }, [currentMilestoneIndex]);

  const handleSkipTo = useCallback((index: number) => {
    if (index >= 0 && index < milestones.length) {
      setCurrentMilestoneIndex(index);
    }
  }, []);

  // Auto-save data to localStorage
  useEffect(() => {
    localStorage.setItem('onboarding-data', JSON.stringify(onboardingData));
  }, [onboardingData]);

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('onboarding-data');
    const savedStep = localStorage.getItem('onboarding-step');
    const savedCompletedSteps = localStorage.getItem('onboarding-completed');
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setOnboardingData(parsedData);
      } catch (error) {
        console.error('Failed to parse saved onboarding data:', error);
      }
    }
    
    if (savedStep) {
      const stepIndex = parseInt(savedStep, 10);
      if (!isNaN(stepIndex) && stepIndex >= 0 && stepIndex < milestones.length) {
        setCurrentMilestoneIndex(stepIndex);
      }
    }
    
    if (savedCompletedSteps) {
      try {
        const parsedSteps = JSON.parse(savedCompletedSteps);
        setCompletedSteps(parsedSteps);
      } catch (error) {
        console.error('Failed to parse completed steps:', error);
      }
    }
  }, []);

  // Save current step to localStorage
  useEffect(() => {
    localStorage.setItem('onboarding-step', currentMilestoneIndex.toString());
  }, [currentMilestoneIndex]);

  // Save completed steps to localStorage
  useEffect(() => {
    localStorage.setItem('onboarding-completed', JSON.stringify(completedSteps));
  }, [completedSteps]);

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
