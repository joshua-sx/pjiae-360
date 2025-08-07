import { ReactNode, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface OnboardingStepLayoutProps {
  children: ReactNode;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  isLoading?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | 'wide';
  className?: string;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
  'wide': 'max-w-[1200px]'
};

export default function OnboardingStepLayout({
  children,
  onBack,
  onNext,
  nextLabel = "Next →",
  nextDisabled = false,
  isLoading = false,
  maxWidth = 'wide',
  className = ""
}: OnboardingStepLayoutProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  return (
    <div className={`h-full flex flex-col bg-slate-50 ${className}`}>
      <ScrollArea ref={scrollAreaRef} className="flex-1 overflow-auto">
        <div className="px-3 py-8 sm:px-6 sm:py-10 pb-safe">
          <div className={`w-full max-w-sm sm:max-w-2xl lg:max-w-4xl xl:${maxWidthClasses[maxWidth]} mx-auto`}>
            {children}
          </div>
        </div>
      </ScrollArea>

      {/* Sticky Navigation Footer - Always visible */}
      <div className="border-t bg-white px-3 py-3 sm:px-6 sm:py-4 flex-shrink-0 pb-safe">
        <div className={`w-full max-w-sm sm:max-w-2xl lg:max-w-4xl xl:${maxWidthClasses[maxWidth]} mx-auto flex gap-3 sm:gap-4`}>
          <Button 
            onClick={onBack} 
            variant="outline" 
            className="flex-1 h-12 sm:h-11 text-sm sm:text-base touch-manipulation"
            size="lg"
          >
            <span className="hidden sm:inline">← Back</span>
            <span className="sm:hidden">←</span>
          </Button>
          <Button 
            onClick={onNext}
            disabled={nextDisabled || isLoading}
            className="flex-1 h-12 sm:h-11 text-sm sm:text-base touch-manipulation"
            size="lg"
          >
            {isLoading ? (
              <>
                <span className="hidden sm:inline">Loading...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">{nextLabel}</span>
                <span className="sm:hidden">→</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}