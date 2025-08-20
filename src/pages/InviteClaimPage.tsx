import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEmployeeInvitation } from '@/hooks/useEmployeeInvitation';
import { validateInvitationTokenSecure } from '@/lib/auth/secure-invitation';
import { toast } from 'sonner';

const InviteClaimPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signInWithMagicLink } = useAuth();
  const { claimProfile } = useEmployeeInvitation();
  
  const [step, setStep] = useState<'validating' | 'sign-in' | 'claiming' | 'success' | 'error'>('validating');
  const [error, setError] = useState<string>('');
  const [invitation, setInvitation] = useState<{
    email: string;
    organizationId: string;
    employeeId: string;
  } | null>(null);

  const token = searchParams.get('token');

  // Validate invitation token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('No invitation token provided');
        setStep('error');
        return;
      }

      try {
        const result = await validateInvitationTokenSecure(token);
        
        if (!result.isValid) {
          setError(result.error || 'Invalid invitation token');
          setStep('error');
          return;
        }

        setInvitation({
          email: result.email!,
          organizationId: result.organizationId!,
          employeeId: result.employeeId!
        });

        // If user is already authenticated, proceed to claim
        if (user) {
          setStep('claiming');
        } else {
          setStep('sign-in');
        }
      } catch (err) {
        setError('Failed to validate invitation');
        setStep('error');
      }
    };

    validateToken();
  }, [token, user]);

  // Auto-claim invitation when user becomes authenticated
  useEffect(() => {
    const claimInvitation = async () => {
      if (step === 'claiming' && user && token) {
        try {
          const result = await claimProfile(token, user.id);
          
          if (result.success) {
            setStep('success');
            toast.success('Welcome to the organization!');
            
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          } else {
            setError(result.error || 'Failed to claim invitation');
            setStep('error');
          }
        } catch (err) {
          setError('Failed to process invitation');
          setStep('error');
        }
      }
    };

    claimInvitation();
  }, [step, user, token, claimProfile, navigate]);

  const handleSignIn = async () => {
    if (!invitation?.email) return;

    try {
      const result = await signInWithMagicLink(invitation.email);
      if (result.error) {
        toast.error(result.error.message);
        return;
      }
      toast.success('Magic link sent! Check your email to continue.');
      // User will be redirected back here after clicking the magic link
    } catch (error) {
      toast.error('Failed to send magic link');
    }
  };

  if (step === 'validating') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-center text-muted-foreground">
                Validating your invitation...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full"
              variant="outline"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'sign-in') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Join Your Organization</CardTitle>
            <CardDescription>
              You've been invited to join your organization. Sign in with your email to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                <strong>Invited Email:</strong> {invitation?.email}
              </AlertDescription>
            </Alert>
            
            <Button onClick={handleSignIn} className="w-full">
              <Mail className="mr-2 h-4 w-4" />
              Send Magic Link to {invitation?.email}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              A magic link will be sent to your email. Click it to access your account.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'claiming') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-center text-muted-foreground">
                Setting up your account...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <CardTitle>Welcome!</CardTitle>
            <CardDescription>
              Your invitation has been accepted. You're now part of the organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Redirecting you to the dashboard...
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default InviteClaimPage;