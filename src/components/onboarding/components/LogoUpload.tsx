
"use client";

import * as React from "react";
import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Image, Upload, X, AlertCircle } from "lucide-react";

interface LogoUploadProps {
  logo: File | null;
  onLogoChange: (logo: File | null) => void;
}

export default function LogoUpload({ logo, onLogoChange }: LogoUploadProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];

    if (!allowedTypes.includes(file.type)) {
      return 'Please Upload a PNG, JPG, or SVG File';
    }
    if (file.size > maxSize) {
      return 'File Size Must Be Less Than 2MB';
    }
    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      setLogoError(error);
      return;
    }

    setLogoError(null);
    onLogoChange(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, [onLogoChange]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleRemoveLogo = useCallback(() => {
    setLogoPreview(null);
    setLogoError(null);
    onLogoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onLogoChange]);

  const handleSkipLogo = useCallback(() => {
    setLogoPreview(null);
    setLogoError(null);
    onLogoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onLogoChange]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-foreground">
          Organization Logo
        </label>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkipLogo}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Skip for Now
        </Button>
      </div>
      
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/svg+xml"
          onChange={handleFileInputChange}
          className="sr-only"
          aria-label="Upload Organization Logo"
        />
        
        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleUploadClick}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer",
            "transition-all duration-200",
            "hover:border-primary/50 hover:bg-primary/5",
            isDragOver ? "border-primary bg-primary/10" : "border-border",
            logoPreview ? "border-solid bg-muted/30" : ""
          )}
          role="button"
          tabIndex={0}
        >
          <AnimatePresence mode="wait">
            {logoPreview ? (
              <motion.div
                key="preview"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <img
                  src={logoPreview}
                  alt="Organization Logo Preview"
                  className="max-h-16 max-w-full mx-auto object-contain"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveLogo();
                  }}
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove Logo</span>
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  Click to Change Logo
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-muted rounded-full">
                  {isDragOver ? (
                    <Upload className="h-6 w-6 text-primary" />
                  ) : (
                    <Image className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    {isDragOver ? 'Drop Your Logo Here' : 'Upload Your Logo'}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Drag and Drop or Click to Browse • PNG, JPG, SVG • Max 2MB
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Logo Error */}
      <AnimatePresence>
        {logoError && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
          >
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
            <span className="text-sm text-destructive font-medium">{logoError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Optional: Add Your Organization's Logo to Personalize the Experience
      </p>
    </div>
  );
}
