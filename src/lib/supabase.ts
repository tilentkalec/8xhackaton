import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// pots-hackathon Supabase project (eu-central-1).
// Open RLS policies are DEMO ONLY — do not ship.
const SUPABASE_URL = 'https://wyhfiqgdmbwzhbhlltjy.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5aGZpcWdkbWJ3emhiaGxsdGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNDQ0MjQsImV4cCI6MjA5NjkyMDQyNH0.WI1M62vwyuIJxnQavUV2RL4XA_MzDdhLcw6nmAEWuGg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
