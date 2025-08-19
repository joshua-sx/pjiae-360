import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { 
  Bug, 
  TestTube, 
  FileText, 
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { SystemTestPanel } from './SystemTestPanel';
import { ImportTestSuite } from './ImportTestSuite';
import { usePermissions } from '@/features/access-control/hooks/usePermissions';
import { PermissionGuard } from '@/components/common/PermissionGuard';

export function TestingDashboard() {
  const permissions = usePermissions();
  const [activeTab, setActiveTab] = useState('overview');

  const testSuites = [
    {
      id: 'system',
      name: 'System Tests',
      description: 'Authentication, permissions, and database connectivity',
      icon: Bug,
      count: 12,
      status: 'ready'
    },
    {
      id: 'import',
      name: 'Import Tests',
      description: 'Employee import functionality and validation',
      icon: TestTube,
      count: 8,
      status: 'ready'
    }
  ];

  const phases = [
    {
      phase: 'Phase 1',
      title: 'UUID Generation & Role Assignment',
      status: 'completed',
      tests: [
        'UUID generation working correctly',
        'Role assignment accepts dynamic roles',
        'Import validation passes with UUIDs',
        'Edge function processes roles correctly'
      ]
    },
    {
      phase: 'Phase 2', 
      title: 'Organization Creation & Admin Roles',
      status: 'completed',
      tests: [
        'New user creates organization automatically',
        'First user gets admin role',
        'Subsequent users get employee role',
        'Organization isolation working'
      ]
    },
    {
      phase: 'Phase 3',
      title: 'Permission System & Bulk Operations',
      status: 'completed',
      tests: [
        'Permission guards prevent unauthorized access',
        'Role-based navigation works',
        'Bulk role assignment functions',
        'Audit trail captures all changes'
      ]
    },
    {
      phase: 'Phase 4',
      title: 'Testing & Validation',
      status: 'active',
      tests: [
        'System test panel operational',
        'Import test suite functional',
        'Comprehensive test coverage',
        'Performance validation complete'
      ]
    }
  ];

  return (
    <PermissionGuard 
      roles={['admin', 'director']}
      fallback={
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Access Restricted</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Testing dashboard requires admin or director permissions.
            </p>
          </CardContent>
        </Card>
      }
    >
      <div className="space-y-6">
        <PageHeader
          title="Testing Dashboard"
          description="Comprehensive testing and validation for the employee import system"
        >
          <Badge variant="outline" className="text-sm">
            Phase 4: Testing & Validation
          </Badge>
        </PageHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="system">System Tests</TabsTrigger>
            <TabsTrigger value="import">Import Tests</TabsTrigger>
            <TabsTrigger value="guide">Testing Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Implementation Status
                  </CardTitle>
                  <CardDescription>
                    Progress through the four implementation phases
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {phases.map((phase, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{phase.phase}</span>
                          <Badge 
                            variant={
                              phase.status === 'completed' ? 'default' :
                              phase.status === 'active' ? 'secondary' : 'outline'
                            }
                          >
                            {phase.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{phase.title}</p>
                      </div>
                      {phase.status === 'completed' && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Available Test Suites</CardTitle>
                  <CardDescription>
                    Run comprehensive tests to validate system functionality
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {testSuites.map((suite) => {
                    const IconComponent = suite.icon;
                    return (
                      <div key={suite.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{suite.name}</div>
                            <div className="text-sm text-muted-foreground">{suite.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{suite.count} tests</Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setActiveTab(suite.id)}
                          >
                            Run Tests
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Current System Status</CardTitle>
                <CardDescription>
                  Real-time information about your current permissions and setup
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {permissions.roles.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Roles</div>
                    <div className="text-xs mt-1">
                      {permissions.roles.join(', ') || 'None'}
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {permissions.canManageEmployees ? 'Yes' : 'No'}
                    </div>
                    <div className="text-sm text-muted-foreground">Can Manage Employees</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {permissions.canCreateAppraisals ? 'Yes' : 'No'}
                    </div>
                    <div className="text-sm text-muted-foreground">Can Create Appraisals</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <SystemTestPanel />
          </TabsContent>

          <TabsContent value="import">
            <ImportTestSuite />
          </TabsContent>

          <TabsContent value="guide">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Testing Guide
                </CardTitle>
                <CardDescription>
                  Comprehensive testing procedures and validation steps
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose max-w-none">
                  <h3>🚀 Quick Start Testing</h3>
                  <ol>
                    <li>Navigate to the <strong>System Tests</strong> tab</li>
                    <li>Click "Run All Tests" to validate core functionality</li>
                    <li>Navigate to the <strong>Import Tests</strong> tab</li>
                    <li>Test both single and bulk employee import scenarios</li>
                    <li>Review results and fix any issues identified</li>
                  </ol>

                  <h3>📋 Complete Test Scenarios</h3>
                  
                  <h4>Scenario 1: New Organization Setup</h4>
                  <ul>
                    <li>Register a new user account</li>
                    <li>Verify organization is created automatically</li>
                    <li>Check that first user receives admin role</li>
                    <li>Import 5-10 employees via CSV</li>
                    <li>Assign various roles using bulk assignment</li>
                  </ul>

                  <h4>Scenario 2: Permission Validation</h4>
                  <ul>
                    <li>Test admin access to all features</li>
                    <li>Verify managers can assign lower roles only</li>
                    <li>Check employees cannot access admin features</li>
                    <li>Validate organization isolation</li>
                  </ul>

                  <h3>🔍 Verification Points</h3>
                  <ul>
                    <li>All system tests pass (green status)</li>
                    <li>Import success rate is &gt;95% for valid data</li>
                    <li>Role assignments complete within 5 seconds</li>
                    <li>Permission enforcement is 100% effective</li>
                    <li>No cross-organization data leakage</li>
                    <li>Audit logs capture all role changes</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-800">Testing Best Practices</p>
                      <p className="text-blue-700 mt-1">
                        Run tests in a development environment first. Use test email addresses 
                        that you control. Always backup your data before running bulk operations.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  );
}