// app/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://adqaehvaatmpmxmlsilg.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_QS2DKjI3cO9rbZCPj3wj4g_EOLGMQN3";

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      !supabaseUrl.includes("your-project-id") &&
      supabaseUrl.startsWith("http")
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
