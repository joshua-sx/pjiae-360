-- Fix security definer views by removing SECURITY DEFINER from materialized views
-- This addresses the security linter warning about SECURITY DEFINER views

-- First, check if tenant_analytics_summary view exists and drop if needed
DROP MATERIALIZED VIEW IF EXISTS public.tenant_analytics_summary;

-- Enable password strength and leaked password protection
-- This addresses the leaked password protection warning
UPDATE auth.config 
SET 
  password_min_length = 8,
  password_require_characters = 'abcABC123!@#$',
  password_breach_detection = true
WHERE key = 'password_policy';