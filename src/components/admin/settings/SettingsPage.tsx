
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Palette, Database, Globe, Shield, Save } from "lucide-react";

const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">
            Configure organizational settings, branding, and system preferences
          </p>
        </div>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Branding & Appearance
            </CardTitle>
            <CardDescription>
              Customize your organization's branding, colors, and visual identity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm font-medium">Organization Logo</div>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <div className="mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center mb-3">
                  <span className="text-white font-bold">SG</span>
                </div>
                <p className="text-sm text-muted-foreground">Click to upload new logo</p>
              </div>
              <Button variant="outline" className="w-full">
                Upload Logo
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Organization Details
            </CardTitle>
            <CardDescription>
              Manage basic organization information and contact details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Organization Name</label>
                <div className="mt-1 p-2 border rounded-md bg-muted">
                  Smartgoals 360 Enterprise
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Domain</label>
                <div className="mt-1 p-2 border rounded-md bg-muted">
                  company.smartgoals360.com
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Edit Details
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data & Retention
            </CardTitle>
            <CardDescription>
              Configure data retention policies and backup settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Data Retention Period</label>
                <div className="mt-1 p-2 border rounded-md bg-muted">
                  7 years (Compliance requirement)
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Backup Frequency</label>
                <div className="mt-1 p-2 border rounded-md bg-muted">
                  Daily automated backups
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Configure Retention
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Compliance
            </CardTitle>
            <CardDescription>
              Manage security settings, audit requirements, and compliance features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Two-Factor Authentication</label>
                <div className="mt-1 p-2 border rounded-md bg-muted">
                  Required for admins
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Session Timeout</label>
                <div className="mt-1 p-2 border rounded-md bg-muted">
                  8 hours of inactivity
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Security Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
          <CardDescription>
            Advanced system settings and feature toggles for your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Advanced Configuration</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Configure advanced system features, integrations, and organizational preferences.
            </p>
            <Button>
              <Settings className="mr-2 h-4 w-4" />
              Open Advanced Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
