import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const AuthDebugPanel = () => {
  const { user, session, loading, isAuthenticated } = useAuth();

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 max-w-sm z-50 bg-white border-2 border-yellow-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">🔧 Auth Debug</CardTitle>
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