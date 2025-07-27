
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface AddDivisionFormProps {
  onAddDivision: (name?: string) => void;
}

export default function AddDivisionForm({ onAddDivision }: AddDivisionFormProps) {
  const [newDivisionName, setNewDivisionName] = useState('');

  const handleAddDivision = () => {
    onAddDivision();
    setNewDivisionName('');
  };

  return (
    <div className="flex space-x-3">
      <Input
        value={newDivisionName}
        onChange={(e) => setNewDivisionName(e.target.value)}
        placeholder="Add a new division..."
        className="flex-1"
        onKeyPress={(e) => e.key === 'Enter' && handleAddDivision()}
      />
      <Button
        onClick={handleAddDivision}
        disabled={!newDivisionName.trim()}
        className="bg-primary hover:bg-primary/90"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Division
      </Button>
    </div>
  );
}
