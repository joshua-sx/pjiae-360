import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

import { EmployeeData } from "./types";

interface ManualAddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employees: EmployeeData[]) => void;
}

export function ManualAddEmployeeModal({ isOpen, onClose, onSave }: ManualAddEmployeeModalProps) {
  const [employees, setEmployees] = useState<EmployeeData[]>([
    { employeeId: "", firstName: "", lastName: "", email: "", phoneNumber: "", jobTitle: "", department: "", division: "" }
  ]);

  const addEmployee = () => {
    setEmployees([...employees, { employeeId: "", firstName: "", lastName: "", email: "", phoneNumber: "", jobTitle: "", department: "", division: "" }]);
  };

  const removeEmployee = (index: number) => {
    if (employees.length > 1) {
      setEmployees(employees.filter((_, i) => i !== index));
    }
  };

  const updateEmployee = (index: number, field: keyof EmployeeData, value: string | EmployeeData['role']) => {
    const updated = [...employees];
    (updated[index] as any)[field] = value;
    setEmployees(updated);
  };

  const handleSave = () => {
    const validEmployees = employees.filter(emp => 
      emp.firstName.trim() && emp.lastName.trim() && emp.email.trim()
    );
    
    if (validEmployees.length === 0) {
      return;
    }

    onSave(validEmployees);
    setEmployees([{ employeeId: "", firstName: "", lastName: "", email: "", phoneNumber: "", jobTitle: "", department: "", division: "" }]);
    onClose();
  };

  const handleClose = () => {
    setEmployees([{ employeeId: "", firstName: "", lastName: "", email: "", phoneNumber: "", jobTitle: "", department: "", division: "" }]);
    onClose();
  };

  const isValid = employees.some(emp => emp.firstName.trim() || emp.lastName.trim() || emp.email.trim());

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Employees Manually</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {employees.map((employee, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Employee {index + 1}</h4>
                {employees.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeEmployee(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`employeeId-${index}`}>Employee ID</Label>
                  <Input
                    id={`employeeId-${index}`}
                    value={employee.employeeId}
                    onChange={(e) => updateEmployee(index, 'employeeId', e.target.value)}
                    placeholder="Enter employee ID"
                  />
                </div>

                <div>
                  <Label htmlFor={`firstName-${index}`}>First Name *</Label>
                  <Input
                    id={`firstName-${index}`}
                    value={employee.firstName}
                    onChange={(e) => updateEmployee(index, 'firstName', e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`lastName-${index}`}>Last Name *</Label>
                  <Input
                    id={`lastName-${index}`}
                    value={employee.lastName}
                    onChange={(e) => updateEmployee(index, 'lastName', e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`email-${index}`}>Email *</Label>
                  <Input
                    id={`email-${index}`}
                    type="email"
                    value={employee.email}
                    onChange={(e) => updateEmployee(index, 'email', e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <Label htmlFor={`phoneNumber-${index}`}>Phone Number</Label>
                  <Input
                    id={`phoneNumber-${index}`}
                    value={employee.phoneNumber}
                    onChange={(e) => updateEmployee(index, 'phoneNumber', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`jobTitle-${index}`}>Job Title</Label>
                  <Input
                    id={`jobTitle-${index}`}
                    value={employee.jobTitle}
                    onChange={(e) => updateEmployee(index, 'jobTitle', e.target.value)}
                    placeholder="Enter job title"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`department-${index}`}>Department</Label>
                  <Input
                    id={`department-${index}`}
                    value={employee.department}
                    onChange={(e) => updateEmployee(index, 'department', e.target.value)}
                    placeholder="Enter department"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`division-${index}`}>Division</Label>
                  <Input
                    id={`division-${index}`}
                    value={employee.division}
                    onChange={(e) => updateEmployee(index, 'division', e.target.value)}
                    placeholder="Enter division"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <Button
            variant="outline"
            onClick={addEmployee}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Employee
          </Button>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!isValid}>
              Add Employees
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}