import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Minus, Wrench } from "lucide-react";

export const AuthDebugPanel = () => {
  const { user, session, loading, isAuthenticated } = useAuth();
  const [isMinimized, setIsMinimized] = useState(false);

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-4 right-4 w-12 h-12 bg-yellow-300 border-2 border-yellow-400 rounded-full flex items-center justify-center cursor-pointer z-50 hover:bg-yellow-400 transition-all duration-300 animate-scale-in shadow-lg"
        onClick={() => setIsMinimized(false)}
      >
        <Wrench className="h-5 w-5 text-yellow-800" />
      </div>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 max-w-sm z-50 bg-white border-2 border-yellow-300 animate-scale-in shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">🔧 Auth Debug</CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMinimized(true)}
            className="h-6 w-6 p-0 hover:bg-yellow-100 rounded-full"
          >
            <Minus className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <span>Status:</span>
          <Badge variant={isAuthenticated ? "default" : "destructive"}>
            {loading ? "Loading..." : isAuthenticated ? "Authenticated" : "Not Authenticated"}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <span>User ID:</span>
          <code className="text-xs bg-gray-100 px-1 rounded">
            {user?.id ? user.id.slice(0, 8) + "..." : "None"}
          </code>
        </div>
        
        <div className="flex items-center gap-2">
          <span>Email:</span>
          <code className="text-xs bg-gray-100 px-1 rounded">
            {user?.email || "None"}
          </code>
        </div>
        
        <div className="flex items-center gap-2">
          <span>Session:</span>
          <Badge variant={session ? "default" : "destructive"}>
            {session ? "Active" : "None"}
          </Badge>
        </div>
        
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => window.location.href = "/log-in"}
          className="w-full text-xs"
        >
          Go to Login
        </Button>
      </CardContent>
    </Card>
  );
};