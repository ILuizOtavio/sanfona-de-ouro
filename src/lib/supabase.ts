import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey && !url.includes("SEU-PROJETO"));

if (!url || !anonKey) {
  console.warn("⚠️ Supabase: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não definidos no .env");
} else if (url.includes("SEU-PROJETO")) {
  console.warn("⚠️ Supabase: .env ainda contém placeholder SEU-PROJETO");
} else {
  console.log("✅ Supabase: URL e chave encontradas, criando cliente...");
}

export const supabase = isSupabaseConfigured ? createClient(url, anonKey, {
  auth: { flowType: "pkce", detectSessionInUrl: true },
}) : null;

if (supabase) console.log("✅ Supabase cliente criado com sucesso");
