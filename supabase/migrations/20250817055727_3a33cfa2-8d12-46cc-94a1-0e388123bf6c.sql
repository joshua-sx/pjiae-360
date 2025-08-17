-- Enable leaked password protection in Supabase Auth
-- This requires updating auth configuration which is handled via Supabase dashboard
-- The migration serves as documentation of the required setting

-- Log that this security setting needs to be enabled manually
INSERT INTO public.security_audit_log (
  event_type, 
  event_details, 
  success
) VALUES (
  'security_configuration_required',
  jsonb_build_object(
    'setting', 'leaked_password_protection',
    'status', 'requires_manual_configuration',
    'documentation', 'This setting must be enabled in Supabase Auth settings dashboard',
    'url', 'https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection'
  ),
  true
);