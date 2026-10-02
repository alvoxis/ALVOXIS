// CORS + JSON helpers shared by the ALVOXIS Edge Functions.

const DEFAULT_ORIGINS = ["https://alvoxis.eu", "https://www.alvoxis.eu"];

function allowedOrigins(): string[] {
  const extra = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  return [...DEFAULT_ORIGINS, ...extra];
}

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins().includes(origin) ? origin : DEFAULT_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

export function json(body: unknown, status: number, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

/** the public URL the customer returns to after Stripe */
export function siteUrl(): string {
  return (Deno.env.get("SITE_URL") ?? "https://alvoxis.eu").replace(/\/+$/, "");
}
