import { defineConfig } from "vitest/config";
import path from "path";
import dotenv from "dotenv";

export default defineConfig(({ mode }) => {
  // IMPORTANT: Integration tests must load env vars from `.env.test` only.
  // Do not call Vite's `loadEnv()` here (it can pull from `.env`, `.env.local`, etc.).
  const envPath = path.resolve(process.cwd(), ".env.test");
  const dotEnvTest = dotenv.config({ path: envPath, override: true });

  if (dotEnvTest.error) {
    throw dotEnvTest.error;
  }

  // `dotenv.config()` already populates process.env; `parsed` is used to populate
  // Vitest's `import.meta.env` mirror via the `test.env` option below.
  const env = dotEnvTest.parsed ?? {};

  // Keep these available as plain process env vars too.
  const resolvedSupabaseUrl = env.VITE_SUPABASE_URL;
  const resolvedAnonKey = env.VITE_SUPABASE_ANON_KEY;
  const resolvedServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

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
