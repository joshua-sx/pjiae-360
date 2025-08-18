import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

interface DepartmentSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  divisionId?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function DepartmentSelector({ 
  value, 
  onValueChange, 
  divisionId, 
  disabled = false,
  placeholder = "Select department"
}: DepartmentSelectorProps) {
  const { departments, divisions, refetch } = useProfile();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredDepartments = departments.filter(dept => 
    !divisionId || dept.division_id === divisionId
  );

  const selectedDivision = divisions.find(d => d.id === divisionId);

  const createDepartment = async () => {
    if (!newDepartmentName.trim()) return;

    setIsCreating(true);
    try {
      // Get user's organization ID for the department
      const { data: orgData } = await supabase.rpc('get_current_user_org_id');
      
      const { data, error } = await supabase
        .from('departments')
        .insert({
          name: newDepartmentName.trim(),
          normalized_name: newDepartmentName.trim().toLowerCase(),
          organization_id: orgData,
          division_id: divisionId || null
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Department created",
        description: `${newDepartmentName} has been added successfully.`
      });

      setNewDepartmentName('');
      setDialogOpen(false);
      refetch();
      
      // Auto-select the newly created department
      onValueChange(data.id);
    } catch (error) {
      console.error('Error creating department:', error);
      toast({
        variant: "destructive",
        title: "Creation failed",
        description: "Unable to create department. Please try again."
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Department</Label>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Plus className="h-3 w-3 mr-1" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Department</DialogTitle>
              <DialogDescription>
                Add a new department to your organization
                {selectedDivision && ` in the ${selectedDivision.name} division`}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="department-name">Department Name</Label>
                <Input
                  id="department-name"
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  placeholder="e.g. Human Resources"
                />
              </div>
              {selectedDivision && (
                <div className="text-sm text-muted-foreground">
                  This department will be created in the <strong>{selectedDivision.name}</strong> division.
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={createDepartment}
                disabled={isCreating || !newDepartmentName.trim()}
              >
                {isCreating ? 'Creating...' : 'Create Department'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">No department</SelectItem>
          {filteredDepartments.map((department) => (
            <SelectItem key={department.id} value={department.id}>
              {department.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {divisionId && filteredDepartments.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No departments found in this division. Create one using the button above.
        </p>
      )}
    </div>
  );
}