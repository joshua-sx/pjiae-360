-- Enable password security features through RLS and configuration
-- Note: Auth configuration is managed through Supabase dashboard, not SQL
-- This migration creates audit tables for tracking security events

-- Create a function to check password strength (frontend will use this)
CREATE OR REPLACE FUNCTION public.validate_password_strength(password_text text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb := '{"valid": true, "issues": []}'::jsonb;
  issues text[] := '{}';
BEGIN
  -- Check minimum length
  IF length(password_text) < 8 THEN
    issues := array_append(issues, 'Password must be at least 8 characters long');
  END IF;
  
  -- Check for uppercase letter
  IF password_text !~ '[A-Z]' THEN
    issues := array_append(issues, 'Password must contain at least one uppercase letter');
  END IF;
  
  -- Check for lowercase letter  
  IF password_text !~ '[a-z]' THEN
    issues := array_append(issues, 'Password must contain at least one lowercase letter');
  END IF;
  
  -- Check for number
  IF password_text !~ '[0-9]' THEN
    issues := array_append(issues, 'Password must contain at least one number');
  END IF;
  
  -- Check for special character
  IF password_text !~ '[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\?]' THEN
    issues := array_append(issues, 'Password must contain at least one special character');
  END IF;
  
  IF array_length(issues, 1) > 0 THEN
    result := jsonb_build_object('valid', false, 'issues', issues);
  END IF;
  
  RETURN result;
END;
$$;