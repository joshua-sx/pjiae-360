
import { Button } from "@/components/ui/button";
import LoadingSpinner from "./LoadingSpinner";

interface NavigationFooterProps {
  onBack: () => void;
  onNext: () => void;
  hasValidStructure: boolean;
  isLoading?: boolean;
  backLabel?: string;
  nextLabel?: string;
  canGoBack?: boolean;
}

export default function NavigationFooter({ 
  onBack, 
  onNext, 
  hasValidStructure, 
  isLoading = false,
  backLabel = "← Back",
  nextLabel = "Continue →",
  canGoBack = true
}: NavigationFooterProps) {
  return (
    <div className="border-t bg-white px-6 py-4 flex-shrink-0 shadow-lg">
      <div className="max-w-4xl mx-auto flex gap-4">
        <Button 
          onClick={onBack} 
          variant="outline" 
          className="flex-1" 
          disabled={isLoading || !canGoBack}
        >
          {backLabel}
        </Button>
        <Button
          onClick={onNext}
          disabled={!hasValidStructure || isLoading}
          className="flex-1 relative"
        >
          {isLoading ? (
            <LoadingSpinner text="Processing..." size="sm" />
          ) : (
            nextLabel
          )}
        </Button>
      </div>
    </div>
  );
}
