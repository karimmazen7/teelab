import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// Supports both variable names
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing VITE_SUPABASE_URL in your .env.local file.");
}

if (!supabaseKey) {
  throw new Error(
    "Missing VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) in your .env.local file.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },

  global: {
    headers: {
      "X-Client-Info": "teelab-web",
    },
  },

  db: {
    schema: "public",
  },

  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export default supabase;
