import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Target, Users, User, Info, Calendar, Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "./DashboardLayout";
import { EmployeeMultiSelect } from "./goals/components/EmployeeMultiSelect";
import { NewGoalData, DivisionGoal } from "./goals/types";
import { defaultDivisionGoal, mockEmployees, mockTeams } from "./goals/mockData";

// Status color mapping
const getStatusColor = (status: DivisionGoal["status"]) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "In Progress":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "At Risk":
      return "bg-red-100 text-red-800 border-red-200";
    case "Not Started":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Progress indicator component
function ProgressIndicator({
  currentStep,
  totalSteps
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="flex items-center justify-center space-x-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNumber = i + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        
        return (
          <div key={stepNumber} className="flex items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                isActive && "bg-primary text-primary-foreground",
                isCompleted && "bg-green-500 text-white",
                !isActive && !isCompleted && "bg-muted text-muted-foreground"
              )}
            >
              {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
            </div>
            {stepNumber < totalSteps && (
              <div
                className={cn(
                  "w-8 h-0.5 mx-2 transition-colors",
                  isCompleted ? "bg-green-500" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

const CreateGoalPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [newGoal, setNewGoal] = useState<NewGoalData>({
    scope: "individual",
    assignedTo: "",
    assignedToName: "",
    title: "",
    description: "",
    successCriteria: "",
    dueDate: undefined,
    priority: "Medium",
    tags: []
  });

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Goals", href: "/goals" },
    { label: "Create Goal" }
  ];

  const resetForm = () => {
    setCurrentStep(1);
    setNewGoal({
      scope: "individual",
      assignedTo: "",
      assignedToName: "",
      title: "",
      description: "",
      successCriteria: "",
      dueDate: undefined,
      priority: "Medium",
      tags: []
    });
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setCurrentStep(5);
    toast.success(`Goal assigned to ${newGoal.assignedToName}!`);
  };

  const handleCreateAnother = () => {
    resetForm();
  };

  const handleGoToDashboard = () => {
    navigate("/goals");
  };

  const handleCancel = () => {
    navigate("/goals");
  };

  const canProceedFromStep1 = newGoal.scope === "individual" 
    ? newGoal.assignedTo && newGoal.assignedTo.split(",").filter(Boolean).length > 0
    : newGoal.assignedTo && newGoal.assignedToName;

  const canProceedFromStep3 = newGoal.title && newGoal.description && newGoal.dueDate;

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h1 className="text-2xl font-bold">Create New Goal</h1>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Step {currentStep} of 4
          </div>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator currentStep={currentStep} totalSteps={4} />

        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Select Goal Scope */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Who is this goal for?</h2>
                  <p className="text-muted-foreground">
                    You can only assign goals to employees or teams within your scope.
                  </p>
                </div>

                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <RadioGroup
                      value={newGoal.scope}
                      onValueChange={(value) => setNewGoal({
                        ...newGoal,
                        scope: value as "individual" | "team",
                        assignedTo: "",
                        assignedToName: ""
                      })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="individual" id="individual" />
                        <label htmlFor="individual" className="flex items-center gap-2 cursor-pointer">
                          <User className="w-4 h-4" />
                          Individual Employee
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="team" id="team" />
                        <label htmlFor="team" className="flex items-center gap-2 cursor-pointer">
                          <Users className="w-4 h-4" />
                          Team/Department
                        </label>
                      </div>
                    </RadioGroup>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {newGoal.scope === "individual" ? "Assign to Employees" : "Select Team"}
                      </label>
                      {newGoal.scope === "individual" ? (
                        <EmployeeMultiSelect
                          employees={mockEmployees}
                          selected={newGoal.assignedTo ? newGoal.assignedTo.split(',') : []}
                          setSelected={(ids) => {
                            setNewGoal({
                              ...newGoal,
                              assignedTo: ids.join(','),
                              assignedToName: mockEmployees
                                .filter(e => ids.includes(e.id))
                                .map(e => e.name)
                                .join(', ')
                            });
                          }}
                        />
                      ) : (
                        <Select
                          value={newGoal.assignedTo}
                          onValueChange={(value) => {
                            const selected = mockTeams.find(t => t.id === value);
                            setNewGoal({
                              ...newGoal,
                              assignedTo: value,
                              assignedToName: selected ? selected.name : ""
                            });
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choose team..." />
                          </SelectTrigger>
                          <SelectContent>
                            {mockTeams.map(item => (
                              <SelectItem key={item.id} value={item.id}>
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  <div>
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {item.memberCount} members • {item.department}
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Contextual Division Goal Display */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Division Context</h2>
                  <p className="text-muted-foreground">
                    This goal will support the broader division objective.
                  </p>
                </div>

                <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-primary rounded-full" />
                      {defaultDivisionGoal.title}
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          This is the division's annual goal set by your director.
                        </TooltipContent>
                      </Tooltip>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {defaultDivisionGoal.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        <span>{defaultDivisionGoal.director} • {defaultDivisionGoal.directorTitle}</span>
                      </div>
                      <Badge className={cn("text-xs", getStatusColor(defaultDivisionGoal.status))}>
                        {defaultDivisionGoal.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Enter Goal Details */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Goal Details</h2>
                  <p className="text-muted-foreground">
                    Provide clear, actionable, and measurable goal information.
                  </p>
                </div>

                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Goal Title *</label>
                      <Input
                        placeholder="Enter a clear, specific goal title..."
                        value={newGoal.title}
                        onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                        className="text-base"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Goal Description *</label>
                      <Textarea
                        placeholder="Describe what needs to be accomplished and why it matters..."
                        value={newGoal.description}
                        onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Success Criteria</label>
                      <Input
                        placeholder="How will success be measured?"
                        value={newGoal.successCriteria}
                        onChange={(e) => setNewGoal({ ...newGoal, successCriteria: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Due Date *</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !newGoal.dueDate && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {newGoal.dueDate ? newGoal.dueDate.toLocaleDateString() : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 pointer-events-auto">
                            <CalendarComponent
                              mode="single"
                              selected={newGoal.dueDate}
                              onSelect={(date) => setNewGoal({ ...newGoal, dueDate: date })}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Priority</label>
                        <Select
                          value={newGoal.priority}
                          onValueChange={(value) => setNewGoal({ ...newGoal, priority: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-primary" />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-sm text-muted-foreground cursor-help underline decoration-dotted">
                            Tips for writing SMART goals
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <div className="space-y-1 text-xs">
                            <div><strong>S</strong>pecific - Clear and well-defined</div>
                            <div><strong>M</strong>easurable - Quantifiable outcomes</div>
                            <div><strong>A</strong>chievable - Realistic and attainable</div>
                            <div><strong>R</strong>elevant - Aligned with objectives</div>
                            <div><strong>T</strong>ime-bound - Has a deadline</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 4: Review & Confirm */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Review & Confirm</h2>
                  <p className="text-muted-foreground">
                    Please review the goal details before assigning.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{newGoal.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Assigned to:</span>
                      <div className="flex items-center gap-2 mt-1">
                        {newGoal.scope === "individual" ? (
                          newGoal.assignedTo ? (
                            newGoal.assignedTo.split(",").map(id => {
                              const emp = mockEmployees.find(e => e.id === id);
                              if (!emp) return null;
                              return (
                                <span
                                  key={id}
                                  className="flex items-center gap-1 bg-card border border-border rounded-full px-2 py-0.5 text-xs font-medium shadow-sm mr-1 mb-1"
                                >
                                  <User className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                                  {emp.name}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-muted-foreground">No employees selected</span>
                          )
                        ) : (
                          <>
                            <Users className="w-4 h-4" />
                            <span className="font-medium">{newGoal.assignedToName}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Description:</span>
                      <p className="mt-1 text-sm">{newGoal.description}</p>
                    </div>

                    {newGoal.successCriteria && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Success Criteria:</span>
                        <p className="mt-1 text-sm">{newGoal.successCriteria}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Due Date:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{newGoal.dueDate?.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Priority:</span>
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs">
                            {newGoal.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 5: Completion */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-8"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Goal Created Successfully!</h2>
                  <p className="text-muted-foreground">
                    {newGoal.scope === "individual" 
                      ? `The goal has been assigned to ${newGoal.assignedTo ? 
                          newGoal.assignedTo.split(",").map(id => {
                            const emp = mockEmployees.find(e => e.id === id);
                            return emp ? emp.name : "";
                          }).filter(Boolean).join(", ") : "no one"}.`
                      : `The goal has been assigned to ${newGoal.assignedToName}.`
                    }
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={handleCreateAnother} variant="outline">
                    Create Another Goal
                  </Button>
                  <Button onClick={handleGoToDashboard}>
                    Go to Goals Dashboard
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sticky Bottom Navigation */}
        {currentStep < 5 && (
          <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border p-4 z-50">
            <div className="max-w-4xl mx-auto flex justify-between">
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel} className="gap-2">
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </div>
              
              {currentStep === 4 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Assign Goal
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !canProceedFromStep1) ||
                    (currentStep === 3 && !canProceedFromStep3)
                  }
                  className="gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CreateGoalPage;
