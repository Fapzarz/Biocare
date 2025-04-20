-- Drop and recreate doctor verification requests table with proper relationships
DROP TABLE IF EXISTS public.doctor_verification_requests CASCADE;

CREATE TABLE public.doctor_verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  license_number text NOT NULL,
  license_document_url text NOT NULL,
  specialization text NOT NULL,
  hospital_name text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  submitted_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  processed_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE doctor_verification_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for doctor verification requests
CREATE POLICY "Doctors can view their own verification requests"
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

CREATE POLICY "Doctors can create verification requests"
ON doctor_verification_requests FOR INSERT
TO authenticated
WITH CHECK (
  doctor_id = auth.uid() AND
  NOT EXISTS (
    SELECT 1 FROM doctor_verification_requests
    WHERE doctor_id = auth.uid() AND status = 'pending'
  )
);

CREATE POLICY "Admin can manage verification requests"
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

-- Create trigger for updated_at
CREATE TRIGGER update_doctor_verification_requests_updated_at
  BEFORE UPDATE ON doctor_verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

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

-- Grant necessary permissions
GRANT ALL ON doctor_verification_requests TO authenticated;