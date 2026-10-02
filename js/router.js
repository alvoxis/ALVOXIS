/* =========================================================
   ALVOXIS — ROUTER
   ========================================================= */

const routes = new Map();

let currentView = null;
let currentParams = {};

export function registerRoute(pattern, { view, render }) {
  routes.set(pattern, { view, render });
}

/* "#/payment/success?kind=order&session_id=…" -> path + query */
function splitHash(hash) {
  const raw = hash.replace(/^#/, "") || "/";
  const index = raw.indexOf("?");
  return {
    path: (index === -1 ? raw : raw.slice(0, index)) || "/",
    query: new URLSearchParams(index === -1 ? "" : raw.slice(index + 1))
  };
}

export function getQuery() {
  return splitHash(window.location.hash).query;
}

function matchRoute(hash) {
  const { path } = splitHash(hash);
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

  document.querySelectorAll(".view").forEach((el) => {
    el.hidden = true;
  });

  if (!match) {
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

  if (handler.view !== "home") {
    window.scrollTo(0, 0);
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

/* re-run the current view's renderer in place (no scroll, no hash change) */
export function rerenderCurrentRoute() {
  const match = matchRoute(window.location.hash);
  if (match && typeof match.handler.render === "function") {
    match.handler.render(match.params);
  }
}

export function initRouter() {
  window.addEventListener("hashchange", resolve);
  resolve();
}
