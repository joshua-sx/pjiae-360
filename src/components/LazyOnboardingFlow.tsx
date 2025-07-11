import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

// Lazy load the heavy OnboardingFlow component
const OnboardingFlow = lazy(() => import("./onboarding/OnboardingFlow"));

// Loading skeleton that matches the onboarding flow layout
const OnboardingFlowSkeleton = () => (
  <div className="min-h-screen bg-background">
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="text-center mb-8">
        <Skeleton className="h-10 w-96 mx-auto mb-4" />
        <Skeleton className="h-6 w-[600px] mx-auto" />
      </div>

      {/* Progress indicator skeleton */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center">
              <Skeleton className="h-8 w-8 rounded-full" />
              {i < 4 && <Skeleton className="h-0.5 w-16 mx-2" />}
            </div>
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>

            <div className="flex justify-between mt-8">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default function LazyOnboardingFlow() {
  return (
    <Suspense fallback={<OnboardingFlowSkeleton />}>
      <OnboardingFlow />
    </Suspense>
  );
}