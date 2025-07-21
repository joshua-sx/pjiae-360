-- Phase 1: Critical Performance Improvements
-- Missing Database Indexes

-- Single-column indexes for relationship lookups
CREATE INDEX IF NOT EXISTS idx_profiles_division_id ON public.profiles(division_id);
CREATE INDEX IF NOT EXISTS idx_profiles_department_id ON public.profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON public.profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_manager_id ON public.profiles(manager_id);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_goals_employee_status ON public.goals(employee_id, status);
CREATE INDEX IF NOT EXISTS idx_goals_employee_cycle ON public.goals(employee_id, cycle_id);
CREATE INDEX IF NOT EXISTS idx_appraisals_employee_status ON public.appraisals(employee_id, status);
CREATE INDEX IF NOT EXISTS idx_appraisals_employee_cycle ON public.appraisals(employee_id, cycle_id);

-- Role-based query support
CREATE INDEX IF NOT EXISTS idx_user_roles_org_role ON public.user_roles(organization_id, role, is_active);
CREATE INDEX IF NOT EXISTS idx_user_roles_profile_active ON public.user_roles(profile_id, is_active);

-- Date-based reporting and filtering
CREATE INDEX IF NOT EXISTS idx_appraisals_created_at ON public.appraisals(created_at);
CREATE INDEX IF NOT EXISTS idx_goals_created_at ON public.goals(created_at);
CREATE INDEX IF NOT EXISTS idx_goals_due_date ON public.goals(due_date);

-- Cycle and period lookups
CREATE INDEX IF NOT EXISTS idx_cycles_org_status ON public.cycles(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_periods_cycle_status ON public.periods(cycle_id, status);

-- Enhanced Constraints for Data Integrity

-- Appraisal dates validation
ALTER TABLE public.appraisals
ADD CONSTRAINT IF NOT EXISTS chk_appraisal_acknowledged_after_created
  CHECK (acknowledged_at IS NULL OR acknowledged_at >= created_at);

-- Goal progress and status consistency
ALTER TABLE public.goals
ADD CONSTRAINT IF NOT EXISTS chk_goal_progress_range
  CHECK (progress >= 0 AND progress <= 100);

ALTER TABLE public.goals
ADD CONSTRAINT IF NOT EXISTS chk_goal_weight_positive
  CHECK (weight > 0);

-- Cycle date order validation
ALTER TABLE public.cycles
ADD CONSTRAINT IF NOT EXISTS chk_cycle_dates_order
  CHECK (end_date > start_date);

-- Period date order validation
ALTER TABLE public.periods
ADD CONSTRAINT IF NOT EXISTS chk_period_dates_order
  CHECK (end_date > start_date);

-- Competency rating score validation
ALTER TABLE public.competency_ratings
ADD CONSTRAINT IF NOT EXISTS chk_competency_score_range
  CHECK (score >= 0 AND score <= 5);

-- Goal rating score validation
ALTER TABLE public.goal_ratings
ADD CONSTRAINT IF NOT EXISTS chk_goal_rating_score_range
  CHECK (score >= 0 AND score <= 5);

-- Profile hire date validation
ALTER TABLE public.profiles
ADD CONSTRAINT IF NOT EXISTS chk_profile_hire_date_reasonable
  CHECK (hire_date IS NULL OR hire_date <= CURRENT_DATE);

-- User roles validation
ALTER TABLE public.user_roles
ADD CONSTRAINT IF NOT EXISTS chk_user_roles_valid_enum
  CHECK (role IN ('admin', 'manager', 'employee', 'director', 'supervisor'));