import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface PageErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function PageError({ 
  title = "Something went wrong",
  message = "Failed to load content. Please try again later.",
  onRetry 
}: PageErrorProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-6">
          <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground mb-4">{message}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}