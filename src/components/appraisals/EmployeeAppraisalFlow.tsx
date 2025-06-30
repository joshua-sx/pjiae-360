
"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { HelpCircle, ChevronRight, User, CheckCircle, Edit, Signature, Mail, Info, ArrowLeft, ArrowRight, Save, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import AppraisalHeader from "./AppraisalHeader";
import PerformanceGoalsStep from "./PerformanceGoalsStep";
import CoreCompetenciesStep from "./CoreCompetenciesStep";
import ReviewAndSignOffStep from "./ReviewAndSignOffStep";

export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  rating?: number;
  feedback?: string;
}

export interface Competency {
  id: string;
  title: string;
  description: string;
  rating?: number;
  feedback?: string;
}

export interface AppraisalData {
  employeeId: string;
  goals: Goal[];
  competencies: Competency[];
  overallRating?: number;
  status: 'draft' | 'with_second_appraiser' | 'awaiting_employee' | 'complete';
  signatures: {
    appraiser?: string;
    secondAppraiser?: string;
    employee?: string;
  };
  timestamps: {
    created: Date;
    lastModified: Date;
    submitted?: Date;
    completed?: Date;
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: string;
  user: string;
  details: string;
}

export interface EmployeeAppraisalFlowProps {
  initialStep?: number;
  onComplete?: (data: AppraisalData) => void;
  onSaveDraft?: (data: AppraisalData) => void;
}

const mockEmployees: Employee[] = [
  { id: "1", name: "Sarah Johnson", department: "Engineering", position: "Senior Developer" },
  { id: "2", name: "Michael Chen", department: "Marketing", position: "Marketing Manager" },
  { id: "3", name: "Emily Rodriguez", department: "Sales", position: "Sales Representative" },
  { id: "4", name: "David Thompson", department: "HR", position: "HR Specialist" },
  { id: "5", name: "Lisa Wang", department: "Finance", position: "Financial Analyst" }
];

const mockGoals: Goal[] = [
  { id: "g1", title: "Increase Team Productivity", description: "Lead initiatives to improve team efficiency by 20% through process optimization and tool implementation." },
  { id: "g2", title: "Complete Professional Development", description: "Attend 3 industry conferences and obtain relevant certification to enhance technical skills." },
  { id: "g3", title: "Mentor Junior Staff", description: "Provide guidance and support to 2 junior team members throughout the year." },
  { id: "g4", title: "Client Satisfaction Improvement", description: "Achieve 95% client satisfaction rating through improved communication and service delivery." }
];

const mockCompetencies: Competency[] = [
  { id: "c1", title: "Communication", description: "Effectively communicates ideas, listens actively, and adapts communication style to audience." },
  { id: "c2", title: "Problem Solving", description: "Identifies issues, analyzes root causes, and develops creative solutions." },
  { id: "c3", title: "Leadership", description: "Inspires and motivates others, delegates effectively, and takes accountability." },
  { id: "c4", title: "Adaptability", description: "Embraces change, learns quickly, and maintains effectiveness in dynamic environments." },
  { id: "c5", title: "Collaboration", description: "Works effectively with others, builds relationships, and contributes to team success." }
];

const steps = [
  { id: 1, title: "Goals", description: "Grade Performance Goals" },
  { id: 2, title: "Competencies", description: "Grade Core Competencies" },
  { id: 3, title: "Review & Sign-Off", description: "Calculate & Review Overall Rating" }
];

export default function EmployeeAppraisalFlow({
  initialStep = 0,
  onComplete,
  onSaveDraft
}: EmployeeAppraisalFlowProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [appraisalData, setAppraisalData] = useState<AppraisalData>({
    employeeId: "",
    goals: mockGoals,
    competencies: mockCompetencies,
    status: 'draft',
    signatures: {},
    timestamps: {
      created: new Date(),
      lastModified: new Date()
    }
  });
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredEmployees = mockEmployees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const mockAuditLog: AuditLogEntry[] = [
    { id: "1", timestamp: new Date(Date.now() - 86400000), action: "Appraisal Created", user: "John Manager", details: "New appraisal created for Sarah Johnson" },
    { id: "2", timestamp: new Date(Date.now() - 43200000), action: "Goals Rated", user: "John Manager", details: "Performance goals completed and rated" },
    { id: "3", timestamp: new Date(Date.now() - 21600000), action: "Draft Saved", user: "John Manager", details: "Appraisal saved as draft" }
  ];

  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const handleStartAppraisal = () => {
    if (!selectedEmployee) return;
    setAppraisalData(prev => ({
      ...prev,
      employeeId: selectedEmployee.id,
      timestamps: { ...prev.timestamps, lastModified: new Date() }
    }));
    setCurrentStep(1);
    showNotification('info', 'Appraisal started successfully');
  };

  const handleGoalUpdate = (goalId: string, rating?: number, feedback?: string) => {
    setAppraisalData(prev => ({
      ...prev,
      goals: prev.goals.map(goal => goal.id === goalId ? { ...goal, rating, feedback } : goal),
      timestamps: { ...prev.timestamps, lastModified: new Date() }
    }));
  };

  const handleCompetencyUpdate = (competencyId: string, rating?: number, feedback?: string) => {
    setAppraisalData(prev => ({
      ...prev,
      competencies: prev.competencies.map(competency => competency.id === competencyId ? { ...competency, rating, feedback } : competency),
      timestamps: { ...prev.timestamps, lastModified: new Date() }
    }));
  };

  const calculateOverallRating = () => {
    const goalRatings = appraisalData.goals.filter(g => g.rating).map(g => g.rating!);
    const competencyRatings = appraisalData.competencies.filter(c => c.rating).map(c => c.rating!);
    
    if (goalRatings.length === 0 && competencyRatings.length === 0) return 0;
    
    const allRatings = [...goalRatings, ...competencyRatings];
    return Math.round(allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length * 10) / 10;
  };

  const canProceedFromGoals = () => appraisalData.goals.every(goal => goal.rating !== undefined);
  const canProceedFromCompetencies = () => appraisalData.competencies.every(competency => competency.rating !== undefined);

  const handleSaveDraft = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedData = {
        ...appraisalData,
        timestamps: { ...appraisalData.timestamps, lastModified: new Date() }
      };
      setAppraisalData(updatedData);
      onSaveDraft?.(updatedData);
      showNotification('success', 'Draft saved successfully');
    } catch (error) {
      showNotification('error', 'Failed to save draft');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const finalData = {
        ...appraisalData,
        overallRating: calculateOverallRating(),
        status: 'with_second_appraiser' as const,
        timestamps: {
          ...appraisalData.timestamps,
          submitted: new Date(),
          lastModified: new Date()
        }
      };
      setAppraisalData(finalData);
      onComplete?.(finalData);
      showNotification('success', 'Appraisal submitted successfully');
    } catch (error) {
      showNotification('error', 'Failed to submit appraisal');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentStep > 0 && appraisalData.employeeId) {
        handleSaveDraft();
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [appraisalData, currentStep]);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <AnimatePresence>
            {notification && (
              <motion.div 
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="fixed top-4 right-4 z-50"
              >
                <Alert className={cn(
                  "w-96",
                  notification.type === 'success' && "border-green-500 bg-green-50",
                  notification.type === 'error' && "border-red-500 bg-red-50",
                  notification.type === 'info' && "border-blue-500 bg-blue-50"
                )}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{notification.message}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <AppraisalHeader 
            currentStep={currentStep}
            steps={steps}
            employee={selectedEmployee}
            onShowAuditTrail={() => setShowAuditTrail(true)}
          />

          <Card className="shadow-lg">
            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                {currentStep === 0 && (
                  <motion.div 
                    key="employee-selection"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="text-center space-y-4">
                      <h2 className="text-2xl font-semibold">Start New Appraisal</h2>
                      <p className="text-muted-foreground">
                        Select an employee to begin their performance appraisal
                      </p>
                    </div>

                    <div className="max-w-md mx-auto space-y-6">
                      <div className="space-y-2">
                        <label htmlFor="employee-search" className="text-sm font-medium">
                          Search Employee
                        </label>
                        <Input 
                          id="employee-search"
                          placeholder="Search by name, department, or position..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="employee-select" className="text-sm font-medium">
                          Select Employee
                        </label>
                        <Select onValueChange={(value) => {
                          const employee = mockEmployees.find(e => e.id === value);
                          setSelectedEmployee(employee || null);
                        }}>
                          <SelectTrigger id="employee-select">
                            <SelectValue placeholder="Choose an employee" />
                          </SelectTrigger>
                          <SelectContent>
                            <ScrollArea className="h-48">
                              {filteredEmployees.map(employee => (
                                <SelectItem key={employee.id} value={employee.id}>
                                  <div className="flex items-center space-x-3">
                                    <User className="h-4 w-4" />
                                    <div>
                                      <div className="font-medium">{employee.name}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {employee.position} • {employee.department}
                                      </div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </ScrollArea>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button 
                        onClick={handleStartAppraisal}
                        disabled={!selectedEmployee}
                        className="w-full h-12 text-lg"
                        size="lg"
                      >
                        Start Appraisal
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {currentStep === 1 && (
                  <motion.div 
                    key="goals-step"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <PerformanceGoalsStep 
                      goals={appraisalData.goals}
                      onGoalUpdate={handleGoalUpdate}
                      canProceed={canProceedFromGoals()}
                    />
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div 
                    key="competencies-step"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <CoreCompetenciesStep 
                      competencies={appraisalData.competencies}
                      onCompetencyUpdate={handleCompetencyUpdate}
                      canProceed={canProceedFromCompetencies()}
                    />
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div 
                    key="review-step"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <ReviewAndSignOffStep 
                      appraisalData={appraisalData}
                      employee={selectedEmployee}
                      overallRating={calculateOverallRating()}
                      onSubmit={handleSubmit}
                      isLoading={isLoading}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {currentStep > 0 && (
                <div className="flex justify-between items-center mt-8 pt-6 border-t">
                  <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center space-x-4">
                    <Button variant="outline" onClick={handleSaveDraft} disabled={isLoading}>
                      <Save className="mr-2 h-4 w-4" />
                      {isLoading ? 'Saving...' : 'Save Draft'}
                    </Button>

                    {currentStep < 3 && (
                      <Button 
                        onClick={nextStep}
                        disabled={
                          (currentStep === 1 && !canProceedFromGoals()) ||
                          (currentStep === 2 && !canProceedFromCompetencies())
                        }
                      >
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={showAuditTrail} onOpenChange={setShowAuditTrail}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Audit Trail</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {mockAuditLog.map(entry => (
                    <div key={entry.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{entry.action}</h4>
                          <span className="text-xs text-muted-foreground">
                            {entry.timestamp.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{entry.details}</p>
                        <p className="text-xs text-muted-foreground">by {entry.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </TooltipProvider>
  );
}
