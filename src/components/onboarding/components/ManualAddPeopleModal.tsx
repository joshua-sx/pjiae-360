
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

interface Person {
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  division: string;
}

interface ManualAddPeopleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (people: Person[]) => void;
}

export default function ManualAddPeopleModal({ isOpen, onClose, onSave }: ManualAddPeopleModalProps) {
  const [people, setPeople] = useState<Person[]>([
    { name: "", email: "", jobTitle: "", department: "", division: "" }
  ]);

  const addPerson = () => {
    setPeople([...people, { name: "", email: "", jobTitle: "", department: "", division: "" }]);
  };

  const removePerson = (index: number) => {
    if (people.length > 1) {
      setPeople(people.filter((_, i) => i !== index));
    }
  };

  const updatePerson = (index: number, field: keyof Person, value: string) => {
    const updated = people.map((person, i) => 
      i === index ? { ...person, [field]: value } : person
    );
    setPeople(updated);
  };

  const handleSave = () => {
    const validPeople = people.filter(person => 
      person.name.trim() && 
      person.email.trim() && 
      person.jobTitle.trim() && 
      person.department.trim() && 
      person.division.trim()
    );
    
    if (validPeople.length > 0) {
      onSave(validPeople);
      onClose();
    }
  };

  const isValid = people.some(person => 
    person.name.trim() && 
    person.email.trim() && 
    person.jobTitle.trim() && 
    person.department.trim() && 
    person.division.trim()
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Team Members</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
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
                  <Label htmlFor={`name-${index}`}>Name *</Label>
                  <Input
                    id={`name-${index}`}
                    value={person.name}
                    onChange={(e) => updatePerson(index, 'name', e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`email-${index}`}>Email *</Label>
                  <Input
                    id={`email-${index}`}
                    type="email"
                    value={person.email}
                    onChange={(e) => updatePerson(index, 'email', e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`jobTitle-${index}`}>Job Title *</Label>
                  <Input
                    id={`jobTitle-${index}`}
                    value={person.jobTitle}
                    onChange={(e) => updatePerson(index, 'jobTitle', e.target.value)}
                    placeholder="Enter job title"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`department-${index}`}>Department *</Label>
                  <Input
                    id={`department-${index}`}
                    value={person.department}
                    onChange={(e) => updatePerson(index, 'department', e.target.value)}
                    placeholder="Enter department"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor={`division-${index}`}>Division *</Label>
                <Input
                  id={`division-${index}`}
                  value={person.division}
                  onChange={(e) => updatePerson(index, 'division', e.target.value)}
                  placeholder="Enter division"
                />
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
        
        <div className="flex gap-3 pt-4">
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
