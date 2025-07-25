-- Add email format validation constraint
ALTER TABLE public.employee_info 
ADD CONSTRAINT email_format_check 
CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Composite performance indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_goals_employee_cycle_status 
ON public.goals (employee_id, cycle_id, status) 
WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appraisals_employee_cycle_status 
ON public.appraisals (employee_id, cycle_id, status) 
WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_employee_info_org_status_manager 
ON public.employee_info (organization_id, status, manager_id) 
WHERE deleted_at IS NULL;

-- Date range indexes for cycles and periods
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cycles_date_range_org 
ON public.cycles (organization_id, start_date, end_date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_periods_date_range_cycle 
ON public.periods (cycle_id, start_date, end_date);

-- Specialized indexes for manager dashboard queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_goals_manager_due_date 
ON public.goals (manager_id, due_date, status) 
WHERE deleted_at IS NULL AND due_date IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_employee_info_manager_division_dept 
ON public.employee_info (manager_id, division_id, department_id) 
WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appraisals_manager_period_status 
ON public.appraisals (employee_id, period_id, status) 
WHERE deleted_at IS NULL;

-- Performance index for user role lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_profile_active 
ON public.user_roles (profile_id, is_active, role) 
WHERE deleted_at IS NULL;