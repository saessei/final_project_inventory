import defaultSupabase from "../lib/supabaseClient.ts";
import supabase from "../lib/supabaseClient.ts";

export const profileService = {
  // Fetch current barista data
  async getProfile(userId: string, supabase = defaultSupabase) {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      if (error.code === "PGRST116") return { full_name: "" };
      throw error;
    }
    return data || { full_name: "" };
  },

  // Update name
  async updateName(userId: string, name: string, supabase = defaultSupabase) {
    const db = supabase;
  const { error } = await db
    .from("profiles")
    .update({ full_name: name })
    .eq("id", userId);

  if (error) {
    console.error("Error updating profile:", error);
    return false; 
  }
  return true;
  },

  // Change password
  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("Password update error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  },
};
