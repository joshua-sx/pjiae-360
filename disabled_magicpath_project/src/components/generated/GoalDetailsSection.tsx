import React from 'react';
import { Calendar, FileText, Target, TrendingUp, Plus, X } from 'lucide-react';
import { cn } from '../../lib/utils';
interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
}
interface GoalData {
  selectedEmployees: Employee[];
  goalName: string;
  description: string;
  startDate: string;
  endDate: string;
  metrics: string[];
}
interface GoalDetailsSectionProps {
  goalData: GoalData;
  onGoalDetailsChange: (field: keyof GoalData, value: string | string[]) => void;
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
    return <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Goal Details</h2>
            <p className="text-sm text-muted-foreground">Define the goal name and description</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Goal Name */}
          <div className="space-y-2">
            <label htmlFor="goalName" className="text-sm font-medium text-foreground">
              Goal Name <span className="text-destructive">*</span>
            </label>
            <input id="goalName" type="text" value={goalData.goalName} onChange={e => onGoalDetailsChange('goalName', e.target.value)} placeholder="Enter a clear, specific goal name..." className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors" />
          </div>

          {/* Goal Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-foreground">
              Description <span className="text-destructive">*</span>
            </label>
            <textarea id="description" value={goalData.description} onChange={e => onGoalDetailsChange('description', e.target.value)} placeholder="Provide a detailed description of what this goal aims to achieve..." rows={4} className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors resize-none" />
          </div>

          {/* Selected Team Members Preview */}
          {goalData.selectedEmployees.length > 0 && <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Assigned Team Members</label>
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex flex-wrap gap-2">
                  {goalData.selectedEmployees.map(employee => <div key={employee.id} className="flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm">
                      <span className="font-medium">{employee.name}</span>
                    </div>)}
                </div>
              </div>
            </div>}
        </div>
      </div>;
  }
  return <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Timeline & Metrics</h2>
          <p className="text-sm text-muted-foreground">Set dates and define success metrics</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="startDate" className="text-sm font-medium text-foreground">
              Start Date <span className="text-destructive">*</span>
            </label>
            <input id="startDate" type="date" value={goalData.startDate} onChange={e => onGoalDetailsChange('startDate', e.target.value)} className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors" />
          </div>

          <div className="space-y-2">
            <label htmlFor="endDate" className="text-sm font-medium text-foreground">
              End Date <span className="text-destructive">*</span>
            </label>
            <input id="endDate" type="date" value={goalData.endDate} onChange={e => onGoalDetailsChange('endDate', e.target.value)} min={goalData.startDate} className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors" />
          </div>
        </div>

        {/* Success Metrics */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium text-foreground">Success Metrics</label>
            </div>
            <button onClick={addMetric} className="flex items-center space-x-1 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-md transition-colors">
              <Plus className="h-4 w-4" />
              <span>Add Metric</span>
            </button>
          </div>

          {goalData.metrics.length === 0 ? <div className="p-4 border-2 border-dashed border-border rounded-lg text-center">
              <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No metrics defined yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add metrics to measure the success of this goal
              </p>
            </div> : <div className="space-y-3">
              {goalData.metrics.map((metric, index) => <div key={index} className="flex items-center space-x-3">
                  <div className="flex-1">
                    <input type="text" value={metric} onChange={e => updateMetric(index, e.target.value)} placeholder={`Metric ${index + 1} (e.g., Increase sales by 20%)`} className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors" />
                  </div>
                  <button onClick={() => removeMetric(index)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>)}
            </div>}
        </div>

        {/* Goal Summary */}
        <div className="p-4 bg-muted/30 rounded-lg border border-border">
          <h3 className="text-sm font-medium text-foreground mb-3">Goal Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Goal:</span>
              <span className="text-foreground font-medium">
                {goalData.goalName || 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Team Members:</span>
              <span className="text-foreground font-medium">
                {goalData.selectedEmployees.length} selected
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <span className="text-foreground font-medium">
                {goalData.startDate && goalData.endDate ? `${goalData.startDate} to ${goalData.endDate}` : 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Metrics:</span>
              <span className="text-foreground font-medium">
                {goalData.metrics.filter(m => m.trim()).length} defined
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default GoalDetailsSection;