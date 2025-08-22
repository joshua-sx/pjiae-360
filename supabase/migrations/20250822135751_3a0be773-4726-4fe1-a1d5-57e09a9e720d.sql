
-- 1) Ensure profiles.user_id is unique (needed to safely reference from employee_info.user_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'profiles_user_id_unique_idx'
  ) THEN
    CREATE UNIQUE INDEX profiles_user_id_unique_idx ON public.profiles(user_id);
  END IF;
END $$;

-- 2) Add FK: employee_info.user_id -> profiles.user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'employee_info_user_id_fkey'
  ) THEN
    ALTER TABLE public.employee_info
      ADD CONSTRAINT employee_info_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES public.profiles(user_id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- 3) Goal Assignments FKs
-- 3a) goal_assignments.employee_id -> employee_info.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'goal_assignments_employee_id_fkey'
  ) THEN
    ALTER TABLE public.goal_assignments
      ADD CONSTRAINT goal_assignments_employee_id_fkey
      FOREIGN KEY (employee_id)
      REFERENCES public.employee_info(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- 3b) goal_assignments.goal_id -> goals.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'goal_assignments_goal_id_fkey'
  ) THEN
    ALTER TABLE public.goal_assignments
      ADD CONSTRAINT goal_assignments_goal_id_fkey
      FOREIGN KEY (goal_id)
      REFERENCES public.goals(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- 4) Goals FK: goals.created_by -> employee_info.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'goals_created_by_fkey'
  ) THEN
    ALTER TABLE public.goals
      ADD CONSTRAINT goals_created_by_fkey
      FOREIGN KEY (created_by)
      REFERENCES public.employee_info(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- 5) Appraisal Appraisers FKs (to stabilize joins/embeds)
-- 5a) appraisal_appraisers.appraisal_id -> appraisals.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'appraisal_appraisers_appraisal_id_fkey'
  ) THEN
    ALTER TABLE public.appraisal_appraisers
      ADD CONSTRAINT appraisal_appraisers_appraisal_id_fkey
      FOREIGN KEY (appraisal_id)
      REFERENCES public.appraisals(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- 5b) appraisal_appraisers.appraiser_id -> employee_info.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'appraisal_appraisers_appraiser_id_fkey'
  ) THEN
    ALTER TABLE public.appraisal_appraisers
      ADD CONSTRAINT appraisal_appraisers_appraiser_id_fkey
      FOREIGN KEY (appraiser_id)
      REFERENCES public.employee_info(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- 6) Helpful indexes for performance (created safely if missing)
CREATE INDEX IF NOT EXISTS goal_assignments_employee_id_idx ON public.goal_assignments(employee_id);
CREATE INDEX IF NOT EXISTS goal_assignments_goal_id_idx     ON public.goal_assignments(goal_id);
CREATE INDEX IF NOT EXISTS goals_created_by_idx             ON public.goals(created_by);

-- 7) Enable realtime on signature_reminders (used by SignatureReminders.tsx)
ALTER TABLE public.signature_reminders REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname   = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename  = 'signature_reminders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.signature_reminders;
  END IF;
END $$;

-- 8) Storage buckets and policies
-- 8a) Buckets (id and name must match; public controls anon read behavior)
INSERT INTO storage.buckets (id, name, public)
VALUES ('org-assets', 'org-assets', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('employee-imports', 'employee-imports', false)
ON CONFLICT (id) DO NOTHING;

-- 8b) Policies on storage.objects
-- Note: Public read for 'org-assets' is allowed via bucket.public = true. We still scope write ops to org admins.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'Admins manage org-assets'
  ) THEN
    CREATE POLICY "Admins manage org-assets"
      ON storage.objects
      FOR ALL
      TO authenticated
      USING (bucket_id = 'org-assets' AND public.has_role('admin'::public.app_role))
      WITH CHECK (bucket_id = 'org-assets' AND public.has_role('admin'::public.app_role));
  END IF;
END $$;

-- Restrict employee-imports (private bucket) to org admins for all ops
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'Admins manage employee-imports'
  ) THEN
    CREATE POLICY "Admins manage employee-imports"
      ON storage.objects
      FOR ALL
      TO authenticated
      USING (bucket_id = 'employee-imports' AND public.has_role('admin'::public.app_role))
      WITH CHECK (bucket_id = 'employee-imports' AND public.has_role('admin'::public.app_role));
  END IF;
END $$;
