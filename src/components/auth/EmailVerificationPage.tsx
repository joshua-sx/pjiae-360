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
      
      // Check for PKCE code (modern Supabase auth flow)
      const code = searchParams.get('code');
      if (code) {
        console.log('🔐 PKCE code found in URL, exchanging for session...');
        setStatus('verifying');
        await exchangeCodeForSession(code);
        return;
      }
      
      // Check for Supabase auth tokens in URL (legacy magic link)
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');
      const emailFromParams = searchParams.get('email');

      if (accessToken && refreshToken && type === 'signup') {
        console.log('🔐 Processing verification with legacy tokens');
        await verifyWithTokens(accessToken, refreshToken);
        return;
      }

      // Check for organization verification token
      const token = searchParams.get('token');
      if (token) {
        console.log('🏢 Organization token found, processing invitation...');
        setStatus('verifying');
        await processOrganizationToken(token);
        return;
      }

      // Check if user is already signed in
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log('✅ User already signed in, checking onboarding status');
        // Check onboarding status to determine where to redirect
        await redirectBasedOnOnboardingStatus(session.user.id);
      } else {
        // If no tokens and no session, but we have an email, auto-resend verification
        if (emailFromParams && !accessToken && !code) {
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

  const exchangeCodeForSession = async (code: string) => {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('❌ Error exchanging code for session:', error);
        setStatus('error');
        setMessage('Failed to verify email. The link may have expired. Please try again.');
        return;
      }

      if (data.session?.user) {
        console.log('✅ Session established successfully via PKCE');
        setStatus('success');
        setMessage('Email verified successfully! Redirecting...');
        
        // Check for organization context in URL
        const organizationId = searchParams.get('organizationId');
        const intendedRole = searchParams.get('intendedRole');
        
        if (organizationId && intendedRole) {
          console.log('🏢 Processing organization membership activation...');
          await processOrganizationMembership(data.session.user.id, organizationId, intendedRole);
        } else {
          await redirectBasedOnOnboardingStatus(data.session.user.id);
        }
      }
    } catch (error) {
      console.error('❌ Unexpected error during code exchange:', error);
      setStatus('error');
      setMessage('An unexpected error occurred. Please try again.');
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

  const processOrganizationToken = async (token: string) => {
    try {
      // Validate the organization token and get user/org details
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('validate_verification_token', { _token: token });

      if (tokenError || !tokenData?.[0]?.is_valid) {
        console.error('❌ Invalid organization token:', tokenError);
        setStatus('error');
        setMessage('Invalid or expired invitation link. Please contact your administrator.');
        return;
      }

      const { user_id, organization_id, intended_role } = tokenData[0];
      
      // Activate user membership in the organization
      const { data: activationData, error: activationError } = await supabase
        .rpc('activate_user_membership', {
          _user_id: user_id,
          _organization_id: organization_id,
          _intended_role: intended_role
        });

      if (activationError || !activationData) {
        console.error('❌ Failed to activate membership:', activationError);
        setStatus('error');
        setMessage('Failed to activate your account. Please contact support.');
        return;
      }

      console.log('✅ Organization membership activated successfully');
      setStatus('success');
      setMessage('Account activated successfully! Redirecting...');
      
      // Redirect to onboarding or dashboard based on user status
      await redirectBasedOnOnboardingStatus(user_id);
    } catch (error) {
      console.error('❌ Error processing organization token:', error);
      setStatus('error');
      setMessage('An unexpected error occurred. Please try again.');
    }
  };

  const processOrganizationMembership = async (userId: string, organizationId: string, intendedRole: string) => {
    try {
      console.log(`🏢 Activating membership for user ${userId} in org ${organizationId} as ${intendedRole}`);
      
      const { data: activationData, error: activationError } = await supabase
        .rpc('activate_user_membership', {
          _user_id: userId,
          _organization_id: organizationId,
          _intended_role: intendedRole as 'admin' | 'director' | 'manager' | 'supervisor' | 'employee'
        });

      if (activationError || !activationData) {
        console.error('❌ Failed to activate membership:', activationError);
        setStatus('error');
        setMessage('Failed to activate your account. Please contact support.');
        return;
      }

      console.log('✅ Organization membership activated successfully');
      await redirectBasedOnOnboardingStatus(userId);
    } catch (error) {
      console.error('❌ Error processing organization membership:', error);
      setStatus('error');
      setMessage('An unexpected error occurred. Please try again.');
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
            Check Your Email
          </CardTitle>
          <CardDescription>
            {status === 'pending' && 'We sent you a secure sign-in link. Click it to access your account.'}
            {status === 'verifying' && 'Signing you in securely...'}
            {status === 'success' && 'Successfully signed in!'}
            {status === 'error' && 'Sign-in link failed or expired.'}
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
                We've sent a secure sign-in link to your email. Click the link to access your account instantly - no password needed!
              </p>
              
              <div className="bg-muted p-4 rounded-lg text-left">
                <h4 className="font-medium text-sm mb-2">What to do next:</h4>
                <ol className="text-xs text-muted-foreground space-y-1">
                  <li>1. Check your email inbox</li>
                  <li>2. Look for an email with "Sign in to your account"</li>
                  <li>3. Click the "Sign In" button in the email</li>
                  <li>4. You'll be automatically signed in</li>
                </ol>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="resend-email" className="text-sm">
                  Didn't receive the email? Enter your email to resend
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
                  'Resend Sign-in Link'
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Check your spam folder • Wait 60s between resends
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