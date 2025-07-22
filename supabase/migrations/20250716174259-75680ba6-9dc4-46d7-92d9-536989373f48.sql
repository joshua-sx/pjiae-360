-- Create the app_role enum first, then the comprehensive RLS policies

-- Create app_role enum if it doesn't exist
DROP TYPE IF EXISTS public.app_role;
CREATE TYPE public.app_role AS ENUM ('admin', 'director', 'manager', 'supervisor', 'employee');

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role public.app_role NOT NULL,
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(profile_id, role, organization_id)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for user_roles
DROP POLICY IF EXISTS "Organization access" ON public.user_roles;
CREATE POLICY "Organization access" ON public.user_roles
FOR ALL USING (organization_id = get_user_organization_id());

-- Create security definer functions for role-based access
CREATE OR REPLACE FUNCTION public.get_current_user_roles()
RETURNS TABLE(role public.app_role) AS $$
BEGIN
  RETURN QUERY
  SELECT ur.role
  FROM public.user_roles ur
  JOIN public.profiles p ON p.id = ur.profile_id
  WHERE p.user_id = auth.uid()
  AND ur.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.has_role(_role public.app_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.profile_id
    WHERE p.user_id = auth.uid()
    AND ur.role = _role
    AND ur.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_profile_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id
    FROM public.profiles
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_direct_reports(_profile_id UUID)
RETURNS TABLE(profile_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT id
  FROM public.profiles
  WHERE manager_id = _profile_id
  AND organization_id = get_user_organization_id();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_division_employees(_profile_id UUID)
RETURNS TABLE(profile_id UUID) AS $$
DECLARE
  user_division_id UUID;
BEGIN
  -- Get the user's division
  SELECT division_id INTO user_division_id
  FROM public.profiles
  WHERE id = _profile_id;
  
  RETURN QUERY
  SELECT id
  FROM public.profiles
  WHERE division_id = user_division_id
  AND organization_id = get_user_organization_id();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;