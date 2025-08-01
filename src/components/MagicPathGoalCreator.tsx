import React, { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GoalProgressIndicator } from "./goals/creation/GoalProgressIndicator";
import { GoalBasicsStep } from "./goals/creation/GoalBasicsStep";
import { GoalAssignmentStep } from "./goals/creation/GoalAssignmentStep";
import { GoalSchedulingStep } from "./goals/creation/GoalSchedulingStep";
import { GoalNavigationButtons } from "./goals/creation/GoalNavigationButtons";
import { GoalData, GoalCreationStep } from "./goals/creation/types";

interface MagicPathGoalCreatorProps {
  onComplete?: (goalData: GoalData) => void;
}

export function MagicPathGoalCreator({ onComplete }: MagicPathGoalCreatorProps): JSX.Element {
  const [goalData, setGoalData] = useState<GoalData>({
    title: "",
    description: "",
    assignee: "",
    selectedEmployee: null,
    selectedEmployees: [],
    dueDate: undefined,
    priority: "Medium",
  });

  const [currentStep, setCurrentStep] = useState(0);

  const steps: GoalCreationStep[] = [
    {
      title: "Select Employees",
      subtitle: "Choose team members who will work on this goal",
      fields: ["assignee"],
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
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };

  const navigate = useNavigate();

  const handleComplete = async () => {
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
      const dueDate = goalData.dueDate ? goalData.dueDate.toISOString().split("T")[0] : startDate;

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
          throw assignmentError;
        }
      }

      toast.success("Goal created successfully!");
      onComplete?.(goalData);
      navigate("/manager/team/goals");
    } catch (error) {
      console.error("Error creating goal:", error);
      toast.error("Failed to create goal");
    }
  };

  const isStepComplete = (stepIndex: number) => {
    const step = steps[stepIndex];
    return step.fields.every((field) => {
      // Step 2 (Additional details) - due date and priority are optional
      if (stepIndex === 2 && (field === "dueDate" || field === "priority")) return true;
      if (field === "assignee") return goalData.selectedEmployees.length > 0;
      return goalData[field] !== "";
    });
  };

  const canProceed = isStepComplete(currentStep);

  const updateGoalData = <K extends keyof GoalData>(field: K, value: GoalData[K]) => {
    setGoalData((prev) => ({ ...prev, [field]: value }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <GoalAssignmentStep
            assignee={goalData.assignee}
            selectedEmployee={goalData.selectedEmployee}
            selectedEmployees={goalData.selectedEmployees}
            onAssigneeChange={(value) => updateGoalData("assignee", value)}
            onEmployeeSelect={(employee) => updateGoalData("selectedEmployee", employee)}
            onEmployeesSelect={(employees) => updateGoalData("selectedEmployees", employees)}
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
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <GoalProgressIndicator currentStep={currentStep} totalSteps={steps.length} />

      <div className="max-w-3xl mx-auto">{renderStepContent()}</div>

      <div className="max-w-3xl mx-auto">
        <GoalNavigationButtons
          currentStep={currentStep}
          totalSteps={steps.length}
          canProceed={canProceed}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      </div>
    </div>
  );
}
