` block as per the Supabase instructions while keeping in mind the limitations of our chat mode." duration="5.016061">
</lov-tool-use>

<lov-tool-use id="thinking-7f8f6bdf-5079-4d10-89e3-93bb1ba7d567" name="lov-think" data="**Preparing SQL presentation**

It looks like we're in a good spot to present the SQL block. I'll outline the plan steps first, and then include a quick reply option labeled \"Implement the plan\" to shift back to the default mode. For Supabase, it's emphasized to make changes via SQL blocks before any code changes, so I'll focus solely on the SQL now without mixing in code changes. At the end, I can add a lov-actions prompt since the instructions say we should always provide a plan along with that quick reply. However, the user will need to review and approve the SQL before it's run." duration="17.785087">
</lov-tool-use>

<lov-tool-use id="thinking-272d1a3f-a1ee-41f2-803e-a424e7a672fe" name="lov-think" data="**Finalizing database modification plan**

I’m deciding on the next steps for our SQL migrations. I need to propose adding several columns, such as `weight`, `alignment_score`, and `year` to the `goals` table, as well as `weight` and `progress` to `goal_assignments`. I'll include the SQL block at the end for review and approval, and for now, I won’t include a quick reply since it’s more about gaining SQL approval first. 

I should backfill existing data and create a `goal_versions` table, along with associated triggers. Additionally, I need to ensure that the new columns do not conflict with existing schemas and that any required triggers are set up to maintain integrity. I'll outline everything carefully!" duration="20.837083">
</lov-tool-use>

<lov-tool-use id="thinking-889fac87-1c4d-41db-9bb7-133c7d0c5ec7" name="lov-think" data="**Assembling SQL and implementation plan**

I’m focused on the next steps for our SQL implementation. I'll update the `useGoals` query to include the new columns and add UI fields for alignment scoring in the ManagerGoalsDashboard. The SQL I need to assemble involves altering the `goals` and `goal_assignments` tables, adding columns for weight, alignment_score, and year, along with necessary backfill activities.

I should also create the `goal_versions` table and define the function for logging version changes. It’s important to consider row-level security (RLS) so that only authorized users can access the goal versions. 

After the SQL approval, I’ll update the dashboard to display weights and alignment scores and introduce new UI components for version history. The lov-sql block will be crafted to ensure everything is valid and safe before executing it. Let's move forward!" duration="8.497108">
</lov-tool-use>

<lov-tool-use id="thinking-c378e00b-ef28-4eee-a087-5c5c429f53cf" name="lov-think" data="**Preparing trigger function and RLS policies**

I'm putting together the trigger function for logging goal versions. For this, I'll set up an RLS policy on `goal_versions` and ensure it supports actions like create, update, and delete while storing the actor's employee ID.

I'll create the function `log_goal_version` that handles different operations. It will find the next version number and insert the appropriate records into `goal_versions`. I'll also ensure that an index is created for efficiency.

Even if no changes occur during an update, I'll log those actions as well. This is looking good; let's finalize the details!" duration="2.626053">
</lov-tool-use>
Great focus. You’ve identified two root gaps causing issues in the goals area:

- Weighted importance and alignment scoring: UI/types expect weight (and we’ll surface alignment_score), but DB doesn’t have them. This breaks useGoals and ManagerGoalsDashboard.
- Version history and change tracking: We need goal-specific versioning + snapshots to support a diff viewer.

Here’s the plan to fix both in two phases: DB first (to unblock the app), then UI wiring.

<lov-plan>
Phase 1 — Database changes (unblocks current bugs)
- Add weight and alignment_score to public.goals
- Add year to public.goals to satisfy existing queries/filters
- Add weight and progress to public.goal_assignments (code already selects these; this prevents SELECT errors and enables per-assignee progress/weight overrides)
- Backfill assignment weights from goal.weight for existing records
- Create goal_versions table, with triggers to snapshot on INSERT/UPDATE/DELETE (stores version_number, actor, timestamp, and JSON snapshot)
- Add RLS to goal_versions so only users who can see the goal can see its versions

Phase 2 — Code updates (after SQL)
- useGoals.ts: 
  - Keep selecting assignment-level weight and progress, but fallback to goal.weight
  - Add alignment_score and year to returned data
- ManagerGoalsDashboard:
  - Ensure Weight column displays assignment weight (fallback to goal weight)
  - Add Alignment Score column and detail view field
- Goal edit/create flows:
  - Add fields for weight (0–100) and alignment_score (0–100)
- Version history UI:
  - Add a GoalHistory drawer/panel to list versions (version_number, changed_by, changed_at)
  - Add a simple diff viewer (compare consecutive snapshots in frontend; no backend change needed)
</lov-plan>

If you approve, I’ll run the SQL below. Once it’s applied, I’ll wire the UI and hook updates.

<lov-sql>
-- 1) Add weighted importance and alignment scoring to goals
ALTER TABLE public.goals
  ADD COLUMN IF NOT EXISTS weight integer NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS alignment_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS year integer;

-- 2) Add per-assignment weight and progress (to match current code paths and enable overrides)
ALTER TABLE public.goal_assignments
  ADD COLUMN IF NOT EXISTS weight integer,
  ADD COLUMN IF NOT EXISTS progress integer NOT NULL DEFAULT 0;

-- Backfill assignment weight from goal default weight for existing rows
UPDATE public.goal_assignments ga
SET weight = g.weight
FROM public.goals g
WHERE ga.goal_id = g.id
  AND ga.weight IS NULL;

-- 3) Goal versioning: history snapshots and change tracking
CREATE TABLE IF NOT EXISTS public.goal_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  changed_by uuid, -- employee_info.id of the actor (nullable for system ops)
  changed_at timestamptz NOT NULL DEFAULT now(),
  change_type text NOT NULL DEFAULT 'update', -- 'create' | 'update' | 'delete'
  change_summary text,
  data jsonb NOT NULL
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_goal_versions_goal_id ON public.goal_versions(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_versions_goal_id_version ON public.goal_versions(goal_id, version_number DESC);

-- Enable RLS and grant read access only if caller can see the underlying goal
ALTER TABLE public.goal_versions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'goal_versions'
      AND policyname = 'Users can view goal versions for accessible goals'
  ) THEN
    CREATE POLICY "Users can view goal versions for accessible goals"
      ON public.goal_versions
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM public.goals g
          WHERE g.id = goal_versions.goal_id
          -- goals RLS will ensure the user can only see versions for goals they can access
        )
      );
  END IF;
END$$;

-- 4) Trigger to log versions on INSERT/UPDATE/DELETE
CREATE OR REPLACE FUNCTION public.log_goal_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_next int;
  v_actor uuid;
BEGIN
  -- Resolve current employee id if available
  BEGIN
    v_actor := public.get_current_employee_id();
  EXCEPTION WHEN OTHERS THEN
    v_actor := NULL;
  END;

  IF TG_OP = 'INSERT' THEN
    SELECT COALESCE(MAX(version_number), 0) + 1
      INTO v_next
    FROM public.goal_versions
    WHERE goal_id = NEW.id;

    INSERT INTO public.goal_versions (goal_id, version_number, changed_by, change_type, data)
    VALUES (NEW.id, v_next, v_actor, 'create', to_jsonb(NEW));

    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    SELECT COALESCE(MAX(version_number), 0) + 1
      INTO v_next
    FROM public.goal_versions
    WHERE goal_id = NEW.id;

    INSERT INTO public.goal_versions (goal_id, version_number, changed_by, change_type, data)
    VALUES (NEW.id, v_next, v_actor, 'update', to_jsonb(NEW));

    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    SELECT COALESCE(MAX(version_number), 0) + 1
      INTO v_next
    FROM public.goal_versions
    WHERE goal_id = OLD.id;

    INSERT INTO public.goal_versions (goal_id, version_number, changed_by, change_type, data)
    VALUES (OLD.id, v_next, v_actor, 'delete', to_jsonb(OLD));

    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$function$;

-- Attach trigger to goals table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_log_goal_version'
  ) THEN
    CREATE TRIGGER trg_log_goal_version
    AFTER INSERT OR UPDATE OR DELETE ON public.goals
    FOR EACH ROW
    EXECUTE FUNCTION public.log_goal_version();
  END IF;
END$$;
