import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useTour } from '@/hooks/useTour';

export function OnboardingNudge() {
  const { isTourCompleted, startTour } = useTour({
    steps: [], // Steps would be defined elsewhere
    persistState: true,
    storageKey: 'app-tour-completed'
  });

  // Don't show if tour is completed
  if (isTourCompleted()) {
    return null;
  }

  return (
    <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Complete Your Setup</CardTitle>
        </div>
        <CardDescription>
          Finish configuring your workspace to get the most out of the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Take a quick tour to learn about key features
          </div>
          <Button onClick={startTour} size="sm">
            Start Tour
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}