import { defineConfig } from "vitest/config";
import path from "path";
import dotenv from "dotenv";

export default defineConfig(() => {
  const envPath = path.resolve(process.cwd(), ".env.test");
  const dotEnvTest = dotenv.config({ path: envPath, override: true });

  if (dotEnvTest.error) {
    throw dotEnvTest.error;
  }

  const env = dotEnvTest.parsed ?? {};

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
      env: {                                          // ← replaces the broken "happy-dom" string
        VITE_SUPABASE_URL: env.VITE_SUPABASE_URL ?? "",
        VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY ?? "",
        VITE_SUPABASE_SERVICE_ROLE_KEY: env.VITE_SUPABASE_SERVICE_ROLE_KEY ?? "",
        TEST_USER_EMAIL: env.TEST_USER_EMAIL ?? "",
        TEST_USER_PASSWORD: env.TEST_USER_PASSWORD ?? "",
      },
      envDir: ".",
    },
  };
});
