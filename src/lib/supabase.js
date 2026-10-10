import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase env. Pastikan file .env.local ada dan berisi VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);