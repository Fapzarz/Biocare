-- Drop existing check constraint
ALTER TABLE notifications
DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add new check constraint with 'new_like' type
ALTER TABLE notifications
ADD CONSTRAINT notifications_type_check
CHECK (type IN (
  'new_response',
  'solution_marked',
  'verification_status',
  'achievement_earned',
  'new_like'
));

-- Grant necessary permissions
GRANT ALL ON notifications TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;