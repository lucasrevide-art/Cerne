import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

if (!supabaseConfigured) {
  console.warn(
    "VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não configuradas — Cerne não vai conseguir sincronizar.",
  );
}

export const supabase = createClient(url ?? "", anonKey ?? "");
