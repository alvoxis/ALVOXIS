/* =========================================================
   ALVOXIS — PUBLIC CONFIGURATION

   Everything in this file is PUBLIC and ships to every
   browser. Supabase publishable keys are designed for that:
   what a visitor can do is decided by Row Level Security,
   not by hiding this key.

   NEVER put here: the Supabase secret / service_role key,
   the Stripe secret key, the Stripe webhook secret or the
   Google client secret. Those live only in Supabase
   (Dashboard → Edge Functions → Secrets / Auth → Providers).

   Values: Supabase Dashboard → Project Settings → API Keys.
   ========================================================= */

export const SITE_URL = "https://alvoxis.eu";

export const SUPABASE_URL = "";
export const SUPABASE_PUBLISHABLE_KEY = "";
