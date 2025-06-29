
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Building, Users, Trash2 } from "lucide-react";
import { OnboardingData } from "./OnboardingFlow";

interface StructureOrgProps {
  data: OnboardingData;
  onDataChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

interface Division {
  id: string;
  name: string;
  type: 'division';
  departments: Array<{ id: string; name: string }>;
}

const StructureOrg = ({ data, onDataChange, onNext, onBack, isLoading }: StructureOrgProps) => {
  const [divisions, setDivisions] = useState<Division[]>(
    data.orgStructure.length > 0 
      ? data.orgStructure
          .filter(unit => unit.type === 'division')
          .map(unit => ({
            id: unit.id,
            name: unit.name,
            type: 'division' as const,
            departments: data.orgStructure
              .filter(dept => dept.parent === unit.id)
              .map(dept => ({ id: dept.id, name: dept.name }))
          }))
      : [{ id: 'div1', name: '', type: 'division' as const, departments: [] }]
  );
  const [newDivisionName, setNewDivisionName] = useState('');

  const suggestions = ['HR', 'Finance', 'ICT', 'Marketing', 'Operations', 'Sales', 'Engineering'];

  const addDivision = (name?: string) => {
    const divisionName = name || newDivisionName.trim();
    if (divisionName) {
      const newDivision: Division = {
        id: `div_${Date.now()}`,
        name: divisionName,
        type: 'division' as const,
        departments: []
      };
      setDivisions([...divisions, newDivision]);
      setNewDivisionName('');
    }
  };

  const updateDivision = (divisionId: string, name: string) => {
    setDivisions(divisions.map(div => 
      div.id === divisionId ? { ...div, name } : div
    ));
  };

  const removeDivision = (divisionId: string) => {
    setDivisions(divisions.filter(div => div.id !== divisionId));
  };

  const addDepartment = (divisionId: string, departmentName: string) => {
    if (!departmentName.trim()) return;
    
    setDivisions(divisions.map(div => 
      div.id === divisionId 
        ? {
            ...div,
            departments: [...div.departments, {
              id: `dept_${Date.now()}`,
              name: departmentName.trim()
            }]
          }
        : div
    ));
  };

  const removeDepartment = (divisionId: string, departmentId: string) => {
    setDivisions(divisions.map(div => 
      div.id === divisionId 
        ? {
            ...div,
            departments: div.departments.filter(dept => dept.id !== departmentId)
          }
        : div
    ));
  };

  const handleNext = () => {
    const validDivisions = divisions.filter(div => div.name.trim());
    const orgStructure: OnboardingData['orgStructure'] = [];
    
    validDivisions.forEach(div => {
      orgStructure.push({
        id: div.id,
        name: div.name,
        type: div.type,
        rank: orgStructure.length + 1
      });
      
      div.departments.forEach(dept => {
        orgStructure.push({
          id: dept.id,
          name: dept.name,
          type: 'department',
          parent: div.id,
          rank: orgStructure.length + 1
        });
      });
    });
    
    onDataChange({ orgStructure });
    onNext();
  };

  const hasValidStructure = divisions.some(div => div.name.trim());

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            How is your organization structured?
          </h1>
          <p className="text-slate-600 text-lg">
            Create divisions and departments to organize your team
          </p>
        </div>

        <div className="space-y-8">
          {/* Quick suggestions */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">Quick suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => addDivision(suggestion)}
                  className="text-sm"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Add new division */}
          <div className="flex space-x-3">
            <Input
              value={newDivisionName}
              onChange={(e) => setNewDivisionName(e.target.value)}
              placeholder="Add a new division..."
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && addDivision()}
            />
            <Button
              onClick={() => addDivision()}
              disabled={!newDivisionName.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Division
            </Button>
          </div>

          {/* Divisions list */}
          <div className="space-y-6">
            {divisions.map((division) => (
              <DivisionCard
                key={division.id}
                division={division}
                onUpdateName={(name) => updateDivision(division.id, name)}
                onRemove={() => removeDivision(division.id)}
                onAddDepartment={(name) => addDepartment(division.id, name)}
                onRemoveDepartment={(deptId) => removeDepartment(division.id, deptId)}
                canRemove={divisions.length > 1}
              />
            ))}
          </div>

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isLoading}
            >
              Back
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!hasValidStructure || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Setting up..." : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DivisionCardProps {
  division: Division;
  onUpdateName: (name: string) => void;
  onRemove: () => void;
  onAddDepartment: (name: string) => void;
  onRemoveDepartment: (deptId: string) => void;
  canRemove: boolean;
}

const DivisionCard = ({ 
  division, 
  onUpdateName, 
  onRemove, 
  onAddDepartment, 
  onRemoveDepartment,
  canRemove 
}: DivisionCardProps) => {
  const [newDeptName, setNewDeptName] = useState('');

  const handleAddDepartment = () => {
    if (newDeptName.trim()) {
      onAddDepartment(newDeptName);
      setNewDeptName('');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1">
          <Building className="w-5 h-5 text-blue-600" />
          <Input
            value={division.name}
            onChange={(e) => onUpdateName(e.target.value)}
            placeholder="Division name..."
            className="font-semibold text-lg border-none p-0 h-auto focus-visible:ring-0"
          />
        </div>
        {canRemove && (
          <Button
            onClick={onRemove}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Departments */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-sm text-slate-600">
          <Users className="w-4 h-4" />
          <span>Departments</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-6">
          {division.departments.map((dept) => (
            <div
              key={dept.id}
              className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"
            >
              <span className="text-slate-700">{dept.name}</span>
              <Button
                onClick={() => onRemoveDepartment(dept.id)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-slate-400 hover:text-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex space-x-2 ml-6">
          <Input
            value={newDeptName}
            onChange={(e) => setNewDeptName(e.target.value)}
            placeholder="Add department..."
            className="text-sm"
            onKeyPress={(e) => e.key === 'Enter' && handleAddDepartment()}
          />
          <Button
            onClick={handleAddDepartment}
            disabled={!newDeptName.trim()}
            variant="outline"
            size="sm"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StructureOrg;
