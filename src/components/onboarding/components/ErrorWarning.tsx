
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface ErrorWarningProps {
  invalidCount: number;
}

export default function ErrorWarning({ invalidCount }: ErrorWarningProps) {
  if (invalidCount === 0) return null;

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          <p className="font-medium text-orange-800">
            {invalidCount} entries have errors and will be skipped
          </p>
        </div>
        <p className="text-sm text-orange-700">
          Only valid entries will be imported. You can add the skipped entries manually later.
        </p>
      </CardContent>
    </Card>
  );
}
