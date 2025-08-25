import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Search, User, Mail, Building, CheckCircle, Clock, Crown, Shield, Users, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAppraiserAssignment } from "@/hooks/useAppraiserAssignment";
import { Employee } from "./types";

interface BulkAppraiserAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[];
  onAssignmentComplete?: () => void;
}

// Mock data for potential appraisers - in real app this would come from API
const mockAppraisers: Employee[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com", 
    department: "Engineering",
    position: "Senior Engineering Manager"
  },
  {
    id: "2", 
    name: "Mike Chen",
    email: "mike.chen@company.com",
    department: "Product",
    position: "Product Director"
  },
  {
    id: "3",
    name: "Lisa Rodriguez", 
    email: "lisa.rodriguez@company.com",
    department: "Engineering",
    position: "Principal Engineer"
  },
  {
    id: "4",
    name: "David Park",
    email: "david.park@company.com", 
    department: "Design",
    position: "Design Manager"
  }
];

export function BulkAppraiserAssignmentModal({ 
  open, 
  onOpenChange, 
  employees,
  onAssignmentComplete 
}: BulkAppraiserAssignmentModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedAppraisers, setSelectedAppraisers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'employees' | 'appraisers'>('employees');
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const { assignAppraisers, loading } = useAppraiserAssignment();

  const MAX_APPRAISERS = 2;

  // Filter employees based on search term
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  // Filter appraisers based on search term
  const filteredAppraisers = useMemo(() => {
    return mockAppraisers.filter(appraiser =>
      appraiser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appraiser.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appraiser.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appraiser.position.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleAppraiserToggle = (appraiserId: string) => {
    setSelectedAppraisers(prev => {
      if (prev.includes(appraiserId)) {
        return prev.filter(id => id !== appraiserId);
      } else if (prev.length < MAX_APPRAISERS) {
        return [...prev, appraiserId];
      }
      return prev;
    });
  };

  const handleSelectAllEmployees = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(emp => emp.id));
    }
  };

  const handleNext = () => {
    if (currentStep === 'employees' && selectedEmployees.length > 0) {
      setCurrentStep('appraisers');
      setSearchTerm("");
    }
  };

  const handleBack = () => {
    if (currentStep === 'appraisers') {
      setCurrentStep('employees');
      setSearchTerm("");
    }
  };

  const handleBulkAssignment = async () => {
    if (selectedEmployees.length === 0 || selectedAppraisers.length === 0) {
      toast({
        title: "Incomplete selection",
        description: "Please select both employees and appraisers.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    setProgress(0);
    
    try {
      // In a real implementation, you would:
      // 1. Create appraisals for employees who don't have them
      // 2. Assign appraisers to each selected employee
      
      const totalOperations = selectedEmployees.length;
      let completedOperations = 0;

      for (const employeeId of selectedEmployees) {
        // Simulate creating appraisal and assigning appraisers
        await new Promise(resolve => setTimeout(resolve, 500));
        
        completedOperations++;
        setProgress((completedOperations / totalOperations) * 100);
      }
      
      toast({
        title: "Bulk assignment completed",
        description: `Assigned ${selectedAppraisers.length} appraisers to ${selectedEmployees.length} employees.`
      });
      
      onAssignmentComplete?.();
      onOpenChange(false);
      handleReset();
    } catch (error) {
      toast({
        title: "Assignment failed",
        description: "Failed to assign appraisers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setProgress(0);
    }
  };

  const handleCancel = () => {
    handleReset();
    onOpenChange(false);
  };

  const handleReset = () => {
    setSelectedEmployees([]);
    setSelectedAppraisers([]);
    setSearchTerm("");
    setCurrentStep('employees');
    setProgress(0);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Bulk Assign Appraisers
          </DialogTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className={currentStep === 'employees' ? 'text-primary font-medium' : ''}>
              1. Select Employees
            </span>
            <span className={currentStep === 'appraisers' ? 'text-primary font-medium' : ''}>
              2. Select Appraisers
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress bar during submission */}
          {isSubmitting && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 animate-spin" />
                <span className="text-sm">Assigning appraisers...</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${currentStep}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              disabled={isSubmitting}
            />
          </div>

          {/* Employee Selection Step */}
          {currentStep === 'employees' && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">
                    {selectedEmployees.length} employee(s) selected
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSelectAllEmployees}
                  disabled={isSubmitting}
                >
                  {selectedEmployees.length === filteredEmployees.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {filteredEmployees.map((employee) => (
                    <Card 
                      key={employee.id} 
                      className={`cursor-pointer transition-colors border ${
                        selectedEmployees.includes(employee.id) 
                          ? 'ring-2 ring-primary border-primary/50 bg-primary/5' 
                          : 'hover:bg-accent/50 border-border'
                      }`}
                      onClick={() => !isSubmitting && handleEmployeeToggle(employee.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedEmployees.includes(employee.id)}
                            disabled={isSubmitting}
                            onChange={() => handleEmployeeToggle(employee.id)}
                          />
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={employee.avatar} />
                            <AvatarFallback className="text-xs">
                              {getInitials(employee.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{employee.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {employee.department}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {employee.position}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              {employee.email}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}

          {/* Appraiser Selection Step */}
          {currentStep === 'appraisers' && (
            <>
              <div className="flex items-center gap-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">
                    Selected {selectedEmployees.length} employees
                  </p>
                  <p className="text-blue-700">
                    Choose up to {MAX_APPRAISERS} appraisers to assign to all selected employees.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {selectedAppraisers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">
                      {selectedAppraisers.length} appraiser(s) selected (max {MAX_APPRAISERS})
                    </span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  The first appraiser will be Primary, the second will be Secondary.
                </p>
              </div>

              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {filteredAppraisers.map((appraiser) => {
                    const isSelected = selectedAppraisers.includes(appraiser.id);
                    const selectionIndex = selectedAppraisers.findIndex(id => id === appraiser.id);
                    const isDisabled = !isSelected && selectedAppraisers.length >= MAX_APPRAISERS;
                    
                    return (
                      <Card 
                        key={appraiser.id} 
                        className={`transition-colors border ${
                          isSelected 
                            ? 'ring-2 ring-primary border-primary/50 bg-primary/5' 
                            : isDisabled 
                              ? 'opacity-50 cursor-not-allowed border-border' 
                              : 'cursor-pointer hover:bg-accent/50 border-border'
                        }`}
                        onClick={() => !isDisabled && !isSubmitting && handleAppraiserToggle(appraiser.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Checkbox
                                checked={isSelected}
                                disabled={isDisabled || isSubmitting}
                                onChange={() => handleAppraiserToggle(appraiser.id)}
                              />
                              {isSelected && (
                                <div className="absolute -top-1 -right-1">
                                  {selectionIndex === 0 ? (
                                    <Crown className="w-3 h-3 text-yellow-500" />
                                  ) : (
                                    <Shield className="w-3 h-3 text-blue-500" />
                                  )}
                                </div>
                              )}
                            </div>
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={appraiser.avatar} />
                              <AvatarFallback className="text-xs">
                                {getInitials(appraiser.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{appraiser.name}</span>
                                {isSelected && (
                                  <Badge variant={selectionIndex === 0 ? "default" : "secondary"} className="text-xs">
                                    {selectionIndex === 0 ? "Primary" : "Secondary"}
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {appraiser.department}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {appraiser.position}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                {appraiser.email}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          {currentStep === 'employees' ? (
            <Button 
              onClick={handleNext} 
              disabled={selectedEmployees.length === 0 || isSubmitting}
              className="gap-2"
            >
              Next: Select Appraisers
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                Back
              </Button>
              <Button 
                onClick={handleBulkAssignment} 
                disabled={selectedAppraisers.length === 0 || isSubmitting || loading}
                className="gap-2"
              >
                {(isSubmitting || loading) ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Assign to {selectedEmployees.length} Employee{selectedEmployees.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}