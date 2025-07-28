-- Add missing 'invited' status to user_status enum
ALTER TYPE user_status ADD VALUE 'invited';

-- Add missing column to appraisal_appraisers table
ALTER TABLE appraisal_appraisers ADD COLUMN is_primary boolean DEFAULT true;