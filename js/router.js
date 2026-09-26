/* =========================================================
   ALVOXIS — ROUTER
   Hash-based view switching, so the whole site feels like
   one continuous experience with no page reloads.

   Routes:
     #/                     home (hero + book catalog)
     #/product/:id          single product page
     #/personalize/:id      photo + message + preview
     #/cart                 cart
     #/checkout             delivery + payment
     #/account              login / register / dashboard
     #/confirmation/:orderId order confirmation
   ========================================================= */

const routes = new Map(); // pattern -> { view, render }

let currentView = null;
let currentParams = {};

export function registerRoute(pattern, { view, render }) {
  routes.set(pattern, { view, render });
}

function matchRoute(hash) {
  const path = hash.replace(/^#/, "") || "/";
  const segments = path.split("/").filter(Boolean);

  for (const [pattern, handler] of routes.entries()) {
    const patternSegments = pattern.split("/").filter(Boolean);

    if (patternSegments.length !== segments.length) continue;

    const params = {};
    let matched = true;

    for (let i = 0; i < patternSegments.length; i++) {
      const p = patternSegments[i];
      const s = segments[i];

      if (p.startsWith(":")) {
        params[p.slice(1)] = decodeURIComponent(s);
      } else if (p !== s) {
        matched = false;
        break;
      }
    }

    if (matched) {
      return { handler, params };
    }
  }

  return null;
}

function setActiveNav(routeName) {
  document.querySelectorAll("[data-nav-route]").forEach((el) => {
    el.classList.toggle("is-active", el.dataset.navRoute === routeName);
  });
}

function resolve() {
  const match = matchRoute(window.location.hash);

  // Hide every view first.
  document.querySelectorAll(".view").forEach((el) => {
    el.hidden = true;
  });

  if (!match) {
    // Unknown route — fall back to home.
    window.location.hash = "#/";
    return;
  }

  const { handler, params } = match;
  currentView = handler.view;
  currentParams = params;

  const viewEl = document.getElementById(`view-${handler.view}`);
  if (!viewEl) {
    console.warn(`ALVOXIS router: missing #view-${handler.view}`);
    return;
  }

  viewEl.hidden = false;
  setActiveNav(handler.view);

  if (typeof handler.render === "function") {
    handler.render(params);
  }

  // Only reset scroll for non-home views — home manages its
  // own scroll-driven cinematic sequence.
  if (handler.view !== "home") {
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }
}

export function navigate(path) {
  window.location.hash = path.startsWith("#") ? path : `#${path}`;
}

export function getCurrentView() {
  return currentView;
}

export function getCurrentParams() {
  return currentParams;
}

export function initRouter() {
  window.addEventListener("hashchange", resolve);
  resolve();
}
