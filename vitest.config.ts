import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const resolvedSupabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const resolvedAnonKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const resolvedServiceRoleKey =
    env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (resolvedSupabaseUrl) process.env.VITE_SUPABASE_URL = resolvedSupabaseUrl;
  if (resolvedAnonKey) process.env.VITE_SUPABASE_ANON_KEY = resolvedAnonKey;
  if (resolvedServiceRoleKey) process.env.SUPABASE_SERVICE_ROLE_KEY = resolvedServiceRoleKey;
  
  return {
    test: {
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/.{idea,git,cache,output,temp}/**",
        "**/*.spec.ts",
      ],
      environment: "jsdom",
      globals: true,
      setupFiles: [path.resolve(__dirname, "./src/tests/setup.ts")],
      env: {
        ...env,
        VITE_SUPABASE_URL: resolvedSupabaseUrl,
        VITE_SUPABASE_ANON_KEY: resolvedAnonKey,
        SUPABASE_SERVICE_ROLE_KEY: resolvedServiceRoleKey,
      },
    },
  };
});
