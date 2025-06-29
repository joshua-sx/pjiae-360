
import { Button } from "@/components/ui/button";

interface NavigationFooterProps {
  onBack: () => void;
  onNext: () => void;
  hasValidStructure: boolean;
  isLoading?: boolean;
}

export default function NavigationFooter({ 
  onBack, 
  onNext, 
  hasValidStructure, 
  isLoading 
}: NavigationFooterProps) {
  return (
    <div className="border-t bg-white px-6 py-4 flex-shrink-0">
      <div className="max-w-4xl mx-auto flex gap-4">
        <Button onClick={onBack} variant="outline" className="flex-1" disabled={isLoading}>
          ← Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!hasValidStructure || isLoading}
          className="flex-1"
        >
          {isLoading ? "Setting up..." : "Continue →"}
        </Button>
      </div>
    </div>
  );
}
