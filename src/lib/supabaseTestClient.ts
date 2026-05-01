import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseServiceRoleKey = (import.meta.env
  .VITE_SUPABASE_SERVICE_ROLE_KEY ??
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY) as string;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY env var",
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
