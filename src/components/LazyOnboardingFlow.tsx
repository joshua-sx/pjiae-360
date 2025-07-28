import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

// Lazy load the heavy OnboardingFlow component
const OnboardingFlow = lazy(() => import("./onboarding/OnboardingFlow"));

// Loading skeleton that matches the onboarding flow layout
const OnboardingFlowSkeleton = () => (
  <div className="min-h-screen bg-slate-50">
    <div className="px-3 py-10 sm:px-6 sm:py-12">
      <div className="w-full max-w-sm sm:max-w-2xl lg:max-w-4xl xl:max-w-[1200px] mx-auto">
        {/* Header skeleton with proper top spacing */}
        <div className="text-center mb-8">
          <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
          <Skeleton className="h-8 w-80 mx-auto mb-3" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        {/* Main content skeleton */}
        <Card>
          <CardContent className="p-8">
            <div className="space-y-6">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation skeleton */}
        <div className="border-t bg-white px-3 py-3 sm:px-6 sm:py-4 mt-8">
          <div className="flex gap-3 sm:gap-4">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 flex-1" />
          </div>
        </div>
      </div>
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