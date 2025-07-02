import { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface OnboardingStepLayoutProps {
  children: ReactNode;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  isLoading?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl';
  className?: string;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl'
};

export default function OnboardingStepLayout({
  children,
  onBack,
  onNext,
  nextLabel = "Next →",
  nextDisabled = false,
  isLoading = false,
  maxWidth = '4xl',
  className = ""
}: OnboardingStepLayoutProps) {
  return (
    <div className={`flex-1 flex flex-col bg-slate-50 ${className}`}>
      <ScrollArea className="flex-1">
        <div className="px-6 py-8">
          <div className={`${maxWidthClasses[maxWidth]} mx-auto`}>
            {children}
          </div>
        </div>
      </ScrollArea>

      {/* Navigation Footer */}
      <div className="border-t bg-white px-6 py-4 flex-shrink-0">
        <div className={`${maxWidthClasses[maxWidth]} mx-auto flex gap-4`}>
          <Button onClick={onBack} variant="outline" className="flex-1">
            ← Back
          </Button>
          <Button 
            onClick={onNext}
            disabled={nextDisabled || isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              nextLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}