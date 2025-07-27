
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AlternativeOptionsProps {
  onManualEntry: () => void;
  onSkip: () => void;
}

export default function AlternativeOptions({ onManualEntry, onSkip }: AlternativeOptionsProps) {
  return (
    <div className="grid md:grid-cols-2 gap-4 mb-8">
      <Button
        onClick={onManualEntry}
        variant="outline"
        className="h-12 flex items-center gap-2 border-slate-300"
      >
        <Plus className="w-4 h-4" />
        Add People Manually
      </Button>
      
      <Button
        onClick={onSkip}
        variant="ghost"
        className="h-12 text-slate-600 hover:text-slate-800"
      >
        Skip for Now
      </Button>
    </div>
  );
}
