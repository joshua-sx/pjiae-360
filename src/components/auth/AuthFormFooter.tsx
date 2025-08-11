import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthFormFooterProps {
  email?: string;
  showMagicLink?: boolean;
}

export function AuthFormFooter({ email, showMagicLink = false }: AuthFormFooterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMagicLink = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address first.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`
        }
      });

      if (error) throw error;

      toast({
        title: "Magic link sent!",
        description: "Check your email for a sign-in link.",
      });
    } catch (error) {
      toast({
        title: "Failed to send magic link",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {showMagicLink && email && (
        <div className="text-center">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={sendMagicLink}
            disabled={isLoading}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            {isLoading ? "Sending..." : "Use a magic link instead"}
          </Button>
        </div>
      )}
      
      <div className="text-muted-foreground text-center text-xs text-balance">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}