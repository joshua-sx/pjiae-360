import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Calendar, User, Users, CheckCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface GoalData {
  title: string;
  description: string;
  assignee: string;
  dueDate: Date | undefined;
  priority: string;
  type: 'individual' | 'team';
}

interface MagicPathGoalCreatorProps {
  onComplete?: (goalData: GoalData) => void;
}

export const MagicPathGoalCreator: React.FC<MagicPathGoalCreatorProps> = ({ onComplete }) => {
  const [goalData, setGoalData] = useState<GoalData>({
    title: '',
    description: '',
    assignee: '',
    dueDate: undefined,
    priority: 'Medium',
    type: 'individual'
  });

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "What's your goal?",
      subtitle: "Let's start with the basics",
      icon: Target,
      fields: ['title', 'description']
    },
    {
      title: "Who's responsible?",
      subtitle: "Assign ownership and set timeline",
      icon: User,
      fields: ['assignee', 'type']
    },
    {
      title: "When and how important?",
      subtitle: "Set deadline and priority level",
      icon: Calendar,
      fields: ['dueDate', 'priority']
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    toast.success("Goal created successfully!");
    onComplete?.(goalData);
  };

  const isStepComplete = (stepIndex: number) => {
    const step = steps[stepIndex];
    return step.fields.every(field => {
      if (field === 'dueDate') return goalData.dueDate !== undefined;
      return goalData[field as keyof GoalData] !== '';
    });
  };

  const canProceed = isStepComplete(currentStep);

  const updateGoalData = (field: keyof GoalData, value: any) => {
    setGoalData(prev => ({ ...prev, [field]: value }));
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    const StepIcon = step.icon;

    return (
      <Card className="border-0 shadow-none">
        <CardHeader className="text-center pb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <StepIcon className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">{step.title}</CardTitle>
          <p className="text-muted-foreground">{step.subtitle}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 0 && (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Goal Title</label>
                <Input
                  placeholder="e.g., Increase sales by 25%"
                  value={goalData.title}
                  onChange={(e) => updateGoalData('title', e.target.value)}
                  className="text-base"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Describe what needs to be achieved and why it matters..."
                  value={goalData.description}
                  onChange={(e) => updateGoalData('description', e.target.value)}
                  rows={4}
                />
              </div>
            </>
          )}

          {currentStep === 1 && (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Goal Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={goalData.type === 'individual' ? 'default' : 'outline'}
                    onClick={() => updateGoalData('type', 'individual')}
                    className="h-16 flex-col gap-2"
                  >
                    <User className="w-5 h-5" />
                    Individual
                  </Button>
                  <Button
                    variant={goalData.type === 'team' ? 'default' : 'outline'}
                    onClick={() => updateGoalData('type', 'team')}
                    className="h-16 flex-col gap-2"
                  >
                    <Users className="w-5 h-5" />
                    Team
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {goalData.type === 'individual' ? 'Assign to Employee' : 'Assign to Team'}
                </label>
                <Input
                  placeholder={goalData.type === 'individual' ? "Employee name or email" : "Team name"}
                  value={goalData.assignee}
                  onChange={(e) => updateGoalData('assignee', e.target.value)}
                />
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Due Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !goalData.dueDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {goalData.dueDate ? goalData.dueDate.toLocaleDateString() : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={goalData.dueDate}
                      onSelect={(date) => updateGoalData('dueDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Priority Level</label>
                <Select value={goalData.priority} onValueChange={(value) => updateGoalData('priority', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        Low Priority
                      </div>
                    </SelectItem>
                    <SelectItem value="Medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        Medium Priority
                      </div>
                    </SelectItem>
                    <SelectItem value="High">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        High Priority
                      </div>
                    </SelectItem>
                    <SelectItem value="Critical">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        Critical Priority
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((_, index) => (
          <div key={index} className="flex items-center">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              index < currentStep ? "bg-green-500 text-white" :
              index === currentStep ? "bg-primary text-primary-foreground" :
              "bg-muted text-muted-foreground"
            )}>
              {index < currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "w-12 h-0.5 mx-2",
                index < currentStep ? "bg-green-500" : "bg-muted"
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed}
          className="gap-2"
        >
          {currentStep === steps.length - 1 ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Create Goal
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};