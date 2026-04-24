import { it, expect, describe, afterAll, beforeAll } from 'vitest';
import { profileService } from '../services/profileService';
import { supabaseTest, supabaseAdmin } from '../lib/supabaseTestClient';

describe('Profile & Password Service Integration', () => {
  // Use unique credentials for every test run to avoid "User already exists" errors
  const tempEmail = `test-user-${Date.now()}@example.com`;
  const tempPassword = 'OldPassword123!';
  const newPassword = 'NewSecurePassword456!';
  let userId: string;

  // Create a real user in the Supabase Auth table
  beforeAll(async () => {
    const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
      email: tempEmail,
      password: tempPassword,
      email_confirm: true 
    });

    if (adminError) throw adminError;
    userId = adminData.user!.id;
  });

 //cleanup
  afterAll(async () => {
    if (userId) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
    }
  });

  describe('getProfile & updateName', () => {
    // happy path
    it('should update the name and then retrieve it', async () => {
      const testName = "Barista Robin";

      // 1. Update the name
      await profileService.updateName(userId, testName, supabaseTest);

      // 2. Fetch the profile
      const profile = await profileService.getProfile(userId, supabaseTest);

      // 3. Assert
      expect(profile.full_name).toBe(testName);
    });

    it('should return empty string for a non-existent user ID', async () => {
      const fakeId = crypto.randomUUID();
      const profile = await profileService.getProfile(fakeId, supabaseTest);
      
      expect(profile.full_name).toBe("");
    });
  });

  describe('updatePassword', () => {
    // happy path
    it('should successfully change password for authenticated user', async () => {
      // 1. Sign in with old password to establish a session
      const { error: signInError } = await supabaseTest.auth.signInWithPassword({
        email: tempEmail,
        password: tempPassword,
      });
      if (signInError) throw signInError;

      // 2. Change password
      await profileService.updatePassword(newPassword, supabaseTest);

      // 3. Verify: Sign out and try to sign back in with the NEW password
      await supabaseTest.auth.signOut();
      
      const { data: verifyData, error: verifyError } = await supabaseTest.auth.signInWithPassword({
        email: tempEmail,
        password: newPassword,
      });

      expect(verifyError).toBeNull();
      expect(verifyData.user?.id).toBe(userId);
    });

    // sad path
    it('should throw an error when trying to update password while logged out', async () => {
      // Ensure we are signed out
      await supabaseTest.auth.signOut();

      // Attempting to update password without a session should fail
      await expect(
        profileService.updatePassword("SomeRandomPass123!", supabaseTest)
      ).rejects.toThrow();
    });

    it('should fail if the new password is too weak', async () => {
      // Sign back in first
      await supabaseTest.auth.signInWithPassword({
        email: tempEmail,
        password: newPassword,
      });

      // Supabase usually requires 6+ characters
      await expect(
        profileService.updatePassword("123", supabaseTest)
      ).rejects.toThrow();
    });
  });
});