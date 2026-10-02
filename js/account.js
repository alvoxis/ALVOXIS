/* =========================================================
   ALVOXIS — ACCOUNT

   Signed out:  sign in · create account · forgot password ·
                choose a new password (after the email link)
                Email + password, or Google. (No Apple.)
   Signed in:   five chapters — Profile · Orders · Support ·
                Gift · Settings — read from Supabase through
                RLS, so a visitor only ever sees their own.
   ========================================================= */

import { t } from "./translations.js";
import { formatPrice } from "./products.js";
import { getState, setLanguage } from "./state.js";
import { getQuery, navigate } from "./router.js";
import {
  AppError, backendConfigured, getVerifiedUser, loadAccount, removeGiftPhoto, sendPasswordReset,
  setGiftPhoto, signedPhotoUrl, signIn, signInWithGoogle, signOut, signUp, takeNext,
  updateDisplayName, updatePassword
} from "./api.js";
import { PHOTO_ACCEPT, PhotoError, preparePhoto } from "./photos.js";
import { LANGUAGES } from "./translations.js";

const PASSWORD_MIN = 8;
const CHAPTERS = ["profile", "orders", "support", "gift", "settings"];
const NUMERALS = ["I", "II", "III", "IV", "V"];

let authReady = false;
let cache = null; // { userId, at, data }

export function markAuthReady() {
  authReady = true;
}

export function forgetAccountData() {
  cache = null;
}

const lang = () => getState().language;
const tr = (key) => t(lang(), key);

export function esc(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  }[c]));
}

function money(cents) {
  return formatPrice((cents || 0) / 100, "EUR");
}

function longDate(value) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat(lang(), { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
  } catch (error) {
    return new Date(value).toLocaleDateString();
  }
}

function errorText(error) {
  return tr(error instanceof AppError ? error.key : "errors.generic");
}

/* disable a button while a request runs; double clicks do nothing */
async function busy(button, labelKey, task) {
  if (button.disabled) return;
  const label = button.textContent;
  button.disabled = true;
  button.setAttribute("aria-busy", "true");
  button.textContent = tr(labelKey);
  try {
    await task();
  } finally {
    if (button.isConnected) {
      button.disabled = false;
      button.removeAttribute("aria-busy");
      button.textContent = label;
    }
  }
}

function showFormError(form, message) {
  const el = form.querySelector(".form-error");
  if (!el) return;
  el.textContent = message || "";
  el.hidden = !message;
}

const GOOGLE_ICON = `<svg class="google-mark" viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path fill="#EA4335" d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z"/><path fill="#4285F4" d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.1.83-.64 2.08-1.84 2.92l2.84 2.2c1.7-1.57 2.68-3.88 2.68-6.62z"/><path fill="#FBBC05" d="M3.88 10.78A5.54 5.54 0 0 1 3.58 9c0-.62.11-1.22.29-1.78L.96 4.96A9.008 9.008 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.92-2.26z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.4-1.57-5.12-3.74L.97 13.04C2.45 15.98 5.48 18 9 18z"/></svg>`;


/* =======================================================
   ENTRY
======================================================= */

export function renderAccountView() {
  const root = document.getElementById("accountContent");
  const query = getQuery();
  const mode = query.get("mode");
  const user = getState().user;

  if (!backendConfigured) {
    root.innerHTML = shell(tr("account.title"), `<p class="account-lead">${esc(tr("errors.unavailable"))}</p>`);
    return;
  }

  if (!authReady) {
    root.innerHTML = shell(tr("account.title"), `<p class="account-lead" aria-busy="true">${esc(tr("common.loading"))}</p>`);
    return;
  }

  if (mode === "reset") {
    renderResetPassword(root, user);
    return;
  }

  if (!user) {
    renderAuth(root, ["register", "forgot", "check", "sent"].includes(mode) ? mode : "signin");
    return;
  }

  const tab = CHAPTERS.includes(query.get("tab")) ? query.get("tab") : "profile";
  renderDashboard(root, user, tab);
}

function shell(title, body, eyebrow = tr("account.eyebrow")) {
  return `
    <div class="account-shell">
      <p class="eyebrow">${esc(eyebrow)}</p>
      <h1 class="account-title">${esc(title)}</h1>
      ${body}
    </div>
  `;
}


/* =======================================================
   SIGNED OUT
======================================================= */

function renderAuth(root, mode) {

  if (mode === "check" || mode === "sent") {
    const key = mode === "check" ? "auth.checkEmail" : "auth.resetSent";
    root.innerHTML = shell(tr(mode === "check" ? "auth.checkEmailTitle" : "auth.resetSentTitle"), `
      <p class="account-lead">${esc(tr(key))}</p>
      <div class="step-actions"><a class="ghost-action" href="#/account">${esc(tr("auth.backToSignIn"))}</a></div>
    `);
    return;
  }

  if (mode === "forgot") {
    root.innerHTML = shell(tr("auth.forgotTitle"), `
      <form class="auth-form auth-card" id="forgotForm" novalidate>
        <p class="account-lead">${esc(tr("auth.forgotText"))}</p>
        <label>${esc(tr("account.email"))} <input type="email" name="email" autocomplete="email" required></label>
        <p class="form-error" role="alert" hidden></p>
        <button type="submit" class="primary-action">${esc(tr("auth.sendLink"))}</button>
        <a class="text-link" href="#/account">${esc(tr("auth.backToSignIn"))}</a>
      </form>
    `);

    const form = root.querySelector("#forgotForm");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const button = form.querySelector("button[type=submit]");
      busy(button, "auth.sending", async () => {
        try {
          await sendPasswordReset(form.email.value.trim());
          navigate("/account?mode=sent");
        } catch (error) {
          showFormError(form, errorText(error));
        }
      });
    });
    return;
  }

  const register = mode === "register";

  root.innerHTML = shell(tr(register ? "auth.registerTitle" : "auth.signInTitle"), `
    <div class="auth-card">
      <p class="account-lead">${esc(tr(register ? "auth.registerLead" : "auth.signInLead"))}</p>

      <button type="button" class="provider-btn" id="googleBtn">${GOOGLE_ICON}<span>${esc(tr("account.google"))}</span></button>
      <p class="form-error" id="googleError" role="alert" hidden></p>

      <div class="auth-divider"><span>${esc(tr("auth.or"))}</span></div>

      <form class="auth-form" id="${register ? "registerForm" : "signinForm"}" novalidate>
        <label>${esc(tr("account.email"))} <input type="email" name="email" autocomplete="email" required></label>
        <label>${esc(tr("account.password"))}
          <input type="password" name="password" autocomplete="${register ? "new-password" : "current-password"}" required ${register ? `minlength="${PASSWORD_MIN}"` : ""}>
        </label>
        ${register ? `
          <label>${esc(tr("account.confirmPassword"))} <input type="password" name="confirmPassword" autocomplete="new-password" required minlength="${PASSWORD_MIN}"></label>
          <p class="field-hint">${esc(tr("auth.passwordHint"))}</p>
        ` : ""}
        <p class="form-error" role="alert" hidden></p>
        <button type="submit" class="primary-action">${esc(tr(register ? "account.createAccount" : "account.signIn"))}</button>
      </form>

      <div class="auth-switch">
        ${register
          ? `<span>${esc(tr("account.haveAccount"))}</span> <a class="text-link" href="#/account">${esc(tr("account.logIn"))}</a>`
          : `<a class="text-link" href="#/account?mode=forgot">${esc(tr("auth.forgot"))}</a>
             <span>${esc(tr("account.noAccount"))} <a class="text-link" href="#/account?mode=register">${esc(tr("account.register"))}</a></span>`}
      </div>
    </div>
  `);

  const googleButton = root.querySelector("#googleBtn");
  googleButton.addEventListener("click", () => {
    busy(googleButton, "auth.redirecting", async () => {
      try {
        await signInWithGoogle();
        await new Promise(() => {}); // stay "busy" while the browser leaves for Google
      } catch (error) {
        const el = root.querySelector("#googleError");
        el.textContent = errorText(error);
        el.hidden = false;
      }
    });
  });

  const form = root.querySelector("form.auth-form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    showFormError(form, "");

    const email = form.email.value.trim();
    const password = form.password.value;

    if (register && password && password.length < PASSWORD_MIN) {
      showFormError(form, tr("errors.weakPassword"));
      return;
    }

    if (!form.reportValidity()) return;

    if (register && password !== form.confirmPassword.value) {
      showFormError(form, tr("account.errorPasswordMatch"));
      return;
    }

    const button = form.querySelector("button[type=submit]");
    busy(button, register ? "auth.creating" : "auth.signingIn", async () => {
      try {
        if (register) {
          const { needsConfirmation } = await signUp(email, password);
          if (needsConfirmation) {
            navigate("/account?mode=check");
            return;
          }
        } else {
          await signIn(email, password);
        }
        afterSignIn();
      } catch (error) {
        showFormError(form, errorText(error));
      }
    });
  });
}

/* where a visitor goes once they are signed in */
export function afterSignIn() {
  const next = takeNext();
  if (next && next.startsWith("#/")) {
    window.location.hash = next.slice(1);
  } else if (window.location.hash === "#/account") {
    renderAccountView();
  } else {
    navigate("/account");
  }
}

function renderResetPassword(root, user) {
  if (!user) {
    root.innerHTML = shell(tr("auth.resetTitle"), `
      <p class="account-lead">${esc(tr("auth.resetLinkInvalid"))}</p>
      <div class="step-actions"><a class="ghost-action" href="#/account?mode=forgot">${esc(tr("auth.sendLink"))}</a></div>
    `);
    return;
  }

  root.innerHTML = shell(tr("auth.resetTitle"), `
    <form class="auth-form auth-card" id="resetForm" novalidate>
      <p class="account-lead">${esc(tr("auth.resetLead"))}</p>
      <label>${esc(tr("auth.newPassword"))} <input type="password" name="password" autocomplete="new-password" minlength="${PASSWORD_MIN}" required></label>
      <label>${esc(tr("account.confirmPassword"))} <input type="password" name="confirmPassword" autocomplete="new-password" minlength="${PASSWORD_MIN}" required></label>
      <p class="field-hint">${esc(tr("auth.passwordHint"))}</p>
      <p class="form-error" role="alert" hidden></p>
      <button type="submit" class="primary-action">${esc(tr("auth.savePassword"))}</button>
    </form>
  `);

  const form = root.querySelector("#resetForm");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    showFormError(form, "");
    if (form.password.value && form.password.value.length < PASSWORD_MIN) return showFormError(form, tr("errors.weakPassword"));
    if (!form.reportValidity()) return;
    if (form.password.value !== form.confirmPassword.value) return showFormError(form, tr("account.errorPasswordMatch"));

    busy(form.querySelector("button[type=submit]"), "auth.saving", async () => {
      try {
        await updatePassword(form.password.value);
        navigate("/account?tab=profile&updated=password");
      } catch (error) {
        showFormError(form, errorText(error));
      }
    });
  });
}


/* =======================================================
   SIGNED IN — five chapters
======================================================= */

async function accountData(user, force = false) {
  if (!force && cache && cache.userId === user.id && Date.now() - cache.at < 20000) return cache.data;
  const data = await loadAccount();
  cache = { userId: user.id, at: Date.now(), data };
  return data;
}

async function renderDashboard(root, user, tab) {

  const nav = CHAPTERS.map((chapter, i) => `
    <a href="#/account?tab=${chapter}" class="account-chapter-link ${chapter === tab ? "is-active" : ""}"
       ${chapter === tab ? 'aria-current="page"' : ""}>
      <span class="chapter-numeral" aria-hidden="true">${NUMERALS[i]}</span>
      <span>${esc(tr(`account.chapters.${chapter}`))}</span>
    </a>
  `).join("");

  const title = (cache && cache.userId === user.id && cache.data.profile.display_name) || user.name || tr("account.dashboard");

  root.innerHTML = shell(title, `
    <nav class="account-chapters" aria-label="${esc(tr("account.title"))}">${nav}</nav>
    <section class="account-chapter" id="accountChapter" aria-busy="true">
      <p class="account-lead">${esc(tr("common.loading"))}</p>
    </section>
  `);

  const panel = root.querySelector("#accountChapter");
  const updated = getQuery().get("updated");

  /* on a phone the chapter strip scrolls: keep the open chapter in view */
  const active = root.querySelector(".account-chapter-link.is-active");
  if (active) active.scrollIntoView({ block: "nearest", inline: "center" });

  let data;
  try {
    data = await accountData(user);
  } catch (error) {
    if (!panel.isConnected) return;
    panel.removeAttribute("aria-busy");
    panel.innerHTML = `
      <p class="account-lead">${esc(errorText(error))}</p>
      <button type="button" class="ghost-action" id="retryAccount">${esc(tr("common.retry"))}</button>
    `;
    panel.querySelector("#retryAccount").addEventListener("click", () => renderDashboard(root, user, tab));
    return;
  }

  if (!panel.isConnected) return; // the visitor moved on while we were loading
  panel.removeAttribute("aria-busy");

  const heading = root.querySelector(".account-title");
  heading.textContent = data.profile.display_name || user.name || tr("account.dashboard");

  const notice = updated === "password" ? `<p class="account-notice is-success" role="status">${esc(tr("auth.passwordUpdated"))}</p>` : "";

  const chapters = { profile: profileChapter, orders: ordersChapter, support: supportChapter, gift: giftChapter, settings: settingsChapter };
  panel.innerHTML = notice + `<h2 class="chapter-heading">${esc(tr(`account.chapters.${tab}`))}</h2>`;
  const body = document.createElement("div");
  panel.appendChild(body);
  chapters[tab](body, user, data, () => renderDashboard(root, user, tab));
}

function signOutButton() {
  return `<button type="button" class="ghost-action" data-sign-out>${esc(tr("account.logOut"))}</button>`;
}

function wireSignOut(container) {
  container.querySelectorAll("[data-sign-out]").forEach((button) => {
    button.addEventListener("click", () => busy(button, "auth.signingOut", async () => {
      try {
        await signOut();
      } catch (error) { /* the local session is gone either way */ }
      forgetAccountData();
      navigate("/account");
    }));
  });
}

function profileChapter(el, user, data) {
  const providers = (user.providers || []).map((p) => (p === "google" ? "Google" : tr("account.methodEmail"))).join(" · ");

  el.innerHTML = `
    <dl class="account-facts">
      <div><dt>${esc(tr("account.email"))}</dt><dd>${esc(user.email)}</dd></div>
      <div><dt>${esc(tr("account.name"))}</dt><dd>${esc(data.profile.display_name || user.name || "—")}</dd></div>
      <div><dt>${esc(tr("account.memberSince"))}</dt><dd>${esc(longDate(user.createdAt || data.profile.created_at))}</dd></div>
      <div><dt>${esc(tr("account.signInMethod"))}</dt><dd>${esc(providers || "—")}</dd></div>
    </dl>
    <div class="step-actions">${signOutButton()}</div>
  `;
  wireSignOut(el);
}

function statusLabel(group, status) {
  return tr(`account.${group}.${status}`) || status;
}

function ordersChapter(el, user, data) {
  const orders = data.orders.filter((o) => !["canceled", "expired"].includes(o.payment_status));

  if (!orders.length) {
    el.innerHTML = `
      <p class="account-lead">${esc(tr("account.noOrders"))}</p>
      <div class="step-actions"><a class="primary-action" href="#/">${esc(tr("cart.continueShopping"))}</a></div>
    `;
    return;
  }

  el.innerHTML = `<ul class="ledger">${orders.map((order) => `
    <li class="ledger-entry">
      <div class="ledger-main">
        <strong>${esc(order.order_number)}</strong>
        <span class="ledger-date">${esc(longDate(order.created_at))}</span>
      </div>
      <ul class="ledger-items">
        ${(order.order_items || []).map((item) => `<li>${esc(tr(`products.${item.product_id}.name`) || item.product_name)} × ${esc(item.quantity)}</li>`).join("")}
      </ul>
      <div class="ledger-meta">
        <span class="ledger-amount">${esc(money(order.total_cents))}</span>
        <span class="status-chip is-${esc(order.payment_status)}">${esc(statusLabel("payment", order.payment_status))}</span>
        ${order.payment_status === "paid" ? `<span class="status-chip">${esc(statusLabel("fulfillment", order.fulfillment_status))}</span>` : ""}
      </div>
    </li>
  `).join("")}</ul>`;
}

function giftStatus(gift) {
  if (gift.production_status !== "not_started") return `gift.status.${gift.production_status}`;
  return {
    pending: "gift.status.photoPending",
    uploaded: "gift.status.photoUploaded",
    approved: "gift.status.approved",
    rejected: "gift.status.rejected"
  }[gift.photo_status] || "gift.status.photoPending";
}

function supportChapter(el, user, data) {
  const recent = (row) => Date.now() - new Date(row.created_at).getTime() < 30 * 60 * 1000;
  const rows = data.support.filter((row) => ["paid", "refunded", "failed"].includes(row.payment_status) || (row.payment_status === "pending" && recent(row)));

  if (!rows.length) {
    el.innerHTML = `
      <p class="account-lead">${esc(tr("account.noSupport"))}</p>
      <div class="step-actions"><a class="primary-action" href="#/?page=support">${esc(tr("support.cta"))}</a></div>
    `;
    return;
  }

  el.innerHTML = `
    <p class="account-lead">${esc(tr("account.supportThanks"))}</p>
    <ul class="ledger">${rows.map((row) => {
      const gift = data.gifts.find((g) => g.support_contribution_id === row.id);
      return `
        <li class="ledger-entry">
          <div class="ledger-main">
            <strong>${esc(tr("account.supportEntry"))}</strong>
            <span class="ledger-date">${esc(longDate(row.paid_at || row.created_at))}</span>
          </div>
          <div class="ledger-meta">
            <span class="ledger-amount">${esc(money(row.amount_cents))}</span>
            <span class="status-chip is-${esc(row.payment_status)}">${esc(statusLabel("payment", row.payment_status))}</span>
            ${row.gift_eligible ? `<span class="status-chip is-gift">${esc(tr("gift.unlocked"))}</span>` : ""}
            ${gift ? `<a class="status-chip is-link" href="#/account?tab=gift">${esc(tr(giftStatus(gift)))}</a>` : ""}
          </div>
        </li>
      `;
    }).join("")}</ul>
  `;
}

function giftChapter(el, user, data, rerender) {
  if (!data.gifts.length) {
    el.innerHTML = `
      <p class="account-lead">${esc(tr("gift.none"))}</p>
      <div class="step-actions"><a class="primary-action" href="#/?page=support">${esc(tr("support.cta"))}</a></div>
    `;
    return;
  }

  el.innerHTML = data.gifts.map((gift) => {
    const locked = gift.production_status !== "not_started" || gift.photo_status === "approved";
    return `
      <article class="gift-card" data-gift="${esc(gift.id)}">
        <p class="eyebrow">${esc(tr("gift.puzzle"))}</p>
        <h3>${esc(tr(gift.photo_path ? "gift.titleReady" : "gift.title"))}</h3>
        <p class="account-lead">${esc(tr(gift.photo_path ? "gift.textReady" : "gift.text"))}</p>
        <p><span class="status-chip is-gift">${esc(tr(giftStatus(gift)))}</span></p>

        <div class="gift-photo">
          ${gift.photo_path
            ? `<img class="gift-preview" alt="${esc(tr("gift.previewAlt"))}" data-photo="${esc(gift.photo_path)}">`
            : `<div class="gift-empty">${esc(tr("gift.noPhoto"))}</div>`}
        </div>

        ${locked ? `<p class="field-hint">${esc(tr("gift.locked"))}</p>` : `
          <input type="file" class="gift-file" accept="${PHOTO_ACCEPT}" hidden>
          <div class="step-actions">
            <button type="button" class="primary-action" data-action="upload">${esc(tr(gift.photo_path ? "gift.replace" : "gift.upload"))}</button>
            ${gift.photo_path ? `<button type="button" class="ghost-action" data-action="remove">${esc(tr("gift.remove"))}</button>` : ""}
          </div>
          <p class="field-hint">${esc(tr("gift.photoHint"))}</p>
        `}
        <p class="form-error" role="alert" hidden></p>
      </article>
    `;
  }).join("");

  el.querySelectorAll(".gift-card").forEach((card) => {
    const gift = data.gifts.find((g) => g.id === card.dataset.gift);
    const error = (message) => {
      const box = card.querySelector(".form-error");
      box.textContent = message || "";
      box.hidden = !message;
    };

    const preview = card.querySelector(".gift-preview");
    if (preview) {
      signedPhotoUrl("gift-photos", gift.photo_path)
        .then((url) => { preview.src = url; })
        .catch((e) => error(errorText(e)));
    }

    const file = card.querySelector(".gift-file");
    const upload = card.querySelector('[data-action="upload"]');
    const remove = card.querySelector('[data-action="remove"]');

    if (upload) {
      upload.addEventListener("click", () => file.click());
      file.addEventListener("change", () => {
        const chosen = file.files[0];
        file.value = "";
        if (!chosen) return;
        error("");
        busy(upload, "gift.uploading", async () => {
          try {
            const { blob } = await preparePhoto(chosen);
            await setGiftPhoto(gift, blob);
            forgetAccountData();
            rerender();
          } catch (e) {
            error(e instanceof PhotoError ? tr(`photo.${e.code}`) : errorText(e));
          }
        });
      });
    }

    if (remove) {
      remove.addEventListener("click", () => {
        if (!window.confirm(tr("gift.removeConfirm"))) return;
        error("");
        busy(remove, "gift.removing", async () => {
          try {
            await removeGiftPhoto(gift);
            forgetAccountData();
            rerender();
          } catch (e) {
            error(errorText(e));
          }
        });
      });
    }
  });
}

function settingsChapter(el, user, data, rerender) {
  el.innerHTML = `
    <form class="auth-form settings-block" id="nameForm" novalidate>
      <h3>${esc(tr("account.displayName"))}</h3>
      <label>${esc(tr("account.name"))} <input type="text" name="name" maxlength="80" autocomplete="name" value="${esc(data.profile.display_name || user.name || "")}"></label>
      <p class="form-error" role="alert" hidden></p>
      <p class="form-success" role="status" hidden>${esc(tr("account.saved"))}</p>
      <button type="submit" class="ghost-action">${esc(tr("common.save"))}</button>
    </form>

    ${user.hasPassword ? `
      <form class="auth-form settings-block" id="passwordForm" novalidate>
        <h3>${esc(tr("auth.changePassword"))}</h3>
        <label>${esc(tr("auth.newPassword"))} <input type="password" name="password" autocomplete="new-password" minlength="${PASSWORD_MIN}" required></label>
        <label>${esc(tr("account.confirmPassword"))} <input type="password" name="confirmPassword" autocomplete="new-password" minlength="${PASSWORD_MIN}" required></label>
        <p class="form-error" role="alert" hidden></p>
        <p class="form-success" role="status" hidden>${esc(tr("auth.passwordUpdated"))}</p>
        <button type="submit" class="ghost-action">${esc(tr("auth.savePassword"))}</button>
      </form>
    ` : ""}

    <div class="settings-block">
      <h3>${esc(tr("a11y.language"))}</h3>
      <div class="settings-languages" role="group" aria-label="${esc(tr("a11y.language"))}">
        ${LANGUAGES.map((code) => `<button type="button" class="support-chip ${code === lang() ? "is-active" : ""}" aria-pressed="${code === lang()}" data-set-lang="${code}">${code.toUpperCase()}</button>`).join("")}
      </div>
    </div>

    <div class="settings-block">${signOutButton()}</div>
  `;

  wireSignOut(el);

  el.querySelectorAll("[data-set-lang]").forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.setLang));
  });

  const nameForm = el.querySelector("#nameForm");
  nameForm.addEventListener("submit", (event) => {
    event.preventDefault();
    showFormError(nameForm, "");
    nameForm.querySelector(".form-success").hidden = true;
    busy(nameForm.querySelector("button[type=submit]"), "auth.saving", async () => {
      try {
        await updateDisplayName(nameForm.name.value);
        forgetAccountData();
        nameForm.querySelector(".form-success").hidden = false;
        document.querySelector(".account-title").textContent = nameForm.name.value.trim() || user.name || tr("account.dashboard");
      } catch (error) {
        showFormError(nameForm, errorText(error));
      }
    });
  });

  const passwordForm = el.querySelector("#passwordForm");
  if (passwordForm) {
    passwordForm.addEventListener("submit", (event) => {
      event.preventDefault();
      showFormError(passwordForm, "");
      passwordForm.querySelector(".form-success").hidden = true;
      if (passwordForm.password.value && passwordForm.password.value.length < PASSWORD_MIN) return showFormError(passwordForm, tr("errors.weakPassword"));
      if (!passwordForm.reportValidity()) return;
      if (passwordForm.password.value !== passwordForm.confirmPassword.value) return showFormError(passwordForm, tr("account.errorPasswordMatch"));
      busy(passwordForm.querySelector("button[type=submit]"), "auth.saving", async () => {
        try {
          await updatePassword(passwordForm.password.value);
          passwordForm.reset();
          passwordForm.querySelector(".form-success").hidden = false;
        } catch (error) {
          showFormError(passwordForm, errorText(error));
        }
      });
    });
  }
}

/* re-validate the session with the Auth server when Account opens */
export async function verifySession() {
  if (!backendConfigured || !getState().user) return;
  try {
    await getVerifiedUser();
  } catch (error) { /* offline: keep the local session for now */ }
}
