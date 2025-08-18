
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";

interface Person {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  division: string;
  employeeId?: string;
  phoneNumber?: string;
}

interface FormPerson {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  division: string;
  department: string;
  employeeId: string;
  phoneNumber: string;
}

interface ManualAddPeopleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (people: Person[]) => void;
}

export default function ManualAddPeopleModal({ isOpen, onClose, onSave }: ManualAddPeopleModalProps) {
  const [people, setPeople] = useState<FormPerson[]>([
    { firstName: "", lastName: "", email: "", role: "", division: "", department: "", employeeId: "", phoneNumber: "" }
  ]);

  const addPerson = () => {
    setPeople([...people, { firstName: "", lastName: "", email: "", role: "", division: "", department: "", employeeId: "", phoneNumber: "" }]);
  };

  const removePerson = (index: number) => {
    if (people.length > 1) {
      setPeople(people.filter((_, i) => i !== index));
    }
  };

  const updatePerson = (index: number, field: keyof FormPerson, value: string) => {
    const updated = people.map((person, i) => 
      i === index ? { ...person, [field]: value } : person
    );
    setPeople(updated);
  };

  const handleSave = () => {
    const validPeople = people.filter(person => 
      person.firstName.trim() && 
      person.lastName.trim() &&
      person.email.trim() && 
      person.role.trim()
    );
    
    if (validPeople.length > 0) {
      // Convert to the expected format
      const convertedPeople = validPeople.map(person => ({
        firstName: person.firstName.trim(),
        lastName: person.lastName.trim(),
        email: person.email,
        jobTitle: person.role,
        department: person.department || '',
        division: person.division || '',
        employeeId: person.employeeId || '', // Added: persist employee ID
        phoneNumber: person.phoneNumber || '' // Added: persist phone number
      }));
      
      onSave(convertedPeople);
      setPeople([{ firstName: "", lastName: "", email: "", role: "", division: "", department: "", employeeId: "", phoneNumber: "" }]); // Reset form
      onClose();
    }
  };

  const isValid = people.some(person => 
    person.firstName.trim() && 
    person.lastName.trim() &&
    person.email.trim() && 
    person.role.trim()
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Add Team Members</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {people.map((person, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Person {index + 1}</h4>
                {people.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePerson(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              {/* Row 1: First Name, Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`firstName-${index}`}>First Name *</Label>
                  <Input
                    id={`firstName-${index}`}
                    data-testid="employee-name"
                    value={person.firstName}
                    onChange={(e) => updatePerson(index, 'firstName', e.target.value)}
                    placeholder="Joshua"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`lastName-${index}`}>Last Name *</Label>
                  <Input
                    id={`lastName-${index}`}
                    value={person.lastName}
                    onChange={(e) => updatePerson(index, 'lastName', e.target.value)}
                    placeholder="Smith"
                  />
                </div>
              </div>
              
              {/* Row 2: Email, Role */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`email-${index}`}>Email *</Label>
                  <Input
                    id={`email-${index}`}
                    data-testid="employee-email"
                    type="email"
                    value={person.email}
                    onChange={(e) => updatePerson(index, 'email', e.target.value)}
                    placeholder="joshua.smith@company.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`role-${index}`}>Role *</Label>
                  <Select value={person.role} onValueChange={(value) => updatePerson(index, 'role', value)}>
                    <SelectTrigger id={`role-${index}`}>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Employee">Employee</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Director">Director</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Row 3: Division, Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`division-${index}`}>Division</Label>
                  <Input
                    id={`division-${index}`}
                    data-testid="employee-division"
                    value={person.division}
                    onChange={(e) => updatePerson(index, 'division', e.target.value)}
                    placeholder="Engineering (optional)"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`department-${index}`}>Department</Label>
                  <Input
                    id={`department-${index}`}
                    data-testid="employee-department"
                    value={person.department}
                    onChange={(e) => updatePerson(index, 'department', e.target.value)}
                    placeholder="Software Development (optional)"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <Button
            variant="outline"
            onClick={addPerson}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Person
          </Button>
        </div>
        
        <div className="flex gap-3 pt-4 flex-shrink-0 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid} className="flex-1" data-testid="save-employee">
            Add Team Members
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
