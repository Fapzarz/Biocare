import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

// Mock Supabase client
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn()
    },
    from: vi.fn(() => ({
      upsert: vi.fn(),
      select: vi.fn(),
      single: vi.fn()
    }))
  }
}));

describe('auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signIn', () => {
    it('signs in successfully with valid credentials', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        email_confirmed_at: new Date().toISOString()
      };

      const mockSession = {
        access_token: 'token',
        refresh_token: 'refresh'
      };

      // Mock successful sign in
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      // Mock profile upsert
      vi.mocked(supabase.from).mockReturnValue({
        upsert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { full_name: 'Test User' },
              error: null
            })
          })
        })
      } as any);

      const result = await auth.signIn('test@example.com', 'password');

      expect(result).toBeTruthy();
      expect(result?.email).toBe('test@example.com');
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
        options: { data: { remember_me: false } }
      });
    });

    it('throws error for unverified email', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        email_confirmed_at: null
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null
      });

      await expect(auth.signIn('test@example.com', 'password'))
        .rejects
        .toThrow('Please verify your email first');
    });
  });
});