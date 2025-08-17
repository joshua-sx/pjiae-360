import { Badge } from "@/components/ui/badge";
import { Check, Clock, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface SaveStatusIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error' | 'offline';
  lastSaved?: Date | null;
  className?: string;
  showOfflineStatus?: boolean;
  isOnline?: boolean;
}

export const SaveStatusIndicator = ({ 
  status, 
  lastSaved, 
  className,
  showOfflineStatus = true,
  isOnline: propIsOnline
}: SaveStatusIndicatorProps) => {
  const [internalIsOnline, setInternalIsOnline] = useState(navigator.onLine);
  const isOnline = propIsOnline !== undefined ? propIsOnline : internalIsOnline;

  useEffect(() => {
    if (propIsOnline !== undefined) return; // Don't listen if prop is provided
    
    const handleOnline = () => setInternalIsOnline(true);
    const handleOffline = () => setInternalIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [propIsOnline]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const getStatusConfig = () => {
    if (!isOnline && showOfflineStatus) {
      return {
        icon: WifiOff,
        text: 'Offline - changes will save when reconnected',
        variant: 'secondary' as const,
        className: 'text-orange-600 bg-orange-50 border-orange-200'
      };
    }

    switch (status) {
      case 'saving':
        return {
          icon: Clock,
          text: 'Saving...',
          variant: 'secondary' as const,
          className: 'text-blue-600 bg-blue-50 border-blue-200'
        };
      case 'saved':
        return {
          icon: Check,
          text: lastSaved ? `Saved ${formatTimeAgo(lastSaved)}` : 'Saved',
          variant: 'secondary' as const,
          className: 'text-green-600 bg-green-50 border-green-200'
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: isOnline ? 'Save failed - retrying...' : 'Save failed - will retry when online',
          variant: 'destructive' as const,
          className: 'text-red-600 bg-red-50 border-red-200'
        };
      default:
        if (lastSaved) {
          return {
            icon: isOnline ? Wifi : WifiOff,
            text: `Last saved ${formatTimeAgo(lastSaved)}`,
            variant: 'secondary' as const,
            className: 'text-muted-foreground bg-muted/50'
          };
        }
        return null;
    }
  };

  const config = getStatusConfig();
  
  if (!config) {
    return null;
  }

  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={cn(
        "flex items-center gap-1.5 text-xs font-normal transition-all duration-200",
        config.className,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.text}
    </Badge>
  );
};