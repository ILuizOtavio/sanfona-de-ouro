import { supabase } from "../lib/supabase";

// ── localStorage keys ─────────────────────────────────────────────────────────
const CLIENTS_KEY   = "sanfona-clients";
const MERCHANTS_KEY = "sanfona-merchants";       // dados de negócio (sem senha)
const MERCHANT_USERS_KEY = "sanfona-merchant-users"; // dados de auth (com senha)
const USERS_KEY     = "sanfona-users";           // dados de auth clientes (com senha)
const VALIDATIONS_KEY = "sanfona-validations";

// ── Types ─────────────────────────────────────────────────────────────────────
export type ClientRegistration = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  audience: string;
  created_at?: string;
};

export type MerchantRegistration = {
  id?: string;
  business_name: string;
  owner_name: string;
  category: string;
  phone: string;
  location: string;
  reward: string;
  created_at?: string;
};

export type CouponValidation = {
  id?: string;
  code: string;
  merchant_name: string;
  client_email: string;
  reward: string;
  validated_at?: string;
};

// ── Full auth records (para admin ver tudo incluindo senha) ────────────────────
export type FullUserRecord = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
  audience?: string;
  created_at?: string;
};

export type FullMerchantRecord = {
  business_name: string;
  owner_name?: string;
  email: string;
  password: string;
  phone?: string;
  category?: string;
  location?: string;
  reward?: string;
  merchantData?: MerchantRegistration;
  created_at?: string;
};

// ── Local helpers ─────────────────────────────────────────────────────────────
function readLocal<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function writeLocal<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Clients ───────────────────────────────────────────────────────────────────
export async function saveClient(input: ClientRegistration) {
  const record = { ...input, id: crypto.randomUUID(), created_at: new Date().toISOString() };
  if (supabase) {
    try {
      const { error } = await supabase.from("clients").insert(record);
      if (error) console.error("❌ Supabase saveClient error:", error);
      else console.log("✅ Supabase cliente salvo:", record.email);
    } catch (err) { console.error("❌ Supabase saveClient exception:", err); }
  } else {
    console.warn("⚠️ Supabase não disponível — salvando apenas localStorage");
  }
  writeLocal(CLIENTS_KEY, [record, ...readLocal<ClientRegistration>(CLIENTS_KEY)]);
  return record;
}

export async function loadClients(): Promise<ClientRegistration[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
      if (!error && data && data.length > 0) return data as ClientRegistration[];
    } catch (_) {}
  }
  return readLocal<ClientRegistration>(CLIENTS_KEY);
}

// ── Merchants ─────────────────────────────────────────────────────────────────
export async function saveMerchant(input: MerchantRegistration) {
  const record = { ...input, id: crypto.randomUUID(), created_at: new Date().toISOString() };
  if (supabase) {
    try {
      const { error } = await supabase.from("merchants").insert(record);
      if (error) console.error("❌ Supabase saveMerchant error:", error);
      else console.log("✅ Supabase lojista salvo:", record.business_name);
    } catch (err) { console.error("❌ Supabase saveMerchant exception:", err); }
  } else {
    console.warn("⚠️ Supabase não disponível — salvando apenas localStorage");
  }
  writeLocal(MERCHANTS_KEY, [record, ...readLocal<MerchantRegistration>(MERCHANTS_KEY)]);
  return record;
}

export async function loadMerchants(): Promise<MerchantRegistration[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from("merchants").select("*").order("created_at", { ascending: false });
      if (!error && data && data.length > 0) return data as MerchantRegistration[];
      if (error) console.warn("⚠️ Supabase loadMerchants error:", error);
    } catch (err) { console.warn("⚠️ Supabase loadMerchants exception:", err); }
  }
  return readLocal<MerchantRegistration>(MERCHANTS_KEY);
}

// ── Admin: carrega todos os usuários/lojistas com senha ───────────────────────
export function loadAllUsers(): FullUserRecord[] {
  return readLocal<FullUserRecord>(USERS_KEY);
}

export function loadAllMerchants(): FullMerchantRecord[] {
  // A chave correta onde os lojistas são gravados com senha é MERCHANT_USERS_KEY
  return readLocal<FullMerchantRecord>(MERCHANT_USERS_KEY);
}

// ── Coupon Validations ─────────────────────────────────────────────────────────
export async function saveValidation(input: CouponValidation) {
  const record = { ...input, id: crypto.randomUUID(), validated_at: new Date().toISOString() };
  if (supabase) {
    try {
      const { error } = await supabase.from("validations").insert(record);
      if (error) console.error("❌ Supabase saveValidation error:", error);
      else console.log("✅ Supabase validação salva:", record.code);
    } catch (err) { console.error("❌ Supabase saveValidation exception:", err); }
  } else {
    console.warn("⚠️ Supabase não disponível — salvando apenas localStorage");
  }
  writeLocal(VALIDATIONS_KEY, [record, ...readLocal<CouponValidation>(VALIDATIONS_KEY)]);
  return record;
}

export async function loadValidations(): Promise<CouponValidation[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from("validations").select("*").order("validated_at", { ascending: false });
      if (!error && data && data.length > 0) return data as CouponValidation[];
      if (error) console.warn("⚠️ Supabase loadValidations error:", error);
    } catch (err) { console.warn("⚠️ Supabase loadValidations exception:", err); }
  }
  return readLocal<CouponValidation>(VALIDATIONS_KEY);
}

// ── Generate a coupon code ─────────────────────────────────────────────────────
export function generateCouponCode(merchantName: string): string {
  const prefix = merchantName.replace(/\s+/g, "").toUpperCase().slice(0, 4);
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${rand}`;
}
