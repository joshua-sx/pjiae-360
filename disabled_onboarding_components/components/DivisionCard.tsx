
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building, Users, Trash2, Plus } from "lucide-react";

interface Division {
  id: string;
  name: string;
  type: 'division';
  departments: Array<{ id: string; name: string }>;
}

interface DivisionCardProps {
  division: Division;
  onUpdateName: (name: string) => void;
  onRemove: () => void;
  onAddDepartment: (name: string) => void;
  onRemoveDepartment: (deptId: string) => void;
  canRemove: boolean;
}

export default function DivisionCard({ 
  division, 
  onUpdateName, 
  onRemove, 
  onAddDepartment, 
  onRemoveDepartment,
  canRemove 
}: DivisionCardProps) {
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
          <Building className="w-5 h-5 text-primary" />
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
}
