-- Fix Goals table RLS policies to enable proper CRUD operations

-- Add UPDATE policy for goals table
CREATE POLICY "Users can update goals they created or manage"
ON public.goals
FOR UPDATE
USING (
  organization_id = get_current_user_org_id() AND (
    created_by IN (
      SELECT employee_info.id 
      FROM employee_info 
      WHERE employee_info.user_id = auth.uid()
    ) OR
    has_role('admin'::app_role) OR
    has_role('director'::app_role) OR
    has_role('manager'::app_role)
  )
);

-- Add DELETE policy for goals table  
CREATE POLICY "Admins and directors can delete goals"
ON public.goals
FOR DELETE
USING (
  organization_id = get_current_user_org_id() AND (
    has_role('admin'::app_role) OR
    has_role('director'::app_role)
  )
);

-- Update the existing SELECT policy to be more specific about role-based access
DROP POLICY IF EXISTS "Users can view goals in their organization" ON public.goals;

CREATE POLICY "Role-based goal access"
ON public.goals
FOR SELECT
USING (
  organization_id = get_current_user_org_id() AND (
    -- Admins and directors see all goals
    has_role('admin'::app_role) OR
    has_role('director'::app_role) OR
    -- Managers see goals they created or are assigned to their team
    (has_role('manager'::app_role) AND (
      created_by IN (
        SELECT employee_info.id 
        FROM employee_info 
        WHERE employee_info.user_id = auth.uid()
      ) OR
      id IN (
        SELECT ga.goal_id 
        FROM goal_assignments ga
        JOIN employee_info ei ON ga.employee_id = ei.id
        WHERE ei.manager_id IN (
          SELECT employee_info.id 
          FROM employee_info 
          WHERE employee_info.user_id = auth.uid()
        )
      )
    )) OR
    -- Employees see goals assigned to them or they created
    (has_role('employee'::app_role) AND (
      created_by IN (
        SELECT employee_info.id 
        FROM employee_info 
        WHERE employee_info.user_id = auth.uid()
      ) OR
      id IN (
        SELECT ga.goal_id 
        FROM goal_assignments ga
        JOIN employee_info ei ON ga.employee_id = ei.id
        WHERE ei.user_id = auth.uid()
      )
    ))
  )
);