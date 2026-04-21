import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL 
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY 
// 1. Get the Service Role Key
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY 

const missing: string[] = [];
if (!supabaseUrl) missing.push("VITE_SUPABASE_URL");
if (!supabaseKey) missing.push("VITE_SUPABASE_ANON_KEY");
if (!serviceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");

if (missing.length > 0) {
  throw new Error(
    `Missing required Supabase test environment variables: ${missing.join(", ")}`,
  );
}

// Client for simulating a NORMAL user (Barista)
export const supabaseTest = createClient(supabaseUrl!, supabaseKey!, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
})

export const supabaseAdmin = createClient(supabaseUrl!, serviceRoleKey!, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
})