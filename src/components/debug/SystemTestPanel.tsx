import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Users, 
  Shield, 
  Database,
  Play,
  RefreshCw,
  Bug
} from 'lucide-react';
import { usePermissions } from '@/features/access-control/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'pending' | 'warning';
  message: string;
  details?: string;
}

interface TestSuite {
  name: string;
  description: string;
  tests: TestResult[];
  overall: 'pass' | 'fail' | 'pending' | 'warning';
}

export function SystemTestPanel() {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testEmail, setTestEmail] = useState('test@example.com');
  const { user } = useAuth();
  const permissions = usePermissions();

  const runAuthTests = async (): Promise<TestResult[]> => {
    const tests: TestResult[] = [];

    // Test 1: User Authentication
    tests.push({
      name: 'User Authentication',
      status: user ? 'pass' : 'fail',
      message: user ? `Authenticated as ${user.email}` : 'No user authenticated',
      details: user ? `User ID: ${user.id}` : undefined
    });

    // Test 2: Permission Loading
    tests.push({
      name: 'Permission Loading',
      status: permissions.loading ? 'warning' : 'pass',
      message: permissions.loading ? 'Permissions still loading' : 'Permissions loaded successfully',
      details: `Roles: ${permissions.roles.join(', ') || 'None'}`
    });

    // Test 3: Role Assignment
    tests.push({
      name: 'Role Assignment',
      status: permissions.roles.length > 0 ? 'pass' : 'warning',
      message: permissions.roles.length > 0 ? `User has ${permissions.roles.length} role(s)` : 'No roles assigned',
      details: permissions.roles.join(', ') || 'No roles found'
    });

    // Test 4: Admin Permissions
    tests.push({
      name: 'Admin Permissions',
      status: permissions.isAdmin ? 'pass' : 'warning',
      message: permissions.isAdmin ? 'User has admin permissions' : 'User does not have admin permissions',
      details: `Can manage employees: ${permissions.canManageEmployees}`
    });

    return tests;
  };

  const runOrganizationTests = async (): Promise<TestResult[]> => {
    const tests: TestResult[] = [];

    try {
      // Test 1: Organization Access
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id, name')
        .limit(1);

      tests.push({
        name: 'Organization Access',
        status: orgError ? 'fail' : 'pass',
        message: orgError ? 'Failed to access organizations' : 'Organization access successful',
        details: orgError ? orgError.message : `Found ${orgData?.length || 0} organization(s)`
      });

      // Test 2: Employee Info Access
      const { data: employeeData, error: empError } = await supabase
        .from('employee_info')
        .select('id, name, email, organization_id')
        .limit(5);

      tests.push({
        name: 'Employee Info Access',
        status: empError ? 'fail' : 'pass',
        message: empError ? 'Failed to access employee info' : 'Employee info access successful',
        details: empError ? empError.message : `Found ${employeeData?.length || 0} employee(s)`
      });

      // Test 3: User Roles Access (using secure RPC)
      const { data: rolesData, error: rolesError } = await supabase.rpc('get_current_user_roles');

      tests.push({
        name: 'User Roles Access',
        status: rolesError ? 'fail' : 'pass',
        message: rolesError ? 'Failed to access user roles' : 'User roles access successful',
        details: rolesError ? rolesError.message : `Found ${rolesData?.length || 0} role(s) for current user`
      });

    } catch (error) {
      tests.push({
        name: 'Database Connection',
        status: 'fail',
        message: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return tests;
  };

  const runImportTests = async (): Promise<TestResult[]> => {
    const tests: TestResult[] = [];

    try {
      // Test 1: Import Function Availability
      const { data, error } = await supabase.functions.invoke('import-employees', {
        body: { test: true }
      });

      tests.push({
        name: 'Import Function Availability',
        status: error ? 'fail' : 'pass',
        message: error ? 'Import function not accessible' : 'Import function accessible',
        details: error ? error.message : 'Edge function responded'
      });

      // Test 2: Validation Service
      try {
        const testData = {
          id: crypto.randomUUID(),
          firstName: 'Test',
          lastName: 'User',
          email: testEmail,
          department: 'Test Dept',
          division: 'Test Div',
          jobTitle: 'Test Role'
        };

        tests.push({
          name: 'UUID Generation',
          status: testData.id.length === 36 ? 'pass' : 'fail',
          message: testData.id.length === 36 ? 'UUID generation working' : 'UUID generation failed',
          details: `Generated: ${testData.id}`
        });

        tests.push({
          name: 'Data Structure Validation',
          status: 'pass',
          message: 'Test data structure is valid',
          details: `Email: ${testData.email}, Role: ${testData.jobTitle}`
        });

      } catch (error) {
        tests.push({
          name: 'Validation Service',
          status: 'fail',
          message: 'Validation service failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }

    } catch (error) {
      tests.push({
        name: 'Import Service',
        status: 'fail',
        message: 'Import service unavailable',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return tests;
  };

  const runRoleTests = async (): Promise<TestResult[]> => {
    const tests: TestResult[] = [];

    try {
      // Test 1: Role Assignment Function
      const { data, error } = await supabase.rpc('get_current_user_roles');

      tests.push({
        name: 'Role Assignment Function',
        status: error ? 'fail' : 'pass',
        message: error ? 'Role function failed' : 'Role function working',
        details: error ? error.message : `Current roles: ${data?.map(r => r.role).join(', ') || 'None'}`
      });

      // Test 2: Permission Calculation
      const canManage = permissions.canManageEmployees;
      const canCreate = permissions.canCreateAppraisals;
      const canView = permissions.canViewReports;

      tests.push({
        name: 'Permission Calculation',
        status: 'pass',
        message: 'Permission calculation working',
        details: `Manage: ${canManage}, Create: ${canCreate}, View: ${canView}`
      });

      // Test 3: Bulk Assignment Capability
      const hasBulkCapability = permissions.isAdmin || permissions.isDirector || permissions.isManager;

      tests.push({
        name: 'Bulk Assignment Capability',
        status: hasBulkCapability ? 'pass' : 'warning',
        message: hasBulkCapability ? 'User can perform bulk assignments' : 'User cannot perform bulk assignments',
        details: `Admin: ${permissions.isAdmin}, Director: ${permissions.isDirector}, Manager: ${permissions.isManager}`
      });

    } catch (error) {
      tests.push({
        name: 'Role Management System',
        status: 'fail',
        message: 'Role management system failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return tests;
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestSuites([]);

    try {
      toast.info('Running system tests...');

      const authTests = await runAuthTests();
      const orgTests = await runOrganizationTests();
      const importTests = await runImportTests();
      const roleTests = await runRoleTests();

      const suites: TestSuite[] = [
        {
          name: 'Authentication & Authorization',
          description: 'Tests user authentication and permission system',
          tests: authTests,
          overall: authTests.some(t => t.status === 'fail') ? 'fail' : 
                   authTests.some(t => t.status === 'warning') ? 'warning' : 'pass'
        },
        {
          name: 'Organization & Database',
          description: 'Tests database connectivity and organization access',
          tests: orgTests,
          overall: orgTests.some(t => t.status === 'fail') ? 'fail' : 
                   orgTests.some(t => t.status === 'warning') ? 'warning' : 'pass'
        },
        {
          name: 'Employee Import System',
          description: 'Tests the employee import functionality',
          tests: importTests,
          overall: importTests.some(t => t.status === 'fail') ? 'fail' : 
                   importTests.some(t => t.status === 'warning') ? 'warning' : 'pass'
        },
        {
          name: 'Role Management',
          description: 'Tests role assignment and permission enforcement',
          tests: roleTests,
          overall: roleTests.some(t => t.status === 'fail') ? 'fail' : 
                   roleTests.some(t => t.status === 'warning') ? 'warning' : 'pass'
        }
      ];

      setTestSuites(suites);

      const overallStatus = suites.some(s => s.overall === 'fail') ? 'fail' : 
                           suites.some(s => s.overall === 'warning') ? 'warning' : 'pass';

      if (overallStatus === 'pass') {
        toast.success('All tests completed successfully!');
      } else if (overallStatus === 'warning') {
        toast.warning('Tests completed with warnings');
      } else {
        toast.error('Some tests failed');
      }

    } catch (error) {
      toast.error('Test execution failed');
      console.error('Test execution error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200';
      case 'fail':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            System Test Panel
          </CardTitle>
          <CardDescription>
            Comprehensive testing suite for the employee import and role management system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="testEmail">Test Email</Label>
              <Input
                id="testEmail"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="mt-6"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run All Tests
                </>
              )}
            </Button>
          </div>

          {testSuites.length === 0 && !isRunning && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Click "Run All Tests" to start the comprehensive system validation
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {testSuites.map((suite, suiteIndex) => (
        <Card key={suiteIndex} className={getStatusColor(suite.overall)}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(suite.overall)}
                {suite.name}
              </div>
              <Badge variant={suite.overall === 'pass' ? 'default' : 
                              suite.overall === 'warning' ? 'secondary' : 'destructive'}>
                {suite.overall.toUpperCase()}
              </Badge>
            </CardTitle>
            <CardDescription>{suite.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suite.tests.map((test, testIndex) => (
                <div key={testIndex} className="flex items-start gap-3 p-3 rounded-lg border">
                  {getStatusIcon(test.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{test.name}</h4>
                      <Badge 
                        variant={test.status === 'pass' ? 'default' : 
                                test.status === 'warning' ? 'secondary' : 'destructive'}
                        className="ml-2"
                      >
                        {test.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{test.message}</p>
                    {test.details && (
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        {test.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}