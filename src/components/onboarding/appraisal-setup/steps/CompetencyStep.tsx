import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, Star, AlertCircle, Target, Trash2, ChevronDown, ChevronRight, Eye } from "lucide-react";
import { CycleData, Competency } from "../types";
import { ValidationErrors } from "../validation";
import { useState } from "react";
import { toast } from "sonner";

interface CompetencyStepProps {
  data: CycleData;
  onDataChange: (updates: Partial<CycleData>) => void;
  errors: ValidationErrors;
}

export const CompetencyStep = ({ data, onDataChange, errors }: CompetencyStepProps) => {
  const [newCompetency, setNewCompetency] = useState({
    name: '',
    description: '',
  });
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleCompetencyChange = (updates: Partial<CycleData['competencyCriteria']>) => {
    onDataChange({
      competencyCriteria: { ...data.competencyCriteria, ...updates }
    });
  };

  const handleCompetencyToggle = (competencyName: string, enabled: boolean) => {
    const competencies = data.competencyCriteria.competencies || [];
    const updatedCompetencies = competencies.map(comp =>
      comp.name === competencyName ? { ...comp, applicable: enabled } : comp
    );
    
    handleCompetencyChange({ competencies: updatedCompetencies });
  };

  const addCustomCompetency = () => {
    if (!newCompetency.name || !newCompetency.description) {
      toast.error("Please fill in both name and description");
      return;
    }

    const competencies = data.competencyCriteria.competencies || [];
    const updatedCompetencies = [...competencies, {
      ...newCompetency,
      applicable: true,
      optional: false,
    }];

    handleCompetencyChange({ competencies: updatedCompetencies });
    setNewCompetency({ name: '', description: '' });
    setIsAddingCustom(false);
    toast.success("Custom competency added");
  };

  const removeCustomCompetency = (competencyName: string) => {
    const competencies = data.competencyCriteria.competencies || [];
    const updatedCompetencies = competencies.filter(comp => comp.name !== competencyName);
    handleCompetencyChange({ competencies: updatedCompetencies });
    toast.success("Competency removed");
  };

  const scoringSystemOptions = [
    { 
      id: '5-point-scale', 
      name: '5-Point Scale', 
      description: 'Exceeds (5), Meets Plus (4), Meets (3), Below (2), Poor (1)',
      preview: '★★★★★'
    },
    { 
      id: '4-point-scale', 
      name: '4-Point Scale', 
      description: 'Exceptional (4), Proficient (3), Developing (2), Needs Improvement (1)',
      preview: '★★★★'
    },
    { 
      id: '3-point-scale', 
      name: '3-Point Scale', 
      description: 'Exceeds (3), Meets (2), Below (1)',
      preview: '★★★'
    },
    { 
      id: 'percentage', 
      name: 'Percentage', 
      description: '0-100% scoring system',
      preview: '85%'
    },
  ];

  const competencies = data.competencyCriteria.competencies || [];
  const enabledCompetencies = competencies.filter(comp => comp.applicable !== false);
  const selectedScoringSystem = scoringSystemOptions.find(s => s.id === data.competencyCriteria.scoringSystem);

  return (
    <div className="space-y-6">
      {/* Enable Competency Evaluation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Competencies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-base font-medium">
                Enable Competency-Based Evaluation
              </Label>
              <p className="text-sm text-muted-foreground">
                Include competency assessment as part of the performance review
              </p>
            </div>
            <Switch 
              checked={data.competencyCriteria.enabled} 
              onCheckedChange={(enabled) => handleCompetencyChange({ enabled })} 
            />
          </div>
          {errors['competencyCriteria.enabled'] && (
            <p className="text-sm text-destructive mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors['competencyCriteria.enabled'][0]}
            </p>
          )}
        </CardContent>
      </Card>

      {data.competencyCriteria.enabled && (
        <>
          {/* Scoring System */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Scoring System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Select Scoring System</Label>
                <Select
                  value={data.competencyCriteria.scoringSystem}
                  onValueChange={(scoringSystem) => handleCompetencyChange({ scoringSystem })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose scoring system" />
                  </SelectTrigger>
                  <SelectContent>
                    {scoringSystemOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{option.name}</span>
                          <span className="text-muted-foreground ml-2">{option.preview}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Scoring Preview */}
              {selectedScoringSystem && (
                <Collapsible open={showPreview} onOpenChange={setShowPreview}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Preview Scoring System
                      </span>
                      {showPreview ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">{selectedScoringSystem.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{selectedScoringSystem.description}</p>
                      <div className="text-lg font-mono">
                        Example: {selectedScoringSystem.preview}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {errors['competencyCriteria.scoringSystem'] && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors['competencyCriteria.scoringSystem'][0]}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Competencies Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Competencies</CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose which competencies to include in your performance reviews
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {competencies.map((competency, index) => (
                  <div key={`${competency.name}-${index}`} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <Checkbox
                      id={`competency-${index}`}
                      checked={competency.applicable !== false}
                      onCheckedChange={(checked) => handleCompetencyToggle(competency.name, !!checked)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`competency-${index}`} className="font-medium">
                          {competency.name}
                        </Label>
                        {/* Show remove button for custom competencies */}
                        {!['Job Knowledge', 'Quality of Work', 'Productivity', 'Initiative', 'Communication Skills', 'Teamwork', 'Adaptability/Flexibility', 'Dependability'].includes(competency.name) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeCustomCompetency(competency.name)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {competency.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Custom Competency */}
              {!isAddingCustom ? (
                <Button
                  variant="outline"
                  onClick={() => setIsAddingCustom(true)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom Competency
                </Button>
              ) : (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4 space-y-4">
                    <div>
                      <Label htmlFor="customName">Competency Name *</Label>
                      <Input
                        id="customName"
                        value={newCompetency.name}
                        onChange={(e) => setNewCompetency({ ...newCompetency, name: e.target.value })}
                        placeholder="e.g., Leadership"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customDescription">Description *</Label>
                      <Textarea
                        id="customDescription"
                        value={newCompetency.description}
                        onChange={(e) => setNewCompetency({ ...newCompetency, description: e.target.value })}
                        placeholder="Describe what this competency evaluates..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={addCustomCompetency} size="sm">
                        Add Competency
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddingCustom(false);
                          setNewCompetency({ name: '', description: '' });
                        }}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          {enabledCompetencies.length > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-primary" />
                  <h4 className="font-medium">Selected Competencies Summary</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {enabledCompetencies.map((competency, index) => (
                    <Badge key={`${competency.name}-${index}`} variant="secondary">
                      {competency.name}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  {enabledCompetencies.length} competenc{enabledCompetencies.length === 1 ? 'y' : 'ies'} selected for evaluation using {selectedScoringSystem?.name || 'Unknown'} scoring system.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};