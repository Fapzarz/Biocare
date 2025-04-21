import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { supabase as mockSupabase } from './mockSupabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const useMock = import.meta.env.VITE_USE_MOCK_SUPABASE === 'true';

if (!useMock && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error('Missing Supabase environment variables');
}

// Cache configuration
const CACHE_TIME = 5 * 60 * 1000; // 5 minutes
const cache: { [key: string]: { data: any; timestamp: number } } = {};

// Create client with improved retry logic and error handling
export const supabase = useMock
  ? mockSupabase
  : createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      fetch: async (url, options = {}) => {
        const MAX_RETRIES = 5;
        const INITIAL_RETRY_DELAY = 1000;
        const MAX_RETRY_DELAY = 30000; // 30 seconds max delay

        let lastError;
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
          try {
            const startTime = performance.now();

            // Check cache for GET requests
            if (options.method === 'GET') {
              const cacheKey = `${url}_${JSON.stringify(options)}`;
              const cached = cache[cacheKey];
              
              if (cached && Date.now() - cached.timestamp < CACHE_TIME) {
                return new Response(JSON.stringify(cached.data), {
                  headers: { 'Content-Type': 'application/json' }
                });
              }
            }

            // Add retry attempt header
            const headers = new Headers(options.headers);
            headers.set('X-Retry-Attempt', attempt.toString());
            options.headers = headers;

            // Exponential backoff with jitter
            if (attempt > 0) {
              const delay = Math.min(
                INITIAL_RETRY_DELAY * Math.pow(2, attempt) + Math.random() * 1000,
                MAX_RETRY_DELAY
              );
              await new Promise(resolve => setTimeout(resolve, delay));
            }

            const response = await fetch(url, {
              ...options,
              signal: AbortSignal.timeout(30000) // 30 second timeout
            });

            const endTime = performance.now();
            const duration = endTime - startTime;

            // Log performance metrics
            if (duration > 1000) {
              console.warn(`Slow API Call to ${url}: ${duration.toFixed(2)}ms`);
            } else {
              console.debug(`API Call to ${url}: ${duration.toFixed(2)}ms`);
            }

            // Cache successful GET responses
            if (options.method === 'GET' && response.ok) {
              const cacheKey = `${url}_${JSON.stringify(options)}`;
              const data = await response.clone().json();
              cache[cacheKey] = { data, timestamp: Date.now() };
            }

            // Handle rate limiting
            if (response.status === 429) {
              const retryAfter = parseInt(response.headers.get('Retry-After') || '5');
              await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
              continue;
            }

            // Handle authentication errors
            if (response.status === 401) {
              // Clear session and redirect to login
              await supabase.auth.signOut();
              window.location.href = '/';
              throw new Error('Authentication required');
            }

            // Handle other error responses
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response;
          } catch (error) {
            lastError = error;
            
            // Don't retry on client errors
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
              console.error('Network error:', error);
              throw new Error('Network error. Please check your connection.');
            }

            // Don't retry on authentication errors
            if (error instanceof Error && error.message === 'Authentication required') {
              throw error;
            }

            // Continue retrying for other errors
            if (attempt < MAX_RETRIES - 1) {
              continue;
            }
          }
        }

        console.error('API Error:', lastError);
        throw lastError;
      }
    }
  });

// Cache cleanup
setInterval(() => {
  const now = Date.now();
  Object.keys(cache).forEach(key => {
    if (now - cache[key].timestamp > CACHE_TIME) {
      delete cache[key];
    }
  });
}, CACHE_TIME);

// Performance monitoring
let totalRequests = 0;
let totalErrors = 0;
let avgResponseTime = 0;

export const getPerformanceMetrics = () => ({
  totalRequests,
  totalErrors,
  errorRate: totalRequests ? (totalErrors / totalRequests) * 100 : 0,
  avgResponseTime,
  cacheSize: Object.keys(cache).length
});

// Initialize database with default data if empty
export async function initializeDatabase() {
  try {
    // Check if the tables exist
    const { error: tablesError } = await checkTables();
    
    if (tablesError) {
      console.error('Error checking tables:', tablesError);
      return { error: tablesError };
    }
    
    // Create profiles if they don't exist
    const { error: profilesError } = await supabase.rpc('create_profiles_if_not_exists');
    
    if (profilesError) {
      console.error('Error creating profiles:', profilesError);
      return { error: profilesError };
    }
    
    return { error: null };
  } catch (error) {
    console.error('Error initializing database:', error);
    return { error };
  }
}

// Function to create user statistics for a new user
export async function createUserStatistics(userId: string) {
  try {
    // Check if user statistics already exist
    const { data, error: checkError } = await supabase
      .from('user_statistics')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking user statistics:', checkError);
      return { error: checkError };
    }
    
    // If statistics don't exist, create them
    if (!data) {
      const { error: insertError } = await supabase
        .from('user_statistics')
        .insert({
          id: userId,
          reputation_score: 0,
          total_consultations: 0,
          solutions_provided: 0,
          last_active: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('Error creating user statistics:', insertError);
        return { error: insertError };
      }
    }
    
    return { error: null };
  } catch (error) {
    console.error('Error in createUserStatistics:', error);
    return { error };
  }
}

// Function to check if required tables exist
async function checkTables() {
  try {
    // Check if profiles table exists
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (profilesError) {
      console.error('Error checking profiles table:', profilesError);
      return { error: profilesError };
    }
    
    // Check if diseases table exists
    const { error: diseasesError } = await supabase
      .from('diseases')
      .select('name')
      .limit(1);
    
    if (diseasesError) {
      console.error('Error checking diseases table:', diseasesError);
      return { error: diseasesError };
    }
    
    return { error: null };
  } catch (error) {
    console.error('Error checking tables:', error);
    return { error };
  }
}

// Call initializeDatabase when the app starts
initializeDatabase().catch(console.error);