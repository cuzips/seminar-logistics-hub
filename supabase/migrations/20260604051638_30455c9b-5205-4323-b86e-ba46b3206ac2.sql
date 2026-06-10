
DO $$
DECLARE
  demo RECORD;
  uid uuid;
BEGIN
  FOR demo IN SELECT * FROM (VALUES
    ('coordinator@trainingsinc.vn', 'Nguyễn Điều Phối', 'coordinator'),
    ('sales@trainingsinc.vn',       'Trần Kinh Doanh',  'sales_manager'),
    ('consultant@trainingsinc.vn',  'Lê Giảng Viên',    'consultant'),
    ('materials@trainingsinc.vn',   'Phạm Vật Tư',      'materials')
  ) AS t(email, full_name, role)
  LOOP
    SELECT id INTO uid FROM auth.users WHERE email = demo.email;
    IF uid IS NULL THEN
      uid := gen_random_uuid();
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
        created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
      ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        demo.email, crypt('Demo@1234', gen_salt('bf')),
        now(),
        jsonb_build_object('provider','email','providers', jsonb_build_array('email')),
        jsonb_build_object('full_name', demo.full_name, 'role', demo.role),
        now(), now(), '', '', '', ''
      );
      INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
      VALUES (gen_random_uuid(), uid,
        jsonb_build_object('sub', uid::text, 'email', demo.email, 'email_verified', true),
        'email', uid::text, now(), now(), now());
    END IF;

    INSERT INTO public.profiles (id, full_name, email)
    VALUES (uid, demo.full_name, demo.email)
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, email = EXCLUDED.email;

    DELETE FROM public.user_roles WHERE user_id = uid;
    INSERT INTO public.user_roles (user_id, role) VALUES (uid, demo.role::public.app_role);
  END LOOP;
END $$;
