import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Edit2, Plus, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Department {
  id: number;
  name: string;
  employeeCount: number;
  manager: string;
}

interface DepartmentTabProps {
  departments: Department[];
}

const DepartmentTab = ({ departments }: DepartmentTabProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const { toast } = useToast();

  const handleAddDepartment = () => {
    if (!newDepartmentName.trim()) {
      toast({
        title: "Error",
        description: "Department name is required",
        variant: "destructive",
      });
      return;
    }

    // TODO: Add department to database
    console.log("Adding department:", newDepartmentName);
    
    toast({
      title: "Success",
      description: `Department "${newDepartmentName}" added successfully`,
    });
    
    setNewDepartmentName("");
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setNewDepartmentName("");
    setShowAddForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Departments ({departments.length})</h3>
        <Button onClick={() => setShowAddForm(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Department name"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddDepartment()}
                className="flex-1"
              />
              <Button onClick={handleAddDepartment} size="sm">
                <Check className="h-4 w-4" />
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {departments.map((department) => (
          <div key={department.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">{department.name}</h4>
                <p className="text-sm text-muted-foreground">Manager: {department.manager}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                {department.employeeCount} employees
              </Badge>
              <Button variant="outline" size="sm">
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentTab;