-- Add unique constraint on profiles.user_id to prevent duplicate user profiles
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_user_id_key;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);

-- Add foreign key from employee_info.user_id to profiles.user_id
ALTER TABLE public.employee_info 
DROP CONSTRAINT IF EXISTS employee_info_user_id_fkey;

ALTER TABLE public.employee_info 
ADD CONSTRAINT employee_info_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key from goal_assignments.employee_id to employee_info.id
ALTER TABLE public.goal_assignments 
DROP CONSTRAINT IF EXISTS goal_assignments_employee_id_fkey;

ALTER TABLE public.goal_assignments 
ADD CONSTRAINT goal_assignments_employee_id_fkey 
FOREIGN KEY (employee_id) REFERENCES public.employee_info(id) ON DELETE CASCADE;

-- Add foreign key from goals.created_by to employee_info.id
ALTER TABLE public.goals 
DROP CONSTRAINT IF EXISTS goals_created_by_fkey;

ALTER TABLE public.goals 
ADD CONSTRAINT goals_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES public.employee_info(id) ON DELETE SET NULL;

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('org-assets', 'org-assets', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('employee-imports', 'employee-imports', false)
ON CONFLICT (id) DO NOTHING;

-- Add RLS policies for org-assets bucket
CREATE POLICY "Public read access for org assets" ON storage.objects
FOR SELECT USING (bucket_id = 'org-assets');

CREATE POLICY "Authenticated users can upload org assets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'org-assets' AND 
  auth.uid() IS NOT NULL
);

-- Add RLS policies for employee-imports bucket  
CREATE POLICY "Admins can manage employee imports" ON storage.objects
FOR ALL USING (
  bucket_id = 'employee-imports' AND 
  has_role('admin'::app_role)
);