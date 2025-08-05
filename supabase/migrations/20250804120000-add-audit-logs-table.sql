-- Create audit_logs table for appraisal-specific events
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appraisal_id uuid REFERENCES public.appraisals(id) ON DELETE CASCADE,
  action text NOT NULL,
  details text,
  user_id uuid REFERENCES auth.users(id),
  "timestamp" timestamptz NOT NULL DEFAULT now()
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_audit_logs_appraisal_id ON public.audit_logs(appraisal_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs("timestamp" DESC);
