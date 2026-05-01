import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Use process.env (not import.meta.env) so the service role key is never
// bundled into the Vite client build. This file is for Node-based tests only.
const supabaseUrl =
  (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL) as string;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env var",
  );
}

export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

export default supabaseAdmin;
