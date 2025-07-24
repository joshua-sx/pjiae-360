import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, Check, FileText, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { validateFileUpload, scanCSVContent } from "@/lib/security";
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
  const isSelected = uploadMethod === 'upload';
  const hasFile = isCompleted && uploadedFile;
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className={`cursor-pointer transition-all duration-300 border-2 ${
      hasFile
        ? 'border-primary bg-primary/5 shadow-lg' 
        : isSelected 
        ? 'border-primary/50 bg-primary/5' 
        : 'border-border hover:border-border/50 hover:bg-accent/50'
    }`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${hasFile ? 'bg-primary' : 'bg-muted'}`}>
              <Upload className={`w-5 h-5 ${hasFile ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
            </div>
            <span className={hasFile ? 'text-primary' : 'text-foreground'}>
              Upload CSV File
            </span>
          </div>
          <AnimatePresence>
            {hasFile && (
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
            )}
          </AnimatePresence>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {hasFile ? (
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
                <p className="text-primary/70 text-sm">
                  Your CSV file has been processed and is ready to import.
                </p>
              </div>

              {/* File Details Card */}
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
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 relative group"
              onClick={() => onMethodChange('upload')}
            >
              <div className="space-y-4">
                <div className="w-14 h-14 bg-muted group-hover:bg-primary/10 rounded-xl flex items-center justify-center mx-auto transition-colors duration-300">
                  <Upload className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                </div>
                <div>
                  <p className="text-foreground font-semibold text-lg mb-1">
                    Drop your CSV here
                  </p>
                  <p className="text-muted-foreground text-sm">
                    or click to browse your files
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  Expected columns: first name, last name, email, job title, department, division
                </div>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Validate file upload
                    const validation = validateFileUpload(file);
                    if (!validation.isValid) {
                      toast.error(validation.errors.join(', '));
                      return;
                    }

                    // Scan file content for malicious content
                    try {
                      const content = await file.text();
                      const securityScan = await scanCSVContent(content);
                      if (!securityScan.isSafe) {
                        toast.error(`Security threat detected: ${securityScan.threats.join(', ')}`);
                        return;
                      }
                      
                      onMethodChange('upload');
                      onUpload(file);
                    } catch (error) {
                      toast.error('Failed to process file');
                    }
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}