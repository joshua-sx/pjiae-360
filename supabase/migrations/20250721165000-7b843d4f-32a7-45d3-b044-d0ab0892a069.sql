-- Add soft delete helper functions

-- Function to mark a record as soft deleted
CREATE OR REPLACE FUNCTION public.soft_delete_record(_table_name text, _record_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _result boolean := false;
  _query text;
BEGIN
  _query := format('UPDATE public.%I SET deleted_at = now(), updated_at = now() WHERE id = $1 AND deleted_at IS NULL', _table_name);
  EXECUTE _query USING _record_id;
  GET DIAGNOSTICS _result = ROW_COUNT;
  RETURN _result > 0;
END;
$$;

-- Function to restore a previously soft deleted record
CREATE OR REPLACE FUNCTION public.restore_record(_table_name text, _record_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _result boolean := false;
  _query text;
BEGIN
  _query := format('UPDATE public.%I SET deleted_at = NULL, updated_at = now() WHERE id = $1 AND deleted_at IS NOT NULL', _table_name);
  EXECUTE _query USING _record_id;
  GET DIAGNOSTICS _result = ROW_COUNT;
  RETURN _result > 0;
END;
$$;

-- Permanently delete records that were soft deleted more than _days_old days ago
CREATE OR REPLACE FUNCTION public.permanent_delete_old_records(_table_name text, _days_old integer DEFAULT 90)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _deleted integer := 0;
  _query text;
BEGIN
  _query := format('DELETE FROM public.%I WHERE deleted_at IS NOT NULL AND deleted_at < now() - ($1 || '' days'')::interval', _table_name);
  EXECUTE _query USING _days_old;
  GET DIAGNOSTICS _deleted = ROW_COUNT;
  RETURN _deleted;
END;
$$;
