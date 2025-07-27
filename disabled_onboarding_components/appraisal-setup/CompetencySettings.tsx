import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface Competency {
  name: string;
  description: string;
  optional?: boolean;
  applicable?: boolean;
}

interface CompetencyCriteria {
  enabled: boolean;
  model: string;
  customCriteria: string[];
  scoringSystem: string;
  competencies?: Competency[];
}

interface CompetencySettingsProps {
  competencyCriteria: CompetencyCriteria;
  onCompetencyChange: (updates: Partial<CompetencyCriteria>) => void;
}

export const CompetencySettings = ({ competencyCriteria, onCompetencyChange }: CompetencySettingsProps) => {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-medium">
              Enable Competency Evaluation
            </Label>
            <p className="text-sm text-muted-foreground">
              Include competency-based assessment in reviews
            </p>
          </div>
          <Switch 
            checked={competencyCriteria.enabled} 
            onCheckedChange={(enabled) => onCompetencyChange({ enabled })} 
          />
        </div>

        {competencyCriteria.enabled && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label>Scoring System</Label>
              <Select 
                value={competencyCriteria.scoringSystem} 
                onValueChange={(value) => onCompetencyChange({ scoringSystem: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select scoring system" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5-point-scale">5-Point Scale (1-5)</SelectItem>
                  <SelectItem value="4-point-scale">4-Point Scale (1-4)</SelectItem>
                  <SelectItem value="percentage">Percentage (0-100%)</SelectItem>
                  <SelectItem value="meets-exceeds">Meets/Exceeds Expectations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Core Competencies Preview */}
            <div className="space-y-2">
              <Label>Core Competencies (PJIAE Model)</Label>
              <ScrollArea className="h-40 rounded-md border bg-muted/30 p-4">
                <div className="space-y-2">
                  {competencyCriteria.competencies?.map((competency, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{competency.name}</p>
                        <p className="text-xs text-muted-foreground">{competency.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};