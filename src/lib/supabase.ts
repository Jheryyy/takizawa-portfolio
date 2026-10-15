import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bpzsqyqyhawwosoyfveb.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_POoJAifWG1AoPgthKloNrw_jVbaCt3U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
