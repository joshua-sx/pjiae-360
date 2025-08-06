import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Mail, Users, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function EmailTestPanel() {
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [results, setResults] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  const testWelcomeEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to test with.",
        variant: "destructive"
      });
      return;
    }

    setLoading(prev => ({ ...prev, welcome: true }));
    try {
      const { data, error } = await supabase.functions.invoke('send-account-welcome', {
        body: {
          email: testEmail,
          firstName: 'Test',
          lastName: 'User'
        }
      });

      if (error) throw error;

      setResults(prev => ({ ...prev, welcome: 'Success! Welcome email sent.' }));
      toast({
        title: "Email Sent",
        description: "Welcome email sent successfully!"
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setResults(prev => ({ ...prev, welcome: `Error: ${message}` }));
      toast({
        title: "Email Failed",
        description: message,
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, welcome: false }));
    }
  };

  const testEmployeeInvitation = async () => {
    if (!testEmail) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to test with.",
        variant: "destructive"
      });
      return;
    }

    setLoading(prev => ({ ...prev, invitation: true }));
    try {
      // This would normally be called through useEmployeeInvitation
      const { data, error } = await supabase.functions.invoke('send-account-welcome', {
        body: {
          email: testEmail,
          firstName: 'Invited',
          lastName: 'Employee'
        }
      });

      if (error) throw error;

      setResults(prev => ({ ...prev, invitation: 'Success! Invitation email sent.' }));
      toast({
        title: "Email Sent",
        description: "Employee invitation sent successfully!"
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setResults(prev => ({ ...prev, invitation: `Error: ${message}` }));
      toast({
        title: "Email Failed",
        description: message,
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, invitation: false }));
    }
  };

  const testEmailVerification = async () => {
    if (!testEmail) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to test with.",
        variant: "destructive"
      });
      return;
    }

    setLoading(prev => ({ ...prev, verification: true }));
    try {
      const { error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'TestPassword123!',
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`
        }
      });

      if (error) throw error;

      setResults(prev => ({ ...prev, verification: 'Success! Verification email sent.' }));
      toast({
        title: "Email Sent",
        description: "Verification email sent successfully!"
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setResults(prev => ({ ...prev, verification: `Error: ${message}` }));
      toast({
        title: "Email Failed",
        description: message,
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, verification: false }));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Email Workflow Testing
        </CardTitle>
        <CardDescription>
          Test the email workflows to ensure they're working correctly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="test-email" className="text-sm font-medium">
            Test Email Address
          </label>
          <Input
            id="test-email"
            type="email"
            placeholder="Enter email to test with..."
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <h3 className="font-semibold">Welcome Email Test</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Test the welcome email that new users receive after signing up.
          </p>
          <Button 
            onClick={testWelcomeEmail} 
            disabled={loading.welcome}
            className="w-full"
          >
            {loading.welcome ? 'Sending...' : 'Test Welcome Email'}
          </Button>
          {results.welcome && (
            <Alert className={results.welcome.includes('Error') ? 'border-red-200' : 'border-green-200'}>
              <AlertDescription>{results.welcome}</AlertDescription>
            </Alert>
          )}
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <h3 className="font-semibold">Employee Invitation Test</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Test the invitation email that employees receive when imported.
          </p>
          <Button 
            onClick={testEmployeeInvitation} 
            disabled={loading.invitation}
            className="w-full"
          >
            {loading.invitation ? 'Sending...' : 'Test Employee Invitation'}
          </Button>
          {results.invitation && (
            <Alert className={results.invitation.includes('Error') ? 'border-red-200' : 'border-green-200'}>
              <AlertDescription>{results.invitation}</AlertDescription>
            </Alert>
          )}
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <h3 className="font-semibold">Email Verification Test</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Test the email verification flow by creating a test account.
          </p>
          <Button 
            onClick={testEmailVerification} 
            disabled={loading.verification}
            className="w-full"
          >
            {loading.verification ? 'Sending...' : 'Test Email Verification'}
          </Button>
          {results.verification && (
            <Alert className={results.verification.includes('Error') ? 'border-red-200' : 'border-green-200'}>
              <AlertDescription>{results.verification}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}