"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Signature,
  CheckCircle,
  Edit,
  Mail,
  Info,
  ArrowLeft,
  Save,
  Star,
  FileText,
  Home,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useRoleBasedNavigation } from "@/hooks/useRoleBasedNavigation";
import { useAppraisalCRUD } from "@/features/appraisals/hooks/useAppraisalCRUD";
import { useAppraisalSignatureFlow } from "@/hooks/useAppraisalSignatureFlow";
import DigitalSignatureModal from "./DigitalSignatureModal";
import { notifyAppraisalEvent, logAuditEvent } from '@/features/appraisals/hooks/useAppraisals';

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
  status: "draft" | "with_second_appraiser" | "awaiting_employee" | "complete";
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
  appraisalId: string | null;
  employee?: Employee | null;
  overallRating: number;
  onSubmit: () => void;
  isLoading: boolean;
}

const getRatingCategory = (rating: number) => {
  if (rating >= 4.5)
    return { label: "Exceptional", color: "bg-green-500 dark:bg-green-600", textColor: "text-green-700 dark:text-green-300" };
  if (rating >= 3.5)
    return { label: "Exceeds Expectations", color: "bg-blue-500 dark:bg-blue-600", textColor: "text-blue-700 dark:text-blue-300" };
  if (rating >= 2.5)
    return { label: "Meets Expectations", color: "bg-yellow-500 dark:bg-yellow-600", textColor: "text-yellow-700 dark:text-yellow-300" };
  if (rating >= 1.5)
    return { label: "Below Expectations", color: "bg-orange-500 dark:bg-orange-600", textColor: "text-orange-700 dark:text-orange-300" };
  return { label: "Unsatisfactory", color: "bg-red-500 dark:bg-red-600", textColor: "text-red-700 dark:text-red-300" };
};

const getStatusInfo = (status: string) => {
  switch (status) {
    case "draft":
      return { label: "Draft", color: "bg-muted-foreground", icon: Edit };
    case "with_second_appraiser":
      return { label: "With 2nd Appraiser", color: "bg-blue-600 dark:bg-blue-500", icon: Mail };
    case "awaiting_employee":
      return { label: "Awaiting Employee", color: "bg-yellow-600 dark:bg-yellow-500", icon: Info };
    case "complete":
      return { label: "Complete", color: "bg-green-600 dark:bg-green-500", icon: CheckCircle };
    default:
      return { label: "Unknown", color: "bg-muted-foreground", icon: Info };
  }
};

export default function ReviewAndSignOffStep({
  appraisalData,
  appraisalId,
  employee,
  overallRating,
  onSubmit,
  isLoading,
}: ReviewAndSignOffStepProps) {
  const { getRolePageUrl } = useRoleBasedNavigation();
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  
  // New signature flow logic
  const { 
    state: signatureState, 
    signatures, 
    loading: signatureLoading, 
    signAppraisal, 
    finalizeAppraisal 
  } = useAppraisalSignatureFlow(appraisalId, employee?.id);

  // Handle signature success
  const handleSignatureSuccess = async (signatureDataUrl: string) => {
    const result = await signAppraisal(signatureDataUrl);
    if (result?.success) {
      setShowSignatureModal(false);
      
      // Log the signature event
      const identifier = appraisalId || appraisalData.employeeId;
      void notifyAppraisalEvent(identifier, 'signature_completed', { 
        role: signatureState.userRole, 
        signature: signatureDataUrl 
      });
    }
  };

  const category = getRatingCategory(overallRating);
  const statusInfo = getStatusInfo(appraisalData.status);
  const StatusIcon = statusInfo.icon;

  const ratedGoals = appraisalData.goals.filter((goal) => goal.rating !== undefined);
  const ratedCompetencies = appraisalData.competencies.filter((comp) => comp.rating !== undefined);
  const totalItems = ratedGoals.length + ratedCompetencies.length;

  if (totalItems === 0) {
    return (
    <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href={getRolePageUrl("dashboard")}>
                    <Home className="h-4 w-4" />
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={getRolePageUrl("appraisals")}>Appraisals</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Review & Sign-Off</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Ratings to Review</h3>
            <p className="text-muted-foreground">
              Please complete the previous steps before reviewing the appraisal.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={getRolePageUrl("dashboard")}>
                  <Home className="h-4 w-4" />
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={getRolePageUrl("appraisals")}>Appraisals</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Review & Sign-Off</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Review & Sign-Off</h1>
              <p className="text-muted-foreground mt-2">
                Review the complete appraisal summary and submit for approval.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className={cn(
                  "flex items-center gap-2",
                  statusInfo.color,
                  "text-white focus:outline focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                )}
              >
                <StatusIcon className="h-3 w-3" />
                {statusInfo.label}
              </Badge>
            </div>
          </div>

          {employee && (
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Reviewing appraisal for <strong>{employee.name}</strong> ({employee.position},{" "}
                {employee.department})
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Overall Performance Rating</span>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Badge
                    variant="secondary"
                    className={cn("text-lg px-4 py-2", category.color, "text-white")}
                  >
                    {overallRating.toFixed(1)}/5.0
                  </Badge>
                </motion.div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={cn("text-xl font-semibold", category.textColor)}>
                    {category.label}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on {totalItems} rated item{totalItems !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-6 w-6",
                        star <= Math.round(overallRating)
                          ? "fill-yellow-400 text-yellow-400 dark:fill-yellow-300 dark:text-yellow-300"
                          : "text-muted-foreground"
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
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">Goal</TableHead>
                        <TableHead className="w-[100px] text-center">Rating</TableHead>
                        <TableHead className="min-w-[200px]">Feedback</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ratedGoals.map((goal, index) => (
                        <TableRow key={goal.id} className={index % 2 === 0 ? "bg-muted/50" : ""}>
                          <TableCell>
                            <div>
                              <h4 className="font-medium text-sm">{goal.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {goal.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="font-mono">
                              {goal.rating}/5
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-muted-foreground">
                              {goal.feedback || "No feedback provided"}
                            </p>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">Competency</TableHead>
                        <TableHead className="w-[100px] text-center">Rating</TableHead>
                        <TableHead className="min-w-[200px]">Feedback</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ratedCompetencies.map((competency, index) => (
                        <TableRow
                          key={competency.id}
                          className={index % 2 === 0 ? "bg-muted/50" : ""}
                        >
                          <TableCell>
                            <div>
                              <h4 className="font-medium text-sm">{competency.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {competency.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="font-mono">
                              {competency.rating}/5
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-muted-foreground">
                              {competency.feedback || "No feedback provided"}
                            </p>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Digital Signature Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Digital Signatures
                <Badge 
                  variant="outline"
                  className={cn(
                    signatureState.signatureStage === 'draft' && 'border-orange-500 text-orange-700',
                    signatureState.signatureStage === 'complete' && 'border-green-500 text-green-700'
                  )}
                >
                  {signatureState.signatureStage === 'draft' && 'Draft'}
                  {signatureState.signatureStage === 'pending_first_appraiser' && 'Pending First Appraiser'}
                  {signatureState.signatureStage === 'pending_second_appraiser' && 'Pending Second Appraiser'}
                  {signatureState.signatureStage === 'pending_employee' && 'Pending Employee'}
                  {signatureState.signatureStage === 'complete' && 'Complete'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* First Appraiser */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    First Appraiser
                    {signatureState.userRole === 'first_appraiser' && (
                      <Badge variant="secondary" className="text-xs">You</Badge>
                    )}
                  </h4>
                  {signatures.first_appraiser ? (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Signed</span>
                    </div>
                  ) : (
                    <div className={cn(
                      "p-3 border rounded-lg text-center transition-all",
                      signatureState.isCurrentUserTurn && signatureState.userRole === 'first_appraiser'
                        ? "bg-primary/10 border-primary border-2 animate-pulse"
                        : "bg-muted/50 border-dashed"
                    )}>
                      <span className={cn(
                        "text-sm",
                        signatureState.isCurrentUserTurn && signatureState.userRole === 'first_appraiser'
                          ? "text-primary font-medium"
                          : "text-muted-foreground"
                      )}>
                        {signatureState.isCurrentUserTurn && signatureState.userRole === 'first_appraiser' 
                          ? "Your turn to sign" 
                          : "Pending signature"
                        }
                      </span>
                    </div>
                  )}
                </div>

                {/* Second Appraiser */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    Second Appraiser
                    {signatureState.userRole === 'second_appraiser' && (
                      <Badge variant="secondary" className="text-xs">You</Badge>
                    )}
                  </h4>
                  {signatures.second_appraiser ? (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Signed</span>
                    </div>
                  ) : (
                    <div className={cn(
                      "p-3 border rounded-lg text-center transition-all",
                      signatureState.isCurrentUserTurn && signatureState.userRole === 'second_appraiser'
                        ? "bg-primary/10 border-primary border-2 animate-pulse"
                        : "bg-muted/50 border-dashed",
                      signatureState.signatureStage !== 'pending_second_appraiser' && "opacity-50"
                    )}>
                      <span className={cn(
                        "text-sm",
                        signatureState.isCurrentUserTurn && signatureState.userRole === 'second_appraiser'
                          ? "text-primary font-medium"
                          : "text-muted-foreground"
                      )}>
                        {signatureState.isCurrentUserTurn && signatureState.userRole === 'second_appraiser' 
                          ? "Your turn to sign" 
                          : "Pending signature"
                        }
                      </span>
                    </div>
                  )}
                </div>

                {/* Employee */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    Employee
                    {signatureState.userRole === 'employee' && (
                      <Badge variant="secondary" className="text-xs">You</Badge>
                    )}
                  </h4>
                  {signatures.employee ? (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Signed</span>
                    </div>
                  ) : (
                    <div className={cn(
                      "p-3 border rounded-lg text-center transition-all",
                      signatureState.isCurrentUserTurn && signatureState.userRole === 'employee'
                        ? "bg-primary/10 border-primary border-2 animate-pulse"
                        : "bg-muted/50 border-dashed",
                      signatureState.signatureStage !== 'pending_employee' && "opacity-50"
                    )}>
                      <span className={cn(
                        "text-sm",
                        signatureState.isCurrentUserTurn && signatureState.userRole === 'employee'
                          ? "text-primary font-medium"
                          : "text-muted-foreground"
                      )}>
                        {signatureState.isCurrentUserTurn && signatureState.userRole === 'employee' 
                          ? "Your turn to sign" 
                          : "Pending signature"
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Button variant="outline" asChild>
                  <a href={getRolePageUrl("appraisals")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Appraisals
                  </a>
                </Button>

                <div className="flex items-center gap-4">
                  {signatureState.canFinalize && (
                    <Button 
                      onClick={finalizeAppraisal} 
                      disabled={signatureLoading}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Submit for Signatures
                    </Button>
                  )}

                  {signatureState.canSign && (
                    <Dialog open={showSignatureModal} onOpenChange={setShowSignatureModal}>
                      <DialogTrigger asChild>
                        <Button className="flex items-center gap-2 animate-pulse">
                          <Signature className="h-4 w-4" />
                          Sign Appraisal
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  )}

                  {!signatureState.canSign && !signatureState.canFinalize && signatureState.signatureStage !== 'complete' && (
                    <Button disabled className="flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Waiting for signatures
                    </Button>
                  )}
                </div>
              </div>

              {signatureState.signatureStage === 'complete' && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    All signatures have been collected. This appraisal is now complete.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Signature Modal */}
        <DigitalSignatureModal
          appraisalId={appraisalId || appraisalData.employeeId}
          open={showSignatureModal}
          onClose={() => setShowSignatureModal(false)}
          onSuccess={handleSignatureSuccess}
        />
      </div>
    </div>
  );
}