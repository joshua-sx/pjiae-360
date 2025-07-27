
import { Button } from "@/components/ui/button";
import { Plus, Building2 } from "lucide-react";
import { PJIAE_DIVISIONS } from "../PJIAEStructureDefaults";

interface QuickSuggestionsProps {
  onAddDivision: (name: string) => void;
  onUsePJIAEStructure?: () => void;
}

export default function QuickSuggestions({ onAddDivision, onUsePJIAEStructure }: QuickSuggestionsProps) {
  const suggestions = PJIAE_DIVISIONS.slice(0, 6).map(div => div.name);

  return (
    <div className="space-y-4">
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
      
      {onUsePJIAEStructure && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building2 className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Use PJIAE Structure</p>
                <p className="text-xs text-blue-700">Pre-configure with Princess Juliana International Airport's 9 divisions</p>
              </div>
            </div>
            <Button
              onClick={onUsePJIAEStructure}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Use Template
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
