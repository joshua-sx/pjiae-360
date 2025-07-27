
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface PresetWindow {
  name: string;
  startDate: Date;
  endDate: Date;
}

interface PresetButtonsProps {
  onSelectPreset: (preset: PresetWindow) => void;
}

export const PresetButtons = ({ onSelectPreset }: PresetButtonsProps) => {
  const getPresetWindows = (): PresetWindow[] => {
    const currentYear = new Date().getFullYear();
    return [
      {
        name: "Q1 Goal Setting",
        startDate: new Date(currentYear, 0, 1), // Jan 1
        endDate: new Date(currentYear, 0, 31),  // Jan 31
      },
      {
        name: "Q2 Goal Setting", 
        startDate: new Date(currentYear, 3, 1), // Apr 1
        endDate: new Date(currentYear, 3, 30), // Apr 30
      },
      {
        name: "Annual Goal Setting",
        startDate: new Date(currentYear, 0, 1), // Jan 1
        endDate: new Date(currentYear, 1, 28), // Feb 28
      }
    ];
  };

  return (
    <div>
      <Label className="text-sm font-medium">Quick Presets</Label>
      <div className="mt-2 flex flex-wrap gap-2">
        {getPresetWindows().map((preset, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSelectPreset(preset)}
          >
            {preset.name}
          </Button>
        ))}
      </div>
    </div>
  );
};
