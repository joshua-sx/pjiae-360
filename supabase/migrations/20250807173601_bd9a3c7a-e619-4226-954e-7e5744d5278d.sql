-- Add subscription_plan field to organizations table
ALTER TABLE organizations 
ADD COLUMN subscription_plan TEXT NOT NULL DEFAULT 'professional';

-- Create activities table for real system event logging
CREATE TABLE activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  employee_id UUID,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on activities table
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policies for activities
CREATE POLICY "Users can view activities in their organization" 
ON activities 
FOR SELECT 
USING (organization_id = get_current_user_org_id());

CREATE POLICY "System can insert activities" 
ON activities 
FOR INSERT 
WITH CHECK (organization_id = get_current_user_org_id());

-- Create index for better performance
CREATE INDEX idx_activities_organization_created_at ON activities(organization_id, created_at DESC);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_employee_id ON activities(employee_id);