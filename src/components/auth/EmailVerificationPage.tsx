import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      try {
        const { data, error } = await supabase.rpc('verify_email_token', {
          _token: token
        });

        if (error) throw error;

        const result = data as { success: boolean; error?: string; user_id?: string };

        if (result.success) {
          setStatus('success');
          setMessage('Your email has been verified successfully! You can now proceed to set up your organization.');
          toast.success('Email verified successfully!');
          
          // Redirect to onboarding after 3 seconds
          setTimeout(() => {
            navigate('/onboarding');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(result.error || 'Email verification failed. The link may be expired or invalid.');
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification. Please try again or contact support.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const handleGoToLogin = () => {
    navigate('/log-in');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'verifying' && (
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-12 w-12 text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="h-12 w-12 text-destructive" />
            )}
          </div>
          <CardTitle>
            {status === 'verifying' && 'Verifying Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'success' && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Redirecting to organization setup in 3 seconds...
              </p>
              <Button onClick={() => navigate('/onboarding')} className="w-full">
                Go to Organization Setup
              </Button>
            </div>
          )}
          {status === 'error' && (
            <div className="text-center">
              <Button onClick={handleGoToLogin} variant="outline" className="w-full">
                Go to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}