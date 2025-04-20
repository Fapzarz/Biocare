/*
  # Doctor Verification System

  1. Changes
    - Creates doctor verification requests table
    - Adds RLS policies for verification management
    - Creates indexes for performance
    - Adds triggers for status changes

  2. Security
    - Enables RLS
    - Adds policies for doctors and admins
    - Ensures data integrity with proper constraints

  3. Notes
    - Safely handles existing policies
    - Includes proper error handling
*/

-- Safely drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Doctors can view their own verification requests" ON doctor_verification_requests;
  DROP POLICY IF EXISTS "Doctors can create verification requests" ON doctor_verification_requests;
  DROP POLICY IF EXISTS "Admin can update verification requests" ON doctor_verification_requests;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- Create doctor verification requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.doctor_verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  license_number text NOT NULL,
  license_document_url text NOT NULL,
  specialization text NOT NULL,
  hospital_name text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  submitted_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  processed_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS if not already enabled
ALTER TABLE doctor_verification_requests ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper checks
CREATE POLICY "Doctors view own requests"
ON doctor_verification_requests FOR SELECT
TO authenticated
USING (
  doctor_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND email = 'admin_Kj9#mP2$vL5@biocare.com'
  )
);

CREATE POLICY "Doctors submit requests"
ON doctor_verification_requests FOR INSERT
TO authenticated
WITH CHECK (
  doctor_id = auth.uid() AND
  NOT EXISTS (
    SELECT 1 FROM doctor_verification_requests
    WHERE doctor_id = auth.uid() AND status = 'pending'
  )
);

CREATE POLICY "Admin manages requests"
ON doctor_verification_requests FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND email = 'admin_Kj9#mP2$vL5@biocare.com'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND email = 'admin_Kj9#mP2$vL5@biocare.com'
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_doctor_verification_requests_doctor_id 
ON doctor_verification_requests(doctor_id);

CREATE INDEX IF NOT EXISTS idx_doctor_verification_requests_status 
ON doctor_verification_requests(status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_verification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_doctor_verification_requests_updated_at
  BEFORE UPDATE ON doctor_verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_verification_updated_at();

-- Create function to handle verification status changes
CREATE OR REPLACE FUNCTION handle_verification_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    -- Update user profile when approved
    UPDATE profiles
    SET 
      is_doctor = true,
      verification_status = 'verified',
      specialization = NEW.specialization,
      license_number = NEW.license_number
    WHERE id = NEW.doctor_id;

    -- Create notification for the doctor
    INSERT INTO notifications (
      user_id,
      type,
      title,
      content
    ) VALUES (
      NEW.doctor_id,
      'verification_status',
      'Verification Approved',
      'Your doctor verification request has been approved. You can now provide medical consultations.'
    );
  ELSIF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
    -- Create notification for rejection
    INSERT INTO notifications (
      user_id,
      type,
      title,
      content
    ) VALUES (
      NEW.doctor_id,
      'verification_status',
      'Verification Rejected',
      CASE 
        WHEN NEW.admin_notes IS NOT NULL 
        THEN 'Your doctor verification request was rejected. Reason: ' || NEW.admin_notes
        ELSE 'Your doctor verification request was rejected. Please contact support for more information.'
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for verification status changes
CREATE TRIGGER handle_verification_status_change_trigger
  AFTER UPDATE OF status ON doctor_verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_verification_status_change();