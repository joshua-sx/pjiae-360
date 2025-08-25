import React, { useState } from "react";
import { Eye, Users, Target, Calendar, Weight, CheckCircle, Edit, AlertTriangle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { MagicPathGoalData } from "../types";

interface ReviewProps {
  goalData: MagicPathGoalData;
  isSubmitting?: boolean;
  onSubmit?: () => void;
  onGoToStep?: (step: number) => void;
}

export const Review = ({ goalData, isSubmitting = false, onSubmit, onGoToStep }: ReviewProps) => {
  const getGoalStatusColor = (goalCount: number) => {
    if (goalCount < 2) return 'text-amber-700 bg-amber-50 border-amber-200';
    if (goalCount < 5) return 'text-blue-700 bg-blue-50 border-blue-200';
    return 'text-muted-foreground bg-muted border-border';
  };

  const getProgressPercentage = (goalCount: number) => {
    return Math.min(goalCount / 5 * 100, 100);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-6">
          <Eye className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-3xl font-medium text-foreground mb-2">
          Preview & Confirmation
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Review all details before submitting for approval
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Goal Details */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-lg">Goal Details</CardTitle>
                </div>
                {onGoToStep && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onGoToStep(2)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Title
                </label>
                <p className="text-foreground font-medium mt-2">
                  {goalData.goalName || 'Untitled Goal'}
                </p>
              </div>
              
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Description
                </label>
                <p className="text-foreground mt-2 leading-relaxed">
                  {goalData.description || 'No description provided'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Weight
                  </label>
                  <div className="flex items-center mt-2">
                    <div className="w-6 h-6 bg-primary rounded flex items-center justify-center mr-3">
                      <Weight className="w-3 h-3 text-primary-foreground" />
                    </div>
                    <span className="text-foreground font-medium">
                      {goalData.weight}%
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Due Date
                  </label>
                  <div className="flex items-center mt-2">
                    <div className="w-6 h-6 bg-primary rounded flex items-center justify-center mr-3">
                      <Calendar className="w-3 h-3 text-primary-foreground" />
                    </div>
                    <span className="text-foreground font-medium">
                      {formatDate(goalData.endDate)}
                    </span>
                  </div>
                </div>
              </div>
              
              {goalData.selectedEmployees.length > 0 && goalData.selectedEmployees[0].department && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Department
                  </label>
                  <p className="text-foreground font-medium mt-2">
                    {goalData.selectedEmployees[0].department}
                  </p>
                </div>
              )}
              
              {goalData.metrics.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Success Metrics
                  </label>
                  <div className="bg-muted border border-border rounded-lg p-4 mt-2">
                    <ul className="space-y-2">
                      {goalData.metrics.map((metric, index) => (
                        <li key={index} className="text-foreground">
                          • {metric}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Assigned Employees */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-lg">
                    Assigned Employees ({goalData.selectedEmployees.length})
                  </CardTitle>
                </div>
                <div className="text-xs text-muted-foreground flex items-center font-medium">
                  <Target className="w-3 h-3 mr-1" />
                  Goal Progress
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {goalData.selectedEmployees.map(employee => (
                  <div key={employee.id} className="p-4 border border-border rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/80 rounded-lg flex items-center justify-center text-primary-foreground font-medium text-sm">
                          {getInitials(employee.name)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground leading-tight">
                            {employee.name}
                          </p>
                          <p className="text-muted-foreground text-sm mt-1">
                            {employee.role}
                          </p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-xs font-medium border ${getGoalStatusColor((employee.goalCount || 0) + 1)}`}>
                        {(employee.goalCount || 0) + 1}/5 goals
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-muted-foreground">
                          Goal Progress
                        </span>
                        <span className="text-xs font-medium text-foreground">
                          {Math.round(getProgressPercentage((employee.goalCount || 0) + 1))}%
                        </span>
                      </div>
                      <div className="w-full bg-border rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300 bg-primary" 
                          style={{
                            width: `${getProgressPercentage((employee.goalCount || 0) + 1)}%`
                          }} 
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Progress after this goal assignment
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Approval Workflow */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-primary-foreground" />
                </div>
                <CardTitle className="text-lg">Approval Workflow</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-primary-foreground font-medium text-sm">1</span>
                      </div>
                      <span className="font-medium text-foreground">
                        Department Manager
                      </span>
                    </div>
                    <div className="w-12 h-px bg-border" />
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-muted-foreground font-medium text-sm">2</span>
                      </div>
                      <span className="text-muted-foreground font-medium">
                        Division Director
                      </span>
                    </div>
                    <div className="w-12 h-px bg-border" />
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-muted-foreground font-medium text-sm">3</span>
                      </div>
                      <span className="text-muted-foreground font-medium">
                        HR Officer
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <p className="text-foreground font-medium text-sm">
                    This goal assignment will be submitted for approval through the standard workflow process.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Policy Notice */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground mb-2">
                    Goal Assignment Policy
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Employees should have 5 performance goals for optimal performance evaluation. Consider the current goal count when making assignments.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submit Button */}
      {onSubmit && (
        <div className="flex justify-center pt-8">
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            size="lg"
            className="px-12 py-4"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-3" />
                Submitting...
              </>
            ) : (
              "Submit for Approval"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Review;
