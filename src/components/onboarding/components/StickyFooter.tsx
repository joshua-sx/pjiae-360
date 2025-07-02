import { Button } from "@/components/ui/button";

interface StickyFooterProps {
  onNext: () => void;
}

export default function StickyFooter({ onNext }: StickyFooterProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg px-6 py-4 z-10">
      <div className="max-w-6xl mx-auto flex justify-center">
        <Button
          onClick={onNext}
          className="h-14 px-8 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
        >
          Continue to Structure Organization →
        </Button>
      </div>
    </div>
  );
}