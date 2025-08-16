import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, LogIn, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logger';

interface AuthErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function AuthErrorFallback({ error, resetErrorBoundary }: AuthErrorFallbackProps) {
  const isAuthError = error.message.toLowerCase().includes('auth') || 
                     error.message.toLowerCase().includes('session') ||
                     error.message.toLowerCase().includes('token');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">
            {isAuthError ? 'Authentication Error' : 'Something went wrong'}
          </CardTitle>
          <CardDescription>
            {isAuthError 
              ? 'There was a problem with your authentication. Please sign in again.'
              : 'We encountered an unexpected error. Please try again.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {import.meta.env?.NODE_ENV === 'development' && (
            <details className="bg-muted p-3 rounded-md">
              <summary className="cursor-pointer text-sm font-medium mb-2">
                Error Details (Development Mode)
              </summary>
              <pre className="text-xs whitespace-pre-wrap break-words">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
          
          <div className="flex flex-col gap-2">
            {isAuthError ? (
              <Button 
                onClick={() => window.location.href = '/log-in'}
                className="w-full"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In Again
              </Button>
            ) : (
              <Button onClick={resetErrorBoundary} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function handleAuthError(error: Error, errorInfo: any) {
  logger.authError('Auth error boundary caught an error', error);
}

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
}

export function AuthErrorBoundary({ children }: AuthErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={AuthErrorFallback}
      onError={handleAuthError}
      onReset={() => {
        // Clear any cached auth state
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
      }}
    >
      {children}
    </ErrorBoundary>
  );
}