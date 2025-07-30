import React, { useState } from 'react';
import { AlertTriangle, Eye, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDemoMode } from '@/contexts/DemoModeContext';

export function DemoModeBanner() {
  const { isDemoMode, demoRole } = useDemoMode();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isDemoMode || isDismissed) return null;

  return (
    <Alert className="border-orange-200 bg-orange-50 text-orange-800 relative">
      <Eye className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between pr-8">
        <div className="flex items-center gap-2">
          <span className="font-medium">Demo Mode Active</span>
          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
            {demoRole.charAt(0).toUpperCase() + demoRole.slice(1)} View
          </Badge>
        </div>
        <span className="text-sm hidden sm:block">All data shown is simulated for demonstration purposes</span>
      </AlertDescription>
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-2 top-2 h-6 w-6 p-0 text-orange-600 hover:text-orange-800 hover:bg-orange-100"
        onClick={() => setIsDismissed(true)}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss</span>
      </Button>
    </Alert>
  );
}