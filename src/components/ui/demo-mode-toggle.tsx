import React from 'react';
import { Switch } from '@/components/ui/switch';
import { useDemoMode } from '@/contexts/DemoModeContext';

export function DemoModeToggle() {
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  return (
    <div className="flex items-center justify-between w-full gap-3">
      <span className="text-sm font-medium">Demo mode</span>
      <div className="tap-target -m-1 p-1">
        <Switch
          size="sm"
          aria-label="Toggle demo mode"
          checked={isDemoMode}
          onCheckedChange={toggleDemoMode}
        />
      </div>
    </div>
  );
}