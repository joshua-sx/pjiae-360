-- Enable leaked password protection and strengthen auth security
-- This addresses the security linter warning

-- Enable leaked password protection
INSERT INTO auth.config (parameter, value) 
VALUES ('password_min_length', '12') 
ON CONFLICT (parameter) DO UPDATE SET value = '12';

INSERT INTO auth.config (parameter, value) 
VALUES ('password_require_uppercase', 'true') 
ON CONFLICT (parameter) DO UPDATE SET value = 'true';

INSERT INTO auth.config (parameter, value) 
VALUES ('password_require_lowercase', 'true') 
ON CONFLICT (parameter) DO UPDATE SET value = 'true';

INSERT INTO auth.config (parameter, value) 
VALUES ('password_require_numbers', 'true') 
ON CONFLICT (parameter) DO UPDATE SET value = 'true';

INSERT INTO auth.config (parameter, value) 
VALUES ('password_require_special', 'true') 
ON CONFLICT (parameter) DO UPDATE SET value = 'true';

-- Enable leaked password protection
INSERT INTO auth.config (parameter, value) 
VALUES ('password_leaked_prevention', 'true') 
ON CONFLICT (parameter) DO UPDATE SET value = 'true';