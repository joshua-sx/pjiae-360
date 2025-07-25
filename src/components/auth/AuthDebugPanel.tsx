import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonSpinner } from "@/components/ui/loading";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Minus, Wrench, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export const AuthDebugPanel = () => {
  const { user, session, loading, isAuthenticated } = useAuth();
  const { roles, loading: rolesLoading } = usePermissions();
  const [isMinimized, setIsMinimized] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      toast({
        title: "Copied!",
        description: `${field} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsMinimized(false);
    }
  }, []);

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  if (isMinimized) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className={cn(
                "fixed bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer z-50 transition-all duration-300 animate-scale-in shadow-lg",
                "bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600",
                "border border-amber-300 hover:border-amber-400",
                "focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2",
                "animate-pulse hover:animate-none"
              )}
              onClick={() => setIsMinimized(false)}
              onKeyDown={handleKeyDown}
              tabIndex={0}
              role="button"
              aria-label="Open authentication debug panel"
            >
              <Wrench className="h-5 w-5 text-white drop-shadow-sm" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Auth Debug Panel</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const DebugField = ({ 
    label, 
    value, 
    copyable = false, 
    variant 
  }: { 
    label: string
    value: string | React.ReactNode
    copyable?: boolean
    variant?: "default" | "destructive"
  }) => (
    <div className="flex items-center justify-between gap-2 py-1">
      <span className="text-muted-foreground font-medium">{label}:</span>
      <div className="flex items-center gap-1">
        {typeof value === 'string' && copyable ? (
          <code className="text-xs bg-muted px-2 py-1 rounded-md font-mono flex-1 max-w-[120px] truncate">
            {value || "None"}
          </code>
        ) : (
          <div className="flex-1 text-right">
            {value}
          </div>
        )}
        {copyable && typeof value === 'string' && value && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-muted"
            onClick={() => copyToClipboard(value, label)}
          >
            {copiedField === label ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Card className={cn(
      "fixed bottom-4 right-4 w-80 z-50 animate-scale-in shadow-xl border-amber-200",
      "bg-gradient-to-br from-amber-50 to-orange-50"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <CardTitle className="text-sm font-semibold text-amber-800">
              Auth Debug
            </CardTitle>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMinimized(true)}
            className="h-7 w-7 p-0 hover:bg-amber-100 rounded-full transition-colors"
            aria-label="Minimize debug panel"
          >
            <Minus className="h-3 w-3" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          {new Date().toLocaleTimeString()}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <DebugField
          label="Status"
          value={
            loading ? (
              <div className="flex items-center gap-1">
                <ButtonSpinner size="sm" />
                <span>Loading...</span>
              </div>
            ) : (
              <Badge variant={isAuthenticated ? "default" : "destructive"} className="text-xs">
                {isAuthenticated ? "Authenticated" : "Not Authenticated"}
              </Badge>
            )
          }
        />
        
        <DebugField
          label="User ID"
          value={user?.id ? `${user.id.slice(0, 8)}...` : "None"}
          copyable={!!user?.id}
        />
        
        <DebugField
          label="Email"
          value={user?.email || "None"}
          copyable={!!user?.email}
        />
        
        <DebugField
          label="Session"
          value={
            <Badge variant={session ? "default" : "destructive"} className="text-xs">
              {session ? "Active" : "None"}
            </Badge>
          }
        />
        
        <DebugField
          label="Role"
          value={
            rolesLoading ? (
              <div className="flex items-center gap-1">
                <ButtonSpinner size="sm" />
                <span>Loading...</span>
              </div>
            ) : !isAuthenticated ? (
              "None"
            ) : roles.length > 0 ? (
              <Badge variant="secondary" className="text-xs">
                {roles[0].charAt(0).toUpperCase() + roles[0].slice(1)}
              </Badge>
            ) : (
              "None"
            )
          }
        />
        
        <div className="pt-2 border-t border-amber-200">
          <Button
            size="sm" 
            variant="outline" 
            onClick={() => window.location.href = "/log-in"}
            className="w-full text-xs hover:bg-amber-100 border-amber-300"
            disabled={loading}
          >
            {loading ? <ButtonSpinner size="sm" /> : "Go to Login"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};