import { beforeAll, afterAll } from "vitest";
import path from "path";
import dotenv from "dotenv";

const envPath = path.resolve(process.cwd(), ".env.test");
const result = dotenv.config({ path: envPath, override: true });

if (result.error) {
  throw result.error;
}

const env = result.parsed ?? {};

for (const [key, value] of Object.entries(env)) {
  process.env[key] = value;
}

beforeAll(() => {
  // Global integration-test setup lives in .env.test.
});

afterAll(() => {
  // Global integration-test cleanup lives in individual specs.
});
