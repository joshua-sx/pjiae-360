import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/Container";

// Lazy load the heavy OnboardingFlow component
const OnboardingFlow = lazy(() => import("./onboarding/OnboardingFlow"));

// Loading skeleton that matches the onboarding flow layout
const OnboardingFlowSkeleton = () => (
  <div className="min-h-screen bg-background">
    {/* Step progress skeleton - matches MilestoneHeader */}
    <div className="sticky top-0 z-sticky bg-background w-full border-b border-border/50">
      <div className="safe-area-top">
        <Container fullBleedScroll>
          <div className="w-full overflow-x-auto overflow-y-hidden px-2 sm:px-3 md:px-4 py-2 sm:py-3">
            <div className="flex items-center justify-start md:justify-center flex-nowrap gap-1.5 sm:gap-2.5 md:gap-3 lg:gap-4 xl:gap-5 min-w-max">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full" />
              ))}
            </div>
          </div>
        </Container>
      </div>
    </div>
    
     <div className="py-8 sm:py-10">
       <Container size="standard">
        {/* Header skeleton */}
        <div className="text-center mb-6">
          <Skeleton className="h-14 w-14 rounded-full mx-auto mb-4" />
          <Skeleton className="h-7 w-80 mx-auto mb-2" />
          <Skeleton className="h-5 w-96 mx-auto" />
        </div>

        {/* Main content skeleton */}
        <Card className="border-border/50">
          <CardContent className="p-8">
            <div className="space-y-8">
              <div className="space-y-5">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-4 w-60" />
              </div>
              
              <div className="space-y-5">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-32 w-full rounded-lg" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation skeleton */}
         <div className="border-t bg-background py-3 sm:py-4 mt-8">
           <Container size="standard">
            <div className="flex gap-3 sm:gap-4">
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 flex-1" />
            </div>
          </Container>
        </div>
      </Container>
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