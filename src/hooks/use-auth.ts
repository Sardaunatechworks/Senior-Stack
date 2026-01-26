import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "../hooks/use-toast";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // 1. Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchProfile(session?.user?.id);
    });

    // 2. Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId?: string) {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setUser(data);
    setIsLoading(false);
  }

  const login = async (credentials: any) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: credentials.username, // Assuming username field actually holds email for Supabase
      password: credentials.password,
    });
    if (error) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
      throw error;
    }
    toast({ title: "Welcome back!" });
  };

  const register = async (data: any) => {
    // 1. Create Auth User
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });
    if (authError) {
      toast({ title: "Registration Failed", description: authError.message, variant: "destructive" });
      throw authError;
    }

    // 2. Create Profile Entry
    if (authData.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        username: data.username,
        email: data.email,
        role: 'reporter'
      });
      if (profileError) console.error("Profile creation failed:", profileError);
    }
    toast({ title: "Account Created!", description: "Please check your email to verify." });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out" });
  };

  return { user, isLoading, login, register, logout };
}