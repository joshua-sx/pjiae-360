import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ClerkKeyManager = () => {
  const [publishableKey, setPublishableKey] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleUpdateKey = async () => {
    if (!publishableKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Clerk publishable key",
        variant: "destructive",
      });
      return;
    }

    if (!publishableKey.startsWith("pk_test_") && !publishableKey.startsWith("pk_live_")) {
      toast({
        title: "Invalid Key Format",
        description: "Clerk publishable keys should start with 'pk_test_' or 'pk_live_'",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    
    try {
      // Store the key in localStorage for immediate use
      localStorage.setItem('clerk_publishable_key', publishableKey);
      
      toast({
        title: "Key Updated",
        description: "Your Clerk publishable key has been saved successfully",
      });
      
      // Provide instructions to the user
      setTimeout(() => {
        toast({
          title: "Refresh Required",
          description: "Please refresh the page to activate Clerk authentication",
        });
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update the Clerk key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Clerk Configuration
        </CardTitle>
        <CardDescription>
          Enter your Clerk publishable key to enable authentication features
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This is a publishable key and is safe to store in your application. 
            Get your key from the <a 
              href="https://go.clerk.com/lovable" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary underline hover:no-underline"
            >
              Clerk Dashboard
            </a>.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="clerk-key">Clerk Publishable Key</Label>
          <Input
            id="clerk-key"
            type="text"
            placeholder="pk_test_..."
            value={publishableKey}
            onChange={(e) => setPublishableKey(e.target.value)}
            className="font-mono text-sm"
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleUpdateKey}
            disabled={isUpdating || !publishableKey.trim()}
            className="flex items-center gap-2"
          >
            {isUpdating ? (
              <>Updating...</>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Update Key
              </>
            )}
          </Button>
        </div>

        <Alert>
          <AlertDescription className="text-sm text-muted-foreground">
            <strong>How to get your Clerk key:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Visit <a href="https://go.clerk.com/lovable" target="_blank" rel="noopener noreferrer" className="text-primary underline">clerk.com</a> and create an account</li>
              <li>Create a new application</li>
              <li>Go to "API Keys" in your dashboard</li>
              <li>Copy the "Publishable key" (starts with pk_test_ or pk_live_)</li>
              <li>Paste it in the field above</li>
            </ol>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};