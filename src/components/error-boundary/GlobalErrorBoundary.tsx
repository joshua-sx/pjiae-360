import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logger';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  errorId: string;
}

function ErrorFallback({ error, resetErrorBoundary, errorId }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Something went wrong</CardTitle>
          <CardDescription>
            We're sorry, but something unexpected happened. Our team has been notified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <details className="bg-muted p-3 rounded-md">
            <summary className="cursor-pointer text-sm font-medium mb-2">
              Error Details
            </summary>
            <div className="text-xs space-y-2">
              <div>
                <strong>Error Reference:</strong> {errorId}
              </div>
              <pre className="whitespace-pre-wrap break-words">
                {error.message}
                {import.meta.env.DEV && error.stack && `\n\n${error.stack}`}
              </pre>
            </div>
          </details>
          
          <div className="flex flex-col gap-2">
            <Button onClick={resetErrorBoundary} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/dashboard'}
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => window.location.href = 'mailto:support@company.com'}
              className="w-full text-sm"
            >
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function handleError(error: Error, errorInfo: any, errorId: string) {
  logger.error('Global error boundary caught an error', {
    action: 'error_boundary',
    route: window.location.pathname,
    userAgent: navigator.userAgent,
    errorId
  }, error);

  // Report to error tracking service in production
  if (import.meta.env?.NODE_ENV === 'production') {
    // TODO: Send to error tracking service (Sentry, etc.)
  }
}

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
}

export function GlobalErrorBoundary({ children }: GlobalErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={(error, errorId, reset) => (
        <ErrorFallback 
          error={error} 
          errorId={errorId} 
          resetErrorBoundary={reset} 
        />
      )}
      onError={(error, errorInfo) => {
        const errorId = Math.random().toString(36).substring(7);
        handleError(error, errorInfo, errorId);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}