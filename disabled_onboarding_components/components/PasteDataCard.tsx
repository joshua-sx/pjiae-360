
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";
import { sanitizeCSVData } from "@/lib/sanitization";
import { csvDataSchema } from "@/lib/validation";

interface PasteDataCardProps {
  uploadMethod: 'upload' | 'paste' | 'manual';
  csvData: string;
  onDataChange: (data: string) => void;
  onMethodChange: (method: 'paste') => void;
  onParse: () => void;
}

export default function PasteDataCard({ 
  uploadMethod, 
  csvData, 
  onDataChange, 
  onMethodChange, 
  onParse 
}: PasteDataCardProps) {
  return (
    <Card className={`transition-all border-2 ${uploadMethod === 'paste' ? 'border-primary bg-primary/5' : 'border-slate-200'}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Paste CSV Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Textarea
            value={csvData}
            onChange={(e) => {
              const sanitizedData = sanitizeCSVData(e.target.value);
              const validation = csvDataSchema.safeParse(sanitizedData);
              if (validation.success) {
                onDataChange(sanitizedData);
                onMethodChange('paste');
              }
            }}
            placeholder="first name,last name,email,division,department&#10;John,Doe,john@company.com,Operations,Engineering&#10;Jane,Smith,jane@company.com,Commercial,Marketing"
            className="h-24 font-mono text-sm resize-none"
            sanitize
          />
          <Button
            onClick={onParse}
            disabled={!csvData.trim()}
            variant="outline"
            className="w-full"
            size="sm"
          >
            Parse Data →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
