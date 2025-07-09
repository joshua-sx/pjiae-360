import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CycleData, defaultCycleData } from "./types";
import { useValidation, ValidationErrors } from "./validation";
import { BasicSetupStep } from "./steps/BasicSetupStep";
import { ReviewPeriodsStep } from "./steps/ReviewPeriodsStep";
import { GoalSettingWindowsStep } from "./steps/GoalSettingWindowsStep";
import { CompetencyStep } from "./steps/CompetencyStep";
import { NotificationsStep } from "./steps/NotificationsStep";
import { PreviewStep } from "./steps/PreviewStep";

interface AppraisalWizardProps {
  initialData?: Partial<CycleData>;
  onComplete: (data: CycleData) => void;
  onSaveDraft: (data: CycleData) => void;
}

const STEPS = [
  { id: 'basic', title: 'Basic Setup', description: 'Configure cycle frequency and timing' },
  { id: 'goalWindows', title: 'Goal Setting', description: 'Define when goals can be set' },
  { id: 'reviewPeriods', title: 'Review Periods', description: 'Schedule review activities' },
  { id: 'competency', title: 'Competencies', description: 'Set evaluation criteria' },
  { id: 'notifications', title: 'Notifications', description: 'Configure alerts and reminders' },
  { id: 'preview', title: 'Preview', description: 'Review your configuration' },
];

export const AppraisalWizard = ({ initialData, onComplete, onSaveDraft }: AppraisalWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [cycleData, setCycleData] = useState<CycleData>(() => ({
    ...defaultCycleData,
    ...initialData,
  }));
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const { validateStep } = useValidation();

  const updateCycleData = useCallback((updates: Partial<CycleData>) => {
    setCycleData(prev => ({ ...prev, ...updates }));
    // Clear validation errors for updated fields
    const newErrors = { ...validationErrors };
    Object.keys(updates).forEach(key => {
      delete newErrors[key];
    });
    setValidationErrors(newErrors);
  }, [validationErrors]);

  const validateCurrentStep = useCallback(() => {
    const stepId = STEPS[currentStep].id;
    const errors = validateStep(stepId, cycleData);
    setValidationErrors(errors || {});
    return !errors;
  }, [currentStep, cycleData, validateStep]);

  const handleNext = useCallback(async () => {
    if (!validateCurrentStep()) {
      toast.error("Please fix the validation errors before continuing");
      return;
    }

    setCompletedSteps(prev => new Set([...prev, currentStep]));

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Final step - complete setup
      setIsLoading(true);
      try {
        const finalErrors = validateStep('complete', cycleData);
        if (finalErrors) {
          setValidationErrors(finalErrors);
          toast.error("Please fix all validation errors before completing setup");
          return;
        }
        await onComplete(cycleData);
        toast.success("Appraisal cycle configuration completed!");
      } catch (error) {
        toast.error("Failed to save configuration");
      } finally {
        setIsLoading(false);
      }
    }
  }, [currentStep, cycleData, validateCurrentStep, validateStep, onComplete]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleSaveDraft = useCallback(async () => {
    setIsLoading(true);
    try {
      await onSaveDraft(cycleData);
      toast.success("Draft saved successfully");
    } catch (error) {
      toast.error("Failed to save draft");
    } finally {
      setIsLoading(false);
    }
  }, [cycleData, onSaveDraft]);

  const renderStepContent = () => {
    const stepId = STEPS[currentStep].id;
    const commonProps = {
      data: cycleData,
      onDataChange: updateCycleData,
      errors: validationErrors,
    };

    switch (stepId) {
      case 'basic':
        return <BasicSetupStep {...commonProps} />;
      case 'goalWindows':
        return <GoalSettingWindowsStep {...commonProps} />;
      case 'reviewPeriods':
        return <ReviewPeriodsStep {...commonProps} />;
      case 'competency':
        return <CompetencyStep {...commonProps} />;
      case 'notifications':
        return <NotificationsStep {...commonProps} />;
      case 'preview':
        return <PreviewStep {...commonProps} />;
      default:
        return null;
    }
  };

  const hasErrors = Object.keys(validationErrors).length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Appraisal Cycle Setup</CardTitle>
              <p className="text-muted-foreground mt-1">
                Step {currentStep + 1} of {STEPS.length}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isLoading}
            >
              Save Draft
            </Button>
          </div>
          
          {/* Step Progress */}
          <div className="mt-6">
            <div className="relative flex items-center justify-between">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center relative z-10">
                  <div className="flex items-center">
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
                        ${index === currentStep 
                          ? 'bg-primary text-primary-foreground scale-110' 
                          : completedSteps.has(index)
                          ? 'bg-green-500 text-white'
                          : 'bg-muted text-muted-foreground'
                        }
                      `}
                    >
                      {completedSteps.has(index) ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    {/* Only show title/description for current step */}
                    {index === currentStep && (
                      <div className="ml-3 hidden sm:block">
                        <p className="text-sm font-medium text-primary">
                          {step.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Progress line that stops at the last step */}
              <div 
                className="absolute top-4 left-4 h-0.5 bg-border hidden sm:block transition-all duration-300"
                style={{
                  width: `calc(${((STEPS.length - 1) / STEPS.length) * 100}% - 0.5rem)`,
                  transform: 'translateX(0.5rem)'
                }}
              />
              {/* Active progress line */}
              <div 
                className="absolute top-4 left-4 h-0.5 bg-primary hidden sm:block transition-all duration-500"
                style={{
                  width: `calc(${(Math.min(currentStep, STEPS.length - 1) / STEPS.length) * 100}% - 0.5rem)`,
                  transform: 'translateX(0.5rem)'
                }}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Validation Errors Alert */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix the following errors:
            <ul className="mt-2 list-disc list-inside">
              {Object.entries(validationErrors).map(([field, errors]) => (
                <li key={field}>
                  <span className="font-medium">{field}:</span> {errors.join(', ')}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {STEPS[currentStep].title}
            <Badge variant="outline">
              Step {currentStep + 1}
            </Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            {STEPS[currentStep].description}
          </p>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {currentStep + 1} of {STEPS.length}
              </span>
              <Button
                onClick={handleNext}
                disabled={isLoading}
              >
                {currentStep === STEPS.length - 1 ? (
                  isLoading ? 'Completing...' : 'Complete Setup'
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};