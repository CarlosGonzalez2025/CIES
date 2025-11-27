
import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallback for production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://czszsegsoigpxtfyplsl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6c3pzZWdzb2lncHh0ZnlwbHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNDMwMzAsImV4cCI6MjA3ODYxOTAzMH0.mf5gFJT-mqByUoWkMxcDsLECjGh02sglEHDRMfHS4hU';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
