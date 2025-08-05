import React from "react";
import { Users, Calendar, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

import type { MagicPathGoalData } from "../types";

interface ReviewProps {
  goalData: MagicPathGoalData;
}

export const Review = ({ goalData }: ReviewProps) => {
  return (
    <div className="space-y-6">
      <div className="bg-background/50 backdrop-blur-sm rounded-xl p-6 border border-border/30 shadow-sm">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-foreground leading-tight">
            {goalData.goalName}
          </h3>
          <p className="text-muted-foreground text-base leading-relaxed">
            {goalData.description}
          </p>
        </div>
      </div>

      <div className="bg-background/50 backdrop-blur-sm rounded-xl p-6 border border-border/30 shadow-sm">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <h4 className="font-semibold text-foreground">Assigned Team Members</h4>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {goalData.selectedEmployees.length}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goalData.selectedEmployees.map((employee) => (
            <div
              key={employee.id}
              className="flex items-center space-x-3 p-4 bg-background/70 rounded-lg border border-border/30"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">
                  {employee.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground text-sm truncate">
                  {employee.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {employee.role}
                </p>
                <p className="text-xs text-primary font-medium">
                  {employee.department}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {goalData.metrics.filter((m) => m.trim()).length > 0 && (
        <div className="bg-background/50 backdrop-blur-sm rounded-xl p-6 border border-border/30 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            <h4 className="font-semibold text-foreground">Success Metrics</h4>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
              {goalData.metrics.filter((m) => m.trim()).length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {goalData.metrics
              .filter((m) => m.trim())
              .map((metric, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-background/70 rounded-lg border border-border/30"
                >
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-xs font-bold text-primary">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {metric}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-background/50 backdrop-blur-sm rounded-xl p-6 border border-border/30 shadow-sm text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar className="h-6 w-6 text-green-600" />
          </div>
          <h4 className="font-semibold text-foreground mb-1">Due Date</h4>
          <p className="text-lg font-bold text-primary mb-1">
            {goalData.startDate
              ? new Date(goalData.startDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Immediately"}
          </p>
          <p className="text-sm text-muted-foreground">
            {goalData.startDate ? "Target date" : "Due now"}
          </p>
        </div>

        <div className="bg-background/50 backdrop-blur-sm rounded-xl p-6 border border-border/30 shadow-sm text-center">
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3",
              goalData.priority === "High" && "bg-red-100",
              goalData.priority === "Medium" && "bg-yellow-100",
              goalData.priority === "Low" && "bg-green-100"
            )}
          >
            <div
              className={cn(
                "w-3 h-3 rounded-full",
                goalData.priority === "High" && "bg-red-500",
                goalData.priority === "Medium" && "bg-yellow-500",
                goalData.priority === "Low" && "bg-green-500"
              )}
            />
          </div>
          <h4 className="font-semibold text-foreground mb-1">Priority Level</h4>
          <p className="text-lg font-bold text-primary mb-1">
            {goalData.priority}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Review;
