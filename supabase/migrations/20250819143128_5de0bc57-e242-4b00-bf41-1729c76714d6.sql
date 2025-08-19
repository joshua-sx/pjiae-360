-- Add cron job for invite reminders (runs daily at 9 AM UTC)
SELECT cron.schedule(
  'invite-reminders-daily',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://vtmwhvxdgrvaegprmkwg.supabase.co/functions/v1/invite-reminders',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);