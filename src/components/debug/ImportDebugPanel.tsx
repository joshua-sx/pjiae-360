import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImportDebugPanelProps {
  isVisible?: boolean;
}

export const ImportDebugPanel = ({ isVisible = false }: ImportDebugPanelProps) => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const runDatabaseTest = async () => {
    setIsLoading(true);
    try {
      // Test database connection and user profile
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Try to get user organization using RPC call to avoid type issues
      const { data: orgId, error: profileError } = await supabase
        .rpc('get_current_user_org_id');

      const { data: organizations, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .limit(5);

      setDebugInfo({
        user: userData.user,
        orgId: orgId,
        profileError: profileError?.message,
        organizations,
        orgError: orgError?.message,
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Database Test Complete",
        description: "Check the debug panel for results",
      });
    } catch (error: any) {
      toast({
        title: "Database Test Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testImportFunction = async () => {
    setIsLoading(true);
    try {
      const testData = {
        orgName: "Test Organization",
        people: [
          {
            id: "test-1",
            firstName: "Test",
            lastName: "User",
            email: "test@example.com",
            jobTitle: "Test Role",
            department: "Test Dept",
            division: "Test Division"
          }
        ],
        adminInfo: {
          name: "Admin Test",
          email: "admin@example.com",
          role: "admin"
        }
      };

      const { data, error } = await supabase.functions.invoke('import-employees', {
        body: testData,
      });

      setDebugInfo({
        testData,
        result: data,
        error: error?.message,
        timestamp: new Date().toISOString()
      });

      if (error) {
        toast({
          title: "Import Function Test Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Import Function Test Complete",
          description: "Check the debug panel for results",
        });
      }
    } catch (error: any) {
      toast({
        title: "Import Function Test Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible && !debugInfo) return null;

  return (
    <Card className="mt-6 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-yellow-800">Import Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runDatabaseTest} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? "Testing..." : "Test Database Connection"}
          </Button>
          <Button 
            onClick={testImportFunction} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? "Testing..." : "Test Import Function"}
          </Button>
        </div>

        {debugInfo && (
          <div className="mt-4 space-y-2">
            <div className="text-sm font-medium">Debug Results:</div>
            <pre className="bg-white p-3 rounded border text-xs overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-xs text-yellow-700">
          <div className="font-medium mb-1">Common Issues:</div>
          <ul className="list-disc list-inside space-y-1">
            <li>Check if your user profile exists and has organization_id</li>
            <li>Verify RLS policies allow INSERT on profiles table</li>
            <li>Ensure required fields (firstName, lastName, email) are provided</li>
            <li>Check browser console for detailed error messages</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};