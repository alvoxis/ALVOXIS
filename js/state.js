/* =========================================================
   ALVOXIS — APP STATE
   ========================================================= */

import { DEFAULT_LANGUAGE, LANGUAGES } from "./translations.js";

const STATE_KEY = "alvoxis_state_v1";
const USERS_KEY = "alvoxis_users_v1";

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
  user: (saved && saved.user) || null
};

const listeners = new Set();

function persist() {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
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

export function getCartTotal() {
  return state.cart.reduce((sum, line) => sum + line.price * line.quantity, 0);
}

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.warn("ALVOXIS: could not save users", error);
  }
}

export function registerUser({ name, email, password }) {
  const users = loadUsers();
  const key = email.trim().toLowerCase();

  if (users[key]) {
    return { ok: false, error: "exists" };
  }

  users[key] = { name, email: key, password, orders: [] };
  saveUsers(users);

  state.user = { name, email: key };
  update();

  return { ok: true };
}

export function loginUser({ email, password }) {
  const users = loadUsers();
  const key = email.trim().toLowerCase();
  const record = users[key];

  if (!record || record.password !== password) {
    return { ok: false, error: "invalid" };
  }

  state.user = { name: record.name, email: record.email };
  update();

  return { ok: true };
}

export function logoutUser() {
  state.user = null;
  update();
}

export function getOrders() {
  if (!state.user) return [];
  const users = loadUsers();
  const record = users[state.user.email];
  return record ? record.orders : [];
}

export function addOrder(order) {
  if (!state.user) return;
  const users = loadUsers();
  const record = users[state.user.email];
  if (!record) return;

  record.orders.unshift(order);
  saveUsers(users);
  update();
}

document.documentElement.lang = state.language;
