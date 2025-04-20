-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can read responses" ON consultation_responses;
DROP POLICY IF EXISTS "Authenticated users can create responses" ON consultation_responses;
DROP POLICY IF EXISTS "Users can update their own responses" ON consultation_responses;
DROP POLICY IF EXISTS "Users can delete their own responses" ON consultation_responses;

-- Create new policies with proper checks
CREATE POLICY "Anyone can read responses"
ON consultation_responses FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can create responses"
ON consultation_responses FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own responses"
ON consultation_responses FOR UPDATE
TO authenticated
USING (author_id = auth.uid())
WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete their own responses"
ON consultation_responses FOR DELETE
TO authenticated
USING (author_id = auth.uid());

-- Grant necessary permissions
GRANT ALL ON consultation_responses TO authenticated;

-- Enable RLS if not already enabled
ALTER TABLE consultation_responses ENABLE ROW LEVEL SECURITY;