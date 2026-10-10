import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile dari tabel profiles
  async function fetchProfile(userId) {
    if (!userId) return null;
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, role, phone")
      .eq("id", userId)
      .single();
    if (error) {
      console.error("fetchProfile error:", error.message);
      return null;
    }
    return data;
  }

  useEffect(() => {
    let mounted = true;

    // 1. Ambil session awal
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        const prof = await fetchProfile(session.user.id);
        if (mounted) setProfile(prof);
      }
      if (mounted) setLoading(false);
    });

    // 2. Listen perubahan auth
    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          setUser(session.user);
          const prof = await fetchProfile(session.user.id);
          if (mounted) setProfile(prof);
        } else {
          setUser(null);
          setProfile(null);
        }
        if (mounted) setLoading(false);
      }
    );

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  const isAdmin = profile?.role === "admin" || profile?.role === "staff";

  const value = {
    user,
    profile,
    loading,
    isAdmin,
    isAuthenticated: !!user,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}