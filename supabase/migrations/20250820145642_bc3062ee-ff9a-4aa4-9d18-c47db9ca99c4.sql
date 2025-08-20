
-- Create the get_goal_versions RPC function
CREATE OR REPLACE FUNCTION public.get_goal_versions(_goal_id uuid)
RETURNS TABLE(
  id uuid,
  goal_id uuid,
  version_number integer,
  changed_by uuid,
  changed_at timestamp with time zone,
  change_type text,
  change_summary text,
  data jsonb
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT 
    gv.id,
    gv.goal_id,
    gv.version_number,
    gv.changed_by,
    gv.changed_at,
    gv.change_type::text,
    gv.change_summary,
    gv.data
  FROM public.goal_versions gv
  WHERE gv.goal_id = _goal_id
  ORDER BY gv.version_number DESC;
$function$;
