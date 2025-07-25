import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";
import { sanitizeCSVData } from "@/lib/sanitization";
import { csvDataSchema } from "@/lib/validation";
import { scanCSVContent } from "@/lib/security";
import { toast } from "sonner";

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
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-border rounded-xl h-64 p-6 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 flex flex-col">
          <div className="text-center mb-4">
            <p className="text-foreground font-semibold text-lg mb-1">
              Paste your CSV data
            </p>
            <p className="text-muted-foreground text-sm">
              or enter data line by line
            </p>
          </div>
          <Textarea
            value={csvData}
            onChange={async (e) => {
              const sanitizedData = sanitizeCSVData(e.target.value);
              const validation = csvDataSchema.safeParse(sanitizedData);
              if (validation.success) {
                // Scan for malicious content
                const securityScan = await scanCSVContent(sanitizedData);
                if (!securityScan.isSafe) {
                  toast.error(`Security threat detected: ${securityScan.threats.join(', ')}`);
                  return;
                }
                
                onDataChange(sanitizedData);
                onMethodChange('paste');
              }
            }}
            placeholder="first name,last name,email,job title,department,division&#10;John,Doe,john@company.com,Engineer,Engineering,Technology&#10;Jane,Smith,jane@company.com,Manager,Marketing,Commercial"
            className="flex-1 font-mono text-sm resize-none w-full bg-background border-0 focus-visible:ring-0 p-2"
          />
          <div className="text-xs text-muted-foreground text-center mt-2">
            Expected columns: first name, last name, email, job title, department, division
          </div>
        </div>
        <Button
          onClick={async () => {
            if (csvData.trim()) {
              // Final security scan before parsing
              const securityScan = await scanCSVContent(csvData);
              if (!securityScan.isSafe) {
                toast.error(`Security threat detected: ${securityScan.threats.join(', ')}`);
                return;
              }
              onParse(csvData);
            }
          }}
          disabled={!csvData.trim()}
          variant="outline"
          className="w-full font-medium py-2.5"
        >
          Parse Data →
        </Button>
      </CardContent>
    </Card>
  );
}