-- Update appraisal_phase enum to include all workflow phases
DROP TYPE IF EXISTS appraisal_phase CASCADE;
CREATE TYPE appraisal_phase AS ENUM (
  'goal_setting',
  'self_assessment', 
  'manager_review',
  'calibration',
  'finalization',
  'acknowledgment',
  'complete'
);

-- Update appraisals table to use new phase enum
ALTER TABLE appraisals 
  ALTER COLUMN phase TYPE appraisal_phase USING phase::text::appraisal_phase;

-- Add amendment tracking to appraisals
ALTER TABLE appraisals ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE appraisals ADD COLUMN IF NOT EXISTS parent_appraisal_id UUID REFERENCES appraisals(id);
ALTER TABLE appraisals ADD COLUMN IF NOT EXISTS amendment_reason TEXT;
ALTER TABLE appraisals ADD COLUMN IF NOT EXISTS locked_for_amendment BOOLEAN DEFAULT FALSE;

-- Create appraisal_acknowledgments table for tracking acknowledgments
CREATE TABLE IF NOT EXISTS appraisal_acknowledgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appraisal_id UUID NOT NULL REFERENCES appraisals(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employee_info(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  acknowledgment_signature TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on acknowledgments
ALTER TABLE appraisal_acknowledgments ENABLE ROW LEVEL SECURITY;

-- Create policies for acknowledgments
CREATE POLICY "Users can acknowledge their own appraisals"
ON appraisal_acknowledgments
FOR INSERT
WITH CHECK (
  employee_id IN (
    SELECT id FROM employee_info WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view acknowledgments for their appraisals"
ON appraisal_acknowledgments
FOR SELECT
USING (
  employee_id IN (
    SELECT id FROM employee_info WHERE user_id = auth.uid()
  ) 
  OR has_role('admin'::app_role) 
  OR has_role('manager'::app_role)
);

-- Update signatures table to track more metadata
ALTER TABLE signatures ADD COLUMN IF NOT EXISTS ip_address INET;
ALTER TABLE signatures ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE signatures ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';

-- Create signature_reminders table
CREATE TABLE IF NOT EXISTS signature_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appraisal_id UUID NOT NULL REFERENCES appraisals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  reminder_type TEXT NOT NULL, -- 'initial', 'followup', 'urgent'
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  acknowledged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on signature reminders
ALTER TABLE signature_reminders ENABLE ROW LEVEL SECURITY;

-- Create policies for signature reminders
CREATE POLICY "Users can view their own signature reminders"
ON signature_reminders
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can insert signature reminders"
ON signature_reminders
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can acknowledge their reminders"
ON signature_reminders
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());