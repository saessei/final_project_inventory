import supabase from "@/lib/supabaseClient";
import { SupabaseClient } from "@supabase/supabase-js";

export const profileService = {
  async getProfile(userId: string, client: SupabaseClient = supabase) {
    const { data, error } = await client  // ← was hardcoded to supabase
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

  async updateName(userId: string, name: string, client: SupabaseClient = supabase): Promise<boolean> {
    const { data, error } = await client
      .from("profiles")
      .update({ full_name: name })
      .eq("id", userId)
      .select();

    if (error) return false;
    if (!data || data.length === 0) return false;
    return true;
  },

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