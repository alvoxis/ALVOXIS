// =========================================================
// ALVOXIS — create-checkout-session
//
// POST { kind: "order",   attempt_id, language, items[], shipping }
// POST { kind: "support", attempt_id, language, amount }
//
// 1. authenticates the caller from their Supabase session
// 2. validates everything against the server-side catalog
//    (prices, quantities, support range €1.00–€100.00)
// 3. records a *pending* order / contribution
// 4. creates the Stripe Checkout Session and returns its URL
//
// Nothing here marks anything as paid — only stripe-webhook does.
// =========================================================

import { adminClient, Stripe, stripeClient } from "../_shared/clients.ts";
import { corsHeaders, json, siteUrl } from "../_shared/http.ts";
import {
  cleanText,
  CURRENCY,
  isOwnOrderPhotoPath,
  isProductId,
  isUuid,
  type Language,
  MAX_LINES,
  MAX_QUANTITY,
  MESSAGE_MAX,
  parseLanguage,
  parseSupportAmount,
  PRODUCTS,
} from "../_shared/catalog.ts";
import type { SupabaseClient, User } from "npm:@supabase/supabase-js@2.117.2";

class RequestError extends Error {
  constructor(public code: string, public status = 400) {
    super(code);
  }
}

Deno.serve(async (req) => {
  const cors = corsHeaders(req);

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405, cors);

  try {
    const stripe = stripeClient();
    if (!stripe) throw new RequestError("payments_unavailable", 503);

    const admin = adminClient();
    const user = await authenticate(req, admin);

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") throw new RequestError("invalid_request");

    const language = parseLanguage(body.language);
    const attemptId = isUuid(body.attempt_id) ? body.attempt_id : crypto.randomUUID();

    const url = body.kind === "support"
      ? await createSupportSession({ stripe, admin, user, language, attemptId, amount: body.amount })
      : body.kind === "order"
      ? await createOrderSession({ stripe, admin, user, language, attemptId, items: body.items, shipping: body.shipping })
      : (() => {
        throw new RequestError("invalid_request");
      })();

    return json({ url }, 200, cors);
  } catch (error) {
    if (error instanceof RequestError) return json({ error: error.code }, error.status, cors);
    // never echo internals (or anything secret) back to the browser
    console.error("create-checkout-session:", error instanceof Error ? error.message : "unknown error");
    return json({ error: "server_error" }, 500, cors);
  }
});

async function authenticate(req: Request, admin: SupabaseClient): Promise<User> {
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!token) throw new RequestError("auth_required", 401);
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) throw new RequestError("auth_required", 401);
  return data.user;
}

function stripeLocale(language: Language): Stripe.Checkout.SessionCreateParams.Locale {
  return language as Stripe.Checkout.SessionCreateParams.Locale; // en, lv, ru, et, lt are all Stripe locales
}

/* a retried click must not produce a second session: reuse the open one */
async function reuseOpenSession(stripe: Stripe, sessionId: string | null): Promise<string | null> {
  if (!sessionId) return null;
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return session.status === "open" && session.url ? session.url : null;
}


// ---------------------------------------------------------
// SUPPORT THE STORY — €1.00 to €100.00, chosen by the visitor
// ---------------------------------------------------------

async function createSupportSession(args: {
  stripe: Stripe;
  admin: SupabaseClient;
  user: User;
  language: Language;
  attemptId: string;
  amount: unknown;
}): Promise<string> {
  const { stripe, admin, user, language, attemptId } = args;

  const amountCents = parseSupportAmount(args.amount);
  if (amountCents === null) throw new RequestError("invalid_amount");

  const existing = await admin
    .from("support_contributions")
    .select("id, user_id, amount_cents, stripe_checkout_session_id")
    .eq("checkout_attempt_id", attemptId)
    .maybeSingle();

  if (existing.data) {
    if (existing.data.user_id !== user.id || existing.data.amount_cents !== amountCents) {
      throw new RequestError("invalid_request");
    }
    const url = await reuseOpenSession(stripe, existing.data.stripe_checkout_session_id);
    if (url) return url;
    throw new RequestError("checkout_expired", 409);
  }

  const inserted = await admin
    .from("support_contributions")
    .insert({
      user_id: user.id,
      amount_cents: amountCents,
      currency: CURRENCY,
      language,
      checkout_attempt_id: attemptId,
    })
    .select("id")
    .single();

  if (inserted.error || !inserted.data) throw new Error("could not record contribution");
  const contributionId = inserted.data.id as string;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: stripeLocale(language),
      customer_email: user.email ?? undefined,
      client_reference_id: user.id,
      submit_type: "donate",
      line_items: [{
        quantity: 1,
        price_data: {
          currency: CURRENCY,
          unit_amount: amountCents,
          product_data: {
            name: "Support the story — ALVOXIS",
            description: "Help us write the next page.",
          },
        },
      }],
      metadata: { kind: "support", contribution_id: contributionId, user_id: user.id },
      payment_intent_data: { metadata: { kind: "support", contribution_id: contributionId } },
      success_url: `${siteUrl()}/#/payment/success?kind=support&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/#/payment/cancel?kind=support`,
    }, { idempotencyKey: `support-${attemptId}` });

    await admin
      .from("support_contributions")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", contributionId);

    if (!session.url) throw new Error("Stripe returned no checkout URL");
    return session.url;
  } catch (error) {
    await admin.from("support_contributions").update({ payment_status: "canceled" }).eq("id", contributionId);
    throw error;
  }
}


// ---------------------------------------------------------
// GIFT BOX ORDER — Mini / Classic with personalisation
// ---------------------------------------------------------

interface OrderLine {
  product_id: "mini" | "classic";
  quantity: number;
  message: string;
  photo_path: string;
}

async function validateLines(admin: SupabaseClient, user: User, items: unknown): Promise<OrderLine[]> {
  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_LINES) {
    throw new RequestError("invalid_cart");
  }

  const lines: OrderLine[] = [];

  for (const raw of items) {
    if (!raw || typeof raw !== "object") throw new RequestError("invalid_cart");
    const item = raw as Record<string, unknown>;

    if (!isProductId(item.product_id)) throw new RequestError("invalid_cart");

    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      throw new RequestError("invalid_cart");
    }

    if (!isOwnOrderPhotoPath(item.photo_path, user.id)) throw new RequestError("photo_missing");

    lines.push({
      product_id: item.product_id,
      quantity,
      message: cleanText(item.message, MESSAGE_MAX),
      photo_path: item.photo_path,
    });
  }

  // every photo must really be in the customer's own private folder
  const listing = await admin.storage.from("order-photos").list(user.id, { limit: 1000 });
  if (listing.error) throw new Error("could not verify photos");
  const stored = new Set((listing.data ?? []).map((file) => `${user.id}/${file.name}`));
  if (lines.some((line) => !stored.has(line.photo_path))) throw new RequestError("photo_missing");

  return lines;
}

function validateShipping(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object") throw new RequestError("invalid_shipping");
  const input = raw as Record<string, unknown>;
  const shipping = {
    full_name: cleanText(input.fullName, 120),
    address: cleanText(input.address, 200),
    city: cleanText(input.city, 120),
    postal_code: cleanText(input.postalCode, 20),
    country: cleanText(input.country, 80),
  };
  if (Object.values(shipping).some((value) => !value)) throw new RequestError("invalid_shipping");
  return shipping;
}

const priceCache = new Map<string, string | null>();

/* use the existing Stripe Price for a product when one is configured —
   but only if it really charges the catalog amount */
async function existingPriceId(stripe: Stripe, productId: "mini" | "classic"): Promise<string | null> {
  const product = PRODUCTS[productId];
  const priceId = Deno.env.get(product.priceEnv);
  if (!priceId) return null;
  if (priceCache.has(priceId)) return priceCache.get(priceId) ?? null;

  const price = await stripe.prices.retrieve(priceId);
  const matches = price.active && price.currency === CURRENCY && price.unit_amount === product.unitAmount &&
    price.type === "one_time";

  if (!matches) console.error(`create-checkout-session: ${product.priceEnv} does not match the catalog price; using price_data`);
  priceCache.set(priceId, matches ? price.id : null);
  return matches ? price.id : null;
}

async function createOrderSession(args: {
  stripe: Stripe;
  admin: SupabaseClient;
  user: User;
  language: Language;
  attemptId: string;
  items: unknown;
  shipping: unknown;
}): Promise<string> {
  const { stripe, admin, user, language, attemptId } = args;

  const existing = await admin
    .from("orders")
    .select("id, user_id, stripe_checkout_session_id")
    .eq("checkout_attempt_id", attemptId)
    .maybeSingle();

  if (existing.data) {
    if (existing.data.user_id !== user.id) throw new RequestError("invalid_request");
    const url = await reuseOpenSession(stripe, existing.data.stripe_checkout_session_id);
    if (url) return url;
    throw new RequestError("checkout_expired", 409);
  }

  const lines = await validateLines(admin, user, args.items);
  const shipping = validateShipping(args.shipping);

  const subtotal = lines.reduce((sum, line) => sum + PRODUCTS[line.product_id].unitAmount * line.quantity, 0);

  const order = await admin
    .from("orders")
    .insert({
      user_id: user.id,
      currency: CURRENCY,
      subtotal_cents: subtotal,
      total_cents: subtotal,
      shipping_address: shipping,
      language,
      checkout_attempt_id: attemptId,
    })
    .select("id, order_number")
    .single();

  if (order.error || !order.data) throw new Error("could not record order");
  const orderId = order.data.id as string;

  try {
    const itemRows = lines.map((line) => {
      const product = PRODUCTS[line.product_id];
      return {
        order_id: orderId,
        product_id: product.id,
        product_name: product.name,
        quantity: line.quantity,
        unit_price_cents: product.unitAmount,
        total_price_cents: product.unitAmount * line.quantity,
        personalization_data: { message: line.message, ...product.personalization },
        photo_path: line.photo_path,
      };
    });

    const insertedItems = await admin.from("order_items").insert(itemRows);
    if (insertedItems.error) throw new Error("could not record order items");

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    for (const line of lines) {
      const product = PRODUCTS[line.product_id];
      const priceId = await existingPriceId(stripe, line.product_id);
      lineItems.push(priceId ? { price: priceId, quantity: line.quantity } : {
        quantity: line.quantity,
        price_data: {
          currency: CURRENCY,
          unit_amount: product.unitAmount,
          product_data: { name: product.name },
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: stripeLocale(language),
      customer_email: user.email ?? undefined,
      client_reference_id: user.id,
      line_items: lineItems,
      metadata: { kind: "order", order_id: orderId, order_number: order.data.order_number, user_id: user.id },
      payment_intent_data: { metadata: { kind: "order", order_id: orderId } },
      success_url: `${siteUrl()}/#/payment/success?kind=order&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/#/payment/cancel?kind=order`,
    }, { idempotencyKey: `order-${attemptId}` });

    if (session.amount_total !== null && session.amount_total !== subtotal) {
      throw new Error("Stripe total does not match the catalog total");
    }

    await admin.from("orders").update({ stripe_checkout_session_id: session.id }).eq("id", orderId);

    if (!session.url) throw new Error("Stripe returned no checkout URL");
    return session.url;
  } catch (error) {
    await admin.from("orders").update({ payment_status: "canceled" }).eq("id", orderId);
    throw error;
  }
}
