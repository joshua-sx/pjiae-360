import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Crown, Shield, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAppraiserAssignment } from "@/hooks/useAppraiserAssignment";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { generateDemoEmployees } from "@/lib/demoData";

interface Employee {
  id: string;
  name: string;
  email: string;
  role?: string;
  department?: string;
  division?: string;
  avatar_url?: string;
}

interface SuggestedAppraiser {
  appraiser_id: string;
  appraiser_name: string;
  appraiser_role: string;
  hierarchy_level: number;
}

interface AppraiserAssignmentFormProps {
  employee: Employee | null;
  appraisalId: string | null;
  onAssignmentComplete: () => void;
  className?: string;
}

export default function AppraiserAssignmentForm({
  employee,
  appraisalId,
  onAssignmentComplete,
  className = ""
}: AppraiserAssignmentFormProps) {
  const [suggestedAppraisers, setSuggestedAppraisers] = useState<SuggestedAppraiser[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [selectedAppraisers, setSelectedAppraisers] = useState<string[]>([]);
  const [primaryAppraiser, setPrimaryAppraiser] = useState<string>("");
  const [secondaryAppraiser, setSecondaryAppraiser] = useState<string>("");
  const [currentUserEmployee, setCurrentUserEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { assignAppraisers } = useAppraiserAssignment();
  const { isDemoMode, demoRole } = useDemoMode();

  useEffect(() => {
    if (employee) {
      console.log('🔍 AppraiserAssignmentForm: Loading data for employee:', employee.id, 'appraisalId:', appraisalId);
      loadCurrentUser();
      loadSuggestedAppraisers();
      loadAllEmployees();
    }
  }, [employee]);

  // Update selected appraisers when primary/secondary change
  useEffect(() => {
    const newSelected = [primaryAppraiser, secondaryAppraiser].filter(Boolean);
    setSelectedAppraisers(newSelected);
  }, [primaryAppraiser, secondaryAppraiser]);

  const loadCurrentUser = async () => {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (currentUser.user) {
        const { data: employeeData } = await supabase
          .from('employee_info')
          .select(`
            id,
            user_id,
            job_title,
            profiles!inner(first_name, last_name, email, avatar_url)
          `)
          .eq('user_id', currentUser.user.id)
          .single();

        if (employeeData) {
          const userEmployee: Employee = {
            id: employeeData.id,
            name: `${employeeData.profiles.first_name} ${employeeData.profiles.last_name}`.trim() || employeeData.profiles.email,
            email: employeeData.profiles.email,
            role: employeeData.job_title || 'Employee',
            avatar_url: employeeData.profiles.avatar_url
          };
          setCurrentUserEmployee(userEmployee);
        }
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadSuggestedAppraisers = async () => {
    if (!employee) return;
    
    setLoading(true);
    try {
      if (isDemoMode) {
        // Generate demo suggested appraisers
        const demoEmployees = generateDemoEmployees(demoRole);
        const suggested = demoEmployees
          .filter(emp => emp.id !== employee.id)
          .slice(0, 5)
          .map((emp, index) => ({
            appraiser_id: emp.id,
            appraiser_name: `${emp.profile.first_name} ${emp.profile.last_name}`,
            appraiser_role: emp.job_title || 'Employee',
            hierarchy_level: index + 1
          }));

        // Add current user as suggested appraiser if not the appraisee
        if (currentUserEmployee && currentUserEmployee.id !== employee.id) {
          suggested.unshift({
            appraiser_id: currentUserEmployee.id,
            appraiser_name: `${currentUserEmployee.name} (You)`,
            appraiser_role: currentUserEmployee.role || 'Manager',
            hierarchy_level: 1
          });
        }

        setSuggestedAppraisers(suggested.slice(0, 5));
      } else {
        const { data, error } = await supabase
          .from('employee_info')
          .select(`
            id,
            user_id,
            job_title,
            profiles!inner(first_name, last_name, email)
          `)
          .eq('status', 'active')
          .neq('id', employee.id)
          .limit(5);
        
        if (error) throw error;
        
        const suggested = (data || []).map((profile, index) => ({
          appraiser_id: profile.id,
          appraiser_name: `${profile.profiles.first_name} ${profile.profiles.last_name}`.trim() || profile.profiles.email,
          appraiser_role: profile.job_title || 'Employee',
          hierarchy_level: index + 1
        }));
        
        setSuggestedAppraisers(suggested);
      }
    } catch (error) {
      console.error('Error loading suggested appraisers:', error);
      toast({
        title: "Error",
        description: "Failed to load suggested appraisers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAllEmployees = async () => {
    try {
      if (isDemoMode) {
        // Generate expanded demo employee list (20+ employees)
        const demoEmployees = generateDemoEmployees('admin'); // Get full list
        const employees = demoEmployees
          .filter(emp => emp.id !== employee?.id)
          .map(emp => ({
            id: emp.id,
            name: `${emp.profile.first_name} ${emp.profile.last_name}`,
            email: emp.profile.email,
            role: emp.job_title || 'Employee',
            department: emp.department?.name,
            division: emp.division?.name,
            avatar_url: emp.profile.avatar_url
          }));

        // Add current user to the list if not the appraisee
        if (currentUserEmployee && currentUserEmployee.id !== employee?.id) {
          employees.unshift({
            id: currentUserEmployee.id,
            name: `${currentUserEmployee.name} (You)`,
            email: currentUserEmployee.email,
            role: currentUserEmployee.role || 'Employee',
            department: currentUserEmployee.department || '',
            division: currentUserEmployee.division || '',
            avatar_url: currentUserEmployee.avatar_url
          });
        }

        setAllEmployees(employees);

        // Auto-select current user as primary and first suggested as secondary
        setTimeout(() => {
          if (currentUserEmployee && currentUserEmployee.id !== employee?.id) {
            setPrimaryAppraiser(currentUserEmployee.id);
            // Select first other employee as secondary
            const firstOther = employees.find(emp => emp.id !== currentUserEmployee.id);
            if (firstOther) {
              setSecondaryAppraiser(firstOther.id);
            }
          } else if (employees.length > 0) {
            setPrimaryAppraiser(employees[0].id);
            if (employees.length > 1) {
              setSecondaryAppraiser(employees[1].id);
            }
          }
        }, 100);
      } else {
        const { data, error } = await supabase
          .from('employee_info')
          .select(`
            id,
            user_id,
            job_title,
            profiles!inner(first_name, last_name, email, avatar_url),
            division:divisions(name),
            department:departments(name)
          `)
          .eq('status', 'active')
          .neq('id', employee?.id);
        
        if (error) throw error;
        
        const employees = (data || []).map(profile => ({
          id: profile.id,
          name: `${profile.profiles.first_name} ${profile.profiles.last_name}`.trim() || profile.profiles.email,
          email: profile.profiles.email,
          role: profile.job_title || 'Employee',
          department: profile.department?.name,
          division: profile.division?.name,
          avatar_url: profile.profiles.avatar_url
        }));
        
        setAllEmployees(employees);

        // Auto-select current user as primary if they're in the list
        setTimeout(() => {
          if (currentUserEmployee) {
            const userInList = employees.find(emp => emp.id === currentUserEmployee.id);
            if (userInList) {
              setPrimaryAppraiser(currentUserEmployee.id);
              const firstOther = employees.find(emp => emp.id !== currentUserEmployee.id);
              if (firstOther) {
                setSecondaryAppraiser(firstOther.id);
              }
            } else if (employees.length > 0) {
              setPrimaryAppraiser(employees[0].id);
              if (employees.length > 1) {
                setSecondaryAppraiser(employees[1].id);
              }
            }
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleAppraiserToggle = (appraiserId: string) => {
    if (selectedAppraisers.includes(appraiserId)) {
      // Remove from selection
      if (primaryAppraiser === appraiserId) {
        setPrimaryAppraiser(secondaryAppraiser);
        setSecondaryAppraiser("");
      } else if (secondaryAppraiser === appraiserId) {
        setSecondaryAppraiser("");
      }
    } else {
      // Add to selection
      if (!primaryAppraiser) {
        setPrimaryAppraiser(appraiserId);
      } else if (!secondaryAppraiser) {
        setSecondaryAppraiser(appraiserId);
      } else {
        // Replace secondary if both slots are filled
        setSecondaryAppraiser(appraiserId);
        toast({
          title: "Appraiser Updated",
          description: "Replaced secondary appraiser",
        });
      }
    }
  };

  const handlePrimaryChange = (value: string) => {
    setPrimaryAppraiser(value);
    // If secondary is same as new primary, clear it
    if (secondaryAppraiser === value) {
      setSecondaryAppraiser("");
    }
  };

  const handleSecondaryChange = (value: string) => {
    // Prevent selecting same person as primary
    if (value === primaryAppraiser) {
      toast({
        title: "Invalid Selection",
        description: "Primary and secondary appraisers must be different",
        variant: "destructive"
      });
      return;
    }
    setSecondaryAppraiser(value);
  };

  const handleSave = async () => {
    if (!employee || selectedAppraisers.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one appraiser",
        variant: "destructive"
      });
      return;
    }

    if (!appraisalId) {
      console.error('❌ AppraiserAssignmentForm: Missing appraisalId on submit', { employee, appraisalId });
      toast({
        title: "Missing information",
        description: "Unable to assign appraisers without a valid appraisal ID",
        variant: "destructive"  
      });
      return;
    }

    setSaving(true);
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('employee_info')
        .select('id')
        .eq('user_id', currentUser.user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      console.log('📋 AppraiserAssignmentForm: Assigning appraisers', {
        appraisalId,
        selectedAppraisers,
        assignedBy: profile.id
      });

      await assignAppraisers(appraisalId, selectedAppraisers, profile.id);

      toast({
        title: "Success",
        description: `Assigned ${selectedAppraisers.length} appraiser(s) to ${employee.name}`,
      });

      onAssignmentComplete();
    } catch (error) {
      console.error('Error assigning appraisers:', error);
      toast({
        title: "Error",
        description: "Failed to assign appraisers",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getAppraiserInfo = (appraiserId: string): Employee | undefined => {
    return allEmployees.find(emp => emp.id === appraiserId);
  };

  const getHierarchyIcon = (level: number) => {
    switch (level) {
      case 1: return <Crown className="w-4 h-4 text-yellow-600" />;
      case 2: return <Shield className="w-4 h-4 text-blue-600" />;
      default: return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getHierarchyLabel = (level: number) => {
    switch (level) {
      case 1: return "Direct Manager";
      case 2: return "Department Head";
      case 3: return "Division Director";
      default: return "Other";
    }
  };

  if (!employee) {
    return null;
  }

  const canAssign = appraisalId && selectedAppraisers.length > 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Employee Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={employee?.avatar_url} />
              <AvatarFallback>
                {employee?.name?.split(' ').map(n => n[0]).join('') || 'E'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{employee?.name}</p>
              <p className="text-sm text-muted-foreground">{employee?.role} • {employee?.department}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!appraisalId && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Please start the appraisal first to assign appraisers.
          </p>
        </div>
      )}

      {/* Appraiser Selection Controls */}
      <div className="space-y-4">
        <h3 className="font-medium">Select Appraisers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Primary Appraiser *</label>
            <Select value={primaryAppraiser} onValueChange={handlePrimaryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select primary appraiser" />
              </SelectTrigger>
              <SelectContent>
                {allEmployees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={emp.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {emp.name?.split(' ').map(n => n[0]).join('') || 'E'}
                        </AvatarFallback>
                      </Avatar>
                      <span>{emp.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Secondary Appraiser</label>
            <Select value={secondaryAppraiser} onValueChange={handleSecondaryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select secondary appraiser" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {allEmployees
                  .filter(emp => emp.id !== primaryAppraiser)
                  .map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={emp.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {emp.name?.split(' ').map(n => n[0]).join('') || 'E'}
                          </AvatarFallback>
                        </Avatar>
                        <span>{emp.name}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Suggested Appraisers */}
      {suggestedAppraisers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <h3 className="font-medium">Suggested Appraisers</h3>
            <Badge variant="secondary" className="text-xs">
              Based on hierarchy
            </Badge>
          </div>

          <div className="grid gap-3">
            {suggestedAppraisers.map((suggested) => {
              const appraiserInfo = getAppraiserInfo(suggested.appraiser_id);
              const isSelected = selectedAppraisers.includes(suggested.appraiser_id);
              
              return (
                <Card 
                  key={suggested.appraiser_id}
                  className={`cursor-pointer transition-colors border-0 shadow-sm ${
                    isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleAppraiserToggle(suggested.appraiser_id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox checked={isSelected} disabled />
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={appraiserInfo?.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {suggested.appraiser_name?.split(' ').map(n => n[0]).join('') || 'A'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{suggested.appraiser_name}</p>
                            {primaryAppraiser === suggested.appraiser_id && (
                              <Badge variant="default" className="text-xs">Primary</Badge>
                            )}
                            {secondaryAppraiser === suggested.appraiser_id && (
                              <Badge variant="secondary" className="text-xs">Secondary</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{suggested.appraiser_role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getHierarchyIcon(suggested.hierarchy_level)}
                        <span className="text-xs text-muted-foreground">
                          {getHierarchyLabel(suggested.hierarchy_level)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* All Employees */}
      <div className="space-y-3">
        <h3 className="font-medium">All Available Appraisers</h3>
        <ScrollArea className="h-80">
          <div className="grid gap-2">
            {allEmployees
              .filter(emp => !suggestedAppraisers.some(s => s.appraiser_id === emp.id))
              .map((emp) => {
                const isSelected = selectedAppraisers.includes(emp.id);
                
                return (
                  <Card 
                    key={emp.id}
                    className={`cursor-pointer transition-colors border-0 shadow-sm ${
                      isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleAppraiserToggle(emp.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <Checkbox checked={isSelected} disabled />
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={emp.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {emp.name?.split(' ').map(n => n[0]).join('') || 'E'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{emp.name}</p>
                            {primaryAppraiser === emp.id && (
                              <Badge variant="default" className="text-xs">Primary</Badge>
                            )}
                            {secondaryAppraiser === emp.id && (
                              <Badge variant="secondary" className="text-xs">Secondary</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {emp.role} • {emp.department}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          {selectedAppraisers.length} of 2 appraisers selected
        </div>
        <Button 
          onClick={handleSave} 
          disabled={!canAssign || saving}
        >
          {saving ? "Assigning..." : "Assign Appraisers"}
        </Button>
      </div>
    </div>
  );
}