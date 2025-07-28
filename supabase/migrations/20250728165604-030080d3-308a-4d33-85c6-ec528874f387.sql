-- Create profiles table for user information
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text, 
  email text,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view profiles in their organization"
ON public.profiles FOR SELECT
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.employee_info ei1, public.employee_info ei2
    WHERE ei1.user_id = auth.uid() 
    AND ei2.user_id = profiles.user_id
    AND ei1.organization_id = ei2.organization_id
  )
);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (user_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update the handle_new_user function to create profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Create profile from user metadata
  INSERT INTO public.profiles (
    user_id,
    first_name,
    last_name,
    email
  ) VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.email
  );

  -- Only create employee info if user has organization metadata
  IF NEW.raw_user_meta_data ? 'organization_id' THEN
    INSERT INTO public.employee_info (
      user_id,
      organization_id,
      status
    ) VALUES (
      NEW.id,
      (NEW.raw_user_meta_data->>'organization_id')::UUID,
      'pending'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix goals table - add created_by reference instead of employee_id 
-- (goals are created by managers/admins, then assigned to employees via goal_assignments)
ALTER TABLE public.goals 
ADD COLUMN IF NOT EXISTS assigned_count integer DEFAULT 0;