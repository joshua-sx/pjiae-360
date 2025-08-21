
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
import { DashboardLayout } from "@/components/DashboardLayout";

export default function SettingsPage() {
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
    <DashboardLayout>
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
        // ... keep existing cards content
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
    </DashboardLayout>
  );
};
