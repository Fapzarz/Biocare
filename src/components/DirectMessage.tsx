import React, { useState, useEffect, useRef } from 'react';
import { Send, Lock, Clock, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { encryption } from '../lib/encryption';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  encrypted_content: string;
  created_at: string;
}

interface DirectMessageProps {
  currentUserId: string;
  recipientId: string;
  recipientName: string;
  onClose: () => void;
}

export function DirectMessage({ 
  currentUserId, 
  recipientId, 
  recipientName,
  onClose 
}: DirectMessageProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipientPublicKey, setRecipientPublicKey] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeEncryption();
    loadMessages();
    subscribeToMessages();
  }, [currentUserId, recipientId]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeEncryption = async () => {
    try {
      await encryption.init();
      
      // Get recipient's public key
      const { data: profile, error: keyError } = await supabase
        .from('user_keys')
        .select('public_key')
        .eq('user_id', recipientId)
        .single();

      if (keyError) throw keyError;
      if (!profile?.public_key) throw new Error('Recipient public key not found');

      setRecipientPublicKey(profile.public_key);

      // Store current user's public key if not exists
      const myPublicKey = encryption.getPublicKey();
      const { error: storeError } = await supabase
        .from('user_keys')
        .upsert({
          user_id: currentUserId,
          public_key: myPublicKey
        });

      if (storeError) throw storeError;
    } catch (err) {
      setError('Failed to initialize encryption');
      console.error('Encryption initialization error:', err);
    }
  };

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (err) {
      setError('Failed to load messages');
      console.error('Error loading messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('direct_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `recipient_id=eq.${currentUserId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !recipientPublicKey) return;

    try {
      const encryptedContent = await encryption.encrypt(
        newMessage.trim(),
        recipientPublicKey
      );

      const { error } = await supabase
        .from('direct_messages')
        .insert([{
          sender_id: currentUserId,
          recipient_id: recipientId,
          encrypted_content: encryptedContent
        }]);

      if (error) throw error;

      setNewMessage('');
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    }
  };

  const decryptMessage = async (message: Message) => {
    try {
      const { data: senderKey } = await supabase
        .from('user_keys')
        .select('public_key')
        .eq('user_id', message.sender_id)
        .single();

      if (!senderKey?.public_key) throw new Error('Sender public key not found');

      return await encryption.decrypt(
        message.encrypted_content,
        senderKey.public_key
      );
    } catch (err) {
      console.error('Error decrypting message:', err);
      return '[Failed to decrypt message]';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {recipientName}
            </h2>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Lock className="h-4 w-4" />
              <span>End-to-end encrypted</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map(async (message) => {
              const isOwnMessage = message.sender_id === currentUserId;
              const decryptedContent = await decryptMessage(message);

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isOwnMessage
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    <p>{decryptedContent}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs opacity-70">
                      <Clock className="h-3 w-3" />
                      {new Date(message.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-4 bg-red-50 dark:bg-red-900/50 border-t border-red-200 dark:border-red-800"
            >
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message Input */}
        <form onSubmit={sendMessage} className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-slate-900 dark:text-slate-100 focus:border-rose-500 focus:ring-rose-500"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}