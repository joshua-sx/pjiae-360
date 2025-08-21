-- Fix password strength protection policy
-- Enable leaked password protection
UPDATE auth.config 
SET password_policy = jsonb_set(
  COALESCE(password_policy, '{}'::jsonb),
  '{leaked_password_protection}',
  'true'::jsonb
);