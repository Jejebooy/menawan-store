import { supabase } from "../lib/supabase";

/**
 * Fetch semua settings sebagai object { key: value }
 */
export async function fetchSettings() {
  const { data, error } = await supabase.from("store_settings").select("key, value");
  if (error) throw error;

  const map = {};
  (data || []).forEach((row) => {
    map[row.key] = row.value || "";
  });
  return map;
}

/**
 * Update / insert banyak settings sekaligus
 */
export async function updateSettings(settings) {
  const rows = Object.entries(settings).map(([key, value]) => ({
    key,
    value: value == null ? "" : String(value),
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("store_settings")
    .upsert(rows, { onConflict: "key" });

  if (error) throw error;
}

/**
 * Fetch satu setting by key (untuk dipakai di halaman public)
 */
export async function getSetting(key, defaultValue = "") {
  const { data, error } = await supabase
    .from("store_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error) {
    console.warn("getSetting error:", error.message);
    return defaultValue;
  }
  return data?.value ?? defaultValue;
}