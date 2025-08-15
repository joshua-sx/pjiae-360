import React from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { RotateCcw, Settings } from "lucide-react";
import { usePreferences, Preferences } from "@/contexts/PreferencesContext";

interface PreferencesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PreferencesDrawer = ({ open, onOpenChange }: PreferencesDrawerProps) => {
  const { preferences, updatePreferences, resetPreferences } = usePreferences();

  const handleDensityChange = (value: string) => {
    updatePreferences({ density: value as Preferences["density"] });
  };

  const handleDefaultHomeChange = (value: string) => {
    updatePreferences({ defaultManagerHome: value as Preferences["defaultManagerHome"] });
  };

  const handleDefaultDatePresetChange = (value: string) => {
    updatePreferences({ defaultDatePreset: value as Preferences["defaultDatePreset"] });
  };

  const handleShowShortcutsTipsChange = (checked: boolean) => {
    updatePreferences({ showShortcutsTips: checked });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[400px] w-full">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Preferences
          </SheetTitle>
          <SheetDescription>
            Customize your experience and default settings
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* UI Density */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Interface Density</Label>
            <Select value={preferences.density} onValueChange={handleDensityChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select density" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comfortable">Comfortable</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Adjust spacing and padding throughout the interface
            </p>
          </div>

          <Separator />

          {/* Default Manager Home */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Default Manager Home</Label>
            <Select value={preferences.defaultManagerHome} onValueChange={handleDefaultHomeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select default home" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dashboard">Dashboard</SelectItem>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="analytics">Analytics</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose which page to show when navigating to the manager section
            </p>
          </div>

          <Separator />

          {/* Default Date Preset */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Default Analytics Date Range</Label>
            <Select value={preferences.defaultDatePreset} onValueChange={handleDefaultDatePresetChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select default date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="ytd">Year to date</SelectItem>
                <SelectItem value="12m">Last 12 months</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Default date range for analytics charts and reports
            </p>
          </div>

          <Separator />

          {/* Show Shortcuts Tips */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Show Keyboard Shortcuts</Label>
                <p className="text-xs text-muted-foreground">
                  Display keyboard shortcut hints and tips
                </p>
              </div>
              <Switch
                checked={preferences.showShortcutsTips}
                onCheckedChange={handleShowShortcutsTipsChange}
              />
            </div>
          </div>

          <Separator />

          {/* Reset Button */}
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={resetPreferences}
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              This will reset all preferences to their default values
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};