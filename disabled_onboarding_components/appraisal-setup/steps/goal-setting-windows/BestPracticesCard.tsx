
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

export const BestPracticesCard = () => {
  return (
    <Card className="bg-muted/50">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-medium mb-2">Best Practices</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Allow at least 2-4 weeks for goal setting activities</li>
              <li>• Schedule goal windows before review periods</li>
              <li>• Consider organizational calendar (holidays, busy periods)</li>
              <li>• Provide buffer time between goal setting and review periods</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
