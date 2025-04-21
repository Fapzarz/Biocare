// mockSupabase.ts - local mock implementation of Supabase client for auth and data operations

// Mock auth methods
const mockAuth = {
  signInWithPassword: async (opts: any) => ({ data: { user: { id: 'mock_user', ...opts } }, error: null }),
  signOut: async () => ({ error: null }),
  onAuthStateChange: (_: any, callback: (event: string, session: any) => void) => {
    const subscription = { data: { event: 'SIGNED_IN', session: null } };
    callback('SIGNED_IN', null);
    return { subscription };
  }
};

const mockFrom = (_table: string) => ({
  select: async () => ({ data: [], error: null }),
  insert: async (items: any) => ({ data: items, error: null }),
  update: async (updates: any) => ({ data: updates, error: null }),
  delete: async () => ({ data: [], error: null }),
  single: async () => ({ data: null, error: null })
});

const mockRpc = async (_fn: string) => ({ data: null, error: null });

const mockStorage = {
  from: (_bucket: string) => ({
    upload: async (_path: string, _file: any) => ({ data: null, error: null }),
    download: async (_path: string) => ({ data: null, error: null }),
    remove: async (_paths: string[]) => ({ data: null, error: null })
  })
};

const mockChannel = (_name?: string) => ({
  subscribe: async () => ({ data: null, error: null }),
  on: (_event: string, _callback: any) => ({
    subscribe: async () => ({ data: null, error: null })
  })
});

export const supabase = {
  auth: mockAuth,
  from: mockFrom,
  rpc: mockRpc,
  storage: mockStorage,
  channel: mockChannel
};
