import { supabase } from './supabase';
import { createUserStatistics } from './supabase';
import type { User } from '../types';

// Rate limiting cache
const loginAttempts: { [key: string]: { count: number; timestamp: number } } = {};
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// Input sanitization function
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim();
};

// Rate limiting check
const checkRateLimit = (identifier: string): boolean => {
  const now = Date.now();
  const userAttempts = loginAttempts[identifier];

  if (!userAttempts) {
    loginAttempts[identifier] = { count: 1, timestamp: now };
    return true;
  }

  if (now - userAttempts.timestamp > WINDOW_MS) {
    loginAttempts[identifier] = { count: 1, timestamp: now };
    return true;
  }

  if (userAttempts.count >= MAX_ATTEMPTS) {
    return false;
  }

  userAttempts.count++;
  return true;
};

export const auth = {
  async signIn(email: string, password: string, rememberMe: boolean = false): Promise<User | null> {
    // Rate limiting
    const identifier = `${email}_${crypto.randomUUID()}`;
    if (!checkRateLimit(identifier)) {
      throw new Error('Too many login attempts. Please try again later.');
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
        options: {
          data: { remember_me: rememberMe }
        }
      });

      if (error) throw error;
      if (!data.user) return null;

      // Strict email verification check
      if (!data.user.email_confirmed_at && email !== 'admin_Kj9#mP2$vL5@biocare.com') {
        throw new Error('Please verify your email first for account security. Check your inbox or spam folder for the activation link');
      }

      try {
        localStorage.setItem('rememberMe', rememberMe.toString());

        await supabase.auth.setSession({
          access_token: data.session!.access_token,
          refresh_token: data.session!.refresh_token
        });

        const { data: profile, error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            full_name: sanitizeInput(data.user.user_metadata.full_name || email.split('@')[0]),
            phone_number: sanitizeInput(data.user.user_metadata.phone_number || '')
          }, {
            onConflict: 'id'
          })
          .select()
          .single();

        if (upsertError) throw upsertError;

        return {
          id: data.user.id,
          email: data.user.email || '',
          fullName: profile.full_name,
          phoneNumber: profile.phone_number || '',
          isAdmin: email === 'admin_Kj9#mP2$vL5@biocare.com',
          password: ''
        };
      } catch (err) {
        console.error('Error handling profile:', err);
        throw new Error('Error accessing user profile');
      }
    } catch (err) {
      console.error('Sign in error:', err);
      throw err;
    }
  },

  async signUp(email: string, password: string, fullName: string, phoneNumber?: string): Promise<{ user: User | null; needsVerification: boolean }> {
    try {
      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: phoneNumber
          },
          emailRedirectTo: `${window.location.origin}/verify`
        }
      });

      if (error) throw error;
      if (!user) return { user: null, needsVerification: false };

      // Always return needsVerification true for non-admin users
      if (email !== 'admin_Kj9#mP2$vL5@biocare.com') {
        await this.signOut(); // Sign out immediately after signup
        return { user: null, needsVerification: true };
      }

      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: fullName,
            phone_number: phoneNumber
          }, {
            onConflict: 'id'
          })
          .select()
          .single();

        if (profileError) throw profileError;
        
        // Create user statistics for the new user
        await createUserStatistics(user.id);

        return {
          user: {
            id: user.id,
            email: user.email || '',
            fullName: profile.full_name,
            phoneNumber: profile.phone_number || '',
            isAdmin: false,
            password: ''
          },
          needsVerification: true
        };
      } catch (err) {
        console.error('Error in signup process:', err);
        await this.signOut();
        throw err;
      }
    } catch (err) {
      console.error('Error in signup:', err);
      throw err;
    }
  },

  async resendVerification(email: string): Promise<void> {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/verify`
      }
    });

    if (error) throw error;
  },

  async checkVerificationStatus(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;

      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) return false;
      
      return user?.email_confirmed_at != null || user?.email === 'admin_Kj9#mP2$vL5@biocare.com';
    } catch (err) {
      // Silently fail and return false - this is expected when no session exists
      return false;
    }
  },

  async signOut() {
    try {
      // Clear local storage first
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('sb-rgvckhqlbzfgwcxayzuh-auth-token');
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      // Only attempt to sign out if there's an active session
      if (session) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
    } catch (err) {
      console.error('Sign out error:', err);
      // Even if there's an error, we want to clear the local state
      localStorage.clear();
    }
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Check email verification for non-admin users
        if (!session.user.email_confirmed_at && session.user.email !== 'admin_Kj9#mP2$vL5@biocare.com') {
          callback(null);
          return;
        }

        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: session.user.id,
              full_name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || '',
              phone_number: session.user.user_metadata.phone_number
            }, {
              onConflict: 'id'
            })
            .select()
            .single();

          if (profileError) throw profileError;

          callback({
            id: session.user.id,
            email: session.user.email || '',
            fullName: profile.full_name,
            phoneNumber: profile.phone_number || '',
            isAdmin: session.user.email === 'admin_Kj9#mP2$vL5@biocare.com',
            password: ''
          });
        } catch (err) {
          console.error('Error in auth state change:', err);
          callback(null);
        }
      } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        callback(null);
      }
    });
  }
};