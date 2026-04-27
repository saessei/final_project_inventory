// vitest.setup.ts
import { beforeAll, afterAll } from 'vitest';
import { supabaseAdmin } from '../lib/supabaseTestClient';

beforeAll(async () => {
  // Example: Ensure the test database is reachable before starting
  console.log("Checking Database Connection...");
});

afterAll(async () => {
  // Example: Wipe the 'orders' table after ALL test files finish
  await supabaseAdmin.from('orders').delete().neq('id', '0000-0000...');
});