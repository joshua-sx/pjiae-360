import React from 'react';
import { Calendar, FileText, Target, TrendingUp, Plus, X, Users, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MagicPathEmployee, MagicPathGoalData } from './types';

interface GoalDetailsSectionProps {
  goalData: MagicPathGoalData;
  onGoalDetailsChange: (field: keyof MagicPathGoalData, value: string | string[]) => void;
  step: 'details' | 'timeline';
}

const GoalDetailsSection: React.FC<GoalDetailsSectionProps> = ({
  goalData,
  onGoalDetailsChange,
  step
}) => {
  const addMetric = () => {
    onGoalDetailsChange('metrics', [...goalData.metrics, '']);
  };

  const updateMetric = (index: number, value: string) => {
    const updatedMetrics = [...goalData.metrics];
    updatedMetrics[index] = value;
    onGoalDetailsChange('metrics', updatedMetrics);
  };

  const removeMetric = (index: number) => {
    const updatedMetrics = goalData.metrics.filter((_, i) => i !== index);
    onGoalDetailsChange('metrics', updatedMetrics);
  };

  if (step === 'details') {
    return (
      <div className="space-y-8">
        {/* Goal Name */}
        <div className="space-y-3">
          <label htmlFor="goalName" className="block text-sm font-semibold text-foreground">
            Goal Name <span className="text-destructive">*</span>
          </label>
          <input
            id="goalName"
            type="text"
            value={goalData.goalName}
            onChange={(e) => onGoalDetailsChange('goalName', e.target.value)}
            placeholder="e.g., Increase customer satisfaction by 25%"
            className="w-full px-4 py-4 bg-background border-2 border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground/60"
          />
          <p className="text-xs text-muted-foreground">
            Choose a clear, specific, and measurable goal name
          </p>
        </div>

        {/* Goal Description */}
        <div className="space-y-3">
          <label htmlFor="description" className="block text-sm font-semibold text-foreground">
            Description <span className="text-destructive">*</span>
          </label>
          <textarea
            id="description"
            value={goalData.description}
            onChange={(e) => onGoalDetailsChange('description', e.target.value)}
            placeholder="Provide a detailed description of what this goal aims to achieve, including context, expected outcomes, and any relevant background information..."
            rows={5}
            className="w-full px-4 py-4 bg-background border-2 border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 resize-none placeholder:text-muted-foreground/60"
          />
          <p className="text-xs text-muted-foreground">
            Include context, expected outcomes, and success criteria
          </p>
        </div>

        {/* Success Metrics */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <label className="text-sm font-semibold text-foreground">Success Metrics</label>
            </div>
            <button
              onClick={addMetric}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Metric</span>
            </button>
          </div>

          {goalData.metrics.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-border rounded-xl text-center">
              <Target className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h4 className="text-sm font-medium text-foreground mb-1">No metrics defined yet</h4>
              <p className="text-xs text-muted-foreground mb-4">
                Add measurable criteria to track the success of this goal
              </p>
              <button
                onClick={addMetric}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add First Metric</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {goalData.metrics.map((metric, index) => (
                <div key={index} className="flex items-center space-x-3 group">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={metric}
                      onChange={(e) => updateMetric(index, e.target.value)}
                      placeholder={`Metric ${index + 1} (e.g., Increase sales by 20%, Reduce response time to under 2 hours)`}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors placeholder:text-muted-foreground/60"
                    />
                  </div>
                  <button
                    onClick={() => removeMetric(index)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Team Members Preview */}
        {goalData.selectedEmployees.length > 0 && (
          <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl p-6 border border-border/50">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Assigned Team Members</h3>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {goalData.selectedEmployees.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {goalData.selectedEmployees.map(employee => (
                <div key={employee.id} className="flex items-center space-x-3 p-3 bg-background/50 rounded-lg border border-border/30">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{employee.name}</p>
                    <p className="text-xs text-muted-foreground">{employee.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label htmlFor="startDate" className="block text-sm font-semibold text-foreground">
            Start Date <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              id="startDate"
              type="date"
              value={goalData.startDate}
              onChange={(e) => onGoalDetailsChange('startDate', e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-background border-2 border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label htmlFor="endDate" className="block text-sm font-semibold text-foreground">
            End Date <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              id="endDate"
              type="date"
              value={goalData.endDate}
              onChange={(e) => onGoalDetailsChange('endDate', e.target.value)}
              min={goalData.startDate}
              className="w-full pl-12 pr-4 py-4 bg-background border-2 border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Priority Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-foreground">Priority Level</label>
        <div className="grid grid-cols-3 gap-3">
          {(['Low', 'Medium', 'High'] as const).map(priority => (
            <button
              key={priority}
              onClick={() => onGoalDetailsChange('priority', priority)}
              className={cn(
                "p-4 rounded-xl border-2 transition-all duration-200 text-center",
                goalData.priority === priority
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              )}
            >
              <div className={cn(
                "w-3 h-3 rounded-full mx-auto mb-2",
                priority === 'High' && "bg-red-500",
                priority === 'Medium' && "bg-yellow-500",
                priority === 'Low' && "bg-green-500"
              )} />
              <p className="text-sm font-medium">{priority}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {priority === 'High' && 'Urgent & Important'}
                {priority === 'Medium' && 'Standard Priority'}
                {priority === 'Low' && 'When Time Permits'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Goal Summary */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Target className="h-5 w-5 mr-2 text-primary" />
          Goal Summary
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-foreground text-lg">
              {goalData.goalName || 'Goal name not specified'}
            </h4>
            <p className="text-muted-foreground mt-1">
              {goalData.description || 'Description not provided'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-primary/20">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Team Size</p>
              <p className="text-sm font-semibold text-foreground">{goalData.selectedEmployees.length} members</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Start Date</p>
              <p className="text-sm font-semibold text-foreground">
                {goalData.startDate || 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">End Date</p>
              <p className="text-sm font-semibold text-foreground">
                {goalData.endDate || 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Priority</p>
              <span className={cn(
                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                goalData.priority === 'High' && "bg-red-100 text-red-800",
                goalData.priority === 'Medium' && "bg-yellow-100 text-yellow-800",
                goalData.priority === 'Low' && "bg-green-100 text-green-800"
              )}>
                {goalData.priority}
              </span>
            </div>
          </div>
          
          {goalData.metrics.filter(m => m.trim()).length > 0 && (
            <div className="pt-4 border-t border-primary/20">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Success Metrics</p>
              <ul className="space-y-1">
                {goalData.metrics.filter(m => m.trim()).map((metric, index) => (
                  <li key={index} className="text-sm text-foreground flex items-center">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                    {metric}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalDetailsSection;