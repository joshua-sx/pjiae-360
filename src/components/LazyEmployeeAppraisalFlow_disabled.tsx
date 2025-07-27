import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

// Lazy load the heavy EmployeeAppraisalFlow component
const EmployeeAppraisalFlow = lazy(() => import("./appraisals/EmployeeAppraisalFlow"));

interface LazyEmployeeAppraisalFlowProps {
  onComplete?: (data: any) => void;
  onSaveDraft?: (data: any) => void;
}

// Loading skeleton that matches the appraisal flow layout
const AppraisalFlowSkeleton = () => (
  <div className="space-y-6">
    {/* Header skeleton */}
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>
    
    {/* Main content skeleton */}
    <Card>
      <CardContent className="p-6 space-y-6">
        {/* Employee selection skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-12 w-full" />
        </div>
        
        {/* Button skeleton */}
        <Skeleton className="h-12 w-full" />
      </CardContent>
    </Card>
  </div>
);

export default function LazyEmployeeAppraisalFlow({ onComplete, onSaveDraft }: LazyEmployeeAppraisalFlowProps) {
  return (
    <Suspense fallback={<AppraisalFlowSkeleton />}>
      <EmployeeAppraisalFlow 
        onComplete={onComplete}
        onSaveDraft={onSaveDraft}
      />
    </Suspense>
  );
}