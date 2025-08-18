-- Fix security warnings

-- 1. Fix function search path issue for normalize_name_trigger
CREATE OR REPLACE FUNCTION public.normalize_name_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  NEW.normalized_name := lower(trim(NEW.name));
  RETURN NEW;
END;
$function$;