/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from "react";
import { createContext, useState, useEffect, useContext } from "react";
import type { Session } from "@supabase/supabase-js";
import supabase from "@/lib/supabaseClient.ts";

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  hasAdminPin: boolean;

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
