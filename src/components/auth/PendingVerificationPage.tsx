import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, RefreshCw, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PendingVerificationPageProps {
  email: string;
  onResend?: () => void;
}

export function PendingVerificationPage({ email, onResend }: PendingVerificationPageProps) {
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [lastResent, setLastResent] = useState<Date | null>(null);

  const handleResend = async () => {
    setIsResending(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email?email=${encodeURIComponent(email)}`
        }
      });

      if (error) {
        toast({
          title: "Resend Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setLastResent(new Date());
        toast({
          title: "Email Sent",
          description: "Check your inbox for the verification link.",
        });
        onResend?.();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to resend verification email.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const canResend = !lastResent || Date.now() - lastResent.getTime() > 60000; // 1 minute cooldown

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <Mail className="h-16 w-16 text-primary" />
              <CheckCircle2 className="h-6 w-6 text-green-500 absolute -top-1 -right-1 bg-background rounded-full" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Check Your Email</h1>
            <p className="text-muted-foreground">
              We sent a confirmation link to
            </p>
            <p className="font-medium text-primary">{email}</p>
          </div>

          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="space-y-2">
              <p>Click the link in the email to confirm your account and enter PJIAE 360.</p>
              <p>The link will expire in 1 hour for security.</p>
            </div>
            
            {lastResent && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700 text-sm">
                  ✓ Verification email resent at {lastResent.toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleResend}
              disabled={isResending || !canResend}
              variant="outline"
              className="w-full"
            >
              {isResending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {canResend ? "Resend Confirmation" : `Wait ${60 - Math.floor((Date.now() - (lastResent?.getTime() || 0)) / 1000)}s`}
                </>
              )}
            </Button>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Didn't receive the email? Check your spam folder or try resending.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}