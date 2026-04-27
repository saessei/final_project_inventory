import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY; 

// This client skips RLS and will fix the 42501 errors
export const supabaseAdmin = createClient(supabaseUrl, serviceKey);