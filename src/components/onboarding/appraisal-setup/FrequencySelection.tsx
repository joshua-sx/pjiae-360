import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { Info, Clock } from "lucide-react";

interface FrequencySelectionProps {
  frequency: "annual" | "bi-annual";
  onFrequencyChange: (frequency: "annual" | "bi-annual") => void;
}

export const FrequencySelection = ({ frequency, onFrequencyChange }: FrequencySelectionProps) => {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-base font-medium flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Review Frequency
          </Label>
          <p className="text-sm text-muted-foreground">
            Select how often you want to conduct performance reviews.
          </p>
        </div>
        
        <RadioGroup 
          value={frequency} 
          onValueChange={onFrequencyChange} 
          className="space-y-4"
        >
          <label 
            htmlFor="annual" 
            className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
          >
            <RadioGroupItem value="annual" id="annual" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Annual Review</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Most organizations prefer annual reviews for comprehensive evaluation</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                One formal review cycle per year with a single goal-setting window
              </p>
            </div>
          </label>

          <label 
            htmlFor="bi-annual" 
            className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
          >
            <RadioGroupItem value="bi-annual" id="bi-annual" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Bi-Annual Review</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  Recommended
                </Badge>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Two formal review cycles per year for more frequent feedback</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Two formal review cycles per year, each with its own goal-setting period
              </p>
            </div>
          </label>
        </RadioGroup>
      </div>
    </Card>
  );
};