-- Create department_heads table
CREATE TABLE public.department_heads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  head_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(department_id)
);

-- Enable RLS on department_heads
ALTER TABLE public.department_heads ENABLE ROW LEVEL SECURITY;

-- RLS policy for department_heads
CREATE POLICY "Organization access for department_heads" ON public.department_heads
  FOR ALL USING (organization_id = public.get_user_organization_id());

-- Create trigger to update updated_at for department_heads
CREATE TRIGGER update_department_heads_updated_at
  BEFORE UPDATE ON public.department_heads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create division_directors table
CREATE TABLE public.division_directors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
  director_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(division_id)
);

-- Enable RLS on division_directors
ALTER TABLE public.division_directors ENABLE ROW LEVEL SECURITY;

-- RLS policy for division_directors
CREATE POLICY "Organization access for division_directors" ON public.division_directors
  FOR ALL USING (organization_id = public.get_user_organization_id());

-- Create trigger to update updated_at for division_directors
CREATE TRIGGER update_division_directors_updated_at
  BEFORE UPDATE ON public.division_directors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
