import React, { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePermissions } from "@/features/access-control";

// Placeholder components - will be implemented in the goal creation feature
const GoalProgressIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <div className="text-sm text-muted-foreground">Step {currentStep + 1} of {totalSteps}</div>
);

const GoalBasicsStep = ({ title, description, onTitleChange, onDescriptionChange }: any) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Goal Details</h3>
    <input 
      placeholder="Goal title" 
      value={title} 
      onChange={(e) => onTitleChange(e.target.value)}
      className="w-full p-2 border rounded"
    />
    <textarea 
      placeholder="Goal description" 
      value={description} 
      onChange={(e) => onDescriptionChange(e.target.value)}
      className="w-full p-2 border rounded"
    />
  </div>
);

const GoalAssignmentStep = ({ selectedEmployees, onEmployeesSelect }: any) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Select Employees</h3>
    <p>Employee selection - Coming Soon</p>
  </div>
);

const GoalSchedulingStep = ({ dueDate, priority, onDueDateChange, onPriorityChange }: any) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Schedule & Priority</h3>
    <input 
      type="date" 
      value={dueDate} 
      onChange={(e) => onDueDateChange(e.target.value)}
      className="w-full p-2 border rounded"
    />
    <select 
      value={priority} 
      onChange={(e) => onPriorityChange(e.target.value)}
      className="w-full p-2 border rounded"
    >
      <option value="Low">Low</option>
      <option value="Medium">Medium</option>
      <option value="High">High</option>
    </select>
  </div>
);

const GoalNavigationButtons = ({ currentStep, totalSteps, canProceed, isLoading, onPrevious, onNext }: any) => (
  <div className="flex gap-2 justify-between">
    <button 
      onClick={onPrevious} 
      disabled={currentStep === 0}
      className="px-4 py-2 border rounded disabled:opacity-50"
    >
      Previous
    </button>
    <button 
      onClick={onNext} 
      disabled={!canProceed || isLoading}
      className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
    >
      {currentStep === totalSteps - 1 ? 'Complete' : 'Next'}
    </button>
  </div>
);

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
    if (isCreating) return;
    
    if (!canManageGoals) {
      toast.error("You don't have permission to create goals");
      return;
    }

    setIsCreating(true);
    
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
    return step.fields.every((field) => {
      // Step 2 (Additional details) - due date and priority are optional
      if (stepIndex === 2 && (field === "dueDate" || field === "priority")) return true;
      if (field === "selectedEmployees") return goalData.selectedEmployees.length > 0;
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
            assignee=""
            selectedEmployee={null}
            selectedEmployees={goalData.selectedEmployees}
            onAssigneeChange={() => {}}
            onEmployeeSelect={() => {}}
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
          isLoading={isCreating}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      </div>
    </div>
  );
}
