import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';

export function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'pending'>('pending');
  const [message, setMessage] = useState<string>('');
  const [resendEmail, setResendEmail] = useState(searchParams.get('email') || '');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const processVerification = async () => {
      // Clear demo mode for new users during verification
      console.log('🔄 Clearing demo mode for new user verification');
      localStorage.removeItem('demo-mode');
      localStorage.removeItem('demo-role');
      
      // Check for Supabase auth tokens in URL
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');
      const emailFromParams = searchParams.get('email');

      if (accessToken && refreshToken && type === 'signup') {
        console.log('🔐 Processing verification with tokens');
        await verifyWithTokens(accessToken, refreshToken);
      } else {
        // Check if user is already signed in
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('✅ User already signed in, checking onboarding status');
          // Check onboarding status to determine where to redirect
          await redirectBasedOnOnboardingStatus(session.user.id);
        } else {
          // If no tokens and no session, but we have an email, auto-resend verification
          if (emailFromParams && !accessToken) {
            console.log('📧 Auto-resending verification email for:', emailFromParams);
            setResendEmail(emailFromParams);
            // Auto-resend verification email after a short delay
            setTimeout(() => {
              resendVerification();
            }, 1000);
          } else {
            console.log('👤 No session found, staying on verification page');
          }
        }
      }
    };

    processVerification();
  }, [searchParams, navigate]);

  const redirectBasedOnOnboardingStatus = async (userId: string) => {
    try {
      console.log('🔍 Checking onboarding status for user:', userId);
      
      // Check if user has employee_info record and is active (onboarding completed)
      const { data: employeeInfo, error } = await supabase
        .from('employee_info')
        .select('status')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error checking onboarding status:', error);
        console.log('🎯 Error occurred, redirecting to onboarding for new user setup');
        // On error, default to onboarding for new users
        setStatus('success');
        setMessage('Your email has been verified successfully! Starting your setup...');
        setTimeout(() => {
          navigate('/onboarding');
        }, 2000);
        return;
      }

      // If no employee_info record or status is not active, redirect to onboarding
      if (!employeeInfo || employeeInfo.status !== 'active') {
        console.log('🚀 New user or inactive status, redirecting to onboarding');
        setStatus('success');
        setMessage('Your email has been verified successfully! Let\'s set up your organization...');
        setTimeout(() => {
          navigate('/onboarding');
        }, 2000);
      } else {
        // User has completed onboarding, redirect to dashboard
        console.log('✅ User onboarding completed, redirecting to dashboard');
        setStatus('success');
        setMessage('Your email has been verified successfully! Taking you to your dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Error during redirect logic:', error);
      console.log('⚠️ Catch block triggered, defaulting to onboarding');
      // On error, default to onboarding
      setStatus('success');
      setMessage('Your email has been verified successfully! Starting your setup...');
      setTimeout(() => {
        navigate('/onboarding');
      }, 2000);
    }
  };

  const verifyWithTokens = async (accessToken: string, refreshToken: string) => {
    try {
      setStatus('verifying');
      console.log('🔐 Setting session with verification tokens');
      
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      if (error) throw error;

      if (data.user) {
        console.log('✅ Session established for user:', data.user.id);
        // Check onboarding status to determine where to redirect
        await redirectBasedOnOnboardingStatus(data.user.id);
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Failed to verify email. Please try again.');
    }
  };

  const resendVerification = async () => {
    try {
      setIsResending(true);
      const emailToUse = resendEmail || searchParams.get('email');
      
      if (!emailToUse) {
        setMessage('Please enter your email address to resend verification.');
        return;
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailToUse,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email?email=${encodeURIComponent(emailToUse)}`
        }
      });

      if (error) throw error;
      
      setMessage('Verification email sent! Please check your inbox and spam folder.');
    } catch (error) {
      console.error('Resend verification error:', error);
      setMessage(error instanceof Error ? error.message : 'Failed to resend verification email.');
    } finally {
      setIsResending(false);
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
              
              <div className="space-y-2">
                <Label htmlFor="resend-email" className="text-sm">
                  Email address for resending verification
                </Label>
                <Input
                  id="resend-email"
                  type="email"
                  placeholder="Enter your email address"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                />
              </div>
              
              <Button 
                variant="outline" 
                onClick={resendVerification} 
                className="w-full"
                disabled={isResending || !resendEmail.trim()}
              >
                {isResending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  'Resend Verification Email'
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Tip: Check your spam folder and wait ~60s between resends to avoid rate limits.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resend-email-error" className="text-sm">
                  Email address for resending verification
                </Label>
                <Input
                  id="resend-email-error"
                  type="email"
                  placeholder="Enter your email address"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                />
              </div>
              
              <Button 
                variant="outline" 
                onClick={resendVerification} 
                className="w-full"
                disabled={isResending || !resendEmail.trim()}
              >
                {isResending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  'Resend Verification Email'
                )}
              </Button>
              <Button variant="ghost" onClick={() => navigate('/auth')} className="w-full">
                Back to Sign In
              </Button>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <Button onClick={() => {
                // Will be redirected automatically, but provide manual option
                window.location.href = '/onboarding';
              }} className="w-full">
                Continue Setup
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}