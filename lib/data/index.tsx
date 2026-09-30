"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { demoStore } from "./demo";
import { supabaseStore } from "./supabase";
import type { DataStore, Profile } from "./types";

export const store: DataStore = isSupabaseConfigured ? supabaseStore : demoStore;

interface AuthState {
  user: Profile | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setUser: (u: Profile | null) => void;
}

const AuthCtx = createContext<AuthState>({ user: null, loading: true, refresh: async () => {}, setUser: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    try {
      setUser(await store.me());
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);
  return <AuthCtx.Provider value={{ user, loading, refresh, setUser }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
