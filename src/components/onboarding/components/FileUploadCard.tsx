import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, FileText, FileCheck, RotateCcw } from "lucide-react";
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
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-muted">
            <FileCheck className="w-5 h-5 text-primary" />
          </div>
          <span className="text-foreground font-medium">
            Upload CSV File
          </span>
        </div>
        <div className="relative max-w-full mx-auto">
          <div className="group relative w-full rounded-xl bg-background ring-1 ring-border p-0.5">
            <div className="absolute inset-x-0 -top-px h-px w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            
            <div className="relative w-full rounded-[10px] bg-muted/50 p-1.5">
              <div className="relative mx-auto w-full overflow-hidden rounded-lg border border-border bg-background">
                <div className="relative h-[240px]">
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center justify-center"
                    >
                      <div className="mb-4">
                        <div className="relative w-16 h-16 flex items-center justify-center">
                        </div>
                      </div>

                      {/* Status indicator */}
                      <div className="flex items-center justify-center gap-1 mb-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-700 font-medium">Successfully imported</span>
                      </div>

                      {/* File details */}
                      <div className="text-center space-y-1 mb-4 border border-muted rounded-lg p-3">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm font-medium text-foreground truncate">
                            {uploadedFile?.name}
                          </span>
                          <Badge variant="outline" className="text-xs">CSV</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {uploadedFile && formatFileSize(uploadedFile.size)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={onChangeFile}
                        className="w-4/5 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/30 px-4 py-2.5 text-sm font-semibold text-primary transition-all duration-200 hover:border-primary/50 hover:bg-primary/5"
                        aria-label="Change file"
                      >
                        <RotateCcw className="w-4 h-4" aria-hidden="true" />
                        Change File
                      </button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
