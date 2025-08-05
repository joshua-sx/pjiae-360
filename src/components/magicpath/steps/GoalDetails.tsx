import React from "react";

import GoalDetailsSection from "../GoalDetailsSection";
import type { MagicPathGoalData } from "../types";

interface GoalDetailsProps {
  goalData: MagicPathGoalData;
  onChange: (field: keyof MagicPathGoalData, value: string | string[]) => void;
}

export const GoalDetails = ({ goalData, onChange }: GoalDetailsProps) => {
  return (
    <div className="space-y-8">
      <GoalDetailsSection
        goalData={goalData}
        onGoalDetailsChange={onChange}
        step="details"
      />
      <GoalDetailsSection
        goalData={goalData}
        onGoalDetailsChange={onChange}
        step="timeline"
      />
    </div>
  );
};

export default GoalDetails;
