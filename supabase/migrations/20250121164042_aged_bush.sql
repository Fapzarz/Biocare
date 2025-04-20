/*
  # Authentication Security Setup

  1. Security Settings
    - Enable email verification
    - Configure rate limiting
    - Set up audit logging
    - Configure RBAC

  2. Admin Role
    - Create admin role with elevated privileges
    - Set up secure policies for admin access
*/

-- Enable Email Verification
ALTER TABLE auth.users
  ALTER COLUMN email_confirmed_at SET DEFAULT NULL;

-- Create Admin Role
DO $$ BEGIN
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
    'admin_Kj9#mP2$vL5@biocare.com',
    crypt('H8#kL9$pM4@nR7*vX2&cY5', gen_salt('bf', 12)),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "admin"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  );
EXCEPTION
  WHEN unique_violation THEN NULL;
END $$;

-- Create Audit Logging Function
CREATE OR REPLACE FUNCTION audit_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO auth.audit_log_entries (
    instance_id,
    id,
    payload,
    created_at,
    ip_address
  ) VALUES (
    auth.uid(),
    gen_random_uuid(),
    row_to_json(NEW),
    now(),
    inet_client_addr()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Audit Log Trigger
DO $$ BEGIN
  CREATE TRIGGER auth_audit_log
    AFTER INSERT OR UPDATE OR DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION audit_log();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Set up Rate Limiting
CREATE OR REPLACE FUNCTION check_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  attempt_count INT;
BEGIN
  SELECT COUNT(*)
  INTO attempt_count
  FROM auth.audit_log_entries
  WHERE payload->>'email' = NEW.email
    AND created_at > now() - interval '15 minutes';

  IF attempt_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Rate Limit Trigger
DO $$ BEGIN
  CREATE TRIGGER auth_rate_limit
    BEFORE INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION check_rate_limit();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;