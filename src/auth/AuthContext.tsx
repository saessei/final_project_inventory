/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useState,
  useEffect,
  useContext,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import supabase from "../lib/supabaseClient.ts";

type Role = "cashier" | "barista";

interface AuthContextType {
  session: Session | null;
  loading: boolean;

  signUpNewUser: (
    email: string,
    password: string,
    displayName?: string,
    role?: Role,
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

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthContextProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

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
  };

  // Sign up
  const signUpNewUser = async (
    email: string,
    password: string,
    displayName?: string,
    role: Role = "cashier",
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || "",
          role,
        },
      },
    });

    if (error) {
      console.error("There was a problem signing up:", error);
      return { success: false, error: error.message || "Signup failed" };
    }
    return { success: true, data };
  };

  // Sign in
  const signInUser = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error occured: ", error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error("An error occured: ", error);
      return { success: false, error: "Unexpected error" };
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

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("There was an error: ", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
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

export const UserAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("UserAuth must be used inside an AuthContextProvider");
  }

  return context;
};