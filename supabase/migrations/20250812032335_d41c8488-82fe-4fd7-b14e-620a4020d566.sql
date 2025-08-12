-- Fix reapply_inferred_roles_for_org: use record variable in FOR loop
CREATE OR REPLACE FUNCTION public.reapply_inferred_roles_for_org(_org_id uuid DEFAULT public.get_current_user_org_id())
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  _processed int := 0;
  _upgraded int := 0;
  _result jsonb;
  _rec record;
BEGIN
  FOR _rec IN SELECT id FROM public.employee_info WHERE organization_id = _org_id LOOP
    _processed := _processed + 1;
    _result := public.system_apply_inferred_role(_rec.id, 'bulk_reapply');
    IF COALESCE((_result->>'success')::boolean, false) AND (_result->>'message') = 'Role assigned' THEN
      _upgraded := _upgraded + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('processed', _processed, 'upgraded', _upgraded);
END;
$$;