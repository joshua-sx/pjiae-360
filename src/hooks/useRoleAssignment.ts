import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions, type AppRole } from './usePermissions';
import { toast } from 'sonner';

interface RoleAssignmentOptions {
  profileId: string;
  role: AppRole;
  reason: string;
}

interface BulkRoleAssignmentOptions {
  assignments: Array<{
    profileId: string;
    role: AppRole;
  }>;
  reason: string;
}

export function useRoleAssignment() {
  const [isAssigning, setIsAssigning] = useState(false);
  const { isAdmin, isDirector, isManager } = usePermissions();

  const canAssignRole = (role: AppRole): boolean => {
    switch (role) {
      case 'admin':
        return isAdmin;
      case 'director':
        return isAdmin || isDirector;
      case 'manager':
        return isAdmin || isDirector || isManager;
      case 'supervisor':
      case 'employee':
        return isAdmin || isDirector || isManager;
      default:
        return false;
    }
  };

  const assignRole = async ({ profileId, role, reason }: RoleAssignmentOptions) => {
    if (!canAssignRole(role)) {
      toast.error('Insufficient permissions to assign this role');
      return { success: false, error: 'Insufficient permissions' };
    }

    if (!reason?.trim()) {
      toast.error('Reason is required for role assignment');
      return { success: false, error: 'Reason is required' };
    }

    setIsAssigning(true);

    try {
      // Get user's organization
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('employee_info')
        .select('organization_id')
        .eq('id', profileId)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Create role assignment directly since assign_user_role function doesn't exist
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userData.user.id,
          role: role,
          organization_id: profile.organization_id
        });

      if (error) throw error;

      toast.success(`Successfully assigned ${role} role`);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to assign role';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsAssigning(false);
    }
  };

  const bulkAssignRoles = async ({ assignments, reason }: BulkRoleAssignmentOptions) => {
    if (!reason?.trim()) {
      toast.error('Reason is required for bulk role assignment');
      return { success: false, error: 'Reason is required' };
    }

    // Validate permissions for all roles
    const invalidAssignments = assignments.filter(({ role }) => !canAssignRole(role));
    if (invalidAssignments.length > 0) {
      toast.error('Insufficient permissions for some role assignments');
      return { success: false, error: 'Insufficient permissions' };
    }

    setIsAssigning(true);
    const results = [];

    try {
      // Get user's organization
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      // Process assignments one by one to maintain audit trail
      for (const { profileId, role } of assignments) {
        try {
          const { data: profile } = await supabase
            .from('employee_info')
            .select('organization_id, user_id')
            .eq('id', profileId)
            .single();

          if (!profile?.user_id) {
            results.push({ profileId, role, success: false, error: 'Profile has no user_id' });
            continue;
          }

          // Create role assignment directly
          const { error } = await supabase
            .from('user_roles')
            .insert({
              user_id: profile.user_id,
              role: role,
              organization_id: profile.organization_id
            });

          results.push({ profileId, role, success: !error, error });
          
          if (error) {
            console.error(`Failed to assign ${role} to ${profileId}:`, error);
          }
        } catch (err) {
          results.push({ profileId, role, success: false, error: err });
          console.error(`Failed to assign ${role} to ${profileId}:`, err);
        }
      }

      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      if (successful.length > 0) {
        toast.success(`Successfully assigned roles to ${successful.length} user(s)`);
      }
      
      if (failed.length > 0) {
        toast.error(`Failed to assign roles to ${failed.length} user(s)`);
      }

      return { 
        success: failed.length === 0, 
        results,
        successCount: successful.length,
        failureCount: failed.length
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Bulk role assignment failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsAssigning(false);
    }
  };

  return {
    assignRole,
    bulkAssignRoles,
    canAssignRole,
    isAssigning
  };
}