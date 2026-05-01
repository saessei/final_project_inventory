/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from "react";
import { createContext, useState, useEffect, useContext } from "react";
import type { Session } from "@supabase/supabase-js";
import supabase from "@/lib/supabaseClient.ts";

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  hasAdminPin: boolean;

  signUpNewUser: (
    email: string,
    password: string,
    displayName?: string,
    adminPin?: string,
  ) => Promise<{ success: boolean; data?: unknown; error?: unknown }>;

  signOut: () => Promise<void>;

  signInUser: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; data?: unknown; error?: string }>;

  refreshSession: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAdminPin, setHasAdminPin] = useState(false);

  const refreshSession = async () => {
    const {
      data: { session: updatedSession },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("refreshSession error:", error);
      return;
    }

    setSession(updatedSession ?? null);

    if (updatedSession?.user?.id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("admin_pin")
        .eq("id", updatedSession.user.id)
        .single();

      setHasAdminPin(!!profile?.admin_pin);
    } else {
      setHasAdminPin(false);
    }
  };

  const signUpNewUser = async (
    email: string,
    password: string,
    displayName?: string,
    adminPin?: string,
  ) => {
    try {
      // First, create the auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || "",
            full_name: displayName || "",
          },
        },
      });

      if (error) {
        console.error("Signup error:", error);
        return { success: false, error: error.message || "Signup failed" };
      }

      if (!data.user) {
        return { success: false, error: "Failed to create user" };
      }

      console.log("User created:", data.user.id);

      // Wait a bit for the user to be fully registered
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create the profile manually
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        email: email,
        full_name: displayName || "",
        display_name: displayName || "",
        admin_pin: adminPin && adminPin.length >= 4 ? adminPin : null,
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // Try to update instead if insert fails
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            email: email,
            full_name: displayName || "",
            display_name: displayName || "",
            admin_pin: adminPin && adminPin.length >= 4 ? adminPin : null,
          })
          .eq("id", data.user.id);

        if (updateError) {
          console.error("Profile update also failed:", updateError);
        } else {
          console.log("Profile updated successfully with admin PIN");
        }
      } else {
        console.log(
          "Profile created successfully with admin PIN:",
          adminPin ? "Yes" : "No",
        );
      }

      return { success: true, data };
    } catch (err) {
      console.error("Unexpected error during signup:", err);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const signInUser = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error: ", error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error("An error occured: ", error);
      return { success: false, error: "Unexpected error" };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("There was an error: ", error);
    }
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        hasAdminPin,
        signUpNewUser,
        signInUser,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthContextProvider");
  }

  return context;
};

export const UserAuth = useAuth;
export { AuthContext };
