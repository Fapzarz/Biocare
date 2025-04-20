-- Create test doctor account
DO $$ 
DECLARE
  v_user_id uuid;
BEGIN
  -- Create auth user for test doctor
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'doctor_test@biocare.com',
    crypt('Doctor123!@#', gen_salt('bf', 12)),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "doctor"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO v_user_id;

  -- Create profile for test doctor
  INSERT INTO profiles (
    id,
    full_name,
    is_doctor,
    verification_status,
    specialization,
    license_number,
    reputation_score
  ) VALUES (
    v_user_id,
    'Dr. Test Account',
    true,
    'verified',
    'General Medicine',
    'TEST-123-456',
    1000
  );

  -- Add initial achievements
  INSERT INTO user_achievements (user_id, badge_id, level)
  SELECT 
    v_user_id,
    id,
    1
  FROM user_badges
  WHERE name IN ('Newcomer', 'Helper');

EXCEPTION
  WHEN unique_violation THEN
    -- Account already exists, do nothing
    NULL;
END $$;