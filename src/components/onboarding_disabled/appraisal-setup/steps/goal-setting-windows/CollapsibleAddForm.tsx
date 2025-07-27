import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { PresetButtons } from "./PresetButtons";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface NewWindow {
  name: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

interface CollapsibleAddFormProps {
  onAdd: (window: { id: string; name: string; startDate: Date; endDate: Date }) => void;
}

export const CollapsibleAddForm = ({ onAdd }: CollapsibleAddFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newWindow, setNewWindow] = useState<NewWindow>({
    name: '',
    startDate: undefined,
    endDate: undefined,
  });

  const handleAddWindow = () => {
    if (!newWindow.name || !newWindow.startDate || !newWindow.endDate) {
      toast.error("Please fill in all fields for the goal setting window");
      return;
    }

    if (newWindow.endDate <= newWindow.startDate) {
      toast.error("End date must be after start date");
      return;
    }

    const window = {
      id: `gsw-${Date.now()}`,
      name: newWindow.name,
      startDate: newWindow.startDate,
      endDate: newWindow.endDate,
    };

    onAdd(window);

    // Reset form and close
    setNewWindow({
      name: '',
      startDate: undefined,
      endDate: undefined,
    });
    setIsOpen(false);

    toast.success("Goal setting window added");
  };

  const handlePresetSelect = (preset: { name: string; startDate: Date; endDate: Date }) => {
    setNewWindow(preset);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between mt-4"
          type="button"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Goal Setting Window
          </div>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="space-y-4 mt-4 animate-accordion-down data-[state=closed]:animate-accordion-up">
        <div className="p-4 border border-border rounded-lg bg-muted/30">
          <PresetButtons onSelectPreset={handlePresetSelect} />

          {/* Manual Entry */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <Label htmlFor="windowName">Window Name *</Label>
              <Input
                id="windowName"
                value={newWindow.name}
                onChange={(e) => setNewWindow({ ...newWindow, name: e.target.value })}
                placeholder="e.g., Q1 Goal Setting"
              />
            </div>
            <div>
              <Label>Start Date *</Label>
              <DatePicker
                date={newWindow.startDate}
                onDateChange={(date) => setNewWindow({ ...newWindow, startDate: date })}
                placeholder="Select start date"
              />
            </div>
            <div>
              <Label>End Date *</Label>
              <DatePicker
                date={newWindow.endDate}
                onDateChange={(date) => setNewWindow({ ...newWindow, endDate: date })}
                placeholder="Select end date"
              />
            </div>
          </div>

          <Button onClick={handleAddWindow} className="w-full mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Add Goal Setting Window
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};