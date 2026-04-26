// auth/AuthContext.tsx
import type { ReactNode } from "react";
import {
  createContext,
  useState,
  useEffect,
  useContext,
} from "react";
import type { Session } from "@supabase/supabase-js";
import supabase from "../lib/supabaseClient.ts";

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
        console.error("There was a problem signing up:", error);
        return { success: false, error: error.message || "Signup failed" };
      }

      if (data.user && adminPin && adminPin.length >= 4) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: data.user.id,
            email: email,
            full_name: displayName || "",
            display_name: displayName || "",
            admin_pin: adminPin,
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error("Profile update error:", profileError);
        }
      }

      return { success: true, data };
    } catch (err) {
      console.error("Unexpected error:", err);
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
        console.error("Sign in error occured: ", error);
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