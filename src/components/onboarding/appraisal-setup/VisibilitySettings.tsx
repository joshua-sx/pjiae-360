import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Eye } from "lucide-react";

interface VisibilitySettingsProps {
  visibility: boolean;
  onVisibilityChange: (visibility: boolean) => void;
}

export const VisibilitySettings = ({ visibility, onVisibilityChange }: VisibilitySettingsProps) => {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-medium flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Review Visibility
            </Label>
            <p className="text-sm text-muted-foreground">
              Employees can see their review status and feedback
            </p>
          </div>
          <Switch 
            checked={visibility} 
            onCheckedChange={onVisibilityChange} 
          />
        </div>
      </div>
    </Card>
  );
};