import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import  supabase  from "../config/supabaseClient.ts";
import {  User, Session, WeakPassword } from '@supabase/supabase-js';

interface AuthContextType {
    session: any;
    signUpNewUser: (email: string, password: string) => Promise<{ success: boolean; data?: any; error?: any }>;
    signOut: () => Promise<void>;
    signInUser: (email: string, password: string) => Promise<{ success: boolean; error: string; data?: undefined; } | { success: boolean; data: { user: User; session: Session; weakPassword?: WeakPassword; }; error?: undefined; } | undefined>;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({children}: AuthProviderProps) => {
    const [ session, setSession ] = useState<any>(null);

    // Sign up
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

    // Sign in

    const signInUser = async(email: string, password: string) => {
        try {
            const {data, error} = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });
            if(error) {
                console.error("Sign in error occured: ", error)
                return {success: false, error: error.message}
            }
            console.log("Sign in success: ", data);
            return {success: true, data};
        } catch(error) {
            console.error("An error occured: ", error)
        }

    }

    useEffect(() => {
        supabase.auth.getSession().then(({data: {session}}) => {
            setSession(session);
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
    }, []);

    // Signout
    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if(error) {
            console.error("There was an error: ", error);
        }
    }

    return (
        <AuthContext.Provider value={{ session, signUpNewUser, signInUser, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const UserAuth = () => {
    return useContext(AuthContext)
}