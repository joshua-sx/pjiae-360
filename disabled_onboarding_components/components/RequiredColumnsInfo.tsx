
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function RequiredColumnsInfo() {
  const requiredColumns = [
    { name: 'First Name', required: true },
    { name: 'Last Name', required: true },
    { name: 'Email Address', required: true },
    { name: 'Division', required: false },
    { name: 'Department', required: false }
  ];

  return (
    <Card className="mb-6 border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <FileText className="w-4 h-4 text-muted-foreground" />
          Required CSV Columns
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {requiredColumns.map((column, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={`w-1.5 h-1.5 rounded-full ${
                column.required ? 'bg-primary' : 'bg-muted-foreground/40'
              }`} />
              <span className={`text-sm ${
                column.required ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}>
                {column.name}
                {!column.required && <span className="ml-1 text-xs">(optional)</span>}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground/80 mt-4 leading-relaxed">
          Column names are flexible — we'll help you map them in the next step
        </p>
      </CardContent>
    </Card>
  );
}
