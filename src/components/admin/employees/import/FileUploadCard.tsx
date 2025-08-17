import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, FileText, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileUpload from "@/components/ui/file-upload";
import { validateFileUpload, scanCSVContent } from '@/lib/security/upload';
import { config } from '@/lib/config';
import { toast } from "sonner";

interface FileUploadCardProps {
  uploadMethod: 'upload' | 'paste' | 'manual' | null;
  onUpload: (file: File) => void;
  onMethodChange: (method: 'upload') => void;
  uploadedFile?: { name: string; size: number } | null;
  onChangeFile?: () => void;
  isCompleted?: boolean;
}

export function FileUploadCard({ 
  uploadMethod, 
  onUpload, 
  onMethodChange, 
  uploadedFile,
  onChangeFile,
  isCompleted = false
}: FileUploadCardProps) {
  const hasFile = isCompleted && uploadedFile;

  const handleFileSelect = async (file: File) => {
    try {
      const validation = validateFileUpload(file);
      if (!validation.isValid) {
        validation.errors.forEach(error => toast.error(error));
        return;
      }

      const content = await file.text();
      const securityScan = await scanCSVContent(content);
      if (!securityScan.isSafe) {
        securityScan.threats.forEach(threat => toast.error(`Security threat: ${threat}`));
        return;
      }

      onMethodChange('upload');
      onUpload(file);
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Failed to process file. Please try again.');
    }
  };

  const handleFileError = (error: { message: string; code: string }) => {
    toast.error(error.message);
  };

  if (hasFile) {
    return (
      <div className="space-y-4">
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Check className="w-8 h-8 text-primary-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-primary mb-2">
            File uploaded successfully!
          </h3>
          <p className="text-muted-foreground text-sm">
            Your CSV file has been processed and is ready to use.
          </p>
        </div>

        <div className="bg-card rounded-xl border p-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-foreground truncate">
                  {uploadedFile?.name}
                </h4>
                <Badge variant="outline" className="text-xs">CSV</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                File size: {uploadedFile && `${Math.round(uploadedFile.size / 1024)} KB`}
              </p>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-700 font-medium">Ready to import</span>
              </div>
            </div>
          </div>
        </div>
        
        <Button onClick={onChangeFile} variant="outline" className="w-full">
          Change File
        </Button>
      </div>
    );
  }

  return (
    <FileUpload
      onUploadSuccess={handleFileSelect}
      onUploadError={handleFileError}
      acceptedFileTypes={['text/csv', '.csv', 'application/vnd.ms-excel']}
      maxFileSize={config.maxFileUploadSize}
      uploadDelay={500}
      className="max-w-full"
    />
  );
}