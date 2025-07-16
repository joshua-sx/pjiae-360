
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OnboardingData } from "./OnboardingTypes";
import StructureHeader from "./components/StructureHeader";
import QuickSuggestions from "./components/QuickSuggestions";
import AddDivisionForm from "./components/AddDivisionForm";
import DivisionCard from "./components/DivisionCard";
import NavigationFooter from "./components/NavigationFooter";
import { PJIAE_DIVISIONS, convertToOnboardingStructure } from "./PJIAEStructureDefaults";

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

  const addDivision = (name?: string) => {
    const divisionName = name || '';
    if (divisionName.trim()) {
      const newDivision: Division = {
        id: `div_${Date.now()}`,
        name: divisionName,
        type: 'division' as const,
        departments: []
      };
      setDivisions([...divisions, newDivision]);
    }
  };

  const usePJIAEStructure = () => {
    const pjiaeStructure = PJIAE_DIVISIONS.map(div => ({
      id: div.id,
      name: div.name,
      type: 'division' as const,
      departments: div.departments.map(dept => ({
        id: dept.id,
        name: dept.name
      }))
    }));
    setDivisions(pjiaeStructure);
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
    <div className="flex-1 flex flex-col bg-slate-50">
      <ScrollArea className="flex-1">
        <div className="px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <StructureHeader />

            <div className="space-y-8">
              <QuickSuggestions 
                onAddDivision={addDivision} 
                onUsePJIAEStructure={usePJIAEStructure}
              />
              <AddDivisionForm onAddDivision={addDivision} />

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
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="border-t bg-white px-6 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex gap-4">
          <Button onClick={onBack} variant="outline" className="flex-1">
            ← Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!hasValidStructure || isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              "Continue →"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StructureOrg;
