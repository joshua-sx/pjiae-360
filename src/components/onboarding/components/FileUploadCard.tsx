
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, Check, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className={`cursor-pointer transition-all border-2 ${
      hasFile
        ? 'border-primary bg-primary/5' 
        : isSelected 
        ? 'border-primary bg-primary/5' 
        : 'border-border hover:border-border-hover hover:bg-accent/50'
    }`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Upload CSV File
          </div>
          <AnimatePresence>
            {hasFile && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30 font-semibold">
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* File Details */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Uploaded File:</h4>
                <div className="flex items-center gap-2 text-xs bg-background rounded-md p-3 border border-primary/20">
                  <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-foreground block truncate">
                      {uploadedFile?.name}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {uploadedFile && formatFileSize(uploadedFile.size)}
                    </span>
                  </div>
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                </div>
              </div>
              
              {/* Change File Button */}
              <Button
                onClick={onChangeFile}
                variant="outline"
                className="w-full border-primary/30 text-primary hover:bg-primary/10"
              >
                Change File
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors relative"
              onClick={() => onMethodChange('upload')}
            >
              <div className="space-y-3">
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-foreground font-medium">Drop your CSV here</p>
                  <p className="text-muted-foreground text-sm">or click to browse</p>
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
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
