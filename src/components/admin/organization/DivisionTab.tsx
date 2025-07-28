import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Edit2, Plus, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Division {
  id: number;
  name: string;
  departmentCount: number;
  head: string;
}

import { useDemoMode } from "@/contexts/DemoModeContext";
import { generateDemoDivisions } from "@/lib/demoData";

// Real data fetch function placeholder
const fetchRealDivisions = async (): Promise<Division[]> => {
  // TODO: Implement real division fetching from database
  return [];
};

const DivisionTab = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDivisionName, setNewDivisionName] = useState("");
  const [divisions, setDivisions] = useState<Division[]>([]);
  const { toast } = useToast();
  const { isDemoMode, demoRole } = useDemoMode();

  useEffect(() => {
    if (isDemoMode) {
      setDivisions(generateDemoDivisions(demoRole));
    } else {
      fetchRealDivisions().then(setDivisions);
    }
  }, [isDemoMode, demoRole]);

  const handleAddDivision = () => {
    if (!newDivisionName.trim()) {
      toast({
        title: "Error",
        description: "Division name is required",
        variant: "destructive",
      });
      return;
    }

    // TODO: Add division to database
    console.log("Adding division:", newDivisionName);
    
    toast({
      title: "Success",
      description: `Division "${newDivisionName}" added successfully`,
    });
    
    setNewDivisionName("");
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setNewDivisionName("");
    setShowAddForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Divisions ({divisions.length})</h3>
        <Button onClick={() => setShowAddForm(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Division
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Division name"
                value={newDivisionName}
                onChange={(e) => setNewDivisionName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddDivision()}
                className="flex-1"
              />
              <Button onClick={handleAddDivision} size="sm">
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
        {divisions.map((division) => (
          <div key={division.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">{division.name}</h4>
                <p className="text-sm text-muted-foreground">Head: {division.head}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                {division.departmentCount} departments
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

export default DivisionTab;