import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';

export function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'pending'>('pending');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const processVerification = async () => {
      // Check for Supabase auth tokens in URL
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');

      if (accessToken && refreshToken && type === 'signup') {
        await verifyWithTokens(accessToken, refreshToken);
      } else {
        // Check if user is already signed in
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setStatus('success');
          setMessage('Your email has been verified successfully! You can now access your account.');
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
      }
    };

    processVerification();
  }, [searchParams, navigate]);

  const verifyWithTokens = async (accessToken: string, refreshToken: string) => {
    try {
      setStatus('verifying');
      
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      if (error) throw error;

      if (data.user) {
        setStatus('success');
        setMessage('Your email has been verified successfully! You can now access your account.');
        
        // Redirect to dashboard after a brief delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Failed to verify email. Please try again.');
    }
  };

  const resendVerification = async () => {
    try {
      const email = searchParams.get('email');
      if (!email) {
        setMessage('No email address found. Please sign up again.');
        return;
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`
        }
      });

      if (error) throw error;
      
      setMessage('Verification email sent! Please check your inbox.');
    } catch (error) {
      console.error('Resend verification error:', error);
      setMessage(error instanceof Error ? error.message : 'Failed to resend verification email.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'verifying' && <Loader2 className="h-5 w-5 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
            {status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
            {status === 'pending' && <Mail className="h-5 w-5" />}
            Email Verification
          </CardTitle>
          <CardDescription>
            {status === 'pending' && 'Please check your email for a verification link.'}
            {status === 'verifying' && 'Verifying your email address...'}
            {status === 'success' && 'Email verified successfully!'}
            {status === 'error' && 'Email verification failed.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert className={status === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === 'pending' && (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                We've sent a verification email to your inbox. Click the link in the email to verify your account.
              </p>
              <Button variant="outline" onClick={resendVerification} className="w-full">
                Resend Verification Email
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-4">
              <Button variant="outline" onClick={resendVerification} className="w-full">
                Resend Verification Email
              </Button>
              <Button variant="ghost" onClick={() => navigate('/auth')} className="w-full">
                Back to Sign In
              </Button>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Continue to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}