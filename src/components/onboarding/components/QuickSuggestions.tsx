
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface QuickSuggestionsProps {
  onAddDivision: (name: string) => void;
}

export default function QuickSuggestions({ onAddDivision }: QuickSuggestionsProps) {
  const suggestions = ['HR', 'Finance', 'ICT', 'Marketing', 'Operations', 'Sales', 'Engineering'];

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-700">Quick suggestions:</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion}
            variant="outline"
            size="sm"
            onClick={() => onAddDivision(suggestion)}
            className="text-sm"
          >
            <Plus className="w-3 h-3 mr-1" />
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
}
