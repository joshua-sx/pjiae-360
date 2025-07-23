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
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when component mounts or content changes
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [children]);
  return (
    <div className={`flex-1 flex flex-col bg-slate-50 min-h-0 ${className}`}>
      <ScrollArea ref={scrollAreaRef} className="flex-1 h-full">
        <div className="px-4 py-6 sm:px-6 sm:py-8 min-h-full">
          <div className={`${maxWidthClasses[maxWidth]} mx-auto`}>
            {children}
          </div>
        </div>
      </ScrollArea>

      {/* Navigation Footer - Mobile optimized */}
      <div className="border-t bg-white px-4 py-3 sm:px-6 sm:py-4 flex-shrink-0">
        <div className={`${maxWidthClasses[maxWidth]} mx-auto flex gap-3 sm:gap-4`}>
          <Button 
            onClick={onBack} 
            variant="outline" 
            className="flex-1 h-11 sm:h-10 text-sm sm:text-base"
            size="lg"
          >
            <span className="hidden sm:inline">← Back</span>
            <span className="sm:hidden">←</span>
          </Button>
          <Button 
            onClick={onNext}
            disabled={nextDisabled || isLoading}
            className="flex-1 h-11 sm:h-10 text-sm sm:text-base"
            size="lg"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Loading...</span>
              </div>
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