-- Create missing get_user_organization_id function
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  RETURN (
    SELECT organization_id 
    FROM public.employee_info 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$function$;

-- Recreate log_security_event function with proper error handling
CREATE OR REPLACE FUNCTION public.log_security_event(_event_type text, _details jsonb DEFAULT NULL::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  _org_id uuid;
  _user_id uuid := auth.uid();
BEGIN
  -- Get organization ID with error handling
  BEGIN
    _org_id := public.get_user_organization_id();
  EXCEPTION
    WHEN OTHERS THEN
      -- If we can't get org ID, still log the event but with null org_id
      _org_id := NULL;
  END;

  -- Insert security event with error handling
  BEGIN
    INSERT INTO public.security_events (
      event_type,
      user_id,
      details,
      organization_id,
      created_at
    ) VALUES (
      _event_type,
      _user_id,
      _details,
      _org_id,
      now()
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log to postgres logs if insert fails
      RAISE WARNING 'Failed to log security event: %', SQLERRM;
  END;
END;
$function$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_user_organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_security_event(text, jsonb) TO authenticated;