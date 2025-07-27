import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Play, 
  RefreshCw,
  Building,
  Users
} from "lucide-react";
import { 
  migrateOrganizationsToClerk, 
  migrateUsersToClerkOrganizations, 
  verifyMigration 
} from "@/utils/clerkMigration";

export const ClerkMigrationPanel = () => {
  const [orgMigrationResult, setOrgMigrationResult] = useState<any>(null);
  const [userMigrationResult, setUserMigrationResult] = useState<any>(null);
  const [verification, setVerification] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleOrganizationMigration = async () => {
    setLoading('organizations');
    try {
      const result = await migrateOrganizationsToClerk();
      setOrgMigrationResult(result);
    } catch (error) {
      setOrgMigrationResult({
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        migratedCount: 0,
        details: []
      });
    } finally {
      setLoading(null);
    }
  };

  const handleUserMigration = async () => {
    setLoading('users');
    try {
      const result = await migrateUsersToClerkOrganizations();
      setUserMigrationResult(result);
    } catch (error) {
      setUserMigrationResult({
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        migratedCount: 0,
        details: []
      });
    } finally {
      setLoading(null);
    }
  };

  const handleVerification = async () => {
    setLoading('verification');
    try {
      const result = await verifyMigration();
      setVerification(result);
    } catch (error) {
      setVerification({
        inconsistencies: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setLoading(null);
    }
  };

  interface MigrationResultCardProps {
    title: string;
    result: MigrationResult | null;
    icon: React.ComponentType<{ className?: string }>;
  }

  const MigrationResultCard = ({ title, result, icon: Icon }: MigrationResultCardProps) => {
    // …rest of the component
  }
    if (!result) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {title} Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Badge variant={result.success ? "default" : "destructive"}>
              {result.success ? "Success" : "Failed"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Migrated: {result.migratedCount}
            </span>
          </div>

          {result.errors && result.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {result.errors.map((error: string, index: number) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {result.details && result.details.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Details:</h4>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {result.details.map((detail: any, index: number) => (
                  <div key={index} className="flex items-center justify-between text-sm p-2 border rounded">
                    <span>{detail.name || detail.email}</span>
                    <Badge variant={detail.status === 'success' ? "default" : "destructive"} size="sm">
                      {detail.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Clerk Migration Panel</h2>
        <p className="text-muted-foreground">
          Migrate your existing Supabase organizations and users to Clerk
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Run these migrations in order:
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Migrate Organizations first</li>
            <li>Then migrate Users to Organizations</li>
            <li>Finally verify the migration</li>
          </ol>
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Step 1: Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Create Clerk organizations for existing Supabase organizations
            </p>
            <Button 
              onClick={handleOrganizationMigration}
              disabled={loading === 'organizations'}
              className="w-full"
            >
              {loading === 'organizations' ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Migrating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Migrate Organizations
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Step 2: Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Add users to their respective Clerk organizations
            </p>
            <Button 
              onClick={handleUserMigration}
              disabled={loading === 'users' || !orgMigrationResult?.success}
              className="w-full"
            >
              {loading === 'users' ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Migrating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Migrate Users
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Step 3: Verify
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Verify migration completed successfully
            </p>
            <Button 
              onClick={handleVerification}
              disabled={loading === 'verification'}
              variant="outline"
              className="w-full"
            >
              {loading === 'verification' ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify Migration
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <MigrationResultCard 
          title="Organization Migration" 
          result={orgMigrationResult} 
          icon={Building}
        />
        
        <MigrationResultCard 
          title="User Migration" 
          result={userMigrationResult} 
          icon={Users}
        />

        {verification && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Migration Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {verification.organizationsWithClerkId}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Organizations with Clerk ID
                  </div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-red-600">
                    {verification.organizationsWithoutClerkId}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Organizations without Clerk ID
                  </div>
                </div>
              </div>

              {verification.inconsistencies && verification.inconsistencies.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      {verification.inconsistencies.map((issue: string, index: number) => (
                        <div key={index}>{issue}</div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
