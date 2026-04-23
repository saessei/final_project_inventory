import { it, expect, describe, afterAll, beforeEach } from 'vitest';
import { profileService } from '../services/profileService';
import supabase from '../lib/supabaseClient'; // Flexible client
import { clearDatabase } from '../utils/db';

describe('Profile Integration Test', () => {
  const tempEmail = `barista-${Date.now()}@test.com`;
  const tempPassword = 'OldPassword123!';
  const newPassword = 'NewSecurePassword456!';
  let userId: string | undefined;

  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    if (userId) {
      await supabase.auth.admin.deleteUser(userId);
    }
  });

  it('should successfully update password for an authenticated user', async () => {
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email: tempEmail,
      password: tempPassword,
      email_confirm: true 
    });

    if (adminError) throw adminError;
    userId = adminData.user?.id;

    await supabase.auth.signInWithPassword({
      email: tempEmail,
      password: tempPassword,
    });
    
    await profileService.updatePassword(newPassword, supabase);

    const { data: verifyData, error: verifyError } = await supabase.auth.signInWithPassword({
      email: tempEmail,
      password: newPassword,
    });

    expect(verifyError).toBeNull();
    expect(verifyData.user?.email).toBe(tempEmail);
  });

  it("should fail to update password when user is not authenticated", async () => {
    await supabase.auth.signOut();
    await expect(profileService.updatePassword("SomePassword123!", supabase)).rejects.toThrow();
  });
});