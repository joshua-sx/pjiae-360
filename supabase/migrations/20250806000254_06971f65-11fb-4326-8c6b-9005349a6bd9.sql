
-- Create signatures table for storing appraisal signatures
CREATE TABLE signatures (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  appraisal_id uuid NOT NULL,
  role text NOT NULL,
  signature_data text NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(appraisal_id, role)
);

-- Enable RLS
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage signatures for their appraisals" ON signatures
FOR ALL USING (
  appraisal_id IN (
    SELECT a.id FROM appraisals a
    JOIN employee_info ei ON a.employee_id = ei.id
    WHERE ei.user_id = auth.uid()
  ) OR
  has_role('admin'::app_role) OR 
  has_role('manager'::app_role)
);

-- Create audit_logs table for appraisal audit trail
CREATE TABLE audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  appraisal_id uuid NOT NULL,
  action text NOT NULL,
  details text,
  user_id uuid,
  timestamp timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view audit logs for their appraisals" ON audit_logs
FOR SELECT USING (
  appraisal_id IN (
    SELECT a.id FROM appraisals a
    JOIN employee_info ei ON a.employee_id = ei.id
    WHERE ei.user_id = auth.uid()
  ) OR
  has_role('admin'::app_role) OR 
  has_role('manager'::app_role)
);

CREATE POLICY "System can insert audit logs" ON audit_logs
FOR INSERT WITH CHECK (true);
