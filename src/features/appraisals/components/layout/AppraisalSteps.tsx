import React from 'react';
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Employee, AppraisalData } from '../types';
import { StepWrapper } from './StepWrapper';
import EmployeeSelectionStep from '../EmployeeSelectionStep';
import PerformanceGoalsStep from '../PerformanceGoalsStep';
import CoreCompetenciesStep from '../CoreCompetenciesStep';
import ReviewAndSignOffStep from '../ReviewAndSignOffStep';
import AssignAppraisersInline from '../AssignAppraisersInline';
import { useScrollToTop } from '@/hooks/useScrollToTop';
interface AppraisalStepsProps {
  currentStep: number;
  selectedEmployee: Employee | null;
  appraisalData: AppraisalData;
  appraisalId: string | null;
  assignedAppraisers: any[];
  employees: Employee[];
  employeesLoading: boolean;
  isLoading: boolean;
  onEmployeeSelect: (employee: Employee) => void;
  onStartAppraisal: () => void;
  onAppraiserAssignment: () => void;
  onAppraiserAssignmentComplete: (assignments?: any[]) => void;
  onGoalUpdate: (goalId: string, rating?: number, feedback?: string) => void;
  onCompetencyUpdate: (competencyId: string, rating?: number, feedback?: string) => void;
  onSubmit: () => void;
  canProceedFromAppraisers: () => boolean;
  canProceedFromGoals: () => boolean;
  canProceedFromCompetencies: () => boolean;
  calculateOverallRating: () => number;
}
export function AppraisalSteps({
  currentStep,
  selectedEmployee,
  appraisalData,
  appraisalId,
  assignedAppraisers,
  employees,
  employeesLoading,
  isLoading,
  onEmployeeSelect,
  onStartAppraisal,
  onAppraiserAssignment,
  onAppraiserAssignmentComplete,
  onGoalUpdate,
  onCompetencyUpdate,
  onSubmit,
  canProceedFromAppraisers,
  canProceedFromGoals,
  canProceedFromCompetencies,
  calculateOverallRating
}: AppraisalStepsProps) {
  useScrollToTop(currentStep);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepWrapper stepKey="employee-selection">
            <EmployeeSelectionStep 
              employees={employees} 
              selectedEmployee={selectedEmployee} 
              onEmployeeSelect={onEmployeeSelect} 
              onStartAppraisal={onStartAppraisal} 
              isLoading={employeesLoading} 
            />
          </StepWrapper>
        );
      case 1:
        return (
          <StepWrapper stepKey="appraiser-assignment">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Assign Appraisers</h2>
                <p className="text-muted-foreground">
                  Select primary and secondary appraisers for {selectedEmployee?.name}'s performance review.
                </p>
              </div>
              
              <AssignAppraisersInline
                employee={selectedEmployee}
                appraisalId={appraisalId}
                assignedAppraisers={assignedAppraisers}
                employees={employees}
                onAssignmentComplete={onAppraiserAssignmentComplete}
              />
            </div>
          </StepWrapper>
        );
      case 2:
        return (
          <StepWrapper stepKey="goals-step">
            <PerformanceGoalsStep 
              goals={appraisalData.goals} 
              onGoalUpdate={onGoalUpdate} 
              canProceed={canProceedFromGoals()} 
            />
          </StepWrapper>
        );
      case 3:
        return (
          <StepWrapper stepKey="competencies-step">
            <CoreCompetenciesStep 
              competencies={appraisalData.competencies} 
              onCompetencyUpdate={onCompetencyUpdate} 
              canProceed={canProceedFromCompetencies()} 
            />
          </StepWrapper>
        );
      case 4:
        return (
          <StepWrapper stepKey="review-step">
            <ReviewAndSignOffStep 
              appraisalData={appraisalData} 
              appraisalId={appraisalId} 
              employee={selectedEmployee} 
              overallRating={calculateOverallRating()} 
              onSubmit={onSubmit} 
              isLoading={isLoading} 
            />
          </StepWrapper>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {renderCurrentStep()}
      </AnimatePresence>
    </div>
  );
}