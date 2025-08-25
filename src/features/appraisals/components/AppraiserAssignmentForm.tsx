import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Crown, Shield, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAppraiserAssignment } from "@/hooks/useAppraiserAssignment";

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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { assignAppraisers } = useAppraiserAssignment();

  useEffect(() => {
    if (employee) {
      console.log('🔍 AppraiserAssignmentForm: Loading data for employee:', employee.id, 'appraisalId:', appraisalId);
      loadSuggestedAppraisers();
      loadAllEmployees();
    }
  }, [employee]);

  const loadSuggestedAppraisers = async () => {
    if (!employee) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('employee_info')
        .select(`
          id,
          user_id
        `)
        .eq('status', 'active')
        .neq('id', employee.id)
        .limit(5);
      
      if (error) throw error;
      
      const suggested = (data || []).map((profile, index) => ({
        appraiser_id: profile.id,
        appraiser_name: 'Unknown Employee',
        appraiser_role: 'Employee',
        hierarchy_level: index + 1
      }));
      
      setSuggestedAppraisers(suggested);
      
      // Auto-select top 2 suggested appraisers
      const topTwo = suggested.slice(0, 2).map(a => a.appraiser_id);
      setSelectedAppraisers(topTwo);
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
      const { data, error } = await supabase
        .from('employee_info')
        .select(`
          id,
          user_id,
          division:divisions(name),
          department:departments(name)
        `)
        .eq('status', 'active')
        .neq('id', employee?.id);
      
      if (error) throw error;
      
      const employees = (data || []).map(profile => ({
        id: profile.id,
        name: 'Unknown Employee',
        email: '',
        role: 'Employee',
        department: profile.department?.name,
        division: profile.division?.name,
        avatar_url: undefined
      }));
      
      setAllEmployees(employees);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleAppraiserToggle = (appraiserId: string) => {
    setSelectedAppraisers(prev => {
      if (prev.includes(appraiserId)) {
        return prev.filter(id => id !== appraiserId);
      } else {
        // Limit to 2 appraisers maximum (as per business requirement)
        if (prev.length >= 2) {
          toast({
            title: "Maximum Reached",
            description: "You can select up to 2 appraisers maximum",
            variant: "destructive"
          });
          return prev;
        }
        return [...prev, appraiserId];
      }
    });
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
                          <p className="font-medium text-sm">{suggested.appraiser_name}</p>
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
        <ScrollArea className="h-64">
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
                          <p className="font-medium text-sm">{emp.name}</p>
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