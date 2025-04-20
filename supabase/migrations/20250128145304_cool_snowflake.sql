-- Drop existing objects if they exist
DO $$ BEGIN
  -- Drop policies
  DROP POLICY IF EXISTS "Users can view their messages" ON direct_messages;
  DROP POLICY IF EXISTS "Users can send messages" ON direct_messages;
  
  -- Drop trigger
  DROP TRIGGER IF EXISTS update_direct_messages_updated_at ON direct_messages;
  
  -- Drop tables
  DROP TABLE IF EXISTS conversation_reads CASCADE;
  DROP TABLE IF EXISTS direct_messages CASCADE;
  
  -- Drop function
  DROP FUNCTION IF EXISTS get_conversations CASCADE;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create direct_messages table with proper relationships
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  encrypted_content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for direct_messages
CREATE POLICY "Users can view their messages"
ON direct_messages FOR SELECT
TO authenticated
USING (
  auth.uid() = sender_id OR 
  auth.uid() = recipient_id
);

CREATE POLICY "Users can send messages"
ON direct_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_recipient ON direct_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON direct_messages(created_at);

-- Create trigger for updated_at
CREATE TRIGGER update_direct_messages_updated_at
  BEFORE UPDATE ON direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Grant necessary permissions
GRANT ALL ON direct_messages TO authenticated;

-- Create function to get conversations
CREATE OR REPLACE FUNCTION get_conversations(p_user_id uuid)
RETURNS TABLE (
  conversation_id uuid,
  other_user_id uuid,
  other_user_name text,
  last_message text,
  last_message_time timestamptz,
  unread_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH conversations AS (
    SELECT DISTINCT
      CASE 
        WHEN sender_id = p_user_id THEN recipient_id
        ELSE sender_id
      END as other_id
    FROM direct_messages
    WHERE sender_id = p_user_id OR recipient_id = p_user_id
  ),
  last_messages AS (
    SELECT 
      id,
      CASE 
        WHEN sender_id = p_user_id THEN recipient_id
        ELSE sender_id
      END as other_id,
      encrypted_content,
      created_at,
      ROW_NUMBER() OVER (
        PARTITION BY 
          CASE 
            WHEN sender_id = p_user_id THEN recipient_id
            ELSE sender_id
          END 
        ORDER BY created_at DESC
      ) as rn
    FROM direct_messages
    WHERE sender_id = p_user_id OR recipient_id = p_user_id
  )
  SELECT 
    lm.id as conversation_id,
    c.other_id as other_user_id,
    p.full_name as other_user_name,
    lm.encrypted_content as last_message,
    lm.created_at as last_message_time,
    COUNT(dm.id) FILTER (
      WHERE dm.recipient_id = p_user_id 
      AND dm.created_at > COALESCE(
        (SELECT last_read_at 
         FROM conversation_reads 
         WHERE user_id = p_user_id 
         AND other_user_id = c.other_id),
        '1970-01-01'::timestamptz
      )
    ) as unread_count
  FROM conversations c
  JOIN profiles p ON p.id = c.other_id
  LEFT JOIN last_messages lm ON lm.other_id = c.other_id AND lm.rn = 1
  LEFT JOIN direct_messages dm ON (
    dm.sender_id = c.other_id 
    AND dm.recipient_id = p_user_id
  )
  GROUP BY lm.id, c.other_id, p.full_name, lm.encrypted_content, lm.created_at;
END;
$$;

-- Create conversation_reads table to track read status
CREATE TABLE IF NOT EXISTS public.conversation_reads (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  other_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  last_read_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, other_user_id)
);

-- Enable RLS on conversation_reads
ALTER TABLE conversation_reads ENABLE ROW LEVEL SECURITY;

-- Create policies for conversation_reads
CREATE POLICY "Users can manage their read status"
ON conversation_reads
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Grant execute permission on function
GRANT EXECUTE ON FUNCTION get_conversations TO authenticated;