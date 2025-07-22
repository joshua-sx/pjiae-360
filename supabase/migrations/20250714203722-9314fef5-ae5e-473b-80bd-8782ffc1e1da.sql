-- Fix: Add unique constraint and update organizational structure for PJIAE
-- 1. Add support for vacant positions
ALTER TABLE roles ADD COLUMN IF NOT EXISTS is_vacant BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS position_status TEXT DEFAULT 'active'; -- active, vacant, interim

-- 2. Add unique constraint to departments if it doesn't exist
ALTER TABLE departments ADD CONSTRAINT departments_name_org_unique UNIQUE (name, organization_id);

-- 3. Update organizational structure
DO $$
DECLARE
    executive_div_id UUID;
    technical_div_id UUID;
    finance_div_id UUID;
    operations_div_id UUID;
    hr_div_id UUID;
    engineering_div_id UUID;
    commercial_div_id UUID;
    security_div_id UUID;
    qa_div_id UUID;
    org_id UUID;
BEGIN
    -- Get organization ID
    SELECT id INTO org_id FROM organizations WHERE name = 'Default Organization';
    
    -- Create all PJIAE divisions
    INSERT INTO divisions (name, code, organization_id) VALUES
        ('Executive', 'EXE', org_id),
        ('Technical', 'TEC', org_id),
        ('Finance', 'FIN', org_id),
        ('Operations', 'OPS', org_id),
        ('Human Resources', 'HRS', org_id),
        ('Engineering', 'ENG', org_id),
        ('Commercial', 'COM', org_id),
        ('Security', 'SEC', org_id),
        ('Quality Assurance', 'QAS', org_id)
    ON CONFLICT (organization_id, code) DO NOTHING;
    
    -- Get division IDs
    SELECT id INTO executive_div_id FROM divisions WHERE code = 'EXE' AND organization_id = org_id;
    SELECT id INTO technical_div_id FROM divisions WHERE code = 'TEC' AND organization_id = org_id;
    SELECT id INTO finance_div_id FROM divisions WHERE code = 'FIN' AND organization_id = org_id;
    SELECT id INTO operations_div_id FROM divisions WHERE code = 'OPS' AND organization_id = org_id;
    SELECT id INTO hr_div_id FROM divisions WHERE code = 'HRS' AND organization_id = org_id;
    SELECT id INTO engineering_div_id FROM divisions WHERE code = 'ENG' AND organization_id = org_id;
    SELECT id INTO commercial_div_id FROM divisions WHERE code = 'COM' AND organization_id = org_id;
    SELECT id INTO security_div_id FROM divisions WHERE code = 'SEC' AND organization_id = org_id;
    SELECT id INTO qa_div_id FROM divisions WHERE code = 'QAS' AND organization_id = org_id;
    
    -- Insert/Update Executive departments
    INSERT INTO departments (name, division_id, organization_id) VALUES
        ('CEO Office', executive_div_id, org_id),
        ('Executive Support', executive_div_id, org_id),
        ('Legal Counsel', executive_div_id, org_id)
    ON CONFLICT (name, organization_id) DO UPDATE SET division_id = EXCLUDED.division_id;
    
    -- Insert/Update all PJIAE departments
    INSERT INTO departments (name, code, division_id, organization_id) VALUES
        ('Finance', 'FIN', finance_div_id, org_id),
        ('Accounting', 'ACC', finance_div_id, org_id),
        ('Budget & Planning', 'BPL', finance_div_id, org_id),
        ('Operations', 'OPS', operations_div_id, org_id),
        ('Maintenance', 'MNT', operations_div_id, org_id),
        ('Ground Support', 'GRD', operations_div_id, org_id),
        ('Human Resources', 'HRS', hr_div_id, org_id),
        ('Training & Development', 'TRD', hr_div_id, org_id),
        ('Engineering', 'ENG', engineering_div_id, org_id),
        ('Project Management Unit', 'PMU', technical_div_id, org_id),
        ('IT Services', 'ITS', technical_div_id, org_id),
        ('Commercial', 'COM', commercial_div_id, org_id),
        ('Marketing', 'MKT', commercial_div_id, org_id),
        ('Customer Service', 'CUS', commercial_div_id, org_id),
        ('Security', 'SEC', security_div_id, org_id),
        ('Safety & Compliance', 'SAC', security_div_id, org_id),
        ('Quality Assurance', 'QAS', qa_div_id, org_id),
        ('Audit', 'AUD', qa_div_id, org_id)
    ON CONFLICT (name, organization_id) DO UPDATE SET division_id = EXCLUDED.division_id;
END $$;

-- 4. Create appraiser assignment system
CREATE TABLE IF NOT EXISTS appraiser_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    appraiser_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT TRUE,
    assigned_by UUID REFERENCES profiles(id),
    assignment_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    UNIQUE(employee_id, appraiser_id)
);

-- Enable RLS on appraiser_assignments
ALTER TABLE appraiser_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for appraiser assignments
CREATE POLICY "Organization access for appraiser assignments" ON appraiser_assignments
    FOR ALL USING (organization_id = get_user_organization_id());

-- Create function to get suggested appraisers based on hierarchy
CREATE OR REPLACE FUNCTION get_suggested_appraisers(employee_id UUID)
RETURNS TABLE(
    appraiser_id UUID,
    appraiser_name TEXT,
    appraiser_role TEXT,
    hierarchy_level INTEGER
) AS $$
BEGIN
    -- Get suggested appraisers based on organizational hierarchy
    RETURN QUERY
    WITH employee_info AS (
        SELECT p.manager_id, p.department_id, p.division_id, p.organization_id
        FROM profiles p 
        WHERE p.id = employee_id
    ),
    hierarchy AS (
        -- Direct manager (level 1)
        SELECT p.id, p.name, COALESCE(r.name, 'Manager') as role_name, 1 as level
        FROM employee_info ei
        JOIN profiles p ON p.id = ei.manager_id
        LEFT JOIN roles r ON r.id = p.role_id
        WHERE p.status = 'active'
        
        UNION ALL
        
        -- Department head (level 2)
        SELECT dh.head_id, p.name, COALESCE(r.name, 'Department Head') as role_name, 2 as level
        FROM employee_info ei
        JOIN department_heads dh ON dh.department_id = ei.department_id
        JOIN profiles p ON p.id = dh.head_id
        LEFT JOIN roles r ON r.id = p.role_id
        WHERE p.status = 'active' AND dh.head_id != employee_id
        
        UNION ALL
        
        -- Division director (level 3)
        SELECT dd.director_id, p.name, COALESCE(r.name, 'Division Director') as role_name, 3 as level
        FROM employee_info ei
        JOIN division_directors dd ON dd.division_id = ei.division_id
        JOIN profiles p ON p.id = dd.director_id
        LEFT JOIN roles r ON r.id = p.role_id
        WHERE p.status = 'active' AND dd.director_id != employee_id
    )
    SELECT h.id, h.name, h.role_name, h.level
    FROM hierarchy h
    ORDER BY h.level
    LIMIT 2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to assign appraisers
CREATE OR REPLACE FUNCTION assign_appraisers(
    employee_id UUID,
    appraiser_ids UUID[],
    assigned_by UUID
) RETURNS BOOLEAN AS $$
DECLARE
    appraiser_id UUID;
    user_org_id UUID;
    i INTEGER := 1;
BEGIN
    -- Get user's organization
    SELECT organization_id INTO user_org_id FROM profiles WHERE id = assigned_by;
    
    -- Clear existing assignments for this employee
    DELETE FROM appraiser_assignments WHERE employee_id = assign_appraisers.employee_id;
    
    -- Insert new appraiser assignments
    FOREACH appraiser_id IN ARRAY appraiser_ids
    LOOP
        INSERT INTO appraiser_assignments (
            employee_id, 
            appraiser_id, 
            assigned_by, 
            organization_id,
            is_primary
        ) VALUES (
            assign_appraisers.employee_id,
            appraiser_id,
            assigned_by,
            user_org_id,
            i = 1 -- First appraiser is primary
        );
        i := i + 1;
    END LOOP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get employees that a user can manage appraiser assignments for
CREATE OR REPLACE FUNCTION get_editable_employees(user_id UUID)
RETURNS TABLE(
    employee_id UUID,
    employee_name TEXT,
    employee_role TEXT,
    can_edit BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH user_info AS (
        SELECT p.id, p.organization_id, p.department_id, p.division_id, COALESCE(r.name, 'Employee') as role_name
        FROM profiles p
        LEFT JOIN roles r ON r.id = p.role_id
        WHERE p.id = user_id
    )
    SELECT 
        p.id,
        COALESCE(p.name, p.email),
        COALESCE(r.name, 'Employee'),
        CASE 
            -- Admin can edit all
            WHEN ui.role_name = 'Admin' THEN TRUE
            -- Division directors can edit all in their division
            WHEN EXISTS (
                SELECT 1 FROM division_directors dd 
                WHERE dd.director_id = ui.id AND dd.division_id = p.division_id
            ) THEN TRUE
            -- Department heads can edit all in their department
            WHEN EXISTS (
                SELECT 1 FROM department_heads dh 
                WHERE dh.head_id = ui.id AND dh.department_id = p.department_id
            ) THEN TRUE
            -- Managers can edit their direct reports
            WHEN p.manager_id = ui.id THEN TRUE
            -- Users can edit themselves
            WHEN p.id = ui.id THEN TRUE
            ELSE FALSE
        END as can_edit
    FROM user_info ui
    CROSS JOIN profiles p
    LEFT JOIN roles r ON r.id = p.role_id
    WHERE p.organization_id = ui.organization_id
    AND p.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at for appraiser_assignments
CREATE TRIGGER update_appraiser_assignments_updated_at
    BEFORE UPDATE ON appraiser_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appraiser_assignments_employee_id ON appraiser_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_appraiser_assignments_appraiser_id ON appraiser_assignments(appraiser_id);
CREATE INDEX IF NOT EXISTS idx_appraiser_assignments_organization_id ON appraiser_assignments(organization_id);