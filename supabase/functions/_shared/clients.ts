// Server-side clients. The service-role client bypasses RLS and must
// never leave the Edge runtime; STRIPE_SECRET_KEY lives only in
// Supabase Edge Function secrets.

import Stripe from "npm:stripe@17.7.0";
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.117.2";

export function adminClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Supabase environment is not configured");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function stripeClient(): Stripe | null {
  const key = Deno.env.get("STRIPE_SECRET_KEY");
  if (!key) return null;

  // STRIPE_API_HOST/PORT/PROTOCOL exist only to point local tests at stripe-mock
  const host = Deno.env.get("STRIPE_API_HOST");
  return new Stripe(key, {
    apiVersion: "2025-02-24.acacia",
    httpClient: Stripe.createFetchHttpClient(),
    ...(host
      ? {
        host,
        port: Number(Deno.env.get("STRIPE_API_PORT") ?? 443),
        protocol: (Deno.env.get("STRIPE_API_PROTOCOL") ?? "https") as "http" | "https",
      }
      : {}),
  });
}

export { Stripe };
