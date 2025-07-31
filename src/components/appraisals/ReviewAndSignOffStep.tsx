"use client";

import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Signature, CheckCircle, Edit, Mail, Info, Save, Star, FileText, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import DigitalSignatureModal from "./DigitalSignatureModal";

export interface Goal {
  id: string;
  title: string;
  description: string;
  rating?: number;
  feedback?: string;
}

export interface Competency {
  id: string;
  title: string;
  description: string;
  rating?: number;
  feedback?: string;
}

export interface AppraisalData {
  employeeId: string;
  goals: Goal[];
  competencies: Competency[];
  overallRating?: number;
  status: 'draft' | 'with_second_appraiser' | 'awaiting_employee' | 'complete';
  signatures: {
    appraiser?: string;
    secondAppraiser?: string;
    employee?: string;
  };
  timestamps: {
    created: Date;
    lastModified: Date;
    submitted?: Date;
    completed?: Date;
  };
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
}

export interface ReviewAndSignOffStepProps {
  appraisalData: AppraisalData;
  employee?: Employee | null;
  overallRating: number;
  onSubmit: () => void;
  isLoading: boolean;
}

const getRatingCategory = (rating: number) => {
  if (rating >= 4.5) return {
    label: "Exceptional",
    color: "bg-green-500",
    textColor: "text-green-700"
  };
  if (rating >= 3.5) return {
    label: "Exceeds Expectations",
    color: "bg-blue-500",
    textColor: "text-blue-700"
  };
  if (rating >= 2.5) return {
    label: "Meets Expectations",
    color: "bg-yellow-500",
    textColor: "text-yellow-700"
  };
  if (rating >= 1.5) return {
    label: "Below Expectations",
    color: "bg-orange-500",
    textColor: "text-orange-700"
  };
  return {
    label: "Unsatisfactory",
    color: "bg-red-500",
    textColor: "text-red-700"
  };
};

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'draft':
      return {
        label: "Draft",
        color: "bg-gray-500",
        icon: Edit
      };
    case 'with_second_appraiser':
      return {
        label: "With 2nd Appraiser",
        color: "bg-blue-500",
        icon: Mail
      };
    case 'awaiting_employee':
      return {
        label: "Awaiting Employee",
        color: "bg-yellow-500",
        icon: Info
      };
    case 'complete':
      return {
        label: "Complete",
        color: "bg-green-500",
        icon: CheckCircle
      };
    default:
      return {
        label: "Unknown",
        color: "bg-gray-500",
        icon: Info
      };
  }
};

export default function ReviewAndSignOffStep({
  appraisalData,
  employee,
  overallRating,
  onSubmit,
  isLoading
}: ReviewAndSignOffStepProps) {
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset submitting state when modal closes
  React.useEffect(() => {
    if (!showSignatureModal && isSubmitting) {
      const timer = setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showSignatureModal, isSubmitting]);

  const category = getRatingCategory(overallRating);
  const statusInfo = getStatusInfo(appraisalData.status);
  const StatusIcon = statusInfo.icon;

  const ratedGoals = appraisalData.goals.filter(goal => goal.rating !== undefined);
  const ratedCompetencies = appraisalData.competencies.filter(comp => comp.rating !== undefined);
  const totalItems = ratedGoals.length + ratedCompetencies.length;

  const handleSignatureSuccess = async (signatureDataUrl: string) => {
    setIsSubmitting(true);
    try {
      // Store the signature data
      appraisalData.signatures.appraiser = signatureDataUrl;
      // Close modal first
      setShowSignatureModal(false);
      // Small delay to ensure smooth transition
      await new Promise(resolve => setTimeout(resolve, 300));
      // Submit the appraisal
      onSubmit();
    } catch (error) {
      console.error('Failed to submit appraisal:', error);
      setIsSubmitting(false);
      // Reopen modal if there was an error
      setShowSignatureModal(true);
    }
  };

  const handleSignAndSubmit = async () => {
    if (!signatureName.trim()) return;
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      appraisalData.signatures.appraiser = signatureName;
      setShowSignatureModal(false);
      onSubmit();
    } catch (error) {
      console.error('Failed to submit appraisal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (totalItems === 0) {
    return (
      <div className="text-center py-16">
        <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Ratings to Review</h3>
        <p className="text-muted-foreground">
          Please complete the previous steps before reviewing the appraisal.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Review & Sign-Off</h2>
        <p className="text-muted-foreground">
          Review the complete appraisal summary and submit for approval.
        </p>
      </div>

      {employee && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Reviewing appraisal for <strong>{employee.name}</strong> ({employee.position}, {employee.department})
          </AlertDescription>
        </Alert>
      )}

      <Separator />

      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Overall Performance Rating</span>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Badge className={cn("text-lg px-4 py-2", category.color, "text-white")}>
                {overallRating.toFixed(1)}/5.0
              </Badge>
            </motion.div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={cn("text-2xl font-bold", category.textColor)}>{category.label}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Based on {totalItems} rated item{totalItems !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star} 
                  className={cn(
                    "h-7 w-7",
                    star <= Math.round(overallRating) 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "text-gray-300"
                  )} 
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {ratedGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Performance Goals</span>
              <Badge variant="outline">{ratedGoals.length} goals</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Goal</TableHead>
                    <TableHead className="w-[15%] text-center">Rating</TableHead>
                    <TableHead>Feedback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ratedGoals.map(goal => (
                    <TableRow key={goal.id}>
                      <TableCell>
                        <h4 className="font-medium text-sm">{goal.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{goal.description}</p>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono">{goal.rating}/5</Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">{goal.feedback || "No feedback provided"}</p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {ratedCompetencies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Core Competencies</span>
              <Badge variant="outline">{ratedCompetencies.length} competencies</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Competency</TableHead>
                    <TableHead className="w-[15%] text-center">Rating</TableHead>
                    <TableHead>Feedback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ratedCompetencies.map(competency => (
                    <TableRow key={competency.id}>
                      <TableCell>
                        <h4 className="font-medium text-sm">{competency.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{competency.description}</p>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono">{competency.rating}/5</Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">{competency.feedback || "No feedback provided"}</p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Digital Signature</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Appraiser</h4>
              {appraisalData.signatures.appraiser ? (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  {appraisalData.signatures.appraiser.startsWith('data:image') ? (
                    <div className="flex items-center gap-2">
                      <img 
                        src={appraisalData.signatures.appraiser} 
                        alt="Digital signature" 
                        className="h-8 max-w-[120px] object-contain border rounded" 
                      />
                      <span className="text-sm font-medium">Digital Signature</span>
                    </div>
                  ) : (
                    <span className="text-sm font-medium">{appraisalData.signatures.appraiser}</span>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-muted/50 border border-dashed rounded-lg text-center">
                  <span className="text-sm text-muted-foreground">Pending signature</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Second Appraiser</h4>
              <div className="p-3 bg-muted/50 border border-dashed rounded-lg text-center">
                <span className="text-sm text-muted-foreground">Pending review</span>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Employee</h4>
              <div className="p-3 bg-muted/50 border border-dashed rounded-lg text-center">
                <span className="text-sm text-muted-foreground">Pending acknowledgment</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row-reverse gap-4 pt-6 border-t">
        <Button 
          size="lg" 
          className="flex items-center gap-2" 
          onClick={() => setShowSignatureModal(true)}
          disabled={isLoading || isSubmitting || !!appraisalData.signatures.appraiser}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          <Signature className="h-4 w-4" />
          {isSubmitting ? 'Submitting...' : 'Sign & Submit'}
        </Button>
        
        <DigitalSignatureModal 
          open={showSignatureModal}
          onClose={() => setShowSignatureModal(false)}
          onSuccess={handleSignatureSuccess}
          appraisalId={appraisalData.employeeId}
        />
      </div>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">Appraisal Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative pl-6">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-border"></div>
            <div className="space-y-6">
              <div className="flex items-center gap-4 relative">
                <div className="w-3 h-3 bg-green-500 rounded-full z-10 ring-4 ring-background"></div>
                <span className="text-sm">Created on {appraisalData.timestamps.created.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-4 relative">
                <div className="w-3 h-3 bg-green-500 rounded-full z-10 ring-4 ring-background"></div>
                <span className="text-sm">Last modified on {appraisalData.timestamps.lastModified.toLocaleDateString()}</span>
              </div>
              {appraisalData.timestamps.submitted && (
                <div className="flex items-center gap-4 relative">
                  <div className="w-3 h-3 bg-blue-500 rounded-full z-10 ring-4 ring-background"></div>
                  <span className="text-sm">Submitted on {appraisalData.timestamps.submitted.toLocaleDateString()}</span>
                </div>
              )}
              {appraisalData.timestamps.completed && (
                <div className="flex items-center gap-4 relative">
                  <div className="w-3 h-3 bg-green-500 rounded-full z-10 ring-4 ring-background"></div>
                  <span className="text-sm">Completed on {appraisalData.timestamps.completed.toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}