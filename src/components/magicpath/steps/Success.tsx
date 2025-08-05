import React from "react";
import { CheckCircle } from "lucide-react";

import type { MagicPathGoalData } from "../types";

interface SuccessProps {
  goalData: MagicPathGoalData;
}

export const Success = ({ goalData }: SuccessProps) => {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Goal Created Successfully!</h2>
      <p className="text-muted-foreground mb-6">
        Your goal has been created and assigned to {goalData.selectedEmployees.length} team member{goalData.selectedEmployees.length !== 1 ? "s" : ""}.
      </p>
    </div>
  );
};

export default Success;
