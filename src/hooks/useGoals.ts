import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from './usePermissions';
import type { Tables } from '@/integrations/supabase/types';

export interface Goal {
  id: string;
  title: string;
  employeeName: string;
  employeeId: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  year: string;
  dueDate: string | null;
  description: string | null;
  type: string;
  weight: number;
  progress: number | null;
  createdAt: string;
  updatedAt: string;
}

interface UseGoalsResult {
  goals: Goal[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useGoals(filters?: {
  year?: string;
  status?: string;
  employeeId?: string;
}): UseGoalsResult {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { roles, loading: permissionsLoading } = usePermissions();

  const fetchGoals = async () => {
    if (permissionsLoading) return;

    try {
      setError(null);
      setLoading(true);

      let query = supabase
        .from('goals')
        .select(`
          id,
          title,
          status,
          due_date,
          description,
          type,
          weight,
          progress,
          created_at,
          updated_at,
          employee:profiles!goals_employee_id_fkey(
            id,
            first_name,
            last_name
          ),
          cycle:cycles(
            id,
            name,
            start_date,
            end_date
          )
        `);

      // Apply role-based filtering
      if (roles.includes('employee') && !roles.some(r => ['admin', 'director', 'manager', 'supervisor'].includes(r))) {
        // Employee sees only their own goals
        const { data: profileData } = await supabase.rpc('get_user_profile_id');
        if (profileData) {
          query = query.eq('employee_id', profileData);
        }
      } else if (roles.includes('manager') || roles.includes('supervisor')) {
        // Manager/Supervisor sees their direct reports' goals
        const { data: profileData } = await supabase.rpc('get_user_profile_id');
        if (profileData) {
          const { data: directReports } = await supabase.rpc('get_direct_reports', {
            _profile_id: profileData
          });
          
          if (directReports && directReports.length > 0) {
            const reportIds = directReports.map(r => r.profile_id);
            reportIds.push(profileData); // Include own goals
            query = query.in('employee_id', reportIds);
          } else {
            query = query.eq('employee_id', profileData);
          }
        }
      } else if (roles.includes('director')) {
        // Director sees division-level goals
        const { data: profileData } = await supabase.rpc('get_user_profile_id');
        if (profileData) {
          const { data: divisionEmployees } = await supabase.rpc('get_division_employees', {
            _profile_id: profileData
          });
          
          if (divisionEmployees && divisionEmployees.length > 0) {
            const employeeIds = divisionEmployees.map(e => e.profile_id);
            query = query.in('employee_id', employeeIds);
          }
        }
      }
      // Admin sees all goals (no additional filter needed)

      // Apply additional filters
      if (filters?.year && filters.year !== 'All') {
        // Filter by cycle year - this is a simplified approach
        // In a real app, you might want to join with cycles and filter by year
        query = query.gte('created_at', `${filters.year}-01-01`)
                   .lt('created_at', `${parseInt(filters.year) + 1}-01-01`);
      }

      if (filters?.status && filters.status !== 'All') {
        query = query.eq('status', filters.status);
      }

      if (filters?.employeeId) {
        query = query.eq('employee_id', filters.employeeId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform the data to match our Goal interface
      const transformedGoals: Goal[] = (data || []).map(goal => ({
        id: goal.id,
        title: goal.title,
        employeeName: goal.employee 
          ? `${goal.employee.first_name || ''} ${goal.employee.last_name || ''}`.trim()
          : 'Unknown Employee',
        employeeId: goal.employee?.id || '',
        status: goal.status as Goal['status'],
        year: goal.cycle?.start_date ? new Date(goal.cycle.start_date).getFullYear().toString() : 
              new Date(goal.created_at).getFullYear().toString(),
        dueDate: goal.due_date,
        description: goal.description,
        type: goal.type,
        weight: goal.weight,
        progress: goal.progress,
        createdAt: goal.created_at,
        updatedAt: goal.updated_at,
      }));

      setGoals(transformedGoals);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [filters?.year, filters?.status, filters?.employeeId, permissionsLoading, roles.join(',')]);

  return {
    goals,
    loading,
    error,
    refetch: fetchGoals,
  };
}