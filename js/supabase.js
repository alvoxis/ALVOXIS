/* =========================================================
   ALVOXIS — the one Supabase client

   Loaded lazily (after the page is interactive) so the film
   and the book never wait for it. supabase-js keeps the real
   Supabase session (PKCE flow) and refreshes it.
   ========================================================= */

import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./config.js";

const SDK_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/+esm";

export const backendConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

let clientPromise = null;

export function getSupabase() {
  if (!backendConfigured) {
    return Promise.resolve(null);
  }

  if (!clientPromise) {
    clientPromise = import(SDK_URL)
      .then(({ createClient }) => createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: {
          flowType: "pkce",
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }))
      .catch((error) => {
        clientPromise = null; // allow a retry later
        throw error;
      });
  }

  return clientPromise;
}
