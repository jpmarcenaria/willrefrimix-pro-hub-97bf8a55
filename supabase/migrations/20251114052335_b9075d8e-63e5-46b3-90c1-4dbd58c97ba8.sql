-- Grant admin role to refrimixtecnologia@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('bf13f975-9c4f-43b8-855d-de2b68ce0de7', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;