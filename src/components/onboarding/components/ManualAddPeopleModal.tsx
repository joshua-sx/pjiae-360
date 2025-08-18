
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
}

interface FormPerson {
  fullName: string;
  email: string;
  role: string;
  department: string;
}

interface ManualAddPeopleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (people: Person[]) => void;
}

export default function ManualAddPeopleModal({ isOpen, onClose, onSave }: ManualAddPeopleModalProps) {
  const [people, setPeople] = useState<FormPerson[]>([
    { fullName: "", email: "", role: "", department: "" }
  ]);

  const addPerson = () => {
    setPeople([...people, { fullName: "", email: "", role: "", department: "" }]);
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
      person.fullName.trim() && 
      person.email.trim() && 
      person.role.trim()
    );
    
    if (validPeople.length > 0) {
      // Convert to the expected format
      const convertedPeople = validPeople.map(person => {
        const nameParts = person.fullName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        return {
          firstName,
          lastName,
          email: person.email,
          jobTitle: person.role,
          department: person.department || '',
          division: ''
        };
      });
      
      onSave(convertedPeople);
      setPeople([{ fullName: "", email: "", role: "", department: "" }]); // Reset form
      onClose();
    }
  };

  const isValid = people.some(person => 
    person.fullName.trim() && 
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`fullName-${index}`}>Full Name *</Label>
                  <Input
                    id={`fullName-${index}`}
                    value={person.fullName}
                    onChange={(e) => updatePerson(index, 'fullName', e.target.value)}
                    placeholder="Joshua Smith"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`email-${index}`}>Email *</Label>
                  <Input
                    id={`email-${index}`}
                    type="email"
                    value={person.email}
                    onChange={(e) => updatePerson(index, 'email', e.target.value)}
                    placeholder="joshua.smith@company.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                
                <div>
                  <Label htmlFor={`department-${index}`}>Department</Label>
                  <Input
                    id={`department-${index}`}
                    value={person.department}
                    onChange={(e) => updatePerson(index, 'department', e.target.value)}
                    placeholder="Engineering (optional)"
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
          <Button onClick={handleSave} disabled={!isValid} className="flex-1">
            Add Team Members
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
