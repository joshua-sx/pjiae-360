
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, FileText, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileUpload from "@/components/ui/file-upload";
import { validateFileUpload, scanCSVContent } from '@/lib/security/upload';
import { config } from '@/lib/config';
import { toast } from "sonner";

interface FileUploadCardProps {
  uploadMethod: 'upload' | 'manual' | null;
  onUpload: (file: File) => void;
  onMethodChange: (method: 'upload') => void;
  uploadedFile?: { name: string; size: number } | null;
  onChangeFile?: () => void;
  isCompleted?: boolean;
}

export default function FileUploadCard({ 
  uploadMethod, 
  onUpload, 
  onMethodChange, 
  uploadedFile,
  onChangeFile,
  isCompleted = false
}: FileUploadCardProps) {
  const isSelected = uploadMethod === 'upload';
  const hasFile = isCompleted && uploadedFile;

  const handleFileSelect = async (file: File) => {
    try {
      // Basic file validation
      const validation = validateFileUpload(file);
      if (!validation.isValid) {
        validation.errors.forEach(error => {
          toast.error(error);
        });
        return;
      }

      // Security scan
      const content = await file.text();
      const securityScan = await scanCSVContent(content);
      if (!securityScan.isSafe) {
        securityScan.threats.forEach(threat => {
          toast.error(`Security threat detected: ${threat}`);
        });
        return;
      }

      // If all validations pass
      onMethodChange('upload');
      onUpload(file);
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process file. Please try again.');
    }
  };

  const handleFileError = (error: { message: string; code: string }) => {
    toast.error(error.message);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (hasFile) {
    return (
      <div className="space-y-6 p-6 border rounded-xl bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary">
              <Check className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-foreground font-medium">
              Upload CSV File
            </span>
          </div>
          <AnimatePresence>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Badge className="bg-primary text-primary-foreground font-semibold px-3 py-1">
                <Check className="w-3 h-3 mr-1" />
                Uploaded
              </Badge>
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div
          key="uploaded"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-6"
        >
          {/* Success Message */}
          <div className="text-center py-4">
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

          {/* File Details Card */}
          <div className="bg-background rounded-xl border p-4 shadow-sm">
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
                  <Badge variant="outline" className="text-xs">
                    CSV
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  File size: {uploadedFile && formatFileSize(uploadedFile.size)}
                </p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-700 font-medium">
                    Ready to import
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Button */}
          <Button
            onClick={onChangeFile}
            variant="outline"
            className="w-full font-medium py-2.5"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Change File
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-muted">
          <FileText className="w-5 h-5 text-muted-foreground" />
        </div>
        <span className="text-foreground font-medium">
          Upload CSV File
        </span>
      </div>
      <FileUpload
        onUploadSuccess={handleFileSelect}
        onUploadError={handleFileError}
        acceptedFileTypes={['text/csv', '.csv', 'application/vnd.ms-excel']}
        maxFileSize={config.maxFileUploadSize}
        uploadDelay={500}
        className="max-w-full"
      />
    </div>
  );
}
