import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

if (!supabaseConfigured) {
  console.warn(
    "VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não configuradas — Cerne não vai conseguir sincronizar.",
  );
}

// URL/chave inválidas (placeholder) quando não configurado, só pra createClient
// não travar a inicialização inteira do app — supabaseConfigured é quem
// decide se mostramos um aviso em vez de deixar a tela em branco.
export const supabase = createClient(
  url ?? "https://placeholder.supabase.co",
  anonKey ?? "placeholder-key",
);
