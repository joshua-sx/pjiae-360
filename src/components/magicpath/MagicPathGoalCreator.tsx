import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Target, Users, FileText, Calendar, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOptimizedEmployees } from '@/hooks/useOptimizedEmployees';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentOrganization } from '@/hooks/useCurrentOrganization';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProgressIndicator from './ProgressIndicator';
import EmployeeMultiSelectDropdown from './EmployeeMultiSelectDropdown';
import GoalDetailsSection from './GoalDetailsSection';
import { MagicPathEmployee, MagicPathGoalData, MagicPathGoalCreatorProps } from './types';

const MagicPathGoalCreator: React.FC<MagicPathGoalCreatorProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [goalData, setGoalData] = useState<MagicPathGoalData>({
    selectedEmployees: [],
    goalName: '',
    description: '',
    startDate: '',
    endDate: '',
    priority: 'Medium',
    metrics: []
  });

  const { data: employees = [], isLoading: employeesLoading } = useOptimizedEmployees();
  const { user } = useAuth();
  const organizationState = useCurrentOrganization();
  const organization = { id: organizationState.id };
  const { toast } = useToast();
  const totalSteps = 4;

  // Transform Supabase employees to MagicPath format
  const magicPathEmployees: MagicPathEmployee[] = employees.map(emp => ({
    id: emp.id,
    name: `${emp.profile?.first_name || ''} ${emp.profile?.last_name || ''}`.trim() || 'Unknown',
    role: emp.job_title || 'No Role',
    department: emp.department?.name || 'No Department',
    avatar: emp.profile?.avatar_url || undefined
  }));

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleEmployeeSelection = (employees: MagicPathEmployee[]) => {
    setGoalData(prev => ({
      ...prev,
      selectedEmployees: employees
    }));
  };

  const handleGoalDetailsChange = (field: keyof MagicPathGoalData, value: any) => {
    setGoalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return goalData.selectedEmployees.length > 0;
      case 2:
        return goalData.goalName.trim() !== '' && goalData.description.trim() !== '';
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleCreateGoal = async () => {
    setIsLoading(true);
    
    try {
      if (!user?.id || !organization?.id) {
        throw new Error('User not authenticated or organization not found');
      }

      // Create goal in database using correct schema
      const { data: goal, error: goalError } = await supabase
        .from('goals')
        .insert({
          title: goalData.goalName,
          description: goalData.description,
          start_date: goalData.startDate,
          due_date: goalData.endDate || goalData.startDate,
          priority: goalData.priority.toLowerCase(),
          status: 'active',
          progress: 0,
          created_by: user.id,
          organization_id: organization.id,
          year: new Date().getFullYear(),
          type: 'team_goal'
        })
        .select()
        .single();

      if (goalError) throw goalError;

      // Create goal assignments for selected employees
      if (goal && goalData.selectedEmployees.length > 0) {
        const assignments = goalData.selectedEmployees.map(emp => ({
          goal_id: goal.id,
          employee_id: emp.id,
          assigned_by: user.id
        }));

        const { error: assignmentError } = await supabase
          .from('goal_assignments')
          .insert(assignments);

        if (assignmentError) throw assignmentError;
      }

      setShowSuccess(true);
      toast({
        title: "Goal Created Successfully!",
        description: `Created "${goalData.goalName}" with ${goalData.selectedEmployees.length} team members.`,
      });

      // Auto-redirect after success
      setTimeout(() => {
        if (onComplete) {
          onComplete(goalData);
        }
      }, 2000);

    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Error Creating Goal",
        description: "There was a problem creating the goal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    if (showSuccess) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Goal Created Successfully!</h2>
          <p className="text-muted-foreground mb-6">
            Your goal has been created and assigned to {goalData.selectedEmployees.length} team member{goalData.selectedEmployees.length !== 1 ? 's' : ''}.
          </p>
          <div className="bg-muted/30 rounded-lg p-4 text-left max-w-md mx-auto">
            <h3 className="font-semibold text-foreground mb-2">{goalData.goalName}</h3>
            <p className="text-sm text-muted-foreground mb-3">{goalData.description}</p>
            <div className="flex flex-wrap gap-2">
              {goalData.selectedEmployees.map(employee => (
                <span key={employee.id} className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                  {employee.name}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Select Team Members</h2>
                <p className="text-muted-foreground">Choose employees who will work on this goal</p>
              </div>
            </div>
            
            {employeesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading employees...</p>
              </div>
            ) : magicPathEmployees.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No employees found</h3>
                <p className="text-muted-foreground">
                  You need to add employees to your team before creating goals.
                </p>
              </div>
            ) : (
              <EmployeeMultiSelectDropdown
                employees={magicPathEmployees}
                selectedEmployees={goalData.selectedEmployees}
                onSelectionChange={handleEmployeeSelection}
              />
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Goal Details</h2>
                <p className="text-muted-foreground">Define the goal name and description</p>
              </div>
            </div>
            
            <GoalDetailsSection
              goalData={goalData}
              onGoalDetailsChange={handleGoalDetailsChange}
              step="details"
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Schedule & Priority</h2>
                <p className="text-muted-foreground">Set timeline and priority level</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Date Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="startDate" className="text-sm font-medium text-foreground">
                    Due Date
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    value={goalData.startDate}
                    onChange={(e) => handleGoalDetailsChange('startDate', e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to set as immediately due
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="priority" className="text-sm font-medium text-foreground">
                    Priority Level
                  </label>
                  <select
                    id="priority"
                    value={goalData.priority}
                    onChange={(e) => handleGoalDetailsChange('priority', e.target.value as 'Low' | 'Medium' | 'High')}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Goal Preview</h2>
                <p className="text-muted-foreground">Review and confirm goal details</p>
              </div>
            </div>
            
            {/* Goal Preview Content */}
            <div className="space-y-6">
              {/* Goal Title & Description */}
              <div className="bg-background/50 backdrop-blur-sm rounded-xl p-6 border border-border/30 shadow-sm">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-foreground leading-tight">{goalData.goalName}</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">{goalData.description}</p>
                </div>
              </div>

              {/* Assigned Team Members */}
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
                  {goalData.selectedEmployees.map(employee => (
                    <div key={employee.id} className="flex items-center space-x-3 p-4 bg-background/70 rounded-lg border border-border/30">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground text-sm truncate">{employee.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{employee.role}</p>
                        <p className="text-xs text-primary font-medium">{employee.department}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Success Metrics */}
              {goalData.metrics.filter(m => m.trim()).length > 0 && (
                <div className="bg-background/50 backdrop-blur-sm rounded-xl p-6 border border-border/30 shadow-sm">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-foreground">Success Metrics</h4>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                      {goalData.metrics.filter(m => m.trim()).length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {goalData.metrics.filter(m => m.trim()).map((metric, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-background/70 rounded-lg border border-border/30">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                          <span className="text-xs font-bold text-primary">{index + 1}</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{metric}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Due Date & Priority Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-background/50 backdrop-blur-sm rounded-xl p-6 border border-border/30 shadow-sm text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">Due Date</h4>
                  <p className="text-lg font-bold text-primary mb-1">
                    {goalData.startDate ? new Date(goalData.startDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }) : 'Immediately'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {goalData.startDate ? 'Target date' : 'Due now'}
                  </p>
                </div>

                <div className="bg-background/50 backdrop-blur-sm rounded-xl p-6 border border-border/30 shadow-sm text-center">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3",
                    goalData.priority === 'High' && "bg-red-100",
                    goalData.priority === 'Medium' && "bg-yellow-100",
                    goalData.priority === 'Low' && "bg-green-100"
                  )}>
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      goalData.priority === 'High' && "bg-red-500",
                      goalData.priority === 'Medium' && "bg-yellow-500",
                      goalData.priority === 'Low' && "bg-green-500"
                    )} />
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">Priority</h4>
                  <p className="text-lg font-bold text-primary mb-1">{goalData.priority}</p>
                  <p className="text-sm text-muted-foreground">
                    {goalData.priority === 'High' && 'Urgent'}
                    {goalData.priority === 'Medium' && 'Standard'}
                    {goalData.priority === 'Low' && 'Flexible'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl shadow-xl">
            <div className="p-12">
              {renderStepContent()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
        </div>

        {/* Main Content */}
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl shadow-xl overflow-visible">
          <div className="p-8 md:p-12 overflow-visible">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          {!showSuccess && (
            <div className="px-8 md:px-12 py-6 bg-muted/20 border-t border-border/50">
              <div className="flex justify-between items-center">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className={cn(
                    "flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200",
                    currentStep === 1
                      ? "text-muted-foreground cursor-not-allowed"
                      : "text-foreground hover:bg-muted/50 hover:scale-105"
                  )}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>

                <div className="flex space-x-3">
                  {currentStep < totalSteps ? (
                    <button
                      onClick={handleNext}
                      disabled={!canProceed()}
                      className={cn(
                        "flex items-center space-x-2 px-8 py-3 rounded-xl font-medium transition-all duration-200",
                        canProceed()
                          ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 shadow-lg"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                      )}
                    >
                      <span>Next</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleCreateGoal}
                      disabled={isLoading || !canProceed()}
                      className={cn(
                        "flex items-center space-x-2 px-8 py-3 rounded-xl font-medium transition-all duration-200",
                        canProceed() && !isLoading
                          ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 shadow-lg"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                      )}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span>Create Goal</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MagicPathGoalCreator;