import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { profileService } from "@/services/profileService";
import { supabaseAdmin } from "@/tests/supabaseTestClient";
import supabase from "@/lib/supabaseClient";

describe("Profile & Password Service Integration", () => {
  const tempEmail = `test-user-${Date.now()}@example.com`;
  const tempPassword = "OldPassword123!";
  const newPassword = "NewSecurePassword456!";
  let userId: string;

  beforeAll(async () => {
    // Create a real auth user using Admin client
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: tempEmail,
      password: tempPassword,
      email_confirm: true,
    });

    if (error) throw error;
    userId = data.user.id;

    // Create the profile record if your DB doesn't do it via trigger
    await supabaseAdmin.from("profiles").upsert({
      id: userId,
      full_name: "Test User",
    });
  });

  afterAll(async () => {
    // Clean up the auth user
    if (userId) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
    }
  });

  describe("Profile Updates", () => {
    it("should update the name and then retrieve it", async () => {
      const updated = await profileService.updateName(userId, "Updated Name");
      expect(updated).toBe(true);

      const profile = await profileService.getProfile(userId);
      expect(profile.full_name).toBe("Updated Name");
    });
  });

  describe("updatePassword", () => {
    it("should successfully change password for authenticated user", async () => {
      // 1. Establish a session (Fixes the "auth is undefined" or "no session" error)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: tempEmail,
        password: tempPassword,
      });
      expect(signInError).toBeNull();

      // 2. Attempt password update
      const result = await profileService.updatePassword(newPassword);
      expect(result.success).toBe(true);

      await supabase.auth.signOut();
    });

    it("should fail if the new password is too weak", async () => {
      // Re-auth with the NEW password
      await supabase.auth.signInWithPassword({
        email: tempEmail,
        password: newPassword,
      });

      const result = await profileService.updatePassword("123"); // Too short
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
