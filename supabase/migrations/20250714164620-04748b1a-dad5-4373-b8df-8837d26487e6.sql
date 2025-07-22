-- Insert a default organization for initial setup
INSERT INTO public.organizations (name, domain) 
VALUES ('Default Organization', NULL)
ON CONFLICT DO NOTHING;

