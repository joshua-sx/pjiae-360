import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { errorHandler, ErrorFactory } from '@/lib/enhanced-error-handling';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Shield } from 'lucide-react';
import { logger } from '@/lib/logger';

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
  context?: string;
  criticalLevel?: 'low' | 'medium' | 'high' | 'critical';
}

interface ErrorDisplayProps {
  error: Error;
  errorId: string;
  context?: string;
  criticalLevel?: 'low' | 'medium' | 'high' | 'critical';
  onRetry: () => void;
  onGoHome: () => void;
  onContactSupport: () => void;
}

function ErrorDisplay({ 
  error, 
  errorId, 
  context, 
  criticalLevel = 'medium',
  onRetry, 
  onGoHome, 
  onContactSupport 
}: ErrorDisplayProps) {
  const getErrorIcon = () => {
    switch (criticalLevel) {
      case 'critical':
        return <Shield className="h-8 w-8 text-destructive" />;
      case 'high':
        return <AlertTriangle className="h-8 w-8 text-destructive" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-warning" />;
    }
  };

  const getErrorTitle = () => {
    switch (criticalLevel) {
      case 'critical':
        return 'Critical System Error';
      case 'high':
        return 'Application Error';
      case 'medium':
        return 'Something Went Wrong';
      default:
        return 'Minor Issue Detected';
    }
  };

  const getErrorDescription = () => {
    switch (criticalLevel) {
      case 'critical':
        return 'A critical error has occurred that requires immediate attention. The system may be unstable.';
      case 'high':
        return 'A significant error has occurred. Please try refreshing or contact support if the issue persists.';
      case 'medium':
        return 'An error occurred while processing your request. You can try again or go back to safety.';
      default:
        return 'A minor issue was detected. This shouldn\'t affect your main workflow.';
    }
  };

  const showAdvancedActions = criticalLevel === 'critical' || criticalLevel === 'high';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getErrorIcon()}
          </div>
          <CardTitle className="text-2xl font-bold">
            {getErrorTitle()}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert variant={criticalLevel === 'critical' ? 'destructive' : 'default'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription>
              {getErrorDescription()}
              {context && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Context: {context}
                </div>
              )}
            </AlertDescription>
          </Alert>

          {/* Error ID for debugging */}
          <div className="bg-muted p-3 rounded-md">
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Error Reference
            </div>
            <code className="text-xs bg-background px-2 py-1 rounded border">
              {errorId}
            </code>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={onRetry}
              variant="default"
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            
            <Button 
              onClick={onGoHome}
              variant="outline"
              className="flex-1"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>

          {showAdvancedActions && (
            <div className="pt-4 border-t">
              <div className="text-sm text-muted-foreground mb-3">
                If this error persists, please contact our support team with the error reference above.
              </div>
              <Button 
                onClick={onContactSupport}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                Contact Support
              </Button>
            </div>
          )}

          {/* Development mode details */}
          {import.meta.env.DEV && (
            <details className="mt-6">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                Technical Details (Development)
              </summary>
              <div className="mt-2 p-3 bg-muted rounded text-xs font-mono">
                <div><strong>Error:</strong> {error.message}</div>
                {error.stack && (
                  <div className="mt-2">
                    <strong>Stack:</strong>
                    <pre className="mt-1 whitespace-pre-wrap overflow-x-auto">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function GlobalErrorBoundary({ 
  children, 
  context = 'Application',
  criticalLevel = 'medium'
}: GlobalErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo, errorId?: string) => {
    // Create enhanced error
    const enhancedError = ErrorFactory.system(
      'COMPONENT_ERROR',
      `Error in ${context}: ${error.message}`
    );

    // Log to our enhanced error handler
    errorHandler.handleError(enhancedError, context);

    // Log additional React-specific info
    logger.auth.error('React component error boundary triggered', {
      context,
      criticalLevel,
      errorId,
      error: error.message,
      componentStack: errorInfo.componentStack?.split('\n').slice(0, 5).join('\n'),
      stack: error.stack?.split('\n').slice(0, 10).join('\n')
    });
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  const handleContactSupport = () => {
    // In a real app, this would open a support modal or redirect to support
    const subject = encodeURIComponent(`Error Report - ${context}`);
    const body = encodeURIComponent(`I encountered an error in ${context}. Error ID: ${Date.now()}`);
    window.open(`mailto:support@example.com?subject=${subject}&body=${body}`);
  };

  return (
    <ErrorBoundary
      onError={handleError}
      fallback={(error, errorId, reset) => (
        <ErrorDisplay
          error={error}
          errorId={errorId}
          context={context}
          criticalLevel={criticalLevel}
          onRetry={reset}
          onGoHome={handleGoHome}
          onContactSupport={handleContactSupport}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

// HOC for wrapping components with enhanced error boundaries
export function withGlobalErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    context?: string;
    criticalLevel?: 'low' | 'medium' | 'high' | 'critical';
  } = {}
) {
  const { context = Component.displayName || Component.name || 'Component', criticalLevel = 'medium' } = options;
  
  return function WrappedComponent(props: P) {
    return (
      <GlobalErrorBoundary context={context} criticalLevel={criticalLevel}>
        <Component {...props} />
      </GlobalErrorBoundary>
    );
  };
}

// Critical components wrapper (for onboarding, auth, etc.)
export function CriticalErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <GlobalErrorBoundary context="Critical Operation" criticalLevel="critical">
      {children}
    </GlobalErrorBoundary>
  );
}

// High-priority components wrapper (for admin operations)
export function HighPriorityErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <GlobalErrorBoundary context="High Priority Operation" criticalLevel="high">
      {children}
    </GlobalErrorBoundary>
  );
}