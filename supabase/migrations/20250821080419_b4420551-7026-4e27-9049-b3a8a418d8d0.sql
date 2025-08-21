-- Add RLS policies for perf_query_events to enable proper access control
-- Enable RLS on perf_query_events
ALTER TABLE public.perf_query_events ENABLE ROW LEVEL SECURITY;

-- Policy for users to view performance data in their organization
CREATE POLICY "Users can view performance data in their organization" 
ON public.perf_query_events
FOR SELECT 
USING (organization_id = get_current_user_org_id());

-- Policy for admins to manage performance data
CREATE POLICY "Admins can manage performance data" 
ON public.perf_query_events
FOR ALL
USING (
  organization_id = get_current_user_org_id() 
  AND has_role('admin'::app_role)
);

-- Policy for system to insert performance data
CREATE POLICY "System can insert performance data" 
ON public.perf_query_events
FOR INSERT 
WITH CHECK (organization_id = get_current_user_org_id());