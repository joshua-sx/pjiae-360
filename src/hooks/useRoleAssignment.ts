import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions, type AppRole } from '@/features/access-control/hooks/usePermissions';
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
      // Get target user_id from profile
      const { data: profile } = await supabase
        .from('employee_info')
        .select('user_id')
        .eq('id', profileId)
        .single();

      if (!profile?.user_id) throw new Error('Profile not found or no user associated');

      // Use secure role assignment function
      const { data, error } = await supabase.rpc('assign_user_role_secure', {
        _target_user_id: profile.user_id,
        _role: role,
        _reason: reason
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; message?: string };
      
      if (!result.success) {
        throw new Error(result.error || 'Role assignment failed');
      }

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
      // Process assignments using secure function
      for (const { profileId, role } of assignments) {
        try {
          const { data: profile } = await supabase
            .from('employee_info')
            .select('user_id')
            .eq('id', profileId)
            .single();

          if (!profile?.user_id) {
            results.push({ profileId, role, success: false, error: 'Profile has no user_id' });
            continue;
          }

          // Use secure role assignment function
          const { data, error } = await supabase.rpc('assign_user_role_secure', {
            _target_user_id: profile.user_id,
            _role: role,
            _reason: reason
          });

          if (error) throw error;

          const result = data as { success: boolean; error?: string; message?: string };
          results.push({ 
            profileId, 
            role, 
            success: result.success, 
            error: result.error 
          });
          
          if (!result.success) {
            console.error(`Failed to assign ${role} to ${profileId}:`, result.error);
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