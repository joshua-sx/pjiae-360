import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";

interface PasteDataCardProps {
  uploadMethod: 'upload' | 'paste' | 'manual' | null;
  csvData: string;
  onDataChange: (data: string) => void;
  onMethodChange: (method: 'paste') => void;
  onParse: (csvText: string) => void;
}

export function PasteDataCard({ 
  uploadMethod, 
  csvData, 
  onDataChange, 
  onMethodChange, 
  onParse 
}: PasteDataCardProps) {
  return (
    <Card className={`transition-all border-2 ${uploadMethod === 'paste' ? 'border-primary bg-primary/5' : 'border-border'}`}>
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
              onDataChange(e.target.value);
              onMethodChange('paste');
            }}
            placeholder="first name,last name,email,job title,department,division&#10;John,Doe,john@company.com,Engineer,Engineering,Technology&#10;Jane,Smith,jane@company.com,Manager,Marketing,Commercial"
            className="h-24 font-mono text-sm resize-none"
          />
          <Button
            onClick={() => onParse(csvData)}
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