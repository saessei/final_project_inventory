import { afterAll, afterEach, describe, expect, it } from "vitest";
import supabase from "@/lib/supabaseClient";
import { profileService } from "@/services/profileService";
import {
  createServiceRoleTestClient,
  createTempAuthUser,
  deleteTempAuthUser,
  ensureProfileRow,
} from "@/__tests__/integration/supabaseTestUtils";

const serviceRole = createServiceRoleTestClient();

let tempUser: Awaited<ReturnType<typeof createTempAuthUser>> | null = null;

const skipIfNoServiceRole = serviceRole ? it : it.skip;

afterEach(async () => {
  await supabase.auth.signOut();
});

afterAll(async () => {
  if (serviceRole && tempUser) {
    await deleteTempAuthUser(serviceRole, tempUser.id);
  }
});

describe("profileService (integration)", () => {
  skipIfNoServiceRole("reads and updates a profile row", async () => {
    tempUser = tempUser ?? (await createTempAuthUser(serviceRole!, "vitest-profile"));
    await ensureProfileRow(serviceRole!, tempUser.id, "Original Name");

    const profile = await profileService.getProfile(tempUser.id, serviceRole!);
    expect(profile.full_name).toBe("Original Name");

    const updated = await profileService.updateName(
      tempUser.id,
      "Updated Name",
      serviceRole!,
    );
    expect(updated).toBe(true);

    const reloaded = await profileService.getProfile(tempUser.id, serviceRole!);
    expect(reloaded.full_name).toBe("Updated Name");
  });

  skipIfNoServiceRole("changes password for a signed-in user", async () => {
    tempUser = tempUser ?? (await createTempAuthUser(serviceRole!, "vitest-password"));
    await ensureProfileRow(serviceRole!, tempUser.id, "Password User");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: tempUser.email,
      password: tempUser.password,
    });
    expect(signInError).toBeNull();

    const newPassword = `New-${Math.random().toString(36).slice(2)}a1!`;
    const result = await profileService.updatePassword(newPassword);

    expect(result.success).toBe(true);

    await supabase.auth.signOut();

    const { error: reSignInError } = await supabase.auth.signInWithPassword({
      email: tempUser.email,
      password: newPassword,
    });
    expect(reSignInError).toBeNull();
  });
});
