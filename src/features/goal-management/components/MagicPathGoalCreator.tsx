import React, { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePermissions } from "@/features/access-control";
import { GoalProgressIndicator } from "./creation/GoalProgressIndicator";
import { GoalBasicsStep } from "./creation/GoalBasicsStep";
import { GoalAssignmentStep } from "./creation/GoalAssignmentStep";
import { GoalSchedulingStep } from "./creation/GoalSchedulingStep";
import { GoalReviewStep } from "./creation/GoalReviewStep";
import { GoalNavigationButtons } from "./creation/GoalNavigationButtons";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { DemoModeBanner } from "@/components/ui/demo-mode-banner";

interface GoalData {
  title: string;
  description: string;
  selectedEmployees: any[];
  dueDate?: Date;
  priority: string;
}

interface GoalCreationStep {
  title: string;
  subtitle: string;
  fields: string[];
}

interface MagicPathGoalCreatorProps {
  onComplete?: (goalData: GoalData) => void;
}

export function MagicPathGoalCreator({ onComplete }: MagicPathGoalCreatorProps): JSX.Element {
  const [goalData, setGoalData] = useState<GoalData>({
    title: "",
    description: "",
    selectedEmployees: [],
    dueDate: undefined,
    priority: "Medium",
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const { canManageGoals } = usePermissions();
  const { isDemoMode } = useDemoMode();
  const navigate = useNavigate();

  const steps: GoalCreationStep[] = [
    {
      title: "Select Employees",
      subtitle: "Choose team members who will work on this goal",
      fields: ["selectedEmployees"],
    },
    {
      title: "Goal Details",
      subtitle: "Define the goal title and description",
      fields: ["title", "description"],
    },
    {
      title: "Schedule & Priority",
      subtitle: "Set optional due date and priority level",
      fields: ["dueDate", "priority"],
    },
    {
      title: "Review & Submit",
      subtitle: "Verify details and submit for approval",
      fields: [],
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep === 0) {
      navigate(-1);
      return;
    }
    setCurrentStep(currentStep - 1);
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  const handleComplete = async () => {
    if (isCreating) return;
    
    if (!canManageGoals) {
      toast.error("You don't have permission to create goals");
      return;
    }

    setIsCreating(true);
    
    if (isDemoMode) {
      toast.success("Demo mode: goal created");
      onComplete?.(goalData);
      setIsCreating(false);
      return;
    }
    
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("User not authenticated");
        return;
      }

      const { data: employeeInfo, error: employeeError } = await supabase
        .from("employee_info")
        .select("id, organization_id")
        .eq("user_id", user.id)
        .single();

      if (employeeError || !employeeInfo) {
        toast.error("Failed to load profile information");
        return;
      }

      const startDate = new Date().toISOString().split("T")[0];
      const dueDate = goalData.dueDate ? new Date(goalData.dueDate).toISOString().split("T")[0] : startDate;

      const { data: goal, error: goalError } = await supabase
        .from("goals")
        .insert({
          created_by: employeeInfo.id,
          organization_id: employeeInfo.organization_id,
          title: goalData.title,
          description: goalData.description || null,
          start_date: startDate,
          due_date: dueDate,
          priority: goalData.priority,
          status: "active",
          progress: 0,
        })
        .select()
        .single();

      if (goalError || !goal) {
        throw goalError || new Error("Goal insertion failed");
      }

      if (goalData.selectedEmployees.length > 0) {
        const assignments = goalData.selectedEmployees.map((emp) => ({
          goal_id: goal.id,
          employee_id: emp.id,
          assigned_by: employeeInfo.id,
          assigned_at: new Date().toISOString(),
        }));

        const { error: assignmentError } = await supabase
          .from("goal_assignments")
          .insert(assignments);

        if (assignmentError) {
          // Cleanup: delete the created goal to avoid orphaned records
          await supabase.from("goals").delete().eq("id", goal.id);
          throw assignmentError;
        }
      }

      toast.success("Goal created successfully!");
      onComplete?.(goalData);
      navigate("/manager/team/goals");
    } catch (error) {
      console.error("Error creating goal:", error);
      toast.error("Failed to create goal");
    } finally {
      setIsCreating(false);
    }
  };

  const isStepComplete = (stepIndex: number) => {
    const step = steps[stepIndex];
    
    // Review step is always complete (no validation needed)
    if (stepIndex === 3) return true;
    
    const isComplete = step.fields.every((field) => {
      // Step 2 (Additional details) - due date and priority are optional
      if (stepIndex === 2 && (field === "dueDate" || field === "priority")) return true;
      if (field === "selectedEmployees") {
        const isValid = goalData.selectedEmployees.length > 0;
        console.log(`Step ${stepIndex} validation - selectedEmployees:`, { 
          value: goalData.selectedEmployees, 
          length: goalData.selectedEmployees.length,
          isValid 
        });
        return isValid;
      }
      const value = goalData[field];
      const isValid = value !== "" && value !== undefined && value !== null;
      console.log(`Step ${stepIndex} validation - ${field}:`, { value, isValid });
      return isValid;
    });
    
    console.log(`Step ${stepIndex} complete:`, isComplete, 'goalData:', goalData);
    return isComplete;
  };

  const canProceed = isStepComplete(currentStep);

  const updateGoalData = <K extends keyof GoalData>(field: K, value: GoalData[K]) => {
    console.log('Updating goal data:', { field, value });
    setGoalData((prev) => {
      const newData = { ...prev, [field]: value };
      console.log('New goal data:', newData);
      return newData;
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <GoalAssignmentStep
            assignee=""
            selectedEmployee={null}
            selectedEmployees={goalData.selectedEmployees}
            onAssigneeChange={() => {}}
            onEmployeeSelect={() => {}}
            onEmployeesSelect={(employees) => {
              console.log('GoalAssignmentStep onEmployeesSelect called:', employees);
              updateGoalData("selectedEmployees", employees);
            }}
          />
        );
      case 1:
        return (
          <GoalBasicsStep
            title={goalData.title}
            description={goalData.description}
            onTitleChange={(value) => updateGoalData("title", value)}
            onDescriptionChange={(value) => updateGoalData("description", value)}
          />
        );
      case 2:
        return (
          <GoalSchedulingStep
            dueDate={goalData.dueDate}
            priority={goalData.priority}
            onDueDateChange={(value) => updateGoalData("dueDate", value)}
            onPriorityChange={(value) => updateGoalData("priority", value)}
          />
        );
      case 3:
        return (
          <GoalReviewStep
            goalData={goalData}
            onEdit={goToStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {isDemoMode && <DemoModeBanner />}
      <GoalProgressIndicator currentStep={currentStep} totalSteps={steps.length} />

      <div className="max-w-3xl mx-auto">{renderStepContent()}</div>

      <div className="max-w-3xl mx-auto">
        <GoalNavigationButtons
          currentStep={currentStep}
          totalSteps={steps.length}
          canProceed={canProceed}
          isLoading={isCreating}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      </div>
    </div>
  );
}
