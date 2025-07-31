import React from 'react';
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Employee, AppraisalData } from '../types';
import { StepWrapper } from './StepWrapper';
import EmployeeSelectionStep from '../EmployeeSelectionStep';
import PerformanceGoalsStep from '../PerformanceGoalsStep';
import CoreCompetenciesStep from '../CoreCompetenciesStep';
import ReviewAndSignOffStep from '../ReviewAndSignOffStep';

interface AppraisalStepsProps {
  currentStep: number;
  selectedEmployee: Employee | null;
  appraisalData: AppraisalData;
  assignedAppraisers: any[];
  employees: Employee[];
  employeesLoading: boolean;
  isLoading: boolean;
  onEmployeeSelect: (employee: Employee) => void;
  onStartAppraisal: () => void;
  onAppraiserAssignment: () => void;
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
  assignedAppraisers,
  employees,
  employeesLoading,
  isLoading,
  onEmployeeSelect,
  onStartAppraisal,
  onAppraiserAssignment,
  onGoalUpdate,
  onCompetencyUpdate,
  onSubmit,
  canProceedFromAppraisers,
  canProceedFromGoals,
  canProceedFromCompetencies,
  calculateOverallRating
}: AppraisalStepsProps) {
  return (
    <AnimatePresence mode="wait">
      {currentStep === 0 && (
        <StepWrapper stepKey="employee-selection">
          <EmployeeSelectionStep
            employees={employees}
            selectedEmployee={selectedEmployee}
            onEmployeeSelect={onEmployeeSelect}
            onStartAppraisal={onStartAppraisal}
            isLoading={employeesLoading}
          />
        </StepWrapper>
      )}

      {currentStep === 1 && (
        <StepWrapper stepKey="appraiser-assignment">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Assign Appraisers</h2>
              <p className="text-muted-foreground">
                Select primary and secondary appraisers for {selectedEmployee?.name}'s performance review.
              </p>
            </div>
            
            {assignedAppraisers.length > 0 ? (
              <div className="space-y-3">
                <h3 className="font-medium">Assigned Appraisers</h3>
                {assignedAppraisers.map((appraiser) => (
                  <div key={appraiser.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="text-sm">
                      <span className="font-medium">
                        {appraiser.appraiser?.profile?.first_name} {appraiser.appraiser?.profile?.last_name}
                      </span>
                      <span className="ml-2 text-muted-foreground">
                        ({appraiser.is_primary ? 'Primary' : 'Secondary'})
                      </span>
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={onAppraiserAssignment}>
                  Reassign Appraisers
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="mb-4">No appraisers assigned yet.</p>
                <Button onClick={() => onAppraiserAssignment()}>
                  Assign Appraisers
                </Button>
              </div>
            )}
          </div>
        </StepWrapper>
      )}

      {currentStep === 2 && (
        <StepWrapper stepKey="goals-step">
          <PerformanceGoalsStep 
            goals={appraisalData.goals}
            onGoalUpdate={onGoalUpdate}
            canProceed={canProceedFromGoals()}
          />
        </StepWrapper>
      )}

      {currentStep === 3 && (
        <StepWrapper stepKey="competencies-step">
          <CoreCompetenciesStep 
            competencies={appraisalData.competencies}
            onCompetencyUpdate={onCompetencyUpdate}
            canProceed={canProceedFromCompetencies()}
          />
        </StepWrapper>
      )}

      {currentStep === 4 && (
        <StepWrapper stepKey="review-step">
          <ReviewAndSignOffStep 
            appraisalData={appraisalData}
            employee={selectedEmployee}
            overallRating={calculateOverallRating()}
            onSubmit={onSubmit}
            isLoading={isLoading}
          />
        </StepWrapper>
      )}
    </AnimatePresence>
  );
}