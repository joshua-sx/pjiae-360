import React from 'react';
import { TooltipProvider } from "@/components/ui/tooltip";
import AppraisalHeader from '../AppraisalHeader';
import { UserNotFoundMessage } from '../../auth/UserNotFoundMessage';

const steps = [
  { id: 1, title: "Assign Appraisers", description: "Select Primary & Secondary Appraisers" },
  { id: 2, title: "Goals", description: "Grade Performance Goals" },
  { id: 3, title: "Competencies", description: "Grade Core Competencies" },
  { id: 4, title: "Review & Sign-Off", description: "Calculate & Review Overall Rating" }
];

export function AuthGuard() {
  return (
    <TooltipProvider>
      <div className="space-y-8">
        <div className="max-w-3xl mx-auto">
          <AppraisalHeader 
            currentStep={0}
            steps={steps}
            employee={null}
          />
        </div>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <UserNotFoundMessage />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}