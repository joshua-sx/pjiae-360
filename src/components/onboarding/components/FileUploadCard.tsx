
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, Check, FileText, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRef } from "react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
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
        ? 'border-blue-500 bg-blue-50/50 shadow-lg shadow-blue-100' 
        : isSelected 
        ? 'border-blue-300 bg-blue-50/30' 
        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
    }`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${hasFile ? 'bg-blue-500' : 'bg-gray-100'}`}>
              <Upload className={`w-5 h-5 ${hasFile ? 'text-white' : 'text-gray-600'}`} />
            </div>
            <span className={hasFile ? 'text-blue-900' : 'text-gray-900'}>
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
                <Badge className="bg-blue-500 text-white border-blue-600 font-semibold px-3 py-1">
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
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  File uploaded successfully!
                </h3>
                <p className="text-blue-700 text-sm">
                  Your CSV file has been processed and is ready to use.
                </p>
              </div>

              {/* File Details Card */}
              <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {uploadedFile?.name}
                      </h4>
                      <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                        CSV
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
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
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 font-medium py-2.5"
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
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300 relative group"
              onClick={() => {
                onMethodChange('upload');
                fileInputRef.current?.click();
              }}
            >
              <div className="space-y-4">
                <div className="w-14 h-14 bg-gray-100 group-hover:bg-blue-100 rounded-xl flex items-center justify-center mx-auto transition-colors duration-300">
                  <Upload className="w-7 h-7 text-gray-500 group-hover:text-blue-600 transition-colors duration-300" />
                </div>
                <div>
                  <p className="text-gray-900 font-semibold text-lg mb-1">
                    Drop your CSV here
                  </p>
                  <p className="text-gray-600 text-sm">
                    or click to browse your files
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  Supports CSV files up to 10MB
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onMethodChange('upload');
                    onUpload(file);
                  }
                }}
                className="hidden"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
