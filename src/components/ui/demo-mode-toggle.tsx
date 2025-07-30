import React from 'react';
import { Switch } from '@/components/ui/switch';
import { useDemoMode } from '@/contexts/DemoModeContext';

export function DemoModeToggle() {
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  return (
    <div className="flex items-center justify-between w-full">
      <span>Demo mode</span>
      <Switch
        checked={isDemoMode}
        onCheckedChange={toggleDemoMode}
      />
    </div>
  );
}