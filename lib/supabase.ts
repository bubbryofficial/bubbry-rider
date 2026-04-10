import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: "bubbry_rider_auth",
    storage: {
      getItem: (key: string) => {
        if (typeof window === "undefined") return null;
        return window.localStorage.getItem(key);
      },
      setItem: (key: string, value: string) => {
        if (typeof window === "undefined") return;
        window.localStorage.setItem(key, value);
      },
      removeItem: (key: string) => {
        if (typeof window === "undefined") return;
        window.localStorage.removeItem(key);
      },
    },
  },
});
