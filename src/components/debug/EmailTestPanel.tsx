import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Mail, Users, TestTube, Eye, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function EmailTestPanel() {
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [results, setResults] = useState<{ [key: string]: any }>({});
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

      setResults(prev => ({ ...prev, welcome: { success: true, data, message: 'Success! Welcome email sent.' } }));
      toast({
        title: "Email Sent",
        description: "Welcome email sent successfully! Check edge function logs for delivery status."
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setResults(prev => ({ ...prev, welcome: { success: false, error: message } }));
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

      setResults(prev => ({ ...prev, invitation: { success: true, data, message: 'Success! Invitation email sent.' } }));
      toast({
        title: "Email Sent",
        description: "Employee invitation sent successfully!"
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setResults(prev => ({ ...prev, invitation: { success: false, error: message } }));
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

      setResults(prev => ({ ...prev, verification: { success: true, message: 'Success! Verification email sent.' } }));
      toast({
        title: "Email Sent",
        description: "Verification email sent successfully!"
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setResults(prev => ({ ...prev, verification: { success: false, error: message } }));
      toast({
        title: "Email Failed",
        description: message,
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, verification: false }));
    }
  };

  // Test enhanced email service with preview
  const testEmailPreview = async () => {
    if (!testEmail) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to test with.",
        variant: "destructive"
      });
      return;
    }

    setLoading(prev => ({ ...prev, preview: true }));
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-email-service', {
        body: {
          template: 'account_welcome',
          to: testEmail,
          preview: true,
          data: {
            firstName: 'Test',
            lastName: 'User',
            email: testEmail,
            verificationUrl: `${window.location.origin}/verify-email`,
            loginUrl: `${window.location.origin}/log-in`,
            supportEmail: 'support@pjiae360.com'
          }
        }
      });

      if (error) throw error;

      setResults(prev => ({ ...prev, preview: { success: true, data, message: 'Email template rendered successfully!' } }));
      toast({
        title: "Preview Generated",
        description: "Email template rendered successfully!"
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setResults(prev => ({ ...prev, preview: { success: false, error: message } }));
      toast({
        title: "Preview Failed",
        description: message,
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, preview: false }));
    }
  };

  const renderResult = (key: string) => {
    const result = results[key];
    if (!result) return null;

    return (
      <Alert className={result.success ? 'border-green-200' : 'border-red-200'}>
        <AlertDescription>
          {result.success ? (
            <div>
              <strong>✅ {result.message}</strong>
              {result.data && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs font-medium">View Response Data</summary>
                  <pre className="mt-2 text-xs overflow-auto bg-muted p-2 rounded">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ) : (
            <div>
              <strong>❌ Error:</strong> {result.error}
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Email Workflow Testing
        </CardTitle>
        <CardDescription>
          Test the email workflows to ensure they're working correctly. 
          Check edge function logs for detailed delivery information.
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
          {renderResult('welcome')}
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
          {renderResult('invitation')}
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
          {renderResult('verification')}
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <h3 className="font-semibold">Email Template Preview</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Test email template rendering without sending (preview mode).
          </p>
          <Button 
            onClick={testEmailPreview} 
            disabled={loading.preview}
            className="w-full"
          >
            {loading.preview ? 'Generating...' : 'Test Email Preview'}
          </Button>
          {renderResult('preview')}
        </div>

        <Separator />

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> If tests succeed but emails aren't received:
            <ul className="mt-2 list-disc list-inside text-sm space-y-1">
              <li>Check your spam/junk folder</li>
              <li>Verify DNS records (DKIM, SPF) in your domain provider</li>
              <li>Ensure sender domain is verified in Resend</li>
              <li>Check Supabase edge function logs for delivery errors</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}