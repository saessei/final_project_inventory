import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import path from "path";
import dotenv from "dotenv";

export default defineConfig(({ mode }) => {
  // Vitest uses Vite's env system, but integration tests need to reliably
  // pick up values from `.env.test` (even if the mode isn't `test`).
  const dotEnvTest = dotenv.config({
    path: path.resolve(process.cwd(), ".env.test"),
    override: true,
  }).parsed;

  // Load Vite env for the active mode, then overlay `.env.test` on top.
  // This keeps parity with the app while ensuring test env always wins.
  const env = {
    ...loadEnv(mode, process.cwd(), ""),
    ...(dotEnvTest ?? {}),
  };

  const resolvedSupabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const resolvedAnonKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const resolvedServiceRoleKey =
    env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (resolvedSupabaseUrl) process.env.VITE_SUPABASE_URL = resolvedSupabaseUrl;
  if (resolvedAnonKey) process.env.VITE_SUPABASE_ANON_KEY = resolvedAnonKey;
  if (resolvedServiceRoleKey) process.env.SUPABASE_SERVICE_ROLE_KEY = resolvedServiceRoleKey;
  
  return {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    test: {
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/.{idea,git,cache,output,temp}/**",
        "**/*.spec.ts",
      ],
      environment: "jsdom",
      globals: true,
      setupFiles: [path.resolve(__dirname, "./src/__tests__/setup.ts")],
      env: {
        ...env,
        VITE_SUPABASE_URL: resolvedSupabaseUrl,
        VITE_SUPABASE_ANON_KEY: resolvedAnonKey,
        SUPABASE_SERVICE_ROLE_KEY: resolvedServiceRoleKey,
      },
    },
  };
});
