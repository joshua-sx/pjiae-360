-- Enable leaked password protection
UPDATE auth.config SET
  password_required_characters = 8,
  enable_password_strength = true,
  password_strength_threshold = 2,
  enable_password_breach_check = true
WHERE project_id = current_setting('app.current_project');