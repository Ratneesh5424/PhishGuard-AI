import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (import.meta.env?.VITE_SUPABASE_URL || 'https://briwdskbldjghcihhvjp.supabase.co').trim();
const SUPABASE_ANON_KEY = (import.meta.env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_4RzuMu8R3ApEWWX57teTuw_1lTP6p-u').trim();

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
