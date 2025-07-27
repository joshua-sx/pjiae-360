
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { ValidationErrors } from "../../validation";

interface ValidationErrorProps {
  errors: ValidationErrors;
}

export const ValidationError = ({ errors }: ValidationErrorProps) => {
  if (!errors.goalSettingWindows) {
    return null;
  }

  return (
    <Card className="border-destructive">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="w-4 h-4" />
          <span className="font-medium">Validation Error</span>
        </div>
        <p className="text-sm text-destructive mt-1">
          {errors.goalSettingWindows[0]}
        </p>
      </CardContent>
    </Card>
  );
};
