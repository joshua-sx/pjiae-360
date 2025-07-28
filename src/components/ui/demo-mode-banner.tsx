import React from 'react';
import { AlertTriangle, Eye } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useDemoMode } from '@/contexts/DemoModeContext';

export function DemoModeBanner() {
  const { isDemoMode, demoRole } = useDemoMode();

  if (!isDemoMode) return null;

  return (
    <Alert className="border-orange-200 bg-orange-50 text-orange-800 mb-4">
      <Eye className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium">Demo Mode Active</span>
          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
            {demoRole.charAt(0).toUpperCase() + demoRole.slice(1)} View
          </Badge>
        </div>
        <span className="text-sm">All data shown is simulated for demonstration purposes</span>
      </AlertDescription>
    </Alert>
  );
}