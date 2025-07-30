import { Badge } from "@/components/ui/badge";
import { Check, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutoSaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: string;
  className?: string;
}

export const AutoSaveIndicator = ({ 
  status, 
  lastSaved, 
  className 
}: AutoSaveIndicatorProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: Clock,
          text: 'Saving...',
          variant: 'secondary' as const,
          className: 'text-muted-foreground'
        };
      case 'saved':
        return {
          icon: Check,
          text: lastSaved ? `Saved ${lastSaved}` : 'Saved',
          variant: 'secondary' as const,
          className: 'text-green-600'
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Save failed',
          variant: 'destructive' as const,
          className: 'text-destructive'
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  
  if (!config || status === 'idle') {
    return null;
  }

  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={cn(
        "flex items-center gap-1 text-xs font-normal",
        config.className,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.text}
    </Badge>
  );
};