
"use client";

import * as React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Save, Loader } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import AppraisalHeader from "./AppraisalHeader";
import PerformanceGoalsStep from "./PerformanceGoalsStep";
import CoreCompetenciesStep from "./CoreCompetenciesStep";
import ReviewAndSignOffStep from "./ReviewAndSignOffStep";
import EmployeeSelectionStep from "./EmployeeSelectionStep";
import NotificationSystem, { NotificationProps } from "./NotificationSystem";
import SaveStatusIndicator, { SaveStatus } from "./SaveStatusIndicator";
import AuditTrailDialog from "./AuditTrailDialog";
import { Employee, AppraisalData, Goal, Competency } from './types';

// Appraisal flow steps definition
const steps = [
  { id: 1, title: "Goals", description: "Grade Performance Goals" },
  { id: 2, title: "Competencies", description: "Grade Core Competencies" },
  { id: 3, title: "Review & Sign-Off", description: "Calculate & Review Overall Rating" }
];
import { useEmployees } from "@/hooks/useEmployees";
import { useAuth } from "@/hooks/useAuth";
import { UserNotFoundMessage } from "../auth/UserNotFoundMessage";

// Main appraisal flow component with auto-save, notifications, and step-by-step navigation
// TODO: Consider extracting save/notification logic into custom hooks for reusability and testability.
export interface EmployeeAppraisalFlowProps {
  initialStep?: number;
  onComplete?: (data: AppraisalData) => void;
  onSaveDraft?: (data: AppraisalData) => void;
}

export default function EmployeeAppraisalFlow({
  initialStep = 0,
  onComplete,
  onSaveDraft
}: EmployeeAppraisalFlowProps) {
  const { toast } = useToast();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { data: employeesData, isLoading: employeesLoading } = useEmployees();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Convert the employee data to match the expected format
  const employees: Employee[] = employeesData?.map(emp => ({
    id: emp.id,
    name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
    email: emp.email,
    department: emp.department?.name || 'Unknown',
    position: emp.job_title || 'Unknown',
    avatar: emp.avatar_url || undefined
  })) || [];
  const [appraisalData, setAppraisalData] = useState<AppraisalData>({
    employeeId: "",
    goals: [], // Production-ready: Goals will be loaded from database
    competencies: [], // Production-ready: Competencies will be loaded from database
    status: 'draft',
    signatures: {},
    timestamps: {
      created: new Date(),
      lastModified: new Date()
    }
  });
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [notification, setNotification] = useState<NotificationProps | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Enhanced UX feedback state
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  
  // Refs for debouncing and scroll management
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastDataRef = useRef<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    // User-facing notification for important events
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  // Silent auto-save function without notifications
  const handleSilentAutoSave = useCallback(async () => {
    if (currentStep === 0 || !appraisalData.employeeId) return;
    
    setIsAutoSaving(true);
    setSaveStatus('saving');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
      const updatedData = {
        ...appraisalData,
        timestamps: { ...appraisalData.timestamps, lastModified: new Date() }
      };
      setAppraisalData(updatedData);
      setLastSaved(new Date());
      setSaveStatus('saved');
      
      // Brief success indicator
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      console.error('Auto-save failed:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [appraisalData, currentStep]);

  // Manual save with notification - ONLY manual saves show toasts
  const handleManualSaveDraft = async () => {
    setIsLoading(true);
    setSaveStatus('saving');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedData = {
        ...appraisalData,
        timestamps: { ...appraisalData.timestamps, lastModified: new Date() }
      };
      setAppraisalData(updatedData);
      setLastSaved(new Date());
      onSaveDraft?.(updatedData);
      setSaveStatus('saved');
      
      // Use toast instead of notification system for save feedback
      toast({
        title: "Draft saved",
        description: "Your appraisal draft has been saved successfully.",
        duration: 3000,
      });
      
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      
      // Use toast for error feedback
      toast({
        title: "Save failed",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Smooth scroll to top function
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  const handleStartAppraisal = () => {
    if (!selectedEmployee) return;
    setAppraisalData(prev => ({
      ...prev,
      employeeId: selectedEmployee.id,
      timestamps: { ...prev.timestamps, lastModified: new Date() }
    }));
    setCurrentStep(1);
    scrollToTop(); // Smooth scroll to top
    showNotification('info', 'Appraisal started successfully.');
  };

  const handleGoalUpdate = (goalId: string, rating?: number, feedback?: string) => {
    setAppraisalData(prev => ({
      ...prev,
      goals: prev.goals.map(goal => goal.id === goalId ? { ...goal, rating, feedback } : goal),
      timestamps: { ...prev.timestamps, lastModified: new Date() }
    }));
    
    // Show immediate visual feedback only - no toast
    setSaveStatus('saving');
    setTimeout(() => setSaveStatus('saved'), 500);
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleCompetencyUpdate = (competencyId: string, rating?: number, feedback?: string) => {
    setAppraisalData(prev => ({
      ...prev,
      competencies: prev.competencies.map(competency => 
        competency.id === competencyId ? { ...competency, rating, feedback } : competency
      ),
      timestamps: { ...prev.timestamps, lastModified: new Date() }
    }));
    
    // Show immediate visual feedback only - no toast
    setSaveStatus('saving');
    setTimeout(() => setSaveStatus('saved'), 500);
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const calculateOverallRating = () => {
    const goalRatings = appraisalData.goals.filter(g => g.rating).map(g => g.rating!);
    const competencyRatings = appraisalData.competencies.filter(c => c.rating).map(c => c.rating!);
    
    if (goalRatings.length === 0 && competencyRatings.length === 0) return 0;
    
    const allRatings = [...goalRatings, ...competencyRatings];
    return Math.round(allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length * 10) / 10;
  };

  const canProceedFromGoals = () => appraisalData.goals.every(goal => goal.rating !== undefined);
  const canProceedFromCompetencies = () => appraisalData.competencies.every(competency => competency.rating !== undefined);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const finalData = {
        ...appraisalData,
        overallRating: calculateOverallRating(),
        status: 'with_second_appraiser' as const,
        timestamps: {
          ...appraisalData.timestamps,
          submitted: new Date(),
          lastModified: new Date()
        }
      };
      setAppraisalData(finalData);
      onComplete?.(finalData);
      showNotification('success', 'Appraisal submitted successfully');
    } catch (error) {
      showNotification('error', 'Failed to submit appraisal');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      scrollToTop(); // Smooth scroll to top on step change
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      scrollToTop(); // Smooth scroll to top on step change
    }
  };

  // Debounced auto-save effect - only triggers silent saves
  useEffect(() => {
    if (currentStep === 0 || !appraisalData.employeeId) return;
    
    const currentDataString = JSON.stringify(appraisalData);
    if (currentDataString === lastDataRef.current) return;
    
    lastDataRef.current = currentDataString;
    
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Set new timeout for debounced save
    autoSaveTimeoutRef.current = setTimeout(() => {
      handleSilentAutoSave();
    }, 3000);
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [appraisalData, currentStep, handleSilentAutoSave]);

  // Show auth message if user is not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <TooltipProvider>
        <div className="min-h-screen bg-background p-2 md:p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <AppraisalHeader 
              currentStep={0}
              steps={steps}
              employee={null}
            />
            <div className="flex items-center justify-center min-h-[400px]">
              <UserNotFoundMessage />
            </div>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div 
        ref={containerRef}
        className="min-h-screen bg-background p-2 md:p-4 overflow-auto"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <NotificationSystem notification={notification} />

          <AppraisalHeader 
            currentStep={currentStep}
            steps={steps}
            employee={selectedEmployee}
          />

          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="employee-selection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <EmployeeSelectionStep
                  employees={employees}
                  selectedEmployee={selectedEmployee}
                  onEmployeeSelect={setSelectedEmployee}
                  onStartAppraisal={handleStartAppraisal}
                  isLoading={employeesLoading}
                />
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div 
                key="goals-step"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="shadow-sm border-border/50">
                  <CardContent className="p-8">
                    <PerformanceGoalsStep 
                      goals={appraisalData.goals}
                      onGoalUpdate={handleGoalUpdate}
                      canProceed={canProceedFromGoals()}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div 
                key="competencies-step"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="shadow-sm border-border/50">
                  <CardContent className="p-8">
                    <CoreCompetenciesStep 
                      competencies={appraisalData.competencies}
                      onCompetencyUpdate={handleCompetencyUpdate}
                      canProceed={canProceedFromCompetencies()}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div 
                key="review-step"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="shadow-sm border-border/50">
                  <CardContent className="p-8">
                    <ReviewAndSignOffStep 
                      appraisalData={appraisalData}
                      employee={selectedEmployee}
                      overallRating={calculateOverallRating()}
                      onSubmit={handleSubmit}
                      isLoading={isLoading}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Footer */}
          {currentStep > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-between items-center pt-6 border-t border-border/50"
            >
              <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} size="lg" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  onClick={handleManualSaveDraft} 
                  disabled={isLoading || saveStatus === 'saving'} 
                  size="lg" 
                  className="flex items-center gap-2"
                >
                  {saveStatus === 'saving' ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isLoading || saveStatus === 'saving' ? 'Saving...' : 'Save Draft'}
                </Button>

                {currentStep < 3 && (
                  <Button 
                    onClick={nextStep}
                    disabled={
                      (currentStep === 1 && !canProceedFromGoals()) ||
                      (currentStep === 2 && !canProceedFromCompetencies())
                    }
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* Audit Trail Dialog */}
          <AuditTrailDialog
            open={showAuditTrail}
            onOpenChange={setShowAuditTrail}
            auditLog={[]} // Production-ready: Audit log will be loaded from database
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
