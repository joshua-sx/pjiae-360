
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trash2 } from "lucide-react";
import { CycleData } from "../../types";
import { toast } from "sonner";

interface GoalWindowsListProps {
  goalSettingWindows: CycleData['goalSettingWindows'];
  reviewPeriods: CycleData['reviewPeriods'];
  onRemove: (id: string) => void;
}

export const GoalWindowsList = ({ goalSettingWindows, reviewPeriods, onRemove }: GoalWindowsListProps) => {
  const handleRemove = (id: string) => {
    // Check if any review periods depend on this window
    const dependentPeriods = reviewPeriods.filter(period => period.goalWindowId === id);
    if (dependentPeriods.length > 0) {
      toast.error(`Cannot remove window. It's linked to ${dependentPeriods.length} review period(s)`);
      return;
    }

    onRemove(id);
    toast.success("Goal setting window removed");
  };

  if (goalSettingWindows.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Configured Windows</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goalSettingWindows.map((window) => (
            <div key={window.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium">{window.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {window.startDate.toLocaleDateString()}
                    </span>
                    <span>to</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {window.endDate.toLocaleDateString()}
                    </span>
                    <Badge variant="outline">
                      {Math.ceil((window.endDate.getTime() - window.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemove(window.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
