import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Play,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TestEmployee {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  division: string;
  role: string;
}

interface ImportTestResult {
  success: boolean;
  message: string;
  imported: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
}

export function ImportTestSuite() {
  const [testMode, setTestMode] = useState<'single' | 'bulk'>('single');
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<ImportTestResult | null>(null);
  
  // Single employee test data
  const [singleEmployee, setSingleEmployee] = useState<TestEmployee>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@testcompany.com',
    jobTitle: 'Software Engineer',
    department: 'Engineering',
    division: 'Technology',
    role: 'employee'
  });

  // Bulk test data
  const [bulkData, setBulkData] = useState(`John,Doe,john.doe@testcompany.com,Software Engineer,Engineering,Technology,employee
Jane,Smith,jane.smith@testcompany.com,Product Manager,Product,Technology,manager
Bob,Johnson,bob.johnson@testcompany.com,Director,Leadership,Executive,director
Alice,Wilson,alice.wilson@testcompany.com,QA Engineer,Engineering,Technology,employee
Tom,Brown,tom.brown@testcompany.com,DevOps Engineer,Engineering,Technology,supervisor`);

  const generateTestEmployees = (mode: 'single' | 'bulk'): TestEmployee[] => {
    if (mode === 'single') {
      return [{ ...singleEmployee, id: crypto.randomUUID() } as TestEmployee & { id: string }];
    }

    return bulkData.split('\n').map((line, index) => {
      const [firstName, lastName, email, jobTitle, department, division, role] = line.split(',');
      return {
        id: crypto.randomUUID(),
        firstName: firstName?.trim() || `Test${index}`,
        lastName: lastName?.trim() || `User${index}`,
        email: email?.trim() || `test${index}@testcompany.com`,
        jobTitle: jobTitle?.trim() || 'Test Role',
        department: department?.trim() || 'Test Department',
        division: division?.trim() || 'Test Division',
        role: role?.trim() || 'employee'
      };
    });
  };

  const runImportTest = async () => {
    setIsRunning(true);
    setTestResult(null);

    try {
      const testEmployees = generateTestEmployees(testMode);
      
      toast.info(`Testing import of ${testEmployees.length} employee(s)...`);

      const importData = {
        orgName: 'Test Organization',
        people: testEmployees,
        adminInfo: {
          name: 'Test Administrator',
          email: 'admin@testcompany.com',
          role: 'admin'
        }
      };

      const { data: result, error } = await supabase.functions.invoke('import-employees', {
        body: importData
      });

      if (error) {
        throw new Error(error.message);
      }

      setTestResult(result);

      if (result.success) {
        toast.success(`Import test completed successfully! Imported ${result.imported} employees.`);
      } else {
        toast.warning(`Import test completed with issues. ${result.failed} employees failed.`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setTestResult({
        success: false,
        message: errorMessage,
        imported: 0,
        failed: 0,
        errors: [{ email: 'N/A', error: errorMessage }]
      });
      toast.error('Import test failed');
    } finally {
      setIsRunning(false);
    }
  };

  const validateTestData = (): { valid: boolean; issues: string[] } => {
    const issues: string[] = [];
    
    if (testMode === 'single') {
      if (!singleEmployee.firstName.trim()) issues.push('First name is required');
      if (!singleEmployee.lastName.trim()) issues.push('Last name is required');
      if (!singleEmployee.email.trim()) issues.push('Email is required');
      if (!singleEmployee.email.includes('@')) issues.push('Invalid email format');
    } else {
      const lines = bulkData.split('\n').filter(line => line.trim());
      if (lines.length === 0) issues.push('No bulk data provided');
      
      lines.forEach((line, index) => {
        const fields = line.split(',');
        if (fields.length < 7) {
          issues.push(`Line ${index + 1}: Missing required fields`);
        }
        if (fields[2] && !fields[2].includes('@')) {
          issues.push(`Line ${index + 1}: Invalid email format`);
        }
      });
    }

    return {
      valid: issues.length === 0,
      issues
    };
  };

  const validation = validateTestData();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee Import Test Suite
          </CardTitle>
          <CardDescription>
            Test the employee import functionality with various scenarios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Label>Test Mode:</Label>
            <Select value={testMode} onValueChange={(value: 'single' | 'bulk') => setTestMode(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Employee</SelectItem>
                <SelectItem value="bulk">Bulk Import (5 employees)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!validation.valid && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div>Test data validation issues:</div>
                <ul className="list-disc list-inside mt-2">
                  {validation.issues.map((issue, index) => (
                    <li key={index} className="text-sm">{issue}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {testMode === 'single' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={singleEmployee.firstName}
                  onChange={(e) => setSingleEmployee(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={singleEmployee.lastName}
                  onChange={(e) => setSingleEmployee(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={singleEmployee.email}
                  onChange={(e) => setSingleEmployee(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={singleEmployee.jobTitle}
                  onChange={(e) => setSingleEmployee(prev => ({ ...prev, jobTitle: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={singleEmployee.department}
                  onChange={(e) => setSingleEmployee(prev => ({ ...prev, department: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="division">Division</Label>
                <Input
                  id="division"
                  value={singleEmployee.division}
                  onChange={(e) => setSingleEmployee(prev => ({ ...prev, division: e.target.value }))}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={singleEmployee.role} 
                  onValueChange={(value) => setSingleEmployee(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="bulkData">Bulk Test Data (CSV format)</Label>
              <Textarea
                id="bulkData"
                value={bulkData}
                onChange={(e) => setBulkData(e.target.value)}
                rows={8}
                placeholder="firstName,lastName,email,jobTitle,department,division,role"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Format: firstName,lastName,email,jobTitle,department,division,role (one per line)
              </p>
            </div>
          )}

          <Button 
            onClick={runImportTest} 
            disabled={isRunning || !validation.valid}
            className="w-full"
            size="lg"
          >
            {isRunning ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running Import Test...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Import Test
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {testResult && (
        <Card className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{testResult.imported}</div>
                <div className="text-sm text-muted-foreground">Imported</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{testResult.failed}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {((testResult.imported / (testResult.imported + testResult.failed)) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{testResult.message}</AlertDescription>
            </Alert>

            {testResult.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-800">Import Errors:</h4>
                <div className="space-y-1">
                  {testResult.errors.map((error, index) => (
                    <div key={index} className="text-sm bg-white rounded p-2 border border-red-200">
                      <span className="font-medium">{error.email}:</span> {error.error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}