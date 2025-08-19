
"use client";

import React from "react";
import { useEmployees } from "@/hooks/useEmployees";
import { useAuth } from "@/hooks/useAuth";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { useAppraisalFlow } from "@/features/appraisals/hooks/useAppraisalFlow";
import { useAutoSave } from "@/features/appraisals/hooks/useAutoSave";
import { Employee } from './types';
import AppraisalHeader from "./AppraisalHeader";
import { 
  AppraisalFlowLayout, 
  AppraisalSteps, 
  AppraisalNavigation, 
  AppraisalModals,
  AuthGuard 
} from './layout';
import { DemoModeBanner } from "@/components/ui/demo-mode-banner";

export interface EmployeeAppraisalFlowProps {
  initialStep?: number;
  onComplete?: (data: any) => void;
  onSaveDraft?: (data: any) => void;
}

export default function EmployeeAppraisalFlow({
  initialStep = 0,
  onComplete,
  onSaveDraft
}: EmployeeAppraisalFlowProps) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { isDemoMode } = useDemoMode();
  const { data: employeesData, isLoading: employeesLoading } = useEmployees();
  
  const { state, dispatch, steps, actions } = useAppraisalFlow(initialStep);
  const { saveStatus, handleManualSave } = useAutoSave(state.appraisalData, state.currentStep > 0, onSaveDraft);

  // Convert employee data
  const employees: Employee[] = employeesData?.map(emp => ({
    id: emp.id,
    name: emp.profile?.first_name && emp.profile?.last_name 
      ? `${emp.profile.first_name} ${emp.profile.last_name}`.trim()
      : emp.profile?.email || emp.employee_number || 'Unknown',
    email: emp.profile?.email || '',
    department: emp.department?.name || 'Unknown',
    position: emp.job_title || 'Unknown',
    avatar: emp.profile?.avatar_url || undefined
  })) || [];

  // Auth guard
  if (!authLoading && !isAuthenticated) {
    return <AuthGuard />;
  }

  return (
    <AppraisalFlowLayout
      isDemoMode={isDemoMode}
      notification={state.ui.notification}
    >
      {isDemoMode && <DemoModeBanner />}
      
      <AppraisalHeader
        currentStep={state.currentStep}
        steps={steps}
        employee={state.selectedEmployee}
      />

      <AppraisalSteps
        currentStep={state.currentStep}
        selectedEmployee={state.selectedEmployee}
        appraisalData={state.appraisalData}
        assignedAppraisers={state.assignedAppraisers}
        employees={employees}
        employeesLoading={employeesLoading}
        isLoading={state.ui.isLoading}
        onEmployeeSelect={(emp) => dispatch({ type: 'SET_EMPLOYEE', payload: emp })}
        onStartAppraisal={() => state.selectedEmployee && actions.startAppraisal(state.selectedEmployee)}
        onAppraiserAssignment={() => dispatch({ type: 'SET_UI_STATE', payload: { showAppraiserModal: true } })}
        onGoalUpdate={actions.updateGoal}
        onCompetencyUpdate={actions.updateCompetency}
        onSubmit={() => actions.handleSubmit(onComplete)}
        canProceedFromAppraisers={actions.canProceedFromAppraisers}
        canProceedFromGoals={actions.canProceedFromGoals}
        canProceedFromCompetencies={actions.canProceedFromCompetencies}
        calculateOverallRating={actions.calculateOverallRating}
      />

      <AppraisalNavigation
        currentStep={state.currentStep}
        canProceed={actions.canProceedFromCurrentStep()}
        isLoading={state.ui.isLoading}
        saveStatus={saveStatus}
        onPrevStep={actions.prevStep}
        onNextStep={actions.nextStep}
        onSaveDraft={handleManualSave}
      />

      <AppraisalModals
        showAppraiserModal={state.ui.showAppraiserModal}
        showAuditTrail={state.ui.showAuditTrail}
        selectedEmployee={state.selectedEmployee}
        appraisalId={state.currentAppraisalId}
        onAppraiserModalChange={(open) =>
          dispatch({ type: 'SET_UI_STATE', payload: { showAppraiserModal: open } })
        }
        onAuditTrailChange={(open) =>
          dispatch({ type: 'SET_UI_STATE', payload: { showAuditTrail: open } })
        }
        onAppraiserAssignmentComplete={actions.handleAppraiserAssignmentComplete}
      />
    </AppraisalFlowLayout>
  );
}
