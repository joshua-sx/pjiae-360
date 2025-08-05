import { useState } from "react";

import { useOptimizedEmployees } from "./useOptimizedEmployees";
import { useAuth } from "./useAuth";
import { useCurrentOrganization } from "./useCurrentOrganization";
import { useToast } from "./use-toast";
import { supabase } from "@/integrations/supabase/client";
import type {
  MagicPathEmployee,
  MagicPathGoalData,
  MagicPathGoalCreatorProps,
} from "@/components/magicpath/types";

const initialGoalData: MagicPathGoalData = {
  selectedEmployees: [],
  goalName: "",
  description: "",
  startDate: "",
  endDate: "",
  priority: "Medium",
  metrics: [],
};

export const useMagicPathGoal = (
  onComplete?: MagicPathGoalCreatorProps["onComplete"],
) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [goalData, setGoalData] = useState<MagicPathGoalData>(initialGoalData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: employees = [], isLoading: employeesLoading } =
    useOptimizedEmployees();
  const { user } = useAuth();
  const organization = useCurrentOrganization();
  const { toast } = useToast();

  const magicPathEmployees: MagicPathEmployee[] = employees.map((emp) => ({
    id: emp.id,
    name:
      `${emp.profile?.first_name || ""} ${emp.profile?.last_name || ""}`.trim() ||
      "Unknown",
    role: emp.job_title || "No Role",
    department: emp.department?.name || "No Department",
    avatar: emp.profile?.avatar_url || undefined,
  }));

  const handleEmployeeSelection = (selected: MagicPathEmployee[]) => {
    setGoalData((prev) => ({ ...prev, selectedEmployees: selected }));
  };

  const handleGoalDetailsChange = (
    field: keyof MagicPathGoalData,
    value: string | string[],
  ) => {
    setGoalData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => setCurrentStep((s) => s + 1);
  const handleBack = () => setCurrentStep((s) => Math.max(1, s - 1));

  const canProceed = () => {
    if (currentStep === 1) {
      return goalData.selectedEmployees.length > 0;
    }
    if (currentStep === 2) {
      return goalData.goalName.trim() !== "" && goalData.description.trim() !== "";
    }
    return true;
  };

  const createGoal = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!user?.id || !organization?.id) {
        throw new Error("User not authenticated or organization not found");
      }

      const { data: goal, error: goalError } = await supabase
        .from("goals")
        .insert({
          title: goalData.goalName,
          description: goalData.description,
          start_date: goalData.startDate,
          due_date: goalData.endDate || goalData.startDate,
          priority: goalData.priority.toLowerCase(),
          status: "active",
          progress: 0,
          created_by: user.id,
          organization_id: organization.id,
          year: new Date().getFullYear(),
          type: "team_goal",
        })
        .select()
        .single();

      if (goalError) throw goalError;

      if (goal && goalData.selectedEmployees.length > 0) {
        const assignments = goalData.selectedEmployees.map((emp) => ({
          goal_id: goal.id,
          employee_id: emp.id,
          assigned_by: user.id,
        }));
        const { error: assignmentError } = await supabase
          .from("goal_assignments")
          .insert(assignments);
        if (assignmentError) throw assignmentError;
      }

      setCurrentStep(4);
      toast({
        title: "Goal Created Successfully!",
        description: `Created "${goalData.goalName}" with ${goalData.selectedEmployees.length} team members.`,
      });
      setTimeout(() => {
        onComplete?.(goalData);
      }, 2000);
    } catch (e) {
      setError("There was a problem creating the goal.");
      toast({
        title: "Error Creating Goal",
        description: "There was a problem creating the goal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentStep,
    goalData,
    employees: magicPathEmployees,
    employeesLoading,
    isLoading,
    error,
    handleNext,
    handleBack,
    handleEmployeeSelection,
    handleGoalDetailsChange,
    canProceed,
    createGoal,
  };
};

export default useMagicPathGoal;
