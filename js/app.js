/* =========================================================
   ALVOXIS — APP
   Wires together: router, state, translations, products,
   and every view renderer. This is the single entry point
   loaded by index.html.
   ========================================================= */

import { LANGUAGES, t } from "./translations.js";
import { PRODUCTS, getProduct, formatPrice } from "./products.js";
import {
  getState, subscribe, setLanguage,
  addToCart, removeFromCart, setQuantity, getCartCount, getCartTotal, clearCart, updateCartLine
} from "./state.js";
import { registerRoute, navigate, initRouter, rerenderCurrentRoute, getQuery } from "./router.js";
import { initHomeExperience } from "./main.js";
import {
  AppError, backendConfigured, initAuth, paymentRecord, rememberNext, startCheckout, uploadOrderPhoto
} from "./api.js";
import { afterSignIn, esc, forgetAccountData, markAuthReady, renderAccountView, verifySession } from "./account.js";
import { initSupport } from "./support.js";
import {
  PHOTO_ACCEPT, PhotoError, dataUrlToBlob, deleteDraftPhoto, loadDraftPhoto, preparePhoto, saveDraftPhoto
} from "./photos.js";


/* =======================================================
   TRANSLATIONS
   · [data-i18n="key"]            -> element text
   · [data-i18n-aria-label="key"] -> aria-label (same for the
     other attributes in I18N_ATTRIBUTES)
   Views rendered from JS call t() directly and are re-rendered
   when the language changes (see BOOT).
======================================================= */

const I18N_ATTRIBUTES = ["aria-label", "aria-roledescription", "alt", "placeholder", "title", "content"];

function applyTranslations() {
  const lang = getState().language;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const value = t(lang, el.dataset.i18n);
    if (typeof value !== "string" || !value) return; // keep existing HTML fallback text
    el.textContent = value;
  });

  I18N_ATTRIBUTES.forEach((attribute) => {
    document.querySelectorAll(`[data-i18n-${attribute}]`).forEach((el) => {
      const value = t(lang, el.getAttribute(`data-i18n-${attribute}`));
      if (typeof value === "string" && value) el.setAttribute(attribute, value);
    });
  });

  document.querySelectorAll("[data-price]").forEach((el) => {
    const product = getProduct(el.dataset.price);
    if (product) el.textContent = formatPrice(product.price, product.currency);
  });

  document.getElementById("langCurrent").textContent = lang.toUpperCase();
  document.documentElement.lang = lang;
}


/* =======================================================
   HEADER — language selector, cart badge, mobile menu
======================================================= */

function initHeader() {

  const langSelect = document.getElementById("langSelect");
  const langCurrent = document.getElementById("langCurrent");
  const langMenu = document.getElementById("langMenu");

  langCurrent.addEventListener("click", () => {
    const isOpen = langSelect.classList.toggle("is-open");
    langCurrent.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (!langSelect.contains(event.target)) {
      langSelect.classList.remove("is-open");
      langCurrent.setAttribute("aria-expanded", "false");
    }
  });

  langMenu.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setLanguage(btn.dataset.lang);
      langSelect.classList.remove("is-open");
    });
  });

  const mobileMenuButton = document.getElementById("mobileMenuButton");
  const mobileNav = document.getElementById("mobileNav");

  mobileMenuButton.setAttribute("aria-expanded", "false");
  mobileMenuButton.setAttribute("aria-controls", "mobileNav");
  mobileMenuButton.addEventListener("click", () => {
    mobileNav.hidden = !mobileNav.hidden;
    mobileMenuButton.setAttribute("aria-expanded", String(!mobileNav.hidden));
  });

  mobileNav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => { mobileNav.hidden = true; });
  });

  /* Escape closes whatever is open */
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (langSelect.classList.contains("is-open")) {
      langSelect.classList.remove("is-open");
      langCurrent.setAttribute("aria-expanded", "false");
      langCurrent.focus();
    }
    if (!mobileNav.hidden) {
      mobileNav.hidden = true;
      mobileMenuButton.setAttribute("aria-expanded", "false");
      mobileMenuButton.focus();
    }
  });

  updateCartBadge();
}

function updateCartBadge() {
  const el = document.getElementById("cartCount");
  const count = getCartCount();
  el.textContent = String(count);
  el.classList.toggle("is-empty", count === 0);
}


/* =======================================================
   VIEW: PRODUCT
======================================================= */

function renderProductView(params) {
  const lang = getState().language;
  const product = getProduct(params.id);
  const root = document.getElementById("productContent");

  if (!product) {
    root.innerHTML = `<p class="empty-note">${t(lang, "product.unavailable")}</p>`;
    return;
  }

  const name = t(lang, `products.${product.id}.name`);
  const tagline = t(lang, `products.${product.id}.tagline`);
  const contentsList = t(lang, "product.contentsList");
  const image = product.images[0] || "";

  root.innerHTML = `
    <a class="back-link" href="#/">← ${t(lang, "product.backToCatalog")}</a>

    <div class="product-layout">

      <div class="product-media">
        ${image ? `<img src="${image}" alt="${name}">` : `<div class="product-media-empty">${t(lang, "catalog.comingSoon")}</div>`}
      </div>

      <div class="product-info">
        <p class="eyebrow">${t(lang, "catalog.eyebrow")}</p>
        <h1>${name}</h1>
        <p class="product-tagline">${tagline}</p>

        <strong class="product-price">${formatPrice(product.price, product.currency)}</strong>

        <div class="product-contents">
          <p class="product-contents-title">${t(lang, "product.contains")}</p>
          <ul>
            ${(Array.isArray(contentsList) ? contentsList : []).map((line) => `<li>${line}</li>`).join("")}
          </ul>
        </div>

        ${
          product.available
            ? `<button class="primary-action" id="selectGiftBtn">${t(lang, "product.selectGift")}</button>`
            : `<span class="unavailable-badge">${t(lang, "product.unavailable")}</span>`
        }
      </div>

    </div>
  `;

  const selectBtn = document.getElementById("selectGiftBtn");
  if (selectBtn) {
    selectBtn.addEventListener("click", () => navigate(`/personalize/${product.id}`));
  }
}


/* =======================================================
   VIEW: PERSONALIZE
   3 steps kept in memory per product id. The photo is
   validated and re-encoded (js/photos.js); once in the cart it
   waits in IndexedDB on this device, and is uploaded to
   private storage only at checkout.
======================================================= */

const MESSAGE_MAX = 240;
const drafts = {}; // productId -> { step, photo: { blob, preview } | null, message }

function getDraft(productId) {
  if (!drafts[productId]) {
    drafts[productId] = { step: 1, photo: null, message: "" };
  }
  return drafts[productId];
}

function renderPersonalizeView(params) {
  const lang = getState().language;
  const product = getProduct(params.id);
  const root = document.getElementById("personalizeContent");

  if (!product || !product.available) {
    root.innerHTML = `<p class="empty-note">${t(lang, "product.unavailable")}</p>`;
    return;
  }

  const draft = getDraft(product.id);

  root.innerHTML = `
    <div class="personalize-shell">

      <h1 class="personalize-title">${t(lang, "personalize.title")}</h1>

      <div class="personalize-steps">
        <span class="step ${draft.step === 1 ? "is-active" : ""}">01 — ${t(lang, "personalize.step1")}</span>
        <span class="step ${draft.step === 2 ? "is-active" : ""}">02 — ${t(lang, "personalize.step2")}</span>
        <span class="step ${draft.step === 3 ? "is-active" : ""}">03 — ${t(lang, "personalize.step3")}</span>
      </div>

      <div id="personalizeStepBody"></div>

    </div>
  `;

  renderPersonalizeStep(product, draft);
}

function renderPersonalizeStep(product, draft) {
  const lang = getState().language;
  const body = document.getElementById("personalizeStepBody");

  if (draft.step === 1) {
    body.innerHTML = `
      <div class="upload-block">

        <div class="puzzle-info">
          <strong>${t(lang, "personalize.puzzleLabel")}</strong>
          <p>${t(lang, "personalize.puzzleExplain")}</p>
        </div>

        <div class="upload-zone" id="uploadZone">
          ${
            draft.photo
              ? `<img src="${draft.photo.preview}" alt="" class="upload-preview">`
              : `<p>${t(lang, "personalize.uploadTitle")}</p><span>${t(lang, "personalize.uploadHint")}</span>`
          }
        </div>

        <input type="file" id="photoInput" accept="${PHOTO_ACCEPT}" hidden>

        <p class="upload-error" id="uploadError" hidden></p>

        <div class="step-actions">
          ${draft.photo ? `<button class="ghost-action" id="removePhotoBtn">${t(lang, "personalize.remove")}</button>` : ""}
          <button class="primary-action" id="continueToStep2" ${draft.photo ? "" : "disabled"}>
            ${t(lang, "personalize.continue")}
          </button>
        </div>

      </div>
    `;

    const zone = document.getElementById("uploadZone");
    const input = document.getElementById("photoInput");
    const errorEl = document.getElementById("uploadError");

    zone.addEventListener("click", () => input.click());

    zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("is-dragover"); });
    zone.addEventListener("dragleave", () => zone.classList.remove("is-dragover"));
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("is-dragover");
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });

    input.addEventListener("change", () => {
      if (input.files[0]) handleFile(input.files[0]);
    });

    async function handleFile(file) {
      errorEl.hidden = true;
      zone.classList.add("is-loading");

      try {
        draft.photo = await preparePhoto(file);
        renderPersonalizeStep(product, draft);
      } catch (error) {
        const key = !(error instanceof PhotoError) ? "personalize.errorGeneric"
          : error.code === "type" ? "personalize.errorFileType"
          : error.code === "size" ? "personalize.errorFileSize"
          : `photo.${error.code}`;
        errorEl.textContent = t(lang, key);
        errorEl.hidden = false;
        zone.classList.remove("is-loading");
      }
    }

    const removeBtn = document.getElementById("removePhotoBtn");
    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        draft.photo = null;
        renderPersonalizeStep(product, draft);
      });
    }

    document.getElementById("continueToStep2").addEventListener("click", () => {
      if (!draft.photo) return;
      draft.step = 2;
      renderPersonalizeStep(product, draft);
    });

    return;
  }

  if (draft.step === 2) {
    body.innerHTML = `
      <div class="message-block">

        <div class="puzzle-info">
          <strong>${t(lang, "personalize.messageLabel")}</strong>
          <p>${t(lang, "personalize.messageExplain")}</p>
        </div>

        <textarea id="messageInput" maxlength="${MESSAGE_MAX}" placeholder="${t(lang, "personalize.placeholder")}">${esc(draft.message)}</textarea>
        <span class="char-count" id="charCount">${draft.message.length} / ${MESSAGE_MAX} ${t(lang, "personalize.charLimit")}</span>

        <div class="card-preview">
          <span class="card-preview-format">${t(lang, "personalize.messageLabel")}</span>
          <p id="cardPreviewText">${esc(draft.message) || t(lang, "personalize.placeholder")}</p>
        </div>

        <div class="step-actions">
          <button class="ghost-action" id="backToStep1">${t(lang, "personalize.back")}</button>
          <button class="primary-action" id="continueToStep3">${t(lang, "personalize.continue")}</button>
        </div>

      </div>
    `;

    const textarea = document.getElementById("messageInput");
    const charCount = document.getElementById("charCount");
    const preview = document.getElementById("cardPreviewText");

    textarea.addEventListener("input", () => {
      draft.message = textarea.value;
      charCount.textContent = `${draft.message.length} / ${MESSAGE_MAX} ${t(lang, "personalize.charLimit")}`;
      preview.textContent = draft.message || t(lang, "personalize.placeholder");
    });

    document.getElementById("backToStep1").addEventListener("click", () => {
      draft.step = 1;
      renderPersonalizeStep(product, draft);
    });

    document.getElementById("continueToStep3").addEventListener("click", () => {
      draft.step = 3;
      renderPersonalizeStep(product, draft);
    });

    return;
  }

  // STEP 3 — PREVIEW

  const name = t(lang, `products.${product.id}.name`);

  body.innerHTML = `
    <div class="preview-block">

      <h2>${t(lang, "personalize.previewTitle")}</h2>

      <div class="preview-row">
        <span class="preview-label">${t(lang, "personalize.selectedBox")}</span>
        <div class="preview-product">
          <img src="${product.images[0]}" alt="${name}">
          <div>
            <strong>${name}</strong>
            <span>${formatPrice(product.price, product.currency)}</span>
          </div>
          </div>
        </div>
      </div>

      <div class="preview-row">
        <span class="preview-label">${t(lang, "personalize.puzzleSection")} · ${product.personalization.puzzleFormat} · ${product.personalization.puzzlePieces}</span>
        <div class="preview-photo">
          <img src="${draft.photo.preview}" alt="">
        </div>
        <button class="text-link" id="editPhotoBtn">${t(lang, "personalize.editPhoto")}</button>
      </div>

      <div class="preview-row">
        <span class="preview-label">${t(lang, "personalize.cardSection")} · ${product.personalization.cardFormat}</span>
        <p class="preview-message">${esc(draft.message) || "—"}</p>
        <button class="text-link" id="editMessageBtn">${t(lang, "personalize.editMessage")}</button>
      </div>

      <button class="primary-action" id="addToCartBtn">${t(lang, "personalize.addToCart")}</button>

    </div>
  `;

  document.getElementById("editPhotoBtn").addEventListener("click", () => {
    draft.step = 1;
    renderPersonalizeStep(product, draft);
  });

  document.getElementById("editMessageBtn").addEventListener("click", () => {
    draft.step = 2;
    renderPersonalizeStep(product, draft);
  });

  const addButton = document.getElementById("addToCartBtn");
  addButton.addEventListener("click", async () => {
    if (addButton.disabled) return;
    addButton.disabled = true;

    const photoKey = `photo_${crypto.randomUUID()}`;
    try {
      await saveDraftPhoto(photoKey, draft.photo.blob);
    } catch (error) {
      addButton.disabled = false;
      alert(t(lang, "personalize.errorGeneric"));
      return;
    }

    addToCart({
      productId: product.id,
      price: product.price,
      currency: product.currency,
      photo: { key: photoKey, preview: draft.photo.preview },
      message: draft.message,
      puzzleFormat: product.personalization.puzzleFormat,
      puzzlePieces: product.personalization.puzzlePieces,
      cardFormat: product.personalization.cardFormat
    });

    delete drafts[product.id];
    updateCartBadge();
    navigate("/cart");
  });
}


/* =======================================================
   VIEW: CART
======================================================= */

function renderCartView() {
  const lang = getState().language;
  const { cart } = getState();
  const root = document.getElementById("cartContent");

  if (cart.length === 0) {
    root.innerHTML = `
      <h1>${t(lang, "cart.title")}</h1>
      <p class="empty-note">${t(lang, "cart.empty")}</p>
      <a class="primary-action" href="#/">${t(lang, "cart.continueShopping")}</a>
    `;
    return;
  }

  root.innerHTML = `
    <h1>${t(lang, "cart.title")}</h1>

    <div class="cart-lines">
      ${cart.map((line) => renderCartLine(line, lang)).join("")}
    </div>

    <div class="cart-summary">
      <div class="cart-summary-row">
        <span>${t(lang, "cart.total")}</span>
        <strong>${formatPrice(getCartTotal(), "EUR")}</strong>
      </div>
      <button class="primary-action" id="checkoutBtn">${t(lang, "cart.checkout")}</button>
    </div>
  `;

  root.querySelectorAll("[data-remove-line]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const line = getState().cart.find((l) => l.lineId === btn.dataset.removeLine);
      if (line && line.photo && line.photo.key) deleteDraftPhoto(line.photo.key);
      removeFromCart(btn.dataset.removeLine);
      updateCartBadge();
      renderCartView();
    });
  });

  root.querySelectorAll("[data-qty-line]").forEach((select) => {
    select.addEventListener("change", () => {
      setQuantity(select.dataset.qtyLine, Number(select.value));
      updateCartBadge();
      renderCartView();
    });
  });

  document.getElementById("checkoutBtn").addEventListener("click", () => navigate("/checkout"));
}

function renderCartLine(line, lang) {
  const product = getProduct(line.productId);
  const name = t(lang, `products.${line.productId}.name`);

  const qtyOptions = Array.from({ length: 10 }, (_, i) => i + 1)
    .map((n) => `<option value="${n}" ${n === line.quantity ? "selected" : ""}>${n}</option>`)
    .join("");

  return `
    <div class="cart-line">

      <img src="${product ? product.images[0] : ""}" alt="${name}" class="cart-line-image">

      <div class="cart-line-info">
        <strong>${name}</strong>
        <span>${formatPrice(product ? product.price : 0, "EUR")}</span>

        <div class="cart-line-personalization">
          <span>${t(lang, "cart.puzzle")}</span>
          <span>${t(lang, "cart.card")}: “${esc(line.message) || "—"}”</span>
        </div>

        <div class="cart-line-controls">
          <label>
            ${t(lang, "cart.quantity")}
            <select data-qty-line="${line.lineId}">${qtyOptions}</select>
          </label>

          <button class="text-link" data-remove-line="${line.lineId}">${t(lang, "cart.remove")}</button>
        </div>
      </div>

      ${line.photo ? `<img src="${esc(line.photo.preview || line.photo.dataUrl)}" alt="" class="cart-line-photo">` : ""}

    </div>
  `;
}


/* =======================================================
   VIEW: CHECKOUT
   Delivery details here; payment on Stripe Checkout. The
   server (create-checkout-session) prices the order from its
   own catalog — nothing the browser sends can change it.
======================================================= */

const SHIPPING_KEY = "alvoxis_shipping_draft";
const SHIPPING_FIELDS = ["fullName", "address", "city", "postalCode", "country"];

function loadShippingDraft() {
  try { return JSON.parse(sessionStorage.getItem(SHIPPING_KEY)) || {}; } catch (error) { return {}; }
}

function saveShippingDraft(form) {
  const draft = {};
  SHIPPING_FIELDS.forEach((name) => { draft[name] = form[name].value; });
  try { sessionStorage.setItem(SHIPPING_KEY, JSON.stringify(draft)); } catch (error) { /* private mode */ }
  return draft;
}

/* same cart -> same attempt id -> a double click can never create two payments */
let checkoutAttempt = { signature: "", id: "" };

function attemptFor(items, shipping) {
  const signature = JSON.stringify([items, shipping]);
  if (checkoutAttempt.signature !== signature) checkoutAttempt = { signature, id: crypto.randomUUID() };
  return checkoutAttempt.id;
}

async function uploadCartPhotos(user) {
  for (const line of getState().cart) {
    if (line.uploaded && line.uploaded.userId === user.id) continue;

    let blob = null;
    if (line.photo && line.photo.key) blob = await loadDraftPhoto(line.photo.key).catch(() => null);
    if (!blob && line.photo && line.photo.dataUrl) blob = await dataUrlToBlob(line.photo.dataUrl); // older carts
    if (!blob) throw new AppError("errors.photoMissing");

    const path = await uploadOrderPhoto(blob);
    updateCartLine(line.lineId, { uploaded: { userId: user.id, path } });
  }
}

function renderCheckoutView() {
  const lang = getState().language;
  const { cart, user } = getState();
  const root = document.getElementById("checkoutContent");

  if (cart.length === 0) {
    root.innerHTML = `<h1>${t(lang, "checkout.title")}</h1><p class="empty-note">${t(lang, "cart.empty")}</p>`;
    return;
  }

  const draft = loadShippingDraft();
  const field = (name, label, autocomplete) =>
    `<label>${t(lang, label)} <input type="text" name="${name}" autocomplete="${autocomplete}" required maxlength="120" value="${esc(draft[name] || "")}"></label>`;

  root.innerHTML = `
    <h1>${t(lang, "checkout.title")}</h1>

    <form id="checkoutForm" class="checkout-form" novalidate>

      <h2>${t(lang, "checkout.delivery")}</h2>

      ${field("fullName", "checkout.fullName", "name")}
      ${field("address", "checkout.address", "street-address")}

      <div class="form-row">
        ${field("city", "checkout.city", "address-level2")}
        ${field("postalCode", "checkout.postalCode", "postal-code")}
      </div>

      ${field("country", "checkout.country", "country-name")}

      <h2>${t(lang, "checkout.payment")}</h2>

      <p class="stripe-notice">${t(lang, "checkout.stripeNotice")}</p>

      ${user ? "" : `<p class="checkout-signin">${t(lang, "checkout.signInFirst")} <a class="text-link" href="#/account" id="checkoutSignIn">${t(lang, "account.signIn")}</a></p>`}

      <div class="checkout-summary">
        <span>${t(lang, "cart.total")}</span>
        <strong>${formatPrice(getCartTotal(), "EUR")}</strong>
      </div>

      <p class="form-error" id="checkoutError" role="alert" hidden></p>

      <div class="step-actions">
        <a class="ghost-action" href="#/cart">${t(lang, "checkout.backToCart")}</a>
        <button type="submit" class="primary-action" id="payNowBtn">${t(lang, "checkout.payNow")}</button>
      </div>

    </form>
  `;

  const form = document.getElementById("checkoutForm");
  const errorEl = document.getElementById("checkoutError");
  const payButton = document.getElementById("payNowBtn");

  form.addEventListener("input", () => saveShippingDraft(form));

  const signIn = document.getElementById("checkoutSignIn");
  if (signIn) signIn.addEventListener("click", () => rememberNext("#/checkout"));

  const fail = (key) => {
    errorEl.textContent = t(getState().language, key);
    errorEl.hidden = false;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (payButton.disabled) return;
    errorEl.hidden = true;

    if (!form.reportValidity()) return;
    const shipping = saveShippingDraft(form);

    if (!backendConfigured) return fail("errors.paymentsUnavailable");

    const currentUser = getState().user;
    if (!currentUser) {
      rememberNext("#/checkout");
      return fail("checkout.signInFirst");
    }

    payButton.disabled = true;
    payButton.setAttribute("aria-busy", "true");
    payButton.textContent = t(getState().language, "checkout.preparing");

    try {
      await uploadCartPhotos(currentUser);
      const items = getState().cart.map((line) => ({
        product_id: line.productId,
        quantity: line.quantity,
        message: line.message || "",
        photo_path: line.uploaded.path
      }));
      payButton.textContent = t(getState().language, "support.redirecting");
      await startCheckout({ kind: "order", attempt_id: attemptFor(items, shipping), items, shipping });
      // the browser is leaving for Stripe
    } catch (error) {
      payButton.disabled = false;
      payButton.removeAttribute("aria-busy");
      payButton.textContent = t(getState().language, "checkout.payNow");
      fail(error instanceof AppError ? error.key : "errors.generic");
    }
  });
}


/* =======================================================
   VIEW: PAYMENT RESULT  (#/payment/success | #/payment/cancel)
   Read-only. Shows what the Stripe webhook has recorded; it
   never marks anything as paid itself.
======================================================= */

let paymentPoll = null;

function renderPaymentView(params) {
  const lang = getState().language;
  const root = document.getElementById("paymentContent");
  const query = getQuery();
  const kind = query.get("kind") === "support" ? "support" : "order";
  const sessionId = query.get("session_id") || "";

  clearTimeout(paymentPoll);

  if (params.result !== "success") {
    root.innerHTML = `
      <div class="confirmation-block">
        <p class="eyebrow">${t(lang, "payment.canceledEyebrow")}</p>
        <h1>${t(lang, "payment.canceledTitle")}</h1>
        <p class="account-lead">${t(lang, "payment.canceledText")}</p>
        <div class="step-actions">
          <a class="primary-action" href="${kind === "support" ? "#/?page=support" : "#/checkout"}">${t(lang, "payment.tryAgain")}</a>
          <a class="ghost-action" href="#/">${t(lang, "confirmation.continueShopping")}</a>
        </div>
      </div>
    `;
    return;
  }

  /* Stripe only sends the visitor here after a completed checkout:
     the cart has become an order, so it is emptied (its photos too). */
  if (kind === "order" && getState().cart.length) {
    getState().cart.forEach((line) => line.photo && line.photo.key && deleteDraftPhoto(line.photo.key));
    clearCart();
    try { sessionStorage.removeItem(SHIPPING_KEY); } catch (error) { /* private mode */ }
    updateCartBadge();
  }
  forgetAccountData();

  root.innerHTML = `
    <div class="confirmation-block">
      <p class="eyebrow">${t(lang, kind === "support" ? "payment.supportEyebrow" : "confirmation.eyebrow")}</p>
      <h1>${t(lang, kind === "support" ? "payment.supportTitle" : "payment.orderTitle")}</h1>
      <p class="account-lead" id="paymentStatus" role="status" aria-live="polite">${t(lang, "payment.confirming")}</p>
      <div id="paymentGift"></div>
      <div class="step-actions">
        <a class="primary-action" href="#/account?tab=${kind === "support" ? "support" : "orders"}">${t(lang, "payment.viewAccount")}</a>
        <a class="ghost-action" href="#/">${t(lang, "confirmation.continueShopping")}</a>
      </div>
    </div>
  `;

  const started = Date.now();

  const check = async () => {
    const statusEl = document.getElementById("paymentStatus");
    if (!statusEl) return; // the visitor moved on
    const lang = getState().language;

    let record = null;
    try {
      if (backendConfigured && getState().user && /^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
        record = await paymentRecord(kind, sessionId);
      }
    } catch (error) { /* keep polling quietly */ }

    if (record && record.payment_status === "paid") {
      statusEl.textContent = kind === "support"
        ? t(lang, "payment.supportConfirmed").replace("{amount}", formatPrice(record.amount_cents / 100, "EUR"))
        : t(lang, "payment.orderConfirmed").replace("{order}", record.order_number);
      if (kind === "support" && record.gift_eligible) {
        document.getElementById("paymentGift").innerHTML = `
          <div class="gift-card">
            <p class="eyebrow">${t(lang, "gift.puzzle")}</p>
            <h3>${t(lang, "support.giftTitle")}</h3>
            <p class="account-lead">${t(lang, "payment.giftUnlocked")}</p>
            <a class="primary-action" href="#/account?tab=gift">${t(lang, "gift.upload")}</a>
          </div>`;
      }
      return;
    }

    if (record && ["failed", "expired", "canceled"].includes(record.payment_status)) {
      statusEl.textContent = t(lang, "payment.failed");
      return;
    }

    if (Date.now() - started > 60000) {
      statusEl.textContent = t(lang, "payment.stillConfirming");
      return;
    }

    paymentPoll = setTimeout(check, 2500);
  };

  check();
}


/* =======================================================
   ROUTES
======================================================= */

let homeExperience = null; // set at boot; the home route re-syncs it when shown

registerRoute("/", { view: "home", render: renderHome });
registerRoute("/product/:id", { view: "product", render: renderProductView });
registerRoute("/personalize/:id", { view: "personalize", render: renderPersonalizeView });
registerRoute("/cart", { view: "cart", render: renderCartView });
registerRoute("/checkout", { view: "checkout", render: renderCheckoutView });
registerRoute("/account", { view: "account", render: () => { renderAccountView(); verifySession(); } });
registerRoute("/payment/:result", { view: "payment", render: renderPaymentView });

function renderHome() {
  if (!homeExperience) return;
  homeExperience.refresh();

  /* "#/?page=support" opens the book straight at the support page */
  if (getQuery().get("page") === "support") {
    homeExperience.openPage(3);
    history.replaceState(null, "", `${location.pathname}#/`);
  }
}


/* =======================================================
   BOOT
======================================================= */

/* Re-render the visible view in the new language, keeping whatever the
   visitor has already typed into its forms. */
function rerenderInNewLanguage() {
  const view = document.querySelector(".view:not([hidden])");
  const typed = {};

  if (view) {
    view.querySelectorAll("input[name], textarea[name], select[name]").forEach((field) => {
      if (field.type === "file") return;
      typed[`${field.form ? field.form.id : ""}:${field.name}`] = field.value;
    });
  }

  rerenderCurrentRoute();

  if (view) {
    view.querySelectorAll("input[name], textarea[name], select[name]").forEach((field) => {
      const key = `${field.form ? field.form.id : ""}:${field.name}`;
      if (key in typed && field.type !== "file") field.value = typed[key];
    });
  }
}

/* Native form validation bubbles speak the browser's language, not the
   site's — replace their text with ours. */
function initValidationMessages() {
  document.addEventListener("invalid", (event) => {
    const field = event.target;
    if (typeof field.setCustomValidity !== "function") return;

    const lang = getState().language;
    field.setCustomValidity("");

    if (field.validity.valueMissing) {
      field.setCustomValidity(t(lang, "form.required"));
    } else if (field.validity.typeMismatch && field.type === "email") {
      field.setCustomValidity(t(lang, "form.email"));
    } else if (field.validity.tooShort) {
      field.setCustomValidity(t(lang, "form.tooShort").replace("{min}", field.minLength));
    }
  }, true);

  document.addEventListener("input", (event) => {
    if (typeof event.target.setCustomValidity === "function") {
      event.target.setCustomValidity("");
    }
  }, true);
}

/* Restore the Supabase session (and finish an OAuth / email-link
   return) without ever holding up the film or the book. */
async function bootAuth() {
  const flow = await initAuth({
    onRecovery: () => navigate("/account?mode=reset")
  }).catch(() => null);

  markAuthReady();

  if (flow === "recovery") {
    navigate("/account?mode=reset");
  } else if (flow === "error") {
    navigate("/account");
  } else if ((flow === "oauth" || flow === "signup") && getState().user) {
    afterSignIn();
  }

  const route = window.location.hash;
  if (route.startsWith("#/account") || route.startsWith("#/checkout") || route.startsWith("#/payment")) {
    rerenderCurrentRoute();
  }
}

document.addEventListener("DOMContentLoaded", () => {

  applyTranslations();
  initHeader();
  initValidationMessages();
  homeExperience = initHomeExperience();
  initSupport();
  initRouter();

  let renderedLanguage = getState().language;
  let renderedUser = null;

  subscribe(() => {
    applyTranslations();
    updateCartBadge();

    if (getState().language !== renderedLanguage) {
      renderedLanguage = getState().language;
      rerenderInNewLanguage();
      return;
    }

    /* signed in / out: the screens that depend on it follow */
    const userId = getState().user ? getState().user.id : null;
    if (userId !== renderedUser) {
      renderedUser = userId;
      forgetAccountData();
      const route = window.location.hash;
      if (route.startsWith("#/account") || route.startsWith("#/checkout")) {
        rerenderCurrentRoute();
      }
    }
  });

  bootAuth();
});
