/* =========================================================
   ALVOXIS — BACKEND API

   Real Supabase Auth, PostgreSQL (behind RLS), private
   Storage and the create-checkout-session Edge Function.
   Every failure is turned into an AppError carrying an i18n
   key under "errors.*" — the UI never shows raw technical
   messages.
   ========================================================= */

import { getSupabase, backendConfigured } from "./supabase.js";
import { getState, setUser } from "./state.js";

export { backendConfigured };

export class AppError extends Error {
  constructor(key) {
    super(key);
    this.key = key; // i18n key, e.g. "errors.invalidCredentials"
  }
}

const AUTH_ERRORS = {
  invalid_credentials: "errors.invalidCredentials",
  email_not_confirmed: "errors.emailNotConfirmed",
  user_already_exists: "errors.userExists",
  email_exists: "errors.userExists",
  weak_password: "errors.weakPassword",
  same_password: "errors.samePassword",
  email_address_invalid: "errors.invalidEmail",
  validation_failed: "errors.invalidEmail",
  over_email_send_rate_limit: "errors.rateLimited",
  over_request_rate_limit: "errors.rateLimited",
  signup_disabled: "errors.unavailable",
  session_not_found: "errors.sessionExpired",
  refresh_token_not_found: "errors.sessionExpired"
};

const FUNCTION_ERRORS = {
  auth_required: "errors.sessionExpired",
  invalid_amount: "support.invalidAmount",
  invalid_cart: "errors.invalidCart",
  photo_missing: "errors.photoMissing",
  invalid_shipping: "errors.invalidShipping",
  payments_unavailable: "errors.paymentsUnavailable",
  checkout_expired: "errors.checkoutExpired"
};

function debug(error) {
  // technical detail only on a developer's machine — never tokens or passwords
  if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    console.warn("ALVOXIS:", error && (error.code || error.name), error && error.message);
  }
}

function toAppError(error, fallback = "errors.generic") {
  if (error instanceof AppError) return error;
  debug(error);
  if (error && AUTH_ERRORS[error.code]) return new AppError(AUTH_ERRORS[error.code]);
  if (error && /fetch|network|load failed/i.test(`${error.name} ${error.message}`)) return new AppError("errors.network");
  return new AppError(fallback);
}

async function client() {
  if (!backendConfigured) throw new AppError("errors.unavailable");
  try {
    const sb = await getSupabase();
    if (!sb) throw new AppError("errors.unavailable");
    return sb;
  } catch (error) {
    throw toAppError(error, "errors.unavailable");
  }
}

function toUser(session) {
  const user = session && session.user;
  if (!user) return null;
  const meta = user.user_metadata || {};
  const providers = (user.app_metadata && user.app_metadata.providers) || [];
  return {
    id: user.id,
    email: user.email || "",
    name: meta.full_name || meta.name || "",
    createdAt: user.created_at,
    providers,
    hasPassword: providers.includes("email")
  };
}


/* ---------- where to go after an auth redirect ---------- */

const NEXT_KEY = "alvoxis_after_auth";

export function rememberNext(hash) {
  try { sessionStorage.setItem(NEXT_KEY, hash); } catch (error) { /* private mode */ }
}

export function takeNext() {
  try {
    const next = sessionStorage.getItem(NEXT_KEY);
    sessionStorage.removeItem(NEXT_KEY);
    return next;
  } catch (error) {
    return null;
  }
}

/* the page the auth emails / Google send the visitor back to */
function returnUrl(flow) {
  return `${location.origin}${location.pathname}?flow=${flow}`;
}


/* ---------- session ---------- */

/**
 * Restores the session, completes an OAuth / email-link return
 * (?code=… is exchanged by supabase-js) and keeps state.user in
 * sync. Resolves to the auth flow that brought the visitor here,
 * if any: "oauth" | "signup" | "recovery".
 */
export async function initAuth({ onRecovery } = {}) {
  if (!backendConfigured) return null;

  const params = new URLSearchParams(location.search);
  const flow = params.get("flow");
  const returning = params.has("code") || params.has("error") || Boolean(flow);

  let sb;
  try {
    sb = await getSupabase();
  } catch (error) {
    debug(error);
    return null;
  }

  sb.auth.onAuthStateChange((event, session) => {
    setUser(toUser(session));
    if (event === "PASSWORD_RECOVERY" && onRecovery) {
      setTimeout(onRecovery, 0); // never call Supabase from inside this callback
    }
  });

  const { data } = await sb.auth.getSession();
  setUser(toUser(data.session));

  if (returning) {
    // drop ?code / ?flow / ?error from the address bar, keep the route
    history.replaceState(null, "", `${location.pathname}${location.hash}`);
    if (params.has("error")) return "error";
  }

  return flow;
}

export async function getVerifiedUser() {
  const sb = await client();
  const { data, error } = await sb.auth.getUser(); // validated by the Auth server, not just local storage
  if (error || !data.user) {
    setUser(null);
    return null;
  }
  const user = toUser({ user: data.user });
  setUser(user);
  return user;
}

export async function signUp(email, password) {
  const sb = await client();
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: returnUrl("signup"), data: { language: getState().language } }
  });
  if (error) throw toAppError(error);
  // with email confirmation on, there is no session until the link is clicked
  return { needsConfirmation: !data.session };
}

export async function signIn(email, password) {
  const sb = await client();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw toAppError(error);
}

export async function signInWithGoogle() {
  const sb = await client();
  const { error } = await sb.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: returnUrl("oauth") }
  });
  if (error) throw toAppError(error);
  // the browser is now on its way to Google
}

export async function sendPasswordReset(email) {
  const sb = await client();
  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: returnUrl("recovery") });
  if (error) throw toAppError(error);
}

export async function updatePassword(password) {
  const sb = await client();
  const { error } = await sb.auth.updateUser({ password });
  if (error) throw toAppError(error);
}

export async function signOut() {
  const sb = await client();
  const { error } = await sb.auth.signOut();
  setUser(null);
  if (error) throw toAppError(error);
}


/* ---------- account data (RLS: only the visitor's own rows) ---------- */

export async function loadAccount() {
  const sb = await client();
  const user = getState().user;
  if (!user) throw new AppError("errors.sessionExpired");

  const [profile, orders, support, gifts] = await Promise.all([
    sb.from("profiles").select("display_name, avatar_url, created_at").eq("id", user.id).maybeSingle(),
    sb.from("orders")
      .select("id, order_number, total_cents, currency, payment_status, fulfillment_status, created_at, paid_at, order_items(product_id, product_name, quantity, total_price_cents)")
      .order("created_at", { ascending: false }),
    sb.from("support_contributions")
      .select("id, amount_cents, currency, payment_status, gift_eligible, created_at, paid_at")
      .order("created_at", { ascending: false }),
    sb.from("gifts")
      .select("id, support_contribution_id, gift_type, photo_path, photo_status, production_status, created_at")
      .order("created_at", { ascending: false })
  ]);

  const failed = [profile, orders, support, gifts].find((result) => result.error);
  if (failed) throw toAppError(failed.error, "errors.loadFailed");

  return {
    profile: profile.data || {},
    orders: orders.data || [],
    support: support.data || [],
    gifts: gifts.data || []
  };
}

export async function updateDisplayName(name) {
  const sb = await client();
  const user = getState().user;
  const { error } = await sb.from("profiles").update({ display_name: name.trim().slice(0, 80) || null }).eq("id", user.id);
  if (error) throw toAppError(error);
}


/* ---------- private photo storage ---------- */

function newPhotoName() {
  return `${crypto.randomUUID()}.jpg`;
}

export async function uploadOrderPhoto(blob) {
  const sb = await client();
  const user = getState().user;
  const path = `${user.id}/${newPhotoName()}`;
  const { error } = await sb.storage.from("order-photos").upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (error) throw toAppError(error, "errors.uploadFailed");
  return path;
}

export async function signedPhotoUrl(bucket, path) {
  const sb = await client();
  const { data, error } = await sb.storage.from(bucket).createSignedUrl(path, 60 * 30);
  if (error) throw toAppError(error, "errors.loadFailed");
  return data.signedUrl;
}

/* upload -> attach to the gift (server validates) -> remove the previous file */
export async function setGiftPhoto(gift, blob) {
  const sb = await client();
  const user = getState().user;
  const path = `${user.id}/${gift.id}/${newPhotoName()}`;

  const upload = await sb.storage.from("gift-photos").upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (upload.error) throw toAppError(upload.error, "errors.uploadFailed");

  const { data, error } = await sb.rpc("set_gift_photo", { p_gift_id: gift.id, p_path: path });
  if (error) {
    await sb.storage.from("gift-photos").remove([path]);
    throw toAppError(error, /locked/.test(error.message) ? "gift.locked" : "errors.uploadFailed");
  }

  if (gift.photo_path) {
    await sb.storage.from("gift-photos").remove([gift.photo_path]);
  }

  return data;
}

export async function removeGiftPhoto(gift) {
  const sb = await client();
  const { data, error } = await sb.rpc("clear_gift_photo", { p_gift_id: gift.id });
  if (error) throw toAppError(error, /locked/.test(error.message) ? "gift.locked" : "errors.generic");
  if (gift.photo_path) {
    await sb.storage.from("gift-photos").remove([gift.photo_path]);
  }
  return data;
}


/* ---------- Stripe Checkout (server-side session) ---------- */

export async function startCheckout(payload) {
  const sb = await client();
  const { data, error } = await sb.functions.invoke("create-checkout-session", {
    body: { ...payload, language: getState().language }
  });

  if (error) {
    let code = null;
    try {
      code = error.context && (await error.context.json()).error;
    } catch (parseError) { /* not JSON */ }
    debug(error);
    throw new AppError(FUNCTION_ERRORS[code] || (code ? "errors.generic" : "errors.network"));
  }

  if (!data || typeof data.url !== "string" || !/^https:\/\//.test(data.url)) {
    throw new AppError("errors.generic");
  }

  location.assign(data.url);
}

/* read-only: what the webhook has recorded for a Checkout Session */
export async function paymentRecord(kind, sessionId) {
  const sb = await client();
  const table = kind === "support" ? "support_contributions" : "orders";
  const columns = kind === "support"
    ? "id, amount_cents, payment_status, gift_eligible"
    : "id, order_number, total_cents, payment_status";
  const { data, error } = await sb.from(table).select(columns).eq("stripe_checkout_session_id", sessionId).maybeSingle();
  if (error) throw toAppError(error, "errors.loadFailed");
  return data;
}
