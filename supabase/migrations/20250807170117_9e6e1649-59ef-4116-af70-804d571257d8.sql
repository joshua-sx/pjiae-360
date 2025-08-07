-- Create goal_setting_windows table
CREATE TABLE public.goal_setting_windows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cycle_id UUID NOT NULL,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.goal_setting_windows ENABLE ROW LEVEL SECURITY;

-- Create policies for goal setting windows
CREATE POLICY "Admins can manage goal setting windows" 
ON public.goal_setting_windows 
FOR ALL 
USING (has_role('admin'::app_role));

CREATE POLICY "Users can view goal setting windows in their organization" 
ON public.goal_setting_windows 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM appraisal_cycles ac 
  WHERE ac.id = goal_setting_windows.cycle_id 
  AND ac.organization_id = get_current_user_org_id()
));

-- Add goal_window_id to cycle_phases table
ALTER TABLE public.cycle_phases 
ADD COLUMN goal_window_id UUID REFERENCES public.goal_setting_windows(id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_goal_setting_windows_updated_at
BEFORE UPDATE ON public.goal_setting_windows
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();