import { ReactNode, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/Container";

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
         <div className="py-8 sm:py-10 pb-safe">
           <Container size="standard">
             {children}
           </Container>
         </div>
      </ScrollArea>

      {/* Sticky Navigation Footer - Always visible */}
       <div className="border-t bg-white py-3 sm:py-4 flex-shrink-0 pb-safe">
        <Container size="standard" className="flex gap-3 sm:gap-4">
          <Button 
            onClick={onBack} 
            variant="ghost" 
            className="flex-1 h-12 sm:h-11 text-sm sm:text-base touch-manipulation"
            size="lg"
          >
            ← Back
          </Button>
          <Button 
            onClick={onNext}
            disabled={nextDisabled || isLoading}
            className="flex-1 h-12 sm:h-11 text-sm sm:text-base touch-manipulation bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            {isLoading ? (
              "Loading..."
            ) : (
              <>
                {nextLabel.replace(' →', '')} →
              </>
            )}
          </Button>
        </Container>
      </div>
    </div>
  );
}