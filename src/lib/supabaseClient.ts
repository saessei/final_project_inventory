// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

// Helper to get env from either Vite or Node context
const getEnv = (key: string) => import.meta.env[key] || process.env[key];

const supabaseUrl = getEnv("VITE_SUPABASE_URL");

// Logic: Use Service Role for tests (God Mode), Anon for everything else
const isTest = import.meta.env.MODE === 'test' || process.env.NODE_ENV === 'test';

const supabaseKey = isTest 
  ? getEnv("SUPABASE_SERVICE_ROLE_KEY") 
  : getEnv("VITE_SUPABASE_ANON_KEY");

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: !isTest, // Disable for tests to prevent localStorage leaks
    // In jsdom/vitest, window is defined, but localStorage might be empty
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

export default supabase;