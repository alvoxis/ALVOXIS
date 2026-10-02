// =========================================================
// ALVOXIS — stripe-webhook
//
// The single source of truth for confirmed payments.
//
//   · every request must carry a valid Stripe signature
//     (STRIPE_WEBHOOK_SECRET) — nothing else is trusted
//   · idempotent: a re-delivered event changes nothing and
//     never creates a second order, contribution or gift
//   · a contribution of €50.00 or more, once paid, unlocks
//     the keepsake puzzle gift
//
// Subscribe the endpoint to:
//   checkout.session.completed
//   checkout.session.async_payment_succeeded
//   checkout.session.async_payment_failed
//   checkout.session.expired
//   charge.refunded
// =========================================================

import { adminClient, Stripe, stripeClient } from "../_shared/clients.ts";
import { json } from "../_shared/http.ts";
import { CURRENCY, GIFT_THRESHOLD_CENTS } from "../_shared/catalog.ts";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2.117.2";

const cryptoProvider = Stripe.createSubtleCryptoProvider();

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const stripe = stripeClient();
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripe || !secret) {
    console.error("stripe-webhook: Stripe secrets are not configured");
    return json({ error: "not_configured" }, 500);
  }

  const signature = req.headers.get("Stripe-Signature");
  if (!signature) return json({ error: "missing_signature" }, 400);

  const payload = await req.text();
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(payload, signature, secret, undefined, cryptoProvider);
  } catch {
    return json({ error: "invalid_signature" }, 400);
  }

  const admin = adminClient();

  try {
    const seen = await admin.from("stripe_events").select("id").eq("id", event.id).maybeSingle();
    if (seen.data) return json({ received: true, duplicate: true }, 200);

    await handle(event, admin);

    await admin.from("stripe_events").upsert({ id: event.id, type: event.type }, { onConflict: "id", ignoreDuplicates: true });
    return json({ received: true }, 200);
  } catch (error) {
    // a 5xx makes Stripe retry later; every step above is safe to repeat
    console.error(`stripe-webhook: ${event.type} ${event.id} failed:`, error instanceof Error ? error.message : "unknown error");
    return json({ error: "processing_failed" }, 500);
  }
});

async function handle(event: Stripe.Event, admin: SupabaseClient): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      // "unpaid" here means a delayed payment method — wait for async_payment_succeeded
      if (session.payment_status === "paid") await markPaid(session, admin);
      return;
    }

    case "checkout.session.async_payment_failed":
      await markUnpaid(event.data.object as Stripe.Checkout.Session, "failed", admin);
      return;

    case "checkout.session.expired":
      await markUnpaid(event.data.object as Stripe.Checkout.Session, "expired", admin);
      return;

    case "charge.refunded":
      await markRefunded(event.data.object as Stripe.Charge, admin);
      return;

    default:
      return; // not an event ALVOXIS acts on
  }
}

function paymentIntentId(session: Stripe.Checkout.Session): string | null {
  const pi = session.payment_intent;
  return typeof pi === "string" ? pi : pi?.id ?? null;
}

async function markPaid(session: Stripe.Checkout.Session, admin: SupabaseClient): Promise<void> {
  const kind = session.metadata?.kind;
  const now = new Date().toISOString();

  if (kind === "order") {
    const { data: order, error } = await admin
      .from("orders")
      .select("id, total_cents, currency, payment_status")
      .eq("id", session.metadata?.order_id ?? "")
      .eq("stripe_checkout_session_id", session.id)
      .maybeSingle();

    if (error) throw new Error("order lookup failed");
    if (!order) {
      console.error(`stripe-webhook: no order for session ${session.id}`);
      return;
    }

    if (session.amount_total !== order.total_cents || session.currency !== CURRENCY) {
      console.error(`stripe-webhook: amount mismatch for order ${order.id}; not marking paid`);
      return;
    }

    const updated = await admin
      .from("orders")
      .update({ payment_status: "paid", paid_at: now, stripe_payment_intent_id: paymentIntentId(session) })
      .eq("id", order.id)
      .neq("payment_status", "paid");
    if (updated.error) throw new Error("order update failed");
    return;
  }

  if (kind === "support") {
    const { data: contribution, error } = await admin
      .from("support_contributions")
      .select("id, user_id, amount_cents, currency, payment_status")
      .eq("id", session.metadata?.contribution_id ?? "")
      .eq("stripe_checkout_session_id", session.id)
      .maybeSingle();

    if (error) throw new Error("contribution lookup failed");
    if (!contribution) {
      console.error(`stripe-webhook: no contribution for session ${session.id}`);
      return;
    }

    if (session.amount_total !== contribution.amount_cents || session.currency !== CURRENCY) {
      console.error(`stripe-webhook: amount mismatch for contribution ${contribution.id}; not marking paid`);
      return;
    }

    const giftEligible = contribution.amount_cents >= GIFT_THRESHOLD_CENTS;

    const updated = await admin
      .from("support_contributions")
      .update({
        payment_status: "paid",
        paid_at: now,
        gift_eligible: giftEligible,
        stripe_payment_intent_id: paymentIntentId(session),
      })
      .eq("id", contribution.id)
      .neq("payment_status", "paid");
    if (updated.error) throw new Error("contribution update failed");

    if (giftEligible) {
      // unique(support_contribution_id) — a re-delivered event can never add a second gift
      const gift = await admin
        .from("gifts")
        .upsert(
          { user_id: contribution.user_id, support_contribution_id: contribution.id, gift_type: "puzzle" },
          { onConflict: "support_contribution_id", ignoreDuplicates: true },
        );
      if (gift.error) throw new Error("gift creation failed");
    }
    return;
  }

  console.error(`stripe-webhook: session ${session.id} has no ALVOXIS metadata`);
}

async function markUnpaid(
  session: Stripe.Checkout.Session,
  status: "failed" | "expired",
  admin: SupabaseClient,
): Promise<void> {
  const table = session.metadata?.kind === "order"
    ? "orders"
    : session.metadata?.kind === "support"
    ? "support_contributions"
    : null;
  if (!table) return;

  // only a still-pending record changes — a paid one is never downgraded by a late event
  const updated = await admin
    .from(table)
    .update({ payment_status: status })
    .eq("stripe_checkout_session_id", session.id)
    .eq("payment_status", "pending");
  if (updated.error) throw new Error(`${table} status update failed`);
}

async function markRefunded(charge: Stripe.Charge, admin: SupabaseClient): Promise<void> {
  if (!charge.refunded) return; // partial refunds are handled by hand
  const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  if (!pi) return;

  const order = await admin.from("orders").update({ payment_status: "refunded" }).eq("stripe_payment_intent_id", pi);
  if (order.error) throw new Error("order refund update failed");

  const { data: contribution, error } = await admin
    .from("support_contributions")
    .update({ payment_status: "refunded", gift_eligible: false })
    .eq("stripe_payment_intent_id", pi)
    .select("id")
    .maybeSingle();
  if (error) throw new Error("contribution refund update failed");

  if (contribution) {
    // a refunded contribution no longer carries a gift — unless it is already being made
    const gift = await admin
      .from("gifts")
      .delete()
      .eq("support_contribution_id", contribution.id)
      .eq("production_status", "not_started");
    if (gift.error) throw new Error("gift revoke failed");
  }
}
