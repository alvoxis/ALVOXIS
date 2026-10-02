/* =========================================================
   ALVOXIS — HOME STAGE: FILM → ONE COVER → PHYSICAL BOOK

   One 100svh stage, one state object, one engine.

     intro   the film plays by itself (muted, inline). Nothing
             here depends on scrolling.
     reveal  the film ends (or is skipped): it recedes into depth
             while the book — whose page 0 IS the cover — emerges
             from that depth as a closed book, then grows to fill
             the stage. There is no second cover anywhere.
     book    pages turn like a magazine sheet: the finger pulls the
             page's corner, the sheet folds along a crease that follows
             the finger, its back folds over, and soft shadows track the
             crease. Release past 35% (or flick) → the turn completes,
             otherwise the sheet lies back down. Arrows, dots, keyboard
             and trackpad drive the very same settle animation.

   Vertical scrolling is never intercepted: the book uses
   `touch-action: pan-y`, so the browser keeps vertical pans and
   this code only ever handles horizontal ones.
   ========================================================= */

/* ---------- tunables ---------- */

const CORNER_LIFT = 0.3;        // how high the pulled corner arcs (share of its reach)
const COMMIT_PROGRESS = 0.35;   // release past this fraction -> the turn completes
const FLICK_VELOCITY = 0.35;    // px/ms — a quick flick also commits
const LOCK_PX = 8;              // movement before a gesture is classified
const STALL_MS = 6000;          // no frames by then -> offer play / skip

export function initHomeExperience() {

  /* =======================================================
     ELEMENTS
  ======================================================= */

  const homeView = document.getElementById("view-home");
  const stage = document.getElementById("experience");
  const videoScene = document.getElementById("videoScene");
  const video = document.getElementById("heroVideo");
  const videoSource = video ? video.querySelector("source") : null;
  const playButton = document.getElementById("videoPlay");
  const skipButton = document.getElementById("videoSkip");
  const progressBar = document.getElementById("videoProgressBar");
  const videoCounter = document.getElementById("videoCounter");

  const collection = document.getElementById("collection");
  const bookScene = document.getElementById("bookScene");
  const book = document.getElementById("alvoxisBook");
  const pages = Array.from(document.querySelectorAll("#alvoxisBook .book-page"));

  const previousButton = document.getElementById("previousCard");
  const nextButton = document.getElementById("nextCard");
  const dots = Array.from(document.querySelectorAll("#collectionDots [data-page]"));
  const counter = document.getElementById("collectionCounter");

  if (!stage || !video || !collection || !bookScene || !book || !pages.length) {
    console.warn("ALVOXIS: home stage elements are missing.");
    return { refresh() {} };
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PAGE_COUNT = pages.length;

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);


  /* =======================================================
     THE ONE SOURCE OF TRUTH
  ======================================================= */

  const state = {
    phase: "intro",                 // "intro" | "reveal" | "book"
    currentPage: 0,                 // top-most page that is still flat
    progress: pages.map(() => 0),   // 0 = flat face-up · 1 = turned over to the left
    drag: null,                     // active pointer / trackpad gesture
    settling: false                 // a settle animation is running
  };

  function setPhase(phase) {
    state.phase = phase;
    stage.dataset.phase = phase;

    const live = phase === "book";
    collection.inert = !live;
    collection.setAttribute("aria-hidden", live ? "false" : "true");
  }


  /* =======================================================
     INTRO — the film plays by itself
  ======================================================= */

  let stallTimer = null;
  let progressFrame = null;

  function formatTime(seconds) {
    const s = Math.max(0, Math.floor(seconds || 0));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  function paintVideoProgress() {
    const duration = video.duration;
    const fraction = Number.isFinite(duration) && duration > 0 ? video.currentTime / duration : 0;

    if (progressBar) {
      progressBar.style.transform = `scaleX(${clamp(fraction, 0, 1)})`;
    }

    if (videoCounter) {
      videoCounter.textContent = Number.isFinite(duration)
        ? `${formatTime(video.currentTime)} / ${formatTime(duration)}`
        : formatTime(video.currentTime);
    }

    /* some mobile browsers occasionally skip the "ended" event */
    if (Number.isFinite(duration) && duration > 0 && video.currentTime >= duration - 0.06) {
      reveal();
    }
  }

  function progressLoop() {
    paintVideoProgress();

    if (state.phase === "intro" && !video.paused) {
      progressFrame = requestAnimationFrame(progressLoop);
    }
  }

  function showPlayPrompt() {
    if (state.phase === "intro" && playButton) {
      playButton.hidden = false;
    }
  }

  function hidePlayPrompt() {
    if (playButton) {
      playButton.hidden = true;
    }
  }

  function playFilm() {

    /* iOS only autoplays inline video that is muted — set it as both
       property and attribute, before play() */
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");

    let attempt;

    try {
      attempt = video.play();
    } catch (error) {
      showPlayPrompt();
      return;
    }

    if (attempt && typeof attempt.catch === "function") {
      /* autoplay refused (e.g. iOS Low Power Mode) -> visible fallback */
      attempt.catch(showPlayPrompt);
    }
  }

  function startIntro() {

    video.addEventListener("playing", () => {
      clearTimeout(stallTimer);
      hidePlayPrompt();
      cancelAnimationFrame(progressFrame);
      progressFrame = requestAnimationFrame(progressLoop);
    });

    video.addEventListener("timeupdate", paintVideoProgress);
    video.addEventListener("ended", reveal);

    /* the film cannot be shown at all -> go straight to the book,
       never leave the visitor on a black stage */
    video.addEventListener("error", reveal);
    if (videoSource) {
      videoSource.addEventListener("error", reveal);
    }

    if (playButton) {
      playButton.addEventListener("click", () => {
        hidePlayPrompt();
        playFilm();
      });
    }

    if (skipButton) {
      skipButton.addEventListener("click", reveal);
    }

    stallTimer = setTimeout(() => {
      if (state.phase === "intro" && video.currentTime === 0) {
        if (filmUnavailable()) {
          reveal();
        } else {
          showPlayPrompt();
        }
      }
    }, STALL_MS);

    playFilm();

    /* the <source> may already have failed before this module ran (its
       error event fired before we listened) — check the element state */
    setTimeout(() => {
      if (state.phase === "intro" && video.readyState === 0 && filmUnavailable()) {
        reveal();
      }
    }, 800);
  }

  function filmUnavailable() {
    return Boolean(video.error) || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE;
  }


  /* =======================================================
     REVEAL — film recedes, the ONE cover emerges and grows
  ======================================================= */

  let revealAnimations = [];

  function reveal() {

    if (state.phase !== "intro") {
      return;
    }

    clearTimeout(stallTimer);
    cancelAnimationFrame(progressFrame);
    hidePlayPrompt();
    setPhase("reveal");

    if (reduceMotion || typeof book.animate !== "function") {
      finishReveal();
      return;
    }

    const filmOut = videoScene.animate([
      { transform: "scale(1)", opacity: 1, filter: "blur(0px)" },
      { transform: "scale(0.58)", opacity: 0, filter: "blur(10px)" }
    ], { duration: 1500, easing: "cubic-bezier(0.55, 0, 0.25, 1)", fill: "forwards" });

    /* the book arrives closed, from the depth the film went into,
       pauses as an object — then opens up to fill the stage */
    const coverIn = book.animate([
      { offset: 0, opacity: 0, transform: "perspective(1600px) translateY(7%) rotateX(18deg) scale(0.3)", borderRadius: "10px", filter: "blur(12px)" },
      { offset: 0.42, opacity: 1, transform: "perspective(1600px) translateY(0%) rotateX(0deg) scale(0.62)", borderRadius: "8px", filter: "blur(0px)" },
      { offset: 0.62, opacity: 1, transform: "perspective(1600px) translateY(0%) rotateX(0deg) scale(0.62)", borderRadius: "8px", filter: "blur(0px)" },
      { offset: 1, opacity: 1, transform: "perspective(1600px) translateY(0%) rotateX(0deg) scale(1)", borderRadius: "0px", filter: "blur(0px)" }
    ], { duration: 2900, delay: 350, easing: "cubic-bezier(0.45, 0, 0.2, 1)", fill: "both" });

    revealAnimations = [filmOut, coverIn];
    coverIn.onfinish = finishReveal;
  }

  function finishReveal() {

    if (state.phase === "book") {
      return;
    }

    video.pause();
    setPhase("book");

    /* final CSS state == last keyframe, so cancelling never jumps */
    revealAnimations.forEach((animation) => animation.cancel());
    revealAnimations = [];

    measure();
    renderAll();
  }


  /* =======================================================
     PAGE TURN — a folding sheet, not a rotating panel

     The page is pulled by its free corner. Wherever the corner is
     dragged to (P), the sheet folds along the perpendicular
     bisector of the corner's rest position (C) and P — exactly the
     crease a real sheet of paper makes:

       · the part of the page behind the crease is clipped away,
         revealing the next page underneath;
       · that same part is drawn again as the flap — mirrored across
         the crease, showing the paper's back — lying on top;
       · the corner travels on an arc around the spine (it can never
         get further from the spine than the page is wide), lifting
         as it goes, so the crease tilts like a real magazine page;
       · three soft shadows follow the crease: the curl shading on
         the flap, the flap's shadow on the page, and the shadow the
         lifted sheet casts onto the next page.

     Everything per frame is a clip-path and a transform — no
     layout, no cloned content, a fixed handful of elements.
  ======================================================= */

  let pageWidth = 0;
  let pageHeight = 0;

  function measure() {
    pageWidth = book.clientWidth || stage.clientWidth || window.innerWidth;
    pageHeight = book.clientHeight || stage.clientHeight || window.innerHeight;
  }

  function makeLayer(className) {
    const el = document.createElement("div");
    el.className = className;
    el.setAttribute("aria-hidden", "true");
    return el;
  }

  /* the flap: the back of the sheet, folded over */
  const flap = makeLayer("turn-flap");
  const flapPaper = makeLayer("turn-flap-paper");
  const flapShade = makeLayer("turn-strip turn-flap-shade");
  flap.append(flapPaper, flapShade);
  book.appendChild(flap);

  /* shadow of the flap on the part of the page still lying flat */
  const flapShadow = makeLayer("turn-strip turn-flap-shadow");

  /* shadow of the lifted sheet on the next page */
  const castShadow = makeLayer("turn-strip turn-cast-shadow");

  /* the gesture currently shaping the sheet: which page, which corner */
  let turn = null; // { index, corner: 1 bottom | -1 top, pull: px of extra vertical pull }

  function setTurn(index, corner, pull) {
    if (!turn || turn.index !== index) {
      if (turn) {
        resetPage(turn.index);
      }
      turn = { index, corner, pull };
      pages[index].appendChild(flapShadow);
      const beneath = pages[index + 1];
      if (beneath) {
        beneath.appendChild(castShadow);
      }
    } else {
      turn.corner = corner;
      turn.pull = pull;
    }
  }

  function resetPage(index) {
    const page = pages[index];
    page.classList.remove("is-turning");
    page.style.clipPath = "";
    page.style.webkitClipPath = "";
    flap.classList.remove("is-visible");
    flapShadow.remove();
    castShadow.remove();
  }

  /* clip the page rectangle to one side of the crease (Sutherland–Hodgman) */
  function clipToSide(mx, my, nx, ny, side) {
    const rect = [[0, 0], [pageWidth, 0], [pageWidth, pageHeight], [0, pageHeight]];
    const out = [];
    const inside = (p) => side * ((p[0] - mx) * nx + (p[1] - my) * ny) >= 0;

    for (let i = 0; i < rect.length; i += 1) {
      const a = rect[i];
      const b = rect[(i + 1) % rect.length];
      const ina = inside(a);
      const inb = inside(b);

      if (ina) {
        out.push(a);
      }

      if (ina !== inb) {
        const da = (a[0] - mx) * nx + (a[1] - my) * ny;
        const db = (b[0] - mx) * nx + (b[1] - my) * ny;
        const k = da / (da - db);
        out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]);
      }
    }

    return out;
  }

  function polygon(points) {
    if (points.length < 3) {
      return "polygon(0 0, 0 0, 0 0)";
    }
    return `polygon(${points.map((p) => `${p[0].toFixed(1)}px ${p[1].toFixed(1)}px`).join(", ")})`;
  }

  /* lay a gradient strip along the crease, its gradient running along (sx, sy) */
  function placeStrip(el, mx, my, sx, sy, depth, opacity) {
    const length = 2 * Math.hypot(pageWidth, pageHeight);
    const angle = Math.atan2(-sx, sy); // strip's x axis runs along the crease, its y axis along (sx, sy)
    el.style.width = `${length.toFixed(0)}px`;
    el.style.height = `${Math.max(1, depth).toFixed(1)}px`;
    el.style.transform = `translate(${mx.toFixed(1)}px, ${my.toFixed(1)}px) rotate(${angle.toFixed(4)}rad) translate(${(-length / 2).toFixed(1)}px, 0)`;
    el.style.opacity = opacity.toFixed(3);
  }

  /*
    The corner's path for turn fraction t (0 = flat, 1 = turned over).
    Horizontally the crease sits at W·(1 − t), so it travels with the
    finger; vertically the corner lifts on an arc around the spine.
  */
  function cornerAt(t, corner, pull) {
    const W = pageWidth;
    const cy = corner === 1 ? pageHeight : 0;
    const lift = reduceMotion ? 0 : CORNER_LIFT * 2 * W * Math.sqrt(Math.max(0, t * (1 - t)));

    let px = W - 2 * W * t;
    let py = cy - corner * lift + pull * Math.sin(Math.PI * t);

    /* the corner is tied to the spine by the width of the sheet */
    const dx = px;
    const dy = py - cy;
    const reach = Math.hypot(dx, dy);
    if (reach > W) {
      px = (dx / reach) * W;
      py = cy + (dy / reach) * W;
    }

    return { cx: W, cy, px, py };
  }

  function renderPage(index) {

    const page = pages[index];
    const t = state.progress[index];
    const turning = t > 0.0005 && t < 0.9995;

    page.classList.toggle("is-turned", t >= 0.9995);
    page.style.zIndex = String(turning ? 300 : t >= 0.9995 ? index : 100 - index);

    if (!turning) {
      if (turn && turn.index === index) {
        resetPage(index);
        turn = null;
      }
      return;
    }

    if (!turn || turn.index !== index) {
      setTurn(index, 1, 0);
    }

    const { cx, cy, px, py } = cornerAt(t, turn.corner, turn.pull);
    const vx = cx - px;
    const vy = cy - py;
    const span = Math.hypot(vx, vy);

    if (span < 0.5) {
      return;
    }

    const nx = vx / span;           // crease normal, pointing at the corner's rest position
    const ny = vy / span;
    const mx = (cx + px) / 2;       // a point on the crease
    const my = (cy + py) / 2;

    /* 1 — the flat part of the page */
    page.classList.add("is-turning");
    const flatPart = polygon(clipToSide(mx, my, nx, ny, -1));
    page.style.clipPath = flatPart;
    page.style.webkitClipPath = flatPart;

    /* 2 — the flap: the folded part, mirrored across the crease */
    const foldedPoints = clipToSide(mx, my, nx, ny, 1);
    const folded = polygon(foldedPoints);
    flap.style.clipPath = folded;
    flap.style.webkitClipPath = folded;

    const a = 1 - 2 * nx * nx;
    const b = -2 * nx * ny;
    const d = 1 - 2 * ny * ny;
    const e = mx - (a * mx + b * my);
    const f = my - (b * mx + d * my);
    flap.style.transform = `matrix(${a.toFixed(5)}, ${b.toFixed(5)}, ${b.toFixed(5)}, ${d.toFixed(5)}, ${e.toFixed(2)}, ${f.toFixed(2)})`;
    flap.classList.add("is-visible");

    /* how deep the fold is — drives the size of every shadow */
    let depth = 0;
    foldedPoints.forEach((p) => {
      depth = Math.max(depth, (p[0] - mx) * nx + (p[1] - my) * ny);
    });

    const lifted = Math.sin(Math.PI * t);

    /* 3 — shadows that follow the crease */
    placeStrip(flapShade, mx, my, nx, ny, depth, 1);
    placeStrip(flapShadow, mx, my, -nx, -ny, depth * 1.12 + 28, 0.35 + lifted * 0.65);
    placeStrip(castShadow, mx, my, nx, ny, Math.min(pageWidth * 0.45, 40 + depth * 0.5), 0.25 + lifted * 0.75);
  }

  function renderAll() {
    pages.forEach((page, index) => renderPage(index));
    updateChrome();
  }

  function updateChrome() {

    const current = state.currentPage;

    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === current);
      dot.setAttribute("aria-current", index === current ? "page" : "false");
    });

    if (counter) {
      counter.textContent = `${String(current + 1).padStart(2, "0")} / ${String(PAGE_COUNT).padStart(2, "0")}`;
    }

    if (previousButton) {
      previousButton.disabled = current === 0;
    }

    if (nextButton) {
      nextButton.disabled = current === PAGE_COUNT - 1;
    }

    stage.dataset.page = String(current);

    /* only the page on top is interactive / focusable */
    pages.forEach((page, index) => {
      const active = index === current;
      page.dataset.active = active ? "true" : "false";
      page.inert = !active;
      page.setAttribute("aria-hidden", active ? "false" : "true");
    });
  }


  /* =======================================================
     SETTLE — the one animation for drag release, arrows,
     dots, keyboard and trackpad alike.
  ======================================================= */

  let settleFrame = null;

  function settle({ index, dir, from, to, fromDrag, velocity = 0 }) {

    cancelAnimationFrame(settleFrame);

    const distance = Math.abs(to - from);

    if (distance < 0.001) {
      finishSettle(index, dir, to);
      return;
    }

    /* a fast release finishes faster; a slow one glides */
    const speedUp = clamp(Math.abs(velocity) / 1.6, 0, 0.45);
    const duration = reduceMotion ? 140 : clamp((300 + distance * 700) * (1 - speedUp), 220, 1000);
    const ease = fromDrag ? easeOutCubic : easeInOutCubic;
    const startedAt = performance.now();
    const startPull = turn && turn.index === index ? turn.pull : 0;

    state.settling = true;

    function step(now) {
      const k = clamp((now - startedAt) / duration, 0, 1);
      state.progress[index] = from + (to - from) * ease(k);
      if (turn && turn.index === index) {
        turn.pull = startPull * (1 - ease(k)); // the sheet straightens as it lands
      }
      renderPage(index);

      if (k < 1) {
        settleFrame = requestAnimationFrame(step);
      } else {
        finishSettle(index, dir, to);
      }
    }

    settleFrame = requestAnimationFrame(step);
  }

  function finishSettle(index, dir, to) {

    state.progress[index] = to;

    /* forward turn done -> next page is on top;
       backward turn done -> the returned page is on top */
    if (dir === 1 && to === 1) {
      state.currentPage = index + 1;
    } else if (dir === -1 && to === 0) {
      state.currentPage = index;
    }

    state.settling = false;
    renderPage(index);
    updateChrome();
  }

  function canInteract() {
    return state.phase === "book" && !state.settling && !state.drag && !homeView.hidden;
  }

  function turnBy(dir) {

    if (!canInteract()) {
      return;
    }

    const current = state.currentPage;

    if (dir === 1 && current < PAGE_COUNT - 1) {
      setTurn(current, 1, 0);
      settle({ index: current, dir: 1, from: state.progress[current], to: 1, fromDrag: false });
    } else if (dir === -1 && current > 0) {
      setTurn(current - 1, 1, 0);
      settle({ index: current - 1, dir: -1, from: state.progress[current - 1], to: 0, fromDrag: false });
    }
  }

  function goToPage(target) {

    target = clamp(target, 0, PAGE_COUNT - 1);

    if (!canInteract() || target === state.currentPage) {
      return;
    }

    /* long jumps lay the in-between pages down at once and animate only
       the last sheet, so pages are never skipped out of order */
    if (target > state.currentPage) {
      for (let i = state.currentPage; i < target - 1; i += 1) {
        state.progress[i] = 1;
        renderPage(i);
      }
      state.currentPage = target - 1;
      turnBy(1);
    } else {
      for (let i = state.currentPage - 1; i > target; i -= 1) {
        state.progress[i] = 0;
        renderPage(i);
      }
      state.currentPage = target + 1;
      turnBy(-1);
    }
    updateChrome();
  }


  /* =======================================================
     DRAG — pointerdown → pointermove (the sheet follows) →
     pointerup / pointercancel (complete or fall back).
     Mouse, pen and touch share one path.
  ======================================================= */

  let suppressClick = false;
  let dragFrame = null;

  function onPointerDown(event) {

    if (!canInteract()) {
      return;
    }

    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    /* typing or selecting text in a field must never turn the page */
    if (event.target.closest("input, textarea, select, label")) {
      return;
    }

    state.drag = {
      kind: "pointer",
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      locked: null,       // null -> undecided · "x" -> page drag · "y"/"none" -> ignore
      index: -1,
      dir: 0,
      base: 0,
      value: 0,
      reach: 1,
      corner: 1,
      pull: 0,
      samples: [{ t: performance.now(), x: event.clientX }]
    };
  }

  function lockGesture(drag, event, dx) {

    if (dx < 0 && state.currentPage < PAGE_COUNT - 1) {
      drag.dir = 1;                                   // leftward: turn the top page
      drag.index = state.currentPage;
    } else if (dx > 0 && state.currentPage > 0) {
      drag.dir = -1;                                  // rightward: bring the last page back
      drag.index = state.currentPage - 1;
    } else {
      drag.locked = "none";                           // nothing to turn that way
      return;
    }

    const rect = bookScene.getBoundingClientRect();
    const localX = drag.startX - rect.left;
    const localY = drag.startY - rect.top;

    /* the finger reaching the far edge completes the turn */
    drag.reach = Math.max(drag.dir === 1 ? localX : pageWidth - localX, pageWidth * 0.55);
    /* grab the corner on the finger's half of the page */
    drag.corner = localY > pageHeight / 2 ? 1 : -1;
    drag.base = state.progress[drag.index];
    drag.value = drag.base;
    drag.locked = "x";
    drag.startX = event.clientX;                      // follow from here, no jump
    drag.startY = event.clientY;

    setTurn(drag.index, drag.corner, 0);

    try {
      bookScene.setPointerCapture(event.pointerId);
    } catch (error) { /* capture is best-effort */ }

    suppressClick = true;
    stage.classList.add("is-dragging");
  }

  function onPointerMove(event) {

    const drag = state.drag;

    if (!drag || drag.kind !== "pointer" || event.pointerId !== drag.id) {
      return;
    }

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;

    if (drag.locked === null) {

      if (Math.abs(dx) < LOCK_PX && Math.abs(dy) < LOCK_PX) {
        return;
      }

      /* vertical intent -> the browser scrolls the page, we stay out */
      if (Math.abs(dy) > Math.abs(dx)) {
        drag.locked = "y";
        return;
      }

      lockGesture(drag, event, dx);
    }

    if (drag.locked !== "x") {
      return;
    }

    event.preventDefault();

    const fraction = (event.clientX - drag.startX) / drag.reach;
    drag.value = clamp(drag.base - fraction, 0, 1);
    drag.pull = clamp(event.clientY - drag.startY, -pageHeight * 0.4, pageHeight * 0.4) * 0.6;

    const now = performance.now();
    drag.samples.push({ t: now, x: event.clientX });
    while (drag.samples.length > 2 && now - drag.samples[0].t > 100) {
      drag.samples.shift();
    }

    /* at most one render per frame, always with the latest pointer */
    if (!dragFrame) {
      dragFrame = requestAnimationFrame(() => {
        dragFrame = null;
        const live = state.drag;
        if (live && live.locked === "x") {
          state.progress[live.index] = live.value;
          setTurn(live.index, live.corner, live.pull);
          renderPage(live.index);
        }
      });
    }
  }

  function velocityX(samples) {
    if (samples.length < 2) {
      return 0;
    }
    const first = samples[0];
    const last = samples[samples.length - 1];
    const dt = last.t - first.t;
    return dt > 0 ? (last.x - first.x) / dt : 0;
  }

  function releaseGesture({ index, dir, value }, flickToward) {

    /* how far the sheet has travelled in the direction of the turn */
    const along = dir === 1 ? value : 1 - value;

    const commit = flickToward > FLICK_VELOCITY ? along > 0.04
                 : flickToward < -FLICK_VELOCITY ? false
                 : along >= COMMIT_PROGRESS;

    const to = dir === 1 ? (commit ? 1 : 0) : (commit ? 0 : 1);
    settle({ index, dir, from: value, to, fromDrag: true, velocity: flickToward });
  }

  function onPointerUp(event) {

    const drag = state.drag;

    if (!drag || drag.kind !== "pointer" || event.pointerId !== drag.id) {
      return;
    }

    state.drag = null;
    cancelAnimationFrame(dragFrame);
    dragFrame = null;
    stage.classList.remove("is-dragging");

    if (drag.locked !== "x") {
      return;
    }

    try {
      bookScene.releasePointerCapture(drag.id);
    } catch (error) { /* already released */ }

    /* render the very last pointer position before settling from it */
    state.progress[drag.index] = drag.value;
    setTurn(drag.index, drag.corner, drag.pull);

    const vx = velocityX(drag.samples);
    const flickToward = drag.dir === 1 ? -vx : vx;

    releaseGesture(drag, event.type === "pointercancel" ? -Infinity : flickToward);

    /* the click that follows a real drag must not open a link */
    setTimeout(() => { suppressClick = false; }, 0);
  }

  bookScene.addEventListener("pointerdown", onPointerDown);
  bookScene.addEventListener("pointermove", onPointerMove);
  bookScene.addEventListener("pointerup", onPointerUp);
  bookScene.addEventListener("pointercancel", onPointerUp);

  /* only the scene's own capture matters: taking capture over from the
     browser's implicit touch capture fires this on the inner target too */
  bookScene.addEventListener("lostpointercapture", (event) => {
    if (event.target === bookScene) {
      onPointerUp(event);
    }
  });

  /* iOS Safari: once a gesture is a page turn, the page must not scroll */
  bookScene.addEventListener("touchmove", (event) => {
    if (state.drag && state.drag.locked === "x") {
      event.preventDefault();
    }
  }, { passive: false });

  bookScene.addEventListener("click", (event) => {
    if (suppressClick) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  /* the native image-drag ghost must never compete with the page drag */
  bookScene.addEventListener("dragstart", (event) => event.preventDefault());


  /* =======================================================
     TRACKPAD — horizontal two-finger swipes arrive as wheel
     events. They drive the same sheet; a short pause in the
     stream counts as the release.
  ======================================================= */

  let wheelTimer = null;

  bookScene.addEventListener("wheel", (event) => {

    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) * 1.2) {
      return; // vertical wheel scrolling stays native
    }

    if (state.drag && state.drag.kind !== "wheel") {
      return;
    }

    if (!state.drag) {

      if (!canInteract()) {
        return;
      }

      const forward = event.deltaX > 0;
      let index;
      let dir;

      if (forward && state.currentPage < PAGE_COUNT - 1) {
        index = state.currentPage;
        dir = 1;
      } else if (!forward && state.currentPage > 0) {
        index = state.currentPage - 1;
        dir = -1;
      } else {
        return;
      }

      state.drag = { kind: "wheel", index, dir, value: state.progress[index] };
      setTurn(index, 1, 0);
    }

    event.preventDefault(); // also stops the browser's horizontal "back" swipe

    const wheel = state.drag;
    wheel.value = clamp(wheel.value + event.deltaX / pageWidth, 0, 1);
    state.progress[wheel.index] = wheel.value;
    renderPage(wheel.index);

    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => {
      const gesture = state.drag;
      if (gesture && gesture.kind === "wheel") {
        state.drag = null;
        releaseGesture(gesture, 0);
      }
    }, 120);

  }, { passive: false });


  /* =======================================================
     BUTTONS, DOTS, KEYBOARD
  ======================================================= */

  if (nextButton) {
    nextButton.addEventListener("click", () => turnBy(1));
  }

  if (previousButton) {
    previousButton.addEventListener("click", () => turnBy(-1));
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => goToPage(Number(dot.dataset.page)));
  });

  document.addEventListener("keydown", (event) => {

    if (homeView.hidden || event.altKey || event.metaKey || event.ctrlKey) {
      return;
    }

    const tag = (event.target.tagName || "").toLowerCase();

    if (tag === "input" || tag === "textarea" || tag === "select") {
      return;
    }

    if (state.phase !== "book") {
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      turnBy(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      turnBy(-1);
    }
  });


  /* =======================================================
     RESIZE + ROUTE VISIBILITY
  ======================================================= */

  let resizeTimer = null;

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      measure();
      renderAll();
    }, 120);
  });

  /* Leaving the home route mid-film: pause it and land on the book when
     the visitor comes back, rather than replaying the intro. */
  new MutationObserver(() => {
    if (homeView.hidden) {
      if (state.phase !== "book") {
        finishReveal();
      }
      video.pause();
    }
  }).observe(homeView, { attributes: true, attributeFilter: ["hidden"] });


  /* =======================================================
     START
  ======================================================= */

  setPhase("intro");
  measure();
  renderAll();
  startIntro();

  return {
    /* called by the router whenever the home view is shown */
    refresh() {
      measure();
      renderAll();
    },

    /* open the book straight at a page (e.g. back from sign-in to
       the support page) — skips the film, lays earlier pages down */
    openPage(index) {
      const target = clamp(index, 0, PAGE_COUNT - 1);
      if (state.phase !== "book") {
        finishReveal();
      }
      cancelAnimationFrame(settleFrame);
      state.settling = false;
      state.drag = null;
      pages.forEach((page, i) => {
        state.progress[i] = i < target ? 1 : 0;
        renderPage(i);
      });
      state.currentPage = target;
      updateChrome();
    }
  };
}
