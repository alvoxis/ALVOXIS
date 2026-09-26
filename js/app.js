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
  addToCart, removeFromCart, setQuantity, getCartCount, getCartTotal,
  registerUser, loginUser, logoutUser, getOrders, addOrder, clearCart
} from "./state.js";
import { registerRoute, navigate, initRouter } from "./router.js";
import { initHomeExperience } from "./main.js";


/* =======================================================
   TRANSLATIONS — apply to every [data-i18n] element
======================================================= */

function applyTranslations() {
  const lang = getState().language;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const value = t(lang, el.dataset.i18n);
    if (Array.isArray(value)) return; // lists are rendered explicitly where used
    el.textContent = value;
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

  mobileMenuButton.addEventListener("click", () => {
    mobileNav.hidden = !mobileNav.hidden;
  });

  mobileNav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => { mobileNav.hidden = true; });
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
   3 steps kept in-memory per product id (not persisted —
   photos are compressed client-side but still too large
   for a comfortable localStorage draft).
======================================================= */

const MESSAGE_MAX = 240;
const drafts = {}; // productId -> { step, photo: {dataUrl,name}|null, message }

function getDraft(productId) {
  if (!drafts[productId]) {
    drafts[productId] = { step: 1, photo: null, message: "" };
  }
  return drafts[productId];
}

function resizeImageToDataUrl(file, maxDimension = 1400, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("read-failed"));

    reader.onload = () => {
      const img = new Image();

      img.onerror = () => reject(new Error("decode-failed"));

      img.onload = () => {
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          const scale = maxDimension / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", quality));
      };

      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
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
              ? `<img src="${draft.photo.dataUrl}" alt="" class="upload-preview">`
              : `<p>${t(lang, "personalize.uploadTitle")}</p><span>${t(lang, "personalize.uploadHint")}</span>`
          }
        </div>

        <input type="file" id="photoInput" accept="image/png, image/jpeg" hidden>

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

      if (!["image/jpeg", "image/png"].includes(file.type)) {
        errorEl.textContent = t(lang, "personalize.errorFileType");
        errorEl.hidden = false;
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        errorEl.textContent = t(lang, "personalize.errorFileSize");
        errorEl.hidden = false;
        return;
      }

      zone.classList.add("is-loading");

      try {
        const dataUrl = await resizeImageToDataUrl(file);
        draft.photo = { dataUrl, name: file.name };
        renderPersonalizeStep(product, draft);
      } catch (error) {
        console.warn("ALVOXIS upload error:", error);
        errorEl.textContent = t(lang, "personalize.errorGeneric");
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

        <textarea id="messageInput" maxlength="${MESSAGE_MAX}" placeholder="${t(lang, "personalize.placeholder")}">${draft.message}</textarea>
        <span class="char-count" id="charCount">${draft.message.length} / ${MESSAGE_MAX} ${t(lang, "personalize.charLimit")}</span>

        <div class="card-preview">
          <span class="card-preview-format">${t(lang, "personalize.messageLabel")}</span>
          <p id="cardPreviewText">${draft.message || t(lang, "personalize.placeholder")}</p>
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

      <div class="preview-row">
        <span class="preview-label">${t(lang, "personalize.puzzleSection")} · ${product.personalization.puzzleFormat} · ${product.personalization.puzzlePieces}</span>
        <div class="preview-photo">
          <img src="${draft.photo.dataUrl}" alt="">
        </div>
        <button class="text-link" id="editPhotoBtn">${t(lang, "personalize.editPhoto")}</button>
      </div>

      <div class="preview-row">
        <span class="preview-label">${t(lang, "personalize.cardSection")} · ${product.personalization.cardFormat}</span>
        <p class="preview-message">${draft.message || "—"}</p>
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

  document.getElementById("addToCartBtn").addEventListener("click", () => {
    addToCart({
      productId: product.id,
      price: product.price,
      currency: product.currency,
      photo: draft.photo,
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
        <span>${formatPrice(line.price, line.currency)}</span>

        <div class="cart-line-personalization">
          <span>${t(lang, "cart.puzzle")}</span>
          <span>${t(lang, "cart.card")}: “${line.message || "—"}”</span>
        </div>

        <div class="cart-line-controls">
          <label>
            ${t(lang, "cart.quantity")}
            <select data-qty-line="${line.lineId}">${qtyOptions}</select>
          </label>

          <button class="text-link" data-remove-line="${line.lineId}">${t(lang, "cart.remove")}</button>
        </div>
      </div>

      ${line.photo ? `<img src="${line.photo.dataUrl}" alt="" class="cart-line-photo">` : ""}

    </div>
  `;
}


/* =======================================================
   VIEW: CHECKOUT
======================================================= */

function renderCheckoutView() {
  const lang = getState().language;
  const { cart } = getState();
  const root = document.getElementById("checkoutContent");

  if (cart.length === 0) {
    root.innerHTML = `<p class="empty-note">${t(lang, "cart.empty")}</p>`;
    return;
  }

  root.innerHTML = `
    <h1>${t(lang, "checkout.title")}</h1>

    <form id="checkoutForm" class="checkout-form">

      <h2>${t(lang, "checkout.delivery")}</h2>

      <label>${t(lang, "checkout.fullName")} <input type="text" name="fullName" required></label>
      <label>${t(lang, "checkout.address")} <input type="text" name="address" required></label>

      <div class="form-row">
        <label>${t(lang, "checkout.city")} <input type="text" name="city" required></label>
        <label>${t(lang, "checkout.postalCode")} <input type="text" name="postalCode" required></label>
      </div>

      <label>${t(lang, "checkout.country")} <input type="text" name="country" required></label>

      <h2>${t(lang, "checkout.payment")}</h2>

      <p class="stripe-notice">${t(lang, "checkout.stripeNotice")}</p>

      <div class="checkout-summary">
        <span>${t(lang, "cart.total")}</span>
        <strong>${formatPrice(getCartTotal(), "EUR")}</strong>
      </div>

      <div class="step-actions">
        <a class="ghost-action" href="#/cart">${t(lang, "checkout.backToCart")}</a>
        <button type="submit" class="primary-action" id="payNowBtn">${t(lang, "checkout.payNow")}</button>
      </div>

      <button type="button" class="text-link demo-preview-btn" id="demoPreviewBtn">
        Preview confirmation screen (demo only — no real payment)
      </button>

    </form>
  `;

  const form = document.getElementById("checkoutForm");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    // Real submission is intentionally NOT implemented here.
    // This is the wire-up point for a secure backend call to
    // create a Stripe Checkout Session — see README.
    alert(t(lang, "checkout.stripeNotice"));
  });

  document.getElementById("demoPreviewBtn").addEventListener("click", () => {
    const orderId = `DEMO-${Date.now().toString().slice(-6)}`;

    addOrder({
      orderId,
      date: new Date().toISOString(),
      lines: cart,
      total: getCartTotal(),
      status: "demo"
    });

    clearCart();
    updateCartBadge();
    navigate(`/confirmation/${orderId}`);
  });
}


/* =======================================================
   VIEW: ACCOUNT
======================================================= */

function renderAccountView() {
  const lang = getState().language;
  const { user } = getState();
  const root = document.getElementById("accountContent");

  if (user) {
    const orders = getOrders();

    root.innerHTML = `
      <h1>${t(lang, "account.dashboard")}</h1>

      <div class="account-section">
        <h2>${t(lang, "account.profile")}</h2>
        <p>${user.name}</p>
        <p>${user.email}</p>
      </div>

      <div class="account-section">
        <h2>${t(lang, "account.myOrders")}</h2>
        ${
          orders.length === 0
            ? `<p class="empty-note">${t(lang, "account.noOrders")}</p>`
            : orders.map((order) => `
                <div class="order-row">
                  <span>#${order.orderId}</span>
                  <span>${new Date(order.date).toLocaleDateString()}</span>
                  <span>${formatPrice(order.total, "EUR")}</span>
                  <span class="order-status">${order.status}</span>
                </div>
              `).join("")
        }
      </div>

      <button class="ghost-action" id="logoutBtn">${t(lang, "account.logOut")}</button>
    `;

    document.getElementById("logoutBtn").addEventListener("click", () => {
      logoutUser();
      renderAccountView();
    });

    return;
  }

  root.innerHTML = `
    <div class="account-auth">

      <p class="demo-notice">${t(lang, "account.demoNotice")}</p>

      <div class="auth-providers">
        <button class="provider-btn" id="googleBtn">${t(lang, "account.google")}</button>
        <button class="provider-btn" id="appleBtn">${t(lang, "account.apple")}</button>
      </div>

      <div class="auth-forms">

        <form id="loginForm" class="auth-form">
          <h2>${t(lang, "account.loginTitle")}</h2>
          <label>${t(lang, "account.email")} <input type="email" name="email" required></label>
          <label>${t(lang, "account.password")} <input type="password" name="password" required></label>
          <p class="form-error" id="loginError" hidden></p>
          <button type="submit" class="primary-action">${t(lang, "account.signIn")}</button>
        </form>

        <form id="registerForm" class="auth-form">
          <h2>${t(lang, "account.registerTitle")}</h2>
          <label>${t(lang, "account.name")} <input type="text" name="name" required></label>
          <label>${t(lang, "account.email")} <input type="email" name="email" required></label>
          <label>${t(lang, "account.password")} <input type="password" name="password" required></label>
          <label>${t(lang, "account.confirmPassword")} <input type="password" name="confirmPassword" required></label>
          <p class="form-error" id="registerError" hidden></p>
          <button type="submit" class="primary-action">${t(lang, "account.createAccount")}</button>
        </form>

      </div>

    </div>
  `;

  document.getElementById("googleBtn").addEventListener("click", () => alert(t(lang, "account.providerNotice")));
  document.getElementById("appleBtn").addEventListener("click", () => alert(t(lang, "account.providerNotice")));

  document.getElementById("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const result = loginUser({ email: data.get("email"), password: data.get("password") });
    const errorEl = document.getElementById("loginError");

    if (!result.ok) {
      errorEl.textContent = t(lang, "account.errorInvalid");
      errorEl.hidden = false;
      return;
    }

    renderAccountView();
  });

  document.getElementById("registerForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const errorEl = document.getElementById("registerError");

    if (data.get("password") !== data.get("confirmPassword")) {
      errorEl.textContent = t(lang, "account.errorPasswordMatch");
      errorEl.hidden = false;
      return;
    }

    const result = registerUser({
      name: data.get("name"),
      email: data.get("email"),
      password: data.get("password")
    });

    if (!result.ok) {
      errorEl.textContent = t(lang, "account.errorExists");
      errorEl.hidden = false;
      return;
    }

    renderAccountView();
  });
}


/* =======================================================
   VIEW: CONFIRMATION
======================================================= */

function renderConfirmationView(params) {
  const lang = getState().language;
  const root = document.getElementById("confirmationContent");

  root.innerHTML = `
    <div class="confirmation-block">
      <p class="eyebrow">${t(lang, "confirmation.eyebrow")}</p>
      <h1>${t(lang, "confirmation.title")}</h1>
      <p class="order-number">${t(lang, "confirmation.orderNumber")}: ${params.orderId}</p>

      <div class="step-actions">
        <a class="ghost-action" href="#/account">${t(lang, "confirmation.viewOrder")}</a>
        <a class="primary-action" href="#/">${t(lang, "confirmation.continueShopping")}</a>
      </div>
    </div>
  `;
}


/* =======================================================
   ROUTES
======================================================= */

registerRoute("/", { view: "home", render: () => {} });
registerRoute("/product/:id", { view: "product", render: renderProductView });
registerRoute("/personalize/:id", { view: "personalize", render: renderPersonalizeView });
registerRoute("/cart", { view: "cart", render: renderCartView });
registerRoute("/checkout", { view: "checkout", render: renderCheckoutView });
registerRoute("/account", { view: "account", render: renderAccountView });
registerRoute("/confirmation/:orderId", { view: "confirmation", render: renderConfirmationView });


/* =======================================================
   BOOT
======================================================= */

document.addEventListener("DOMContentLoaded", () => {

  applyTranslations();
  initHeader();
  initHomeExperience();
  initRouter();

  subscribe(() => {
    applyTranslations();
    updateCartBadge();
  });

});
