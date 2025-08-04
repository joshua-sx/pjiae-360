
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
    <Alert className="border-orange-200 bg-orange-50 text-orange-800 relative mx-auto max-w-7xl p-0">
      <div className="flex items-center justify-between gap-4 px-6 py-3">
        <div className="flex items-center gap-3 flex-1">
          <Eye className="h-4 w-4 flex-shrink-0" />
          <div className="flex items-center justify-center flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                {demoRole.charAt(0).toUpperCase() + demoRole.slice(1)} View
              </Badge>
              <span className="text-sm hidden sm:inline">All data shown is simulated for demonstration purposes</span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-orange-600 hover:text-orange-800 hover:bg-orange-100 flex-shrink-0"
          onClick={() => setIsDismissed(true)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      </div>
    </Alert>
  );
}
