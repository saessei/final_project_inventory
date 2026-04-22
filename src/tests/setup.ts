import { beforeAll, beforeEach } from "vitest";
import { clearTestDatabase } from "./dbCleaner";

// Use process.env because Vitest injects the loaded envs there
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

beforeAll(() => {
  const missing: string[] = [];
  if (!supabaseUrl) missing.push("VITE_SUPABASE_URL");
  if (!serviceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");

  if (missing.length > 0) {
    throw new Error(
      `Missing required test environment variables: ${missing.join(", ")}. Configure them in CI secrets or a local .env.test file.`,
    );
  }
});

beforeEach(async () => {
  await clearTestDatabase();
});