
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Circle, Clock } from 'lucide-react';

interface SignatureStepsProps {
  currentStep: number;
  steps: Array<{
    id: number;
    title: string;
    description: string;
    completed?: boolean;
  }>;
}

export function SignatureSteps({ currentStep, steps }: SignatureStepsProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Signature Process</CardTitle>
        <CardDescription>
          Follow these steps to complete the appraisal signing process
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.completed || step.id < currentStep;
            
            return (
              <div key={step.id} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : isActive ? (
                    <Clock className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-grow">
                  <h4 className={`font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-700'
                  }`}>
                    {step.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default SignatureSteps;
