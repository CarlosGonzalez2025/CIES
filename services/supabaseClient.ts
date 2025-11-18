
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://czszsegsoigpxtfyplsl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6c3pzZWdzb2lncHh0ZnlwbHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNDMwMzAsImV4cCI6MjA3ODYxOTAzMH0.mf5gFJT-mqByUoWkMxcDsLECjGh02sglEHDRMfHS4hU';

// Fallback to process.env if available, otherwise use hardcoded values from user
const finalSupabaseUrl = process.env.VITE_SUPABASE_URL || supabaseUrl;
const finalSupabaseKey = process.env.VITE_SUPABASE_ANON_KEY || supabaseAnonKey;

if (!finalSupabaseUrl || !finalSupabaseKey) {
  throw new Error('Supabase URL and Anon Key must be provided.');
}

export const supabase = createClient(finalSupabaseUrl, finalSupabaseKey);
