/* =========================================================
   ALVOXIS — HOME STAGE: FILM → ONE COVER → PHYSICAL BOOK

   One 100svh stage, one state object, one engine.

     intro   the film plays by itself (muted, inline). Nothing
             here depends on scrolling.
     reveal  the film ends (or is skipped): it recedes into depth
             while the book — whose page 0 IS the cover — emerges
             from that depth as a closed book, then grows to fill
             the stage. There is no second cover anywhere.
     book    pages turn by direct manipulation: the page follows
             the finger / mouse and bends through a short chain of
             vertical strips. Release past 35% → the turn completes,
             otherwise it falls back. Arrows, dots, keyboard and
             trackpad drive the very same settle animation.

   Vertical scrolling is never intercepted: the book uses
   `touch-action: pan-y`, so the browser keeps vertical pans and
   this code only ever handles horizontal ones.
   ========================================================= */

/* ---------- tunables ---------- */

const SEGMENTS = 8;             // curl strips per page (6–10)
const CURL_DEG = 64;            // extra bend at the free edge, at mid-turn
const COMMIT_PROGRESS = 0.35;   // release past this fraction -> the turn completes
const FLICK_VELOCITY = 0.5;     // px/ms — a fast flick also commits
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
     PAGE CURL

     A turning page is drawn by a chain of SEGMENTS nested strips.
     Each strip holds a slice of the page's real front (and back)
     and hinges on its own left edge, so small per-strip rotations
     add up into a bend while the edges stay joined. The strips
     near the free edge bend most, and each is shaded by its own
     angle to the light. The interactive page is shown whenever it
     is flat; the strips only exist on screen during a turn.
  ======================================================= */

  const curls = pages.map(() => null);
  let pageWidth = 0;
  let pageHeight = 0;

  /* per-hinge share of the total bend: grows toward the free edge */
  const hingeWeights = (() => {
    const raw = [];
    for (let i = 0; i < SEGMENTS; i += 1) {
      raw.push(i === 0 ? 0 : Math.pow(i, 1.35));
    }
    const sum = raw.reduce((a, b) => a + b, 0);
    return raw.map((w) => w / sum);
  })();

  function measure() {
    pageWidth = book.clientWidth || stage.clientWidth || window.innerWidth;
    pageHeight = book.clientHeight || stage.clientHeight || window.innerHeight;
    book.style.setProperty("--book-perspective", `${Math.round(Math.max(1100, pageWidth * 2.3))}px`);
  }

  function buildCurl(index) {

    const page = pages[index];
    const front = page.querySelector(".book-page-front");
    const back = page.querySelector(".book-page-back");
    const signature = `${pageWidth}x${pageHeight}|${front.innerHTML}`;
    const cached = curls[index];

    if (cached && cached.signature === signature) {
      return cached;
    }

    if (cached) {
      cached.root.remove();
    }

    const stripWidth = pageWidth / SEGMENTS;
    const root = document.createElement("div");
    root.className = "page-curl";
    root.setAttribute("aria-hidden", "true");

    const strips = [];
    let parent = root;

    for (let i = 0; i < SEGMENTS; i += 1) {

      const strip = document.createElement("div");
      strip.className = i === SEGMENTS - 1 ? "curl-strip curl-strip-edge" : "curl-strip";
      strip.style.left = i === 0 ? "0px" : `${stripWidth}px`;
      strip.style.width = `${stripWidth}px`;

      const frontFace = document.createElement("div");
      frontFace.className = "curl-face curl-front";
      const frontSlice = front.cloneNode(true);
      frontSlice.className = "curl-slice";
      frontSlice.style.width = `${pageWidth}px`;
      frontSlice.style.left = `${-i * stripWidth}px`;
      frontFace.appendChild(frontSlice);

      const backFace = document.createElement("div");
      backFace.className = "curl-face curl-back";
      const backSlice = back.cloneNode(true);
      backSlice.className = "curl-slice curl-back-slice";
      backSlice.style.width = `${pageWidth}px`;
      /* the back is seen mirrored, so slice it from the opposite side */
      backSlice.style.left = `${-(SEGMENTS - 1 - i) * stripWidth}px`;
      backFace.appendChild(backSlice);

      strip.append(frontFace, backFace);
      parent.appendChild(strip);
      strips.push(strip);
      parent = strip;
    }

    root.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
    root.querySelectorAll("[data-i18n], [data-price]").forEach((el) => {
      el.removeAttribute("data-i18n");
      el.removeAttribute("data-price");
    });

    page.appendChild(root);

    const curl = { root, strips, signature };
    curls[index] = curl;
    return curl;
  }

  function invalidateCurls() {
    curls.forEach((curl, index) => {
      if (curl && !pages[index].classList.contains("is-turning")) {
        curl.root.remove();
        curls[index] = null;
      }
    });
  }

  function paintCurl(curl, p) {

    const bump = Math.sin(Math.PI * p);
    const bend = reduceMotion ? 0 : CURL_DEG * bump;
    const baseDeg = 180 * p;
    let cumulative = baseDeg;

    curl.strips.forEach((strip, i) => {

      const hinge = bend * hingeWeights[i];
      cumulative += hinge;

      /* tiny z lift per strip keeps the bent sheet clear of the page below */
      strip.style.transform = i === 0
        ? ""
        : `rotateY(${(-hinge).toFixed(3)}deg) translateZ(${(bump * 0.6).toFixed(2)}px)`;

      /* light comes from the viewer: the more a slice faces away, the darker */
      const facing = Math.cos((cumulative * Math.PI) / 180);
      const frontShade = clamp(0.55 * (1 - facing), 0, 0.6);
      const backShade = clamp(0.55 * (1 + facing), 0, 0.6);
      strip.style.setProperty("--shade-front", frontShade.toFixed(3));
      strip.style.setProperty("--shade-back", backShade.toFixed(3));
    });
  }


  /* =======================================================
     RENDER
  ======================================================= */

  function renderPage(index) {

    const page = pages[index];
    const p = state.progress[index];
    const turning = p > 0.0005 && p < 0.9995;

    page.classList.toggle("is-turning", turning);
    page.classList.toggle("is-turned", p >= 0.9995);
    page.style.transform = p <= 0.0005 ? "" : `rotateY(${(-180 * p).toFixed(3)}deg)`;
    page.style.zIndex = String(turning ? 300 : p >= 0.9995 ? index : 100 - index);

    /* the sheet lifting away casts its shadow on the page beneath it */
    const beneath = pages[index + 1];
    if (beneath) {
      beneath.style.setProperty("--cast-shadow", (turning ? Math.sin(Math.PI * p) * 0.65 : 0).toFixed(3));
    }

    if (turning) {
      paintCurl(buildCurl(index), p);
    }
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

  function settle({ index, dir, from, to, fromDrag }) {

    cancelAnimationFrame(settleFrame);

    const distance = Math.abs(to - from);

    if (distance < 0.001) {
      finishSettle(index, dir, to);
      return;
    }

    const duration = reduceMotion ? 140 : clamp(260 + distance * 640, 260, 900);
    const ease = fromDrag ? easeOutCubic : easeInOutCubic;
    const startedAt = performance.now();

    state.settling = true;

    function step(now) {
      const t = clamp((now - startedAt) / duration, 0, 1);
      state.progress[index] = from + (to - from) * ease(t);
      renderPage(index);

      if (t < 1) {
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
      settle({ index: current, dir: 1, from: state.progress[current], to: 1, fromDrag: false });
    } else if (dir === -1 && current > 0) {
      settle({ index: current - 1, dir: -1, from: state.progress[current - 1], to: 0, fromDrag: false });
    }
  }

  function goToPage(target) {

    target = clamp(target, 0, PAGE_COUNT - 1);

    if (!canInteract() || target === state.currentPage) {
      return;
    }

    /* long jumps snap the in-between pages and animate only the last turn */
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
  }


  /* =======================================================
     DRAG — pointerdown → pointermove (page follows) → pointerup
     (complete or fall back). Mouse, pen and touch share it.
  ======================================================= */

  let suppressClick = false;
  let dragFrame = null;

  function beginGesture(index, dir) {
    state.drag.index = index;
    state.drag.dir = dir;
    state.drag.base = state.progress[index];
    state.drag.value = state.drag.base;
    buildCurl(index); // build before the first frame so nothing pops in
  }

  function onPointerDown(event) {

    if (!canInteract()) {
      return;
    }

    if (event.pointerType === "mouse" && event.button !== 0) {
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
      samples: [{ t: performance.now(), x: event.clientX }]
    };
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

      if (dx < 0 && state.currentPage < PAGE_COUNT - 1) {
        beginGesture(state.currentPage, 1);          // leftward: turn the top page
      } else if (dx > 0 && state.currentPage > 0) {
        beginGesture(state.currentPage - 1, -1);     // rightward: bring the last page back
      } else {
        drag.locked = "none";                        // nothing to turn that way
        return;
      }

      drag.locked = "x";
      drag.startX = event.clientX;                   // follow from here, no jump

      try {
        bookScene.setPointerCapture(event.pointerId);
      } catch (error) { /* capture is best-effort */ }

      suppressClick = true;
      stage.classList.add("is-dragging");
    }

    if (drag.locked !== "x") {
      return;
    }

    event.preventDefault();

    /* the page's turned fraction tracks the pointer's travel across the page */
    const fraction = (event.clientX - drag.startX) / (pageWidth || window.innerWidth);
    drag.value = clamp(drag.base - fraction, 0, 1);

    const now = performance.now();
    drag.samples.push({ t: now, x: event.clientX });
    while (drag.samples.length > 2 && now - drag.samples[0].t > 100) {
      drag.samples.shift();
    }

    if (!dragFrame) {
      dragFrame = requestAnimationFrame(() => {
        dragFrame = null;
        if (state.drag && state.drag.locked === "x") {
          state.progress[state.drag.index] = state.drag.value;
          renderPage(state.drag.index);
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

    /* how far the page has travelled in the direction of the turn */
    const along = dir === 1 ? value : 1 - value;

    const commit = flickToward > FLICK_VELOCITY ? along > 0.05
                 : flickToward < -FLICK_VELOCITY ? false
                 : along >= COMMIT_PROGRESS;

    const to = dir === 1 ? (commit ? 1 : 0) : (commit ? 0 : 1);
    settle({ index, dir, from: value, to, fromDrag: true });
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
     events. They drive the same gesture; a short pause in the
     stream counts as the release.
  ======================================================= */

  let wheelTimer = null;

  bookScene.addEventListener("wheel", (event) => {

    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) * 1.2) {
      return; // vertical wheel scrolling stays native
    }

    const drag = state.drag;

    if (drag && drag.kind !== "wheel") {
      return;
    }

    if (!drag) {

      if (!canInteract()) {
        return;
      }

      const forward = event.deltaX > 0;

      if (forward && state.currentPage < PAGE_COUNT - 1) {
        state.drag = { kind: "wheel" };
        beginGesture(state.currentPage, 1);
      } else if (!forward && state.currentPage > 0) {
        state.drag = { kind: "wheel" };
        beginGesture(state.currentPage - 1, -1);
      } else {
        return;
      }
    }

    event.preventDefault(); // also stops the browser's horizontal "back" swipe

    const wheel = state.drag;
    wheel.value = clamp(wheel.value + event.deltaX / (pageWidth || window.innerWidth), 0, 1);
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
      invalidateCurls();
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
      invalidateCurls();
      renderAll();
    }
  };
}
