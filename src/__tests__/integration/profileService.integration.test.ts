// src/__tests__/integration/profileService.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { profileService } from "../../services/profileService";
import {
  createAnonClient,
  createServiceRoleClient,
} from "./supabaseTestClient";

const serviceClient = createServiceRoleClient();
const userClient = createAnonClient();

describe("ProfileService Integration Tests (Real DB)", () => {
  let userId: string;

  beforeAll(async () => {
    const email = import.meta.env.TEST_USER_EMAIL;
    const password = import.meta.env.TEST_USER_PASSWORD;

    if (!email || !password) {
      throw new Error(
        "TEST_USER_EMAIL and TEST_USER_PASSWORD must be set in .env.test",
      );
    }

    // Sign in as the test user with the anon client
    const { data, error } = await userClient.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.user) {
      throw new Error(`Sign-in failed: ${error?.message}`);
    }

    userId = data.user.id;

    // Seed a known, clean profile state via service role (bypasses RLS)
    const { error: upsertError } = await serviceClient
      .from("profiles")
      .upsert({ id: userId, full_name: "Initial Name" });

    if (upsertError) {
      throw new Error(`Profile seed failed: ${upsertError.message}`);
    }
  });

  afterAll(async () => {
    if (userId) {
      await serviceClient
        .from("profiles")
        .update({ full_name: "Initial Name" })
        .eq("id", userId);
    }
    await userClient.auth.signOut();
  });

  //getProfile

  describe("getProfile", () => {
    it("should return the profile for a valid user", async () => {
      // Pass userClient so the service uses this session, not the singleton
      const profile = await profileService.getProfile(userId, userClient);

      expect(profile).toBeDefined();
      expect(profile.full_name).toBe("Initial Name");
    });

    it("should return empty name for a non-existent user", async () => {
      const profile = await profileService.getProfile(
        "00000000-0000-0000-0000-000000000000",
        userClient,
      );
      expect(profile.full_name).toBe("");
    });
  });

  // updateName

  describe("updateName", () => {
    it("should persist the updated name to the database", async () => {
      const newName = `Integration Test ${Date.now()}`;

      // Drive the update through the user-scoped client
      const success = await profileService.updateName(
        userId,
        newName,
        userClient,
      );
      expect(success).toBe(true);

      // Verify the write landed using service role (bypasses any RLS read restrictions)
      const { data, error } = await serviceClient
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .single();

      expect(error).toBeNull();
      expect(data?.full_name).toBe(newName);
    });

    it("should return false when updating a non-existent user", async () => {
      const result = await profileService.updateName(
        "00000000-0000-0000-0000-000000000000",
        "Ghost",
        serviceClient,
      );
      expect(result).toBe(false);
    });
  });
});
