
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Palette, Database, Globe, Shield, Save, Edit2 } from "lucide-react";
import { useOrganizationStore, selectOrganizationName, selectOrganizationId, selectSetOrganization } from "@/stores";
import { PageHeader } from "@/components/ui/page-header";
import { useOrganization } from "@/hooks/useOrganization";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const SettingsPage = () => {
  const organizationName = useOrganizationStore(selectOrganizationName);
  const organizationId = useOrganizationStore(selectOrganizationId);
  const setOrganization = useOrganizationStore(selectSetOrganization);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(organizationName || '');
  const [isSaving, setIsSaving] = useState(false);
  
  const orgInitials = (organizationName || 'SG')
    .split(/\s+/)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const organizationDomain = organizationName
    ? `company.${organizationName.toLowerCase().replace(/\s+/g, '')}.com`
    : 'company.pjiae360.com';

  const handleSaveOrganizationName = async () => {
    if (!organizationId || !editedName.trim()) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ name: editedName.trim() })
        .eq('id', organizationId);

      if (error) throw error;

      // Update local store
      setOrganization(organizationId, editedName.trim());
      
      // Invalidate organization query to refetch data
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      
      setIsEditingName(false);
      toast({
        title: "Success",
        description: "Organization name updated successfully",
      });
    } catch (error) {
      console.error('Failed to update organization name:', error);
      toast({
        title: "Error",
        description: "Failed to update organization name",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedName(organizationName || '');
    setIsEditingName(false);
  };
  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Settings"
        description="Configure organizational settings, branding, and system preferences"
      >
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </PageHeader>

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
                  <span className="text-white font-bold">{orgInitials}</span>
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
                {isEditingName ? (
                  <div className="mt-1 space-y-2">
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      placeholder="Enter organization name"
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={handleSaveOrganizationName}
                        disabled={isSaving || !editedName.trim()}
                      >
                        {isSaving ? "Saving..." : "Save"}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center justify-between p-2 border rounded-md bg-muted">
                    <span>{organizationName || 'PJIAE 360 Enterprise'}</span>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        setEditedName(organizationName || '');
                        setIsEditingName(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Domain</label>
                <div className="mt-1 p-2 border rounded-md bg-muted">
                  {organizationDomain}
                </div>
              </div>
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
              Role Management
            </CardTitle>
            <CardDescription>
              Configure role assignments and job title mappings for automatic role inference.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Job Title Mappings</label>
                <div className="mt-1 p-2 border rounded-md bg-muted">
                  Configure how job titles map to roles
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Role Inference</label>
                <div className="mt-1 p-2 border rounded-md bg-muted">
                  Automatic role assignment based on job titles
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/admin/settings/job-title-mappings'}>
                Manage Job Title Mappings
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
