import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImportDebugPanelProps {
  isVisible?: boolean;
}

interface ValidationError {
  path?: string[];
  field?: string;
  message?: string;
  code?: string;
}

interface DebugInfo {
  user?: unknown;
  orgId?: unknown;
  profileError?: string;
  organizations?: unknown;
  orgError?: string;
  testData?: unknown;
  result?: unknown;
  error?: string;
  validationErrors?: ValidationError[] | null;
  timestamp: string;
}

export const ImportDebugPanel = ({ isVisible = false }: ImportDebugPanelProps) => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
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
        .select('organizations.*')
        .eq('id', orgId)
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
      // Generate valid UUID for testing - this is required by validation schema
      const validTestId = crypto.randomUUID();
      
      const testData = {
        orgName: "Test Organization",
        people: [
          {
            id: validTestId,
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

      // Parse validation errors for better display
      let parsedValidationErrors = null;
      if (error && error.message) {
        try {
          // Try to parse validation errors if they're in JSON format
          const errorData = JSON.parse(error.message);
          if (Array.isArray(errorData)) {
            parsedValidationErrors = errorData;
          }
        } catch {
          // If not JSON, check if it contains validation error patterns
          if (error.message.includes('Invalid employee ID') || error.message.includes('validation')) {
            parsedValidationErrors = [{ field: 'general', message: error.message }];
          }
        }
      }

      setDebugInfo({
        testData,
        result: data,
        error: error?.message,
        validationErrors: parsedValidationErrors,
        timestamp: new Date().toISOString()
      });

      if (error) {
        const description = parsedValidationErrors 
          ? `Validation failed: ${parsedValidationErrors.map(e => e.message || e.code).join(', ')}`
          : error.message;
        
        toast({
          title: "Import Function Test Failed",
          description,
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
          <div className="mt-4 space-y-3">
            <div className="text-sm font-medium">Debug Results:</div>
            
            {/* Show validation errors prominently if they exist */}
            {debugInfo.validationErrors && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <div className="text-sm font-medium text-red-800 mb-2">Validation Errors:</div>
                <ul className="text-xs text-red-700 space-y-1">
                  {debugInfo.validationErrors.map((error: any, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Badge variant="destructive" className="text-xs">
                        {error.path ? error.path.join('.') : 'general'}
                      </Badge>
                      <span>{error.message || error.code}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <pre className="bg-white p-3 rounded border text-xs overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-xs text-yellow-700">
          <div className="font-medium mb-1">Common Issues:</div>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Employee ID must be a valid UUID</strong> (e.g., 123e4567-e89b-12d3-a456-426614174000)</li>
            <li>Check if your user profile exists and has organization_id</li>
            <li>Verify RLS policies allow INSERT on profiles table</li>
            <li>Ensure required fields (firstName, lastName, email) are provided</li>
            <li>Email addresses must be valid format and not from blocked domains</li>
            <li>Check browser console for detailed error messages</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};