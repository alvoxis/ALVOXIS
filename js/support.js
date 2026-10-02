/* =========================================================
   ALVOXIS — SUPPORT THE STORY (the last page of the book)

   The visitor picks €1.00–€100.00. The amount is checked here
   for a friendly answer, and checked again by the
   create-checkout-session Edge Function, which is the one that
   decides. Payment is confirmed only by the Stripe webhook;
   €50.00+ unlocks the keepsake puzzle there, server-side.
   ========================================================= */

import { t } from "./translations.js";
import { getState, subscribe } from "./state.js";
import { AppError, backendConfigured, rememberNext, startCheckout } from "./api.js";

const MIN_CENTS = 100;
const MAX_CENTS = 10000;
const GIFT_CENTS = 5000;
const AMOUNT_KEY = "alvoxis_support_amount";

const TIERS = [
  { from: 5000, key: "support.tier5" },
  { from: 2500, key: "support.tier4" },
  { from: 1000, key: "support.tier3" },
  { from: 500, key: "support.tier2" },
  { from: 100, key: "support.tier1" }
];

/* "12" / "12.5" / "12,50" -> cents, or null */
export function parseAmount(text) {
  const value = String(text || "").trim().replace(",", ".");
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(value)) return null;
  const [whole, fraction = ""] = value.split(".");
  const cents = Number(whole) * 100 + Number((fraction + "00").slice(0, 2));
  return cents >= MIN_CENTS && cents <= MAX_CENTS ? cents : null;
}

function centsToInput(cents) {
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2);
}

export function initSupport() {

  const form = document.getElementById("supportForm");
  if (!form) return;

  const input = document.getElementById("supportAmount");
  const chips = Array.from(form.querySelectorAll(".support-chip"));
  const mood = document.getElementById("supportMood");
  const gift = document.getElementById("supportGift");
  const errorEl = document.getElementById("supportError");
  const submit = document.getElementById("supportSubmit");

  let attemptId = null; // one id per amount: a double click can never pay twice
  let busy = false;

  const lang = () => getState().language;

  function showError(html) {
    errorEl.innerHTML = html;
    errorEl.hidden = !html;
  }

  function render() {
    const raw = input.value.trim();
    const cents = parseAmount(raw);

    chips.forEach((chip) => {
      const active = cents !== null && Number(chip.dataset.amount) * 100 === cents;
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-pressed", active ? "true" : "false");
    });

    if (cents === null) {
      mood.textContent = t(lang(), "support.prompt");
      mood.classList.remove("is-lit");
      gift.hidden = true;
      input.setAttribute("aria-invalid", raw ? "true" : "false");
    } else {
      mood.textContent = t(lang(), TIERS.find((tier) => cents >= tier.from).key);
      mood.classList.add("is-lit");
      gift.hidden = cents < GIFT_CENTS;
      input.setAttribute("aria-invalid", "false");
    }

    if (!busy) submit.textContent = t(lang(), "support.cta");
  }

  function setAmount(cents) {
    input.value = centsToInput(cents);
    attemptId = null;
    showError("");
    render();
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => setAmount(Number(chip.dataset.amount) * 100));
  });

  input.addEventListener("input", () => {
    input.value = input.value.replace(/[^\d.,]/g, "");
    attemptId = null;
    showError("");
    render();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy) return;

    const cents = parseAmount(input.value);
    if (cents === null) {
      showError(t(lang(), "support.invalidAmount"));
      input.focus();
      return;
    }

    if (!backendConfigured) {
      showError(t(lang(), "errors.paymentsUnavailable"));
      return;
    }

    if (!getState().user) {
      try { sessionStorage.setItem(AMOUNT_KEY, String(cents)); } catch (error) { /* private mode */ }
      rememberNext("#/?page=support");
      showError(`${t(lang(), "support.signInFirst")} <a href="#/account" class="support-signin">${t(lang(), "support.signIn")}</a>`);
      return;
    }

    attemptId = attemptId || crypto.randomUUID();
    busy = true;
    submit.disabled = true;
    submit.setAttribute("aria-busy", "true");
    submit.textContent = t(lang(), "support.redirecting");
    showError("");

    try {
      await startCheckout({ kind: "support", amount: (cents / 100).toFixed(2), attempt_id: attemptId });
      // the browser is leaving for Stripe; keep the button disabled
    } catch (error) {
      busy = false;
      submit.disabled = false;
      submit.removeAttribute("aria-busy");
      showError(t(lang(), error instanceof AppError ? error.key : "errors.generic"));
      render();
    }
  });

  /* back from sign-in: restore the amount the visitor had chosen */
  try {
    const saved = Number(sessionStorage.getItem(AMOUNT_KEY));
    if (saved >= MIN_CENTS && saved <= MAX_CENTS) {
      setAmount(saved);
      sessionStorage.removeItem(AMOUNT_KEY);
    }
  } catch (error) { /* private mode */ }

  /* the browser's back button from Stripe can restore this page from cache */
  window.addEventListener("pageshow", () => {
    busy = false;
    submit.disabled = false;
    submit.removeAttribute("aria-busy");
    render();
  });

  let renderedLanguage = lang();
  subscribe(() => {
    if (lang() !== renderedLanguage) {
      renderedLanguage = lang();
      render();
      if (!errorEl.hidden) showError("");
    }
  });

  render();
}
