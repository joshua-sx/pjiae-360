
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";

interface FileUploadCardProps {
  uploadMethod: 'upload' | 'paste' | 'manual';
  onUpload: (file: File) => void;
  onMethodChange: (method: 'upload') => void;
}

export default function FileUploadCard({ uploadMethod, onUpload, onMethodChange }: FileUploadCardProps) {
  return (
    <Card className={`cursor-pointer transition-all border-2 ${uploadMethod === 'upload' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          Upload CSV File
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-primary/50 transition-colors relative"
          onClick={() => onMethodChange('upload')}
        >
          <div className="space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <p className="text-slate-700 font-medium">Drop your CSV here</p>
              <p className="text-slate-500 text-sm">or click to browse</p>
            </div>
          </div>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onMethodChange('upload');
                onUpload(file);
              }
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </CardContent>
    </Card>
  );
}
