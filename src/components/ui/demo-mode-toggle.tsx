import React from 'react';
import { Switch } from '@/components/ui/switch';
import { useDemoMode } from '@/contexts/DemoModeContext';

export function DemoModeToggle() {
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  return (
    <div className="flex items-center justify-between w-full gap-3 h-10">
      <span className="text-sm leading-none">Demo mode</span>
      <div className="tap-target p-1 self-center flex items-center justify-center">
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