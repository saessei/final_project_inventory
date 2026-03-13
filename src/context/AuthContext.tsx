import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import  supabase  from "../config/supabaseClient.ts";

interface AuthContextType {
    session: any;
    signUpNewUser: (email: string, password: string) => Promise<{ success: boolean; data?: any; error?: any }>;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({children}: AuthProviderProps) => {
    const [ session, setSession ] = useState<any>(null);

    // sign up
    const signUpNewUser = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            console.error("There was a problem signing up:", error);
            return { success: false, error };
        }
        return { success: true, data };
    }

    useEffect(() => {
        supabase.auth.getSession().then(({data: {session}}) => {
            setSession(session);
        });

        supabase.auth.onAuthChange((_event, session) => {
            setSession(session);
        })
    }, [])

    return (
        <AuthContext.Provider value={{ session, signUpNewUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const UserAuth = () => {
    return useContext(AuthContext)
}