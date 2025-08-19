import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type ConfirmationStatus = 'loading' | 'success' | 'error' | 'expired' | 'already-used';

interface ConfirmationResult {
  success: boolean;
  user_id?: string;
  organization_id?: string;
  role?: string;
  onboarding_completed?: boolean;
  is_admin?: boolean;
  auth_url?: string;
  redirect_to?: string;
  error?: string;
  code?: string;
}

export function ConfirmMembershipPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<ConfirmationStatus>('loading');
  const [result, setResult] = useState<ConfirmationResult | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const confirmMembership = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setResult({ success: false, error: 'No verification token provided' });
        return;
      }

      try {
        console.log('🔑 Confirming membership with token:', token.substring(0, 8) + '...');

        const { data, error } = await supabase.functions.invoke('confirm-membership', {
          body: { token }
        });

        if (error) {
          console.error('❌ Confirmation error:', error);
          setStatus('error');
          setResult({ success: false, error: error.message });
          return;
        }

        const confirmationResult = data as ConfirmationResult;

        if (!confirmationResult.success) {
          console.error('❌ Confirmation failed:', confirmationResult.error);
          
          // Handle specific error codes
          if (confirmationResult.code === 'INVALID_TOKEN') {
            if (confirmationResult.error?.includes('expired')) {
              setStatus('expired');
            } else if (confirmationResult.error?.includes('already been used')) {
              setStatus('already-used');
            } else {
              setStatus('error');
            }
          } else {
            setStatus('error');
          }
          
          setResult(confirmationResult);
          return;
        }

        console.log('✅ Membership confirmed successfully:', confirmationResult);
        setStatus('success');
        setResult(confirmationResult);

        // Auto-redirect after success
        setTimeout(() => {
          handleSuccessRedirect(confirmationResult);
        }, 2000);

      } catch (error: any) {
        console.error('💥 Confirmation error:', error);
        setStatus('error');
        setResult({ success: false, error: 'Failed to confirm membership' });
      }
    };

    confirmMembership();
  }, [searchParams]);

  const handleSuccessRedirect = async (confirmationResult: ConfirmationResult) => {
    setIsRedirecting(true);

    try {
      // If we have an auth URL, use it for seamless login
      if (confirmationResult.auth_url) {
        console.log('🔗 Redirecting with auth URL');
        window.location.href = confirmationResult.auth_url;
        return;
      }

      // Otherwise, redirect to the appropriate page
      const redirectPath = confirmationResult.redirect_to || '/dashboard';
      console.log('🏠 Redirecting to:', redirectPath);
      navigate(redirectPath);

    } catch (error) {
      console.error('❌ Redirect error:', error);
      toast({
        title: "Redirect Error",
        description: "Please try logging in manually.",
        variant: "destructive",
      });
      navigate('/log-in');
    }
  };

  const handleResendVerification = () => {
    const email = searchParams.get('email');
    if (email) {
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } else {
      navigate('/log-in');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
            <h1 className="text-2xl font-semibold">Confirming Your Account</h1>
            <p className="text-muted-foreground">
              Please wait while we verify your account and set up your access...
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            <h1 className="text-2xl font-semibold text-green-700">Account Confirmed!</h1>
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Welcome to PJIAE 360! Your account has been verified and activated.
              </p>
              {result?.role && (
                <p className="text-sm font-medium">
                  Role: <span className="capitalize">{result.role}</span>
                </p>
              )}
              {isRedirecting ? (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirecting you to the application...
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  You'll be redirected automatically in a few seconds.
                </p>
              )}
            </div>
          </div>
        );

      case 'expired':
        return (
          <div className="text-center space-y-4">
            <Clock className="h-12 w-12 mx-auto text-orange-500" />
            <h1 className="text-2xl font-semibold text-orange-700">Link Expired</h1>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                This verification link has expired. Please request a new one.
              </p>
              <Button onClick={handleResendVerification} className="w-full">
                Get New Verification Link
              </Button>
            </div>
          </div>
        );

      case 'already-used':
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 mx-auto text-blue-500" />
            <h1 className="text-2xl font-semibold text-blue-700">Already Confirmed</h1>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                This verification link has already been used. Your account is active.
              </p>
              <Button onClick={() => navigate('/log-in')} className="w-full">
                Sign In to Your Account
              </Button>
            </div>
          </div>
        );

      case 'error':
      default:
        return (
          <div className="text-center space-y-4">
            <XCircle className="h-12 w-12 mx-auto text-red-500" />
            <h1 className="text-2xl font-semibold text-red-700">Verification Failed</h1>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                {result?.error || 'We couldn\'t verify your account. The link may be invalid or expired.'}
              </p>
              <div className="space-y-2">
                <Button onClick={handleResendVerification} className="w-full">
                  Get New Verification Link
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/log-in')} 
                  className="w-full"
                >
                  Back to Sign In
                </Button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8">
        {renderContent()}
      </Card>
    </div>
  );
}
