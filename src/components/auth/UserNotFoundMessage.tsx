import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const UserNotFoundMessage = () => {
  const navigate = useNavigate();

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-yellow-600" />
        </div>
        <CardTitle className="text-xl">Authentication Required</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          Please log in to access your employee data and start appraisals.
        </p>
        <div className="space-y-2">
          <Button 
            onClick={() => navigate("/log-in")} 
            className="w-full"
          >
            Sign In
          </Button>
          <Button 
            onClick={() => navigate("/create-account")} 
            variant="outline" 
            className="w-full"
          >
            Create Account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};