
import { useState } from 'react';
import { MagicPathGoalData, MagicPathEmployee } from '@/components/magicpath/types';
import { useEmployees } from '@/hooks/useEmployees';

const initialGoalData: MagicPathGoalData = {
  selectedEmployees: [],
  goalName: '',
  description: '',
  startDate: '',
  endDate: '',
  priority: 'Medium',
  metrics: [],
  weight: 10,
  alignmentScore: 0,
};

export function useMagicPathGoal(onComplete?: () => void) {
  const [currentStep, setCurrentStep] = useState(1);
  const [goalData, setGoalData] = useState<MagicPathGoalData>(initialGoalData);
  const [isLoading, setIsLoading] = useState(false);

  const { data: employeesData, isLoading: employeesLoading } = useEmployees();

  const employees: MagicPathEmployee[] = employeesData?.map(emp => ({
    id: emp.id,
    name: emp.profile ? 
      `${emp.profile.first_name || ''} ${emp.profile.last_name || ''}`.trim() || 
      emp.profile.email : 'Unknown',
    role: emp.job_title || 'Employee',
    department: emp.department?.name,
    avatar: emp.profile?.avatar_url,
    goalCount: 0, // Default to 0, can be updated from backend later
  })) || [];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step);
    }
  };

  const handleEmployeeSelection = (employees: MagicPathEmployee[]) => {
    setGoalData(prev => ({
      ...prev,
      selectedEmployees: employees
    }));
  };

  const handleGoalDetailsChange = (field: keyof MagicPathGoalData, value: string | string[] | number) => {
    setGoalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return goalData.selectedEmployees.length > 0;
      case 2:
        return goalData.goalName.trim() !== '' && goalData.description.trim() !== '';
      case 3:
        return goalData.startDate !== '' && goalData.endDate !== '';
      default:
        return true;
    }
  };

  const createGoal = async () => {
    setIsLoading(true);
    try {
      // Goal creation logic would go here
      console.log('Creating goal:', goalData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentStep(4);
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error creating goal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentStep,
    goalData,
    employees,
    employeesLoading,
    handleNext,
    handleBack,
    goToStep,
    handleEmployeeSelection,
    handleGoalDetailsChange,
    canProceed,
    createGoal,
    isLoading,
  };
}
