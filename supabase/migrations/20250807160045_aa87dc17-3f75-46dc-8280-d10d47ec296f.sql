-- Drop the problematic trigger that's causing the onboarding save error
-- The trigger is trying to update 'updated_at' column which doesn't exist in onboarding_drafts table
DROP TRIGGER IF EXISTS update_onboarding_drafts_last_saved_at ON public.onboarding_drafts;

-- Note: The onboarding_drafts table uses 'last_saved_at' which is manually managed by the application
-- so this trigger is redundant and causing errors