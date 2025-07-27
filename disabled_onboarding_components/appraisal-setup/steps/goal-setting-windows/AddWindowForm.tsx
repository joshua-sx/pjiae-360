
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PresetButtons } from "./PresetButtons";

interface NewWindow {
  name: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

interface AddWindowFormProps {
  onAdd: (window: { id: string; name: string; startDate: Date; endDate: Date }) => void;
}

export const AddWindowForm = ({ onAdd }: AddWindowFormProps) => {
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

    setNewWindow({
      name: '',
      startDate: undefined,
      endDate: undefined,
    });

    toast.success("Goal setting window added");
  };

  const handlePresetSelect = (preset: { name: string; startDate: Date; endDate: Date }) => {
    setNewWindow(preset);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add Goal Setting Window</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PresetButtons onSelectPreset={handlePresetSelect} />

        {/* Manual Entry */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <Button onClick={handleAddWindow} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Goal Setting Window
        </Button>
      </CardContent>
    </Card>
  );
};
