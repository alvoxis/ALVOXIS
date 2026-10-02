/* =========================================================
   ALVOXIS — APP STATE
   ========================================================= */

import { DEFAULT_LANGUAGE, LANGUAGES } from "./translations.js";
import { getProduct } from "./products.js";

const STATE_KEY = "alvoxis_state_v1";

/* The old browser-only account system kept users — with
   plaintext passwords — and fake orders in localStorage.
   Remove whatever is left of it from this device. */
try {
  localStorage.removeItem("alvoxis_users_v1");
} catch (error) { /* storage unavailable */ }

function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.warn("ALVOXIS: could not read saved state", error);
    return null;
  }
}

function detectLanguage() {
  const nav = (navigator.language || "en").slice(0, 2).toLowerCase();
  return LANGUAGES.includes(nav) ? nav : DEFAULT_LANGUAGE;
}

const saved = loadState();

const state = {
  language: (saved && saved.language) || detectLanguage(),
  cart: (saved && saved.cart) || [],
  user: null // filled from the Supabase session at boot
};

const listeners = new Set();

function persist() {
  try {
    /* only UI preferences + the cart draft; never the user */
    localStorage.setItem(STATE_KEY, JSON.stringify({ language: state.language, cart: state.cart }));
  } catch (error) {
    console.warn("ALVOXIS: could not save state", error);
  }
}

function notify() {
  listeners.forEach((fn) => fn(state));
}

function update() {
  persist();
  notify();
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getState() {
  return state;
}

export function setLanguage(lang) {
  if (!LANGUAGES.includes(lang)) return;
  state.language = lang;
  document.documentElement.lang = lang;
  update();
}

function makeLineId() {
  return `line_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function addToCart({ productId, price, currency, photo, message, puzzleFormat, puzzlePieces, cardFormat }) {
  const line = {
    lineId: makeLineId(),
    productId,
    quantity: 1,
    price,
    currency,
    photo: photo || null,
    message: message || "",
    puzzleFormat: puzzleFormat || "A4",
    puzzlePieces: puzzlePieces || 120,
    cardFormat: cardFormat || "A6"
  };

  state.cart.push(line);
  update();
  return line.lineId;
}

export function removeFromCart(lineId) {
  state.cart = state.cart.filter((line) => line.lineId !== lineId);
  update();
}

export function updateCartLine(lineId, patch) {
  const line = state.cart.find((l) => l.lineId === lineId);
  if (!line) return;
  Object.assign(line, patch);
  update();
}

export function setQuantity(lineId, quantity) {
  const line = state.cart.find((l) => l.lineId === lineId);
  if (!line) return;
  line.quantity = Math.max(1, Math.min(10, quantity));
  update();
}

export function clearCart() {
  state.cart = [];
  update();
}

export function getCartCount() {
  return state.cart.reduce((sum, line) => sum + line.quantity, 0);
}

/* display only — the amount actually charged is computed by the server */
export function getCartTotal() {
  return state.cart.reduce((sum, line) => {
    const product = getProduct(line.productId);
    return sum + (product ? product.price : 0) * line.quantity;
  }, 0);
}

/* ---------- signed-in user ----------
   A snapshot of the Supabase session, kept in memory only.
   Supabase Auth is the source of truth; nothing about the user
   is ever written to localStorage by ALVOXIS itself. */

export function setUser(user) {
  const before = state.user ? state.user.id : null;
  state.user = user;
  if ((user ? user.id : null) !== before) notify();
}

document.documentElement.lang = state.language;
