
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function RequiredColumnsInfo() {
  const requiredColumns = [
    'Name (Full Name, First Name + Last Name)',
    'Email (Email Address, Work Email)',
    'Department (Optional - can be mapped later)'
  ];

  return (
    <Card className="mb-8 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Required CSV Columns
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {requiredColumns.map((column, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <p className="text-slate-700 text-sm">{column}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-600 mt-3">
          💡 Column names are flexible - we'll help you map them in the next step
        </p>
      </CardContent>
    </Card>
  );
}
