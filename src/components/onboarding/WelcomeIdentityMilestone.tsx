
"use client";

import * as React from "react";
import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, Image, ArrowRight, Upload, X, AlertCircle, ArrowLeft } from "lucide-react";

export interface OnboardingData {
  orgName: string;
  logo: File | null;
  adminInfo: {
    name: string;
    email: string;
    role: string;
  };
  people: Array<{
    id: string;
    name: string;
    email: string;
    department?: string;
    role?: string;
  }>;
  orgStructure: Array<{
    id: string;
    name: string;
    type: 'division' | 'department' | 'custom';
    parent?: string;
    children?: string[];
    rank?: number;
    description?: string;
  }>;
  roles: {
    directors: string[];
    managers: string[];
    supervisors: string[];
    employees: string[];
  };
  reviewCycle: {
    frequency: 'quarterly' | 'biannual' | 'annual';
    startDate: string;
    visibility: boolean;
  };
}

export interface WelcomeIdentityMilestoneProps {
  data: OnboardingData;
  onDataChange: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export default function WelcomeIdentityMilestone({
  data,
  onDataChange,
  onNext,
  onBack,
  isLoading = false
}: WelcomeIdentityMilestoneProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOrgNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onDataChange({ orgName: e.target.value });
  }, [onDataChange]);

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
    onDataChange({ logo: file });

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, [onDataChange]);

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
    onDataChange({ logo: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onDataChange]);

  const handleSkipLogo = useCallback(() => {
    setLogoPreview(null);
    setLogoError(null);
    onDataChange({ logo: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onDataChange]);

  const canProceed = data.orgName.trim().length > 0;

  return (
    <main className="flex-1 min-h-0 flex flex-col">
      <ScrollArea className="flex-1">
        <div className="px-4 md:px-12 py-6">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <header className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4"
              >
                <Building2 className="h-6 w-6 text-primary" />
              </motion.div>
              
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                className="text-2xl md:text-3xl font-bold text-foreground mb-3"
              >
                Welcome & Identity
              </motion.h1>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed"
              >
                Let's get your organization set up for success. We'll start with some basic information about your company.
              </motion.p>
            </header>

            {/* Main Form */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              className="space-y-6"
            >
              {/* Organization Details */}
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Organization Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Organization Name */}
                  <div className="space-y-3">
                    <label htmlFor="orgName" className="block text-sm font-medium text-foreground">
                      Organization Name *
                    </label>
                    <Input
                      id="orgName"
                      type="text"
                      placeholder="Enter Your Organization Name"
                      value={data.orgName}
                      onChange={handleOrgNameChange}
                      className={cn(
                        "text-base h-11 transition-all duration-200",
                        "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                        "hover:border-primary/50"
                      )}
                      aria-required="true"
                    />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Used as Your Company Name in the Dashboard
                    </p>
                  </div>

                  {/* Logo Upload */}
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
                </CardContent>
              </Card>

              {/* Administrator Information */}
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Administrator Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Name</span>
                      <span className="text-sm text-muted-foreground">{data.adminInfo.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Email</span>
                      <span className="text-sm text-muted-foreground">{data.adminInfo.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Role</span>
                      <span className="text-sm text-muted-foreground">{data.adminInfo.role}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                    You'll Be Set Up as the Primary Administrator for Your Organization
                  </p>
                </CardContent>
              </Card>

              {/* Navigation */}
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                className="flex justify-between items-center pt-6"
              >
                <Button
                  variant="outline"
                  onClick={onBack}
                  disabled={true}
                  className="min-w-[120px] h-11 opacity-50 cursor-not-allowed"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                
                <Button
                  onClick={onNext}
                  disabled={!canProceed || isLoading}
                  size="lg"
                  className="min-w-[160px] h-11 text-base font-medium"
                >
                  {isLoading ? "Setting Up..." : "Continue"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </ScrollArea>
    </main>
  );
}
