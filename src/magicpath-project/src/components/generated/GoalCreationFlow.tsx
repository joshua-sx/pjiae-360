import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Target } from 'lucide-react';
import { cn } from '../../lib/utils';
import ProgressIndicator from './ProgressIndicator';
import EmployeeMultiSelectDropdown from './EmployeeMultiSelectDropdown';
import GoalDetailsSection from './GoalDetailsSection';
interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
}
interface GoalData {
  selectedEmployees: Employee[];
  goalName: string;
  description: string;
  startDate: string;
  endDate: string;
  metrics: string[];
}
const mockEmployees: Employee[] = [{
  id: '1',
  name: 'Alex Chen',
  role: 'Senior Developer',
  department: 'Engineering'
}, {
  id: '2',
  name: 'Maria Rodriguez',
  role: 'Team Lead',
  department: 'Operations'
}, {
  id: '3',
  name: 'David Kim',
  role: 'Product Manager',
  department: 'Product'
}, {
  id: '4',
  name: 'Jennifer Walsh',
  role: 'Customer Success',
  department: 'Support'
}, {
  id: '5',
  name: 'Michael Brown',
  role: 'UX Designer',
  department: 'Design'
}, {
  id: '6',
  name: 'Sarah Johnson',
  role: 'Data Analyst',
  department: 'Analytics'
}];
const GoalCreationFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [goalData, setGoalData] = useState<GoalData>({
    selectedEmployees: [],
    goalName: '',
    description: '',
    startDate: '',
    endDate: '',
    metrics: []
  });
  const totalSteps = 3;
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  const handleEmployeeSelection = (employees: Employee[]) => {
    setGoalData(prev => ({
      ...prev,
      selectedEmployees: employees
    }));
  };
  const handleGoalDetailsChange = (field: keyof GoalData, value: any) => {
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
        return false;
    }
  };
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Select Team Members</h2>
                <p className="text-sm text-muted-foreground">Choose employees who will work on this goal</p>
              </div>
            </div>
            <EmployeeMultiSelectDropdown employees={mockEmployees} selectedEmployees={goalData.selectedEmployees} onSelectionChange={handleEmployeeSelection} />
          </div>;
      case 2:
        return <GoalDetailsSection goalData={goalData} onGoalDetailsChange={handleGoalDetailsChange} step="details" />;
      case 3:
        return <GoalDetailsSection goalData={goalData} onGoalDetailsChange={handleGoalDetailsChange} step="timeline" />;
      default:
        return null;
    }
  };
  return <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Create New Goal</h1>
          </div>
          
          <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
        </div>

        {/* Main Content */}
        <div className="bg-card border border-border rounded-lg shadow-sm">
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div key={currentStep} initial={{
              opacity: 0,
              x: 20
            }} animate={{
              opacity: 1,
              x: 0
            }} exit={{
              opacity: 0,
              x: -20
            }} transition={{
              duration: 0.3
            }}>
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="px-8 py-6 border-t border-border bg-muted/30">
            <div className="flex justify-between items-center">
              <button onClick={handleBack} disabled={currentStep === 1} className={cn("flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors", currentStep === 1 ? "text-muted-foreground cursor-not-allowed" : "text-foreground hover:bg-muted")}>
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              <div className="flex space-x-3">
                {currentStep < totalSteps ? <button onClick={handleNext} disabled={!canProceed()} className={cn("flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors", canProceed() ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed")}>
                    <span>Next</span>
                    <ArrowRight className="h-4 w-4" />
                  </button> : <button onClick={() => console.log('Creating goal:', goalData)} disabled={!canProceed()} className={cn("px-6 py-2 rounded-lg font-medium transition-colors", canProceed() ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed")}>
                    Create Goal
                  </button>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default GoalCreationFlow;