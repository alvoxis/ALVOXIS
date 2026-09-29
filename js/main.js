/* =========================================================
   ALVOXIS — CINEMATIC STAGE + PHYSICAL BOOK

   ONE pinned (sticky) stage holds both the hero video and the
   book. Scrolling scrubs the video; in the last part of that
   scroll the video recedes into depth while the book — the same
   single element the visitor will then drag — grows out of that
   depth to fill the screen. There is exactly one cover.

   Once the book is live, page turning is direct manipulation:
   the page follows the finger / mouse. Arrows, dots, keyboard
   and trackpad all drive the SAME settle animation.

   Vertical scrolling is never intercepted: the book area uses
   `touch-action: pan-y`, so the browser owns vertical gestures
   and this code only ever sees horizontal ones.
   ========================================================= */

/* ---------- tunables ---------- */

const SEGMENTS = 8;            // strips per photographic page (6–10 allowed)
const CURL_TOTAL_DEG = 46;     // total bend across the sheet at peak
const COMMIT_PROGRESS = 0.35;  // release past this -> the turn completes
const FLICK_VELOCITY = 0.45;   // px/ms — a fast flick also commits
const LOCK_PX = 8;             // movement before a gesture is classified
const DRAG_SMOOTHING = 0.42;   // 1 = rigid 1:1, lower = a touch of paper mass

const REVEAL_START = 0.70;     // stage scroll progress where the video starts receding
const REVEAL_END = 0.96;       // ...and where the cover has fully arrived

export function initHomeExperience() {

  /* =======================================================
     ELEMENTS
  ======================================================= */

  const storyEl = document.querySelector(".video-experience");
  const heroVideo = document.getElementById("heroVideo");
  const videoContent = document.getElementById("videoContent");
  const videoOverlay = document.querySelector(".video-overlay");
  const videoProgressBar = document.getElementById("videoProgressBar");
  const videoCounter = document.getElementById("videoCounter");
  const progressBlock = document.querySelector(".video-progress-container");

  const collectionLayer = document.getElementById("collection");
  const bookScene = document.getElementById("bookScene");
  const book = document.getElementById("alvoxisBook");
  const pages = Array.from(document.querySelectorAll(".book-page"));

  const previousButton = document.getElementById("previousCard");
  const nextButton = document.getElementById("nextCard");
  const dots = Array.from(document.querySelectorAll("#collectionDots span"));
  const counter = document.getElementById("collectionCounter");
  const scrollHint = document.querySelector(".book-scroll-hint");

  if (!storyEl || !heroVideo || !collectionLayer || !bookScene || !book || !pages.length) {
    console.warn("ALVOXIS: required elements are missing.");
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PAGE_COUNT = pages.length;


  /* =======================================================
     SMALL HELPERS
  ======================================================= */

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);


  /* =======================================================
     VIDEO — scrubbed by scroll
  ======================================================= */

  let videoReady = false;
  let videoDuration = 0;

  function markVideoReady() {
    if (Number.isFinite(heroVideo.duration) && heroVideo.duration > 0) {
      videoReady = true;
      videoDuration = heroVideo.duration;
      updateStory();
    }
  }

  /* =======================================================
     STORY — one scroll range drives BOTH the video and the
     cover's arrival. The reveal never depends on the video
     having loaded, so a slow/blocked video can't strand the
     visitor without a book.
  ======================================================= */

  let bookLive = false;
  let drag = null;

  function updateStory() {

    const rect = storyEl.getBoundingClientRect();
    const scrollable = storyEl.offsetHeight - window.innerHeight;

    if (scrollable <= 0) {
      return;
    }

    const progressValue = clamp(-rect.top, 0, scrollable) / scrollable;

    /* --- video playback (scrubbed) --- */

    const playback = clamp(progressValue / REVEAL_START, 0, 1);

    if (videoReady) {
      const target = playback * videoDuration;

      if (Math.abs(heroVideo.currentTime - target) > 0.015) {
        try { heroVideo.currentTime = target; } catch (error) { /* seeking not ready yet */ }
      }
    }

    if (videoProgressBar) {
      videoProgressBar.style.width = `${playback * 100}%`;
    }

    if (videoCounter) {
      videoCounter.textContent = `${String(Math.round(playback * 100)).padStart(2, "0")} / 100`;
    }

    const textFade = clamp((progressValue - 0.5) / 0.16, 0, 1);

    if (videoContent) {
      videoContent.style.opacity = String(1 - textFade);
      videoContent.style.transform = `translate3d(0, ${textFade * -35}px, 0)`;
    }

    if (progressBlock) {
      progressBlock.style.opacity = String(1 - clamp((progressValue - 0.6) / 0.1, 0, 1));
    }

    /* --- the hand-off: video recedes, cover emerges from the same depth --- */

    const reveal = clamp((progressValue - REVEAL_START) / (REVEAL_END - REVEAL_START), 0, 1);
    const eased = easeInOutCubic(reveal);

    const videoScale = reduceMotion ? 1 : 1 - eased * 0.3;
    heroVideo.style.transform = `scale(${videoScale})`;
    heroVideo.style.opacity = String(1 - clamp(eased * 1.15, 0, 1));

    if (videoOverlay) {
      videoOverlay.style.opacity = String(1 - eased * 0.7);
    }

    const coverOpacity = clamp((eased - 0.04) / 0.55, 0, 1);
    const coverScale = reduceMotion ? 1 : 0.55 + eased * 0.45;
    const coverBlur = reduceMotion ? 0 : (1 - eased) * 10;

    collectionLayer.style.opacity = String(coverOpacity);
    /* "none", not "": clearing the inline value would fall back to the stylesheet's
       starting scale(0.55) and shrink the finished book back into the distance */
    collectionLayer.style.transform = eased >= 0.999 ? "none" : `scale(${coverScale})`;
    collectionLayer.style.filter = coverBlur > 0.15 ? `blur(${coverBlur.toFixed(2)}px)` : "";

    const live = reveal >= 0.985;

    if (live !== bookLive) {
      bookLive = live;
      collectionLayer.classList.toggle("is-live", live);
      collectionLayer.inert = !live;

      if (!live && drag) {
        cancelDrag();
      }
    }
  }

  collectionLayer.inert = true;


  /* =======================================================
     BOOK MODEL

     progress[i] is the turned fraction of page i:
       0 = flat and face-up   ·   1 = fully turned (face-down, left)
     currentPage is the top-most page that is still flat.
  ======================================================= */

  const progress = pages.map(() => 0);
  let currentPage = 0;

  /* --- page-curl strips (photographic pages only) --- */

  const stripSets = pages.map((page) => buildStrips(page));

  function buildStrips(page) {

    const media = page.querySelector(".book-page-media");
    const img = media ? media.querySelector("img") : null;

    if (!media || !img) {
      return null;
    }

    img.classList.add("is-source");

    const chain = [];
    let parent = media;

    for (let i = 0; i < SEGMENTS; i += 1) {
      const strip = document.createElement("div");
      strip.className = "book-page-strip";
      strip.setAttribute("aria-hidden", "true");
      parent.appendChild(strip);
      chain.push(strip);
      parent = strip;
    }

    const set = { media, img, chain };
    layoutStrips(set);

    if (!img.complete || !img.naturalWidth) {
      img.addEventListener("load", () => layoutStrips(set), { once: true });
    }

    return set;
  }

  /*
    Sizes and positions use clientWidth/Height (layout size) — never
    getBoundingClientRect — because the page may be mid-rotation, and a
    transformed rect would give wrong numbers.
  */

  function layoutStrips(set) {

    const { media, img, chain } = set;
    const w = media.clientWidth;
    const h = media.clientHeight;

    if (!w || !h || !img.naturalWidth) {
      return;
    }

    /* emulate object-fit: cover; object-position: center */
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const bw = img.naturalWidth * scale;
    const bh = img.naturalHeight * scale;
    const x0 = (w - bw) / 2;
    const y0 = (h - bh) / 2;
    const stripW = w / SEGMENTS;
    const src = img.currentSrc || img.src;

    chain.forEach((strip, i) => {
      strip.style.backgroundImage = `url("${src}")`;
      strip.style.width = `${stripW + 1}px`;        // +1px overlap hides hairline seams
      strip.style.height = `${h}px`;
      strip.style.left = i === 0 ? "0px" : `${stripW}px`;
      strip.style.backgroundSize = `${bw}px ${bh}px`;
      strip.style.backgroundPosition = `${x0 - i * stripW}px ${y0}px`;
    });
  }

  function applyCurl(set, p) {

    if (!set) {
      return;
    }

    const bump = p <= 0 || p >= 1 ? 0 : Math.sin(Math.PI * p);
    const hinges = SEGMENTS - 1;
    const delta = reduceMotion ? 0 : (CURL_TOTAL_DEG / hinges) * bump;

    set.chain.forEach((strip, i) => {
      if (i === 0) {
        return; // the first strip is fixed to the spine
      }
      strip.style.transform = delta ? `rotateY(${delta.toFixed(3)}deg)` : "";
      strip.style.setProperty("--shade", (Math.min(0.26, (i * delta) / 150)).toFixed(3));
    });
  }

  /* --- render one page from its progress --- */

  function renderPage(index) {

    const page = pages[index];
    const p = progress[index];

    const inTransit = p > 0.0005 && p < 0.9995;
    const lift = inTransit ? Math.sin(Math.PI * p) : 0;

    page.style.transform = p === 0 ? "" : `rotateY(${(-180 * p).toFixed(3)}deg)`;
    page.style.zIndex = String(inTransit ? 300 : p >= 0.9995 ? index : 100 - index);
    page.style.setProperty("--shadow-opacity", (lift * 0.95).toFixed(3));

    /* the sheet lifting away casts its shadow on the page beneath it */
    const beneath = pages[index + 1];

    if (beneath) {
      beneath.style.setProperty("--cast-shadow", (lift * 0.6).toFixed(3));
    }

    applyCurl(stripSets[index], inTransit ? p : 0);
  }

  function renderAll() {
    pages.forEach((page, index) => renderPage(index));
    updateChrome();
  }

  /* --- chrome: dots, counter, arrows, hint, interactivity --- */

  function updateChrome() {

    dots.forEach((dot, index) => dot.classList.toggle("active", index === currentPage));

    if (counter) {
      counter.textContent = `${String(currentPage + 1).padStart(2, "0")} / ${String(PAGE_COUNT).padStart(2, "0")}`;
    }

    if (scrollHint) {
      scrollHint.style.opacity = currentPage === 0 ? "1" : "0";
    }

    if (previousButton) {
      previousButton.disabled = currentPage === 0;
    }

    if (nextButton) {
      nextButton.disabled = currentPage === PAGE_COUNT - 1;
    }

    /* only the visible page is interactive / focusable */
    pages.forEach((page, index) => {
      const active = index === currentPage;
      page.dataset.active = active ? "true" : "false";
      page.inert = !active;
    });
  }


  /* =======================================================
     SETTLE — the one animation used by drag-release, arrows,
     dots and keyboard alike.
  ======================================================= */

  let settleFrame = null;
  let isSettling = false;

  function settle({ index, dir, from, to, fromDrag }) {

    cancelAnimationFrame(settleFrame);

    const distance = Math.abs(to - from);

    if (distance < 0.001) {
      finishSettle(index, dir, to);
      return;
    }

    const duration = reduceMotion ? 120 : clamp(230 + distance * 520, 230, 760);
    const ease = fromDrag ? easeOutCubic : easeInOutCubic;
    const startedAt = performance.now();

    isSettling = true;

    function step(now) {

      const t = clamp((now - startedAt) / duration, 0, 1);
      progress[index] = from + (to - from) * ease(t);
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

    progress[index] = to;

    /* forward turn completed -> next page is now on top;
       backward turn completed -> the un-turned page is on top */
    if (dir === 1 && to === 1) {
      currentPage = index + 1;
    } else if (dir === -1 && to === 0) {
      currentPage = index;
    }

    renderPage(index);
    updateChrome();
    isSettling = false;
  }

  function turnBy(dir) {

    if (isSettling || drag || !bookLive) {
      return;
    }

    if (dir === 1 && currentPage < PAGE_COUNT - 1) {
      settle({ index: currentPage, dir: 1, from: progress[currentPage], to: 1, fromDrag: false });
    }

    if (dir === -1 && currentPage > 0) {
    if (dir === -1 && currentPage > 0) {
      settle({ index: currentPage - 1, dir: -1, from: progress[currentPage - 1], to: 0, fromDrag: false });
    }
  }

  function goToPage(target) {

    target = clamp(target, 0, PAGE_COUNT - 1);

    if (target === currentPage || isSettling || drag || !bookLive) {
      return;
    }

    /* long jumps snap the in-between pages and animate only the last turn */
    if (target > currentPage) {
      for (let i = currentPage; i < target - 1; i += 1) {
        progress[i] = 1;
        renderPage(i);
      }
      currentPage = target - 1;
      turnBy(1);
    } else {
      for (let i = currentPage - 1; i > target; i -= 1) {
        progress[i] = 0;
        renderPage(i);
      }
      currentPage = target + 1;
      turnBy(-1);
    }
  }


  /* =======================================================
     DRAG — direct manipulation

     The page's turned fraction equals how far the pointer has
     travelled as a fraction of the page width: 20% across the
     screen -> the page is ~20% of the way over. A light
     smoothing term gives the paper a little mass without ever
     becoming rubbery.
  ======================================================= */

  let suppressClick = false;

  function beginDrag(event) {

    if (!bookLive || isSettling || drag) {
      return;
    }

    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    if (event.target.closest(".book-controls")) {
      return;
    }

    drag = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      anchorX: event.clientX,
      locked: null,
      index: -1,
      dir: 0,
      target: 0,
      value: 0,
      baseValue: 0,
      width: bookScene.clientWidth || window.innerWidth,
      samples: [{ t: performance.now(), x: event.clientX }],
      frame: null
    };
  }

  function lockDrag(event, dx) {

    /* leftward drag turns the current page; rightward drag brings the
       previous page back — if there is one */
    if (dx < 0 && currentPage < PAGE_COUNT - 1) {
      drag.dir = 1;
      drag.index = currentPage;
      drag.value = drag.target = progress[currentPage];
    } else if (dx > 0 && currentPage > 0) {
      drag.dir = -1;
      drag.index = currentPage - 1;
      drag.value = drag.target = progress[currentPage - 1];
    } else {
      drag.locked = "none"; // nothing to turn in that direction
      return;
    }

    drag.locked = "x";
    drag.baseValue = drag.value;

    try {
      bookScene.setPointerCapture(event.pointerId);
    } catch (error) { /* capture is best-effort */ }

    suppressClick = true;
    drag.frame = requestAnimationFrame(dragLoop);
  }

  function moveDrag(event) {

    if (!drag || event.pointerId !== drag.id) {
      return;
    }

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;

    if (drag.locked === null) {

      if (Math.abs(dx) < LOCK_PX && Math.abs(dy) < LOCK_PX) {
        return;
      }

      /* clear vertical intent -> hand the gesture back to native scrolling */
      if (Math.abs(dy) > Math.abs(dx) * 0.9) {
        drag.locked = "y";
        return;
      }

      lockDrag(event, dx);
    }

    if (drag.locked !== "x") {
      return;
    }

    const travelled = event.clientX - drag.anchorX;
    const fraction = travelled / drag.width;

    /* forward: leftward travel raises progress; backward: rightward travel lowers it */
    drag.target = clamp(drag.baseValue - fraction, 0, 1);

    const now = performance.now();
    drag.samples.push({ t: now, x: event.clientX });

    while (drag.samples.length > 2 && now - drag.samples[0].t > 110) {
      drag.samples.shift();
    }

    event.preventDefault();
  }

  function dragLoop() {

    if (!drag || drag.locked !== "x") {
      return;
    }

    const gap = drag.target - drag.value;
    drag.value = Math.abs(gap) < 0.0005 ? drag.target : drag.value + gap * DRAG_SMOOTHING;

    progress[drag.index] = drag.value;
    renderPage(drag.index);

    drag.frame = requestAnimationFrame(dragLoop);
  }

  function velocityX() {

    const s = drag.samples;

    if (s.length < 2) {
      return 0;
    }

    const first = s[0];
    const last = s[s.length - 1];
    const dt = last.t - first.t;

    return dt > 0 ? (last.x - first.x) / dt : 0;
  }

  function endDrag(event) {

    if (!drag || event.pointerId !== drag.id) {
      return;
    }

    if (drag.locked !== "x") {
      drag = null;
      return;
    }

    cancelAnimationFrame(drag.frame);

    const { index, dir } = drag;
    const value = drag.value;
    const vx = velocityX();

    try {
      bookScene.releasePointerCapture(drag.id);
    } catch (error) { /* already released */ }

    /* how far along the *turn direction* the page has gone */
    const along = dir === 1 ? value : 1 - value;

    /* flick: leftward motion is negative vx. Commit forward turns on a
       fast leftward flick and backward turns on a fast rightward one. */
    const flickToward = dir === 1 ? -vx : vx;
    const commit = flickToward > FLICK_VELOCITY ? along > 0.04
                 : flickToward < -FLICK_VELOCITY ? false
                 : along >= COMMIT_PROGRESS;

    const to = dir === 1 ? (commit ? 1 : 0) : (commit ? 0 : 1);

    drag = null;

    settle({ index, dir, from: value, to, fromDrag: true });

    /* the click that follows a real drag must not activate a link/button */
    setTimeout(() => { suppressClick = false; }, 0);
  }

  function cancelDrag() {

    if (!drag) {
      return;
    }

    cancelAnimationFrame(drag.frame);

    if (drag.locked === "x") {
      const { index, dir } = drag;
      const value = drag.value;
      drag = null;
      settle({ index, dir, from: value, to: dir === 1 ? 0 : 1, fromDrag: true });
    } else {
      drag = null;
    }

    suppressClick = false;
  }

  bookScene.addEventListener("pointerdown", beginDrag);
  bookScene.addEventListener("pointermove", moveDrag);
  bookScene.addEventListener("pointerup", endDrag);
  bookScene.addEventListener("pointercancel", cancelDrag);

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
     events, not pointer events. They drive the same drag
     model; a short pause in the stream counts as "release".
  ======================================================= */

  let wheelDrag = null;
  let wheelTimer = null;

  bookScene.addEventListener("wheel", (event) => {

    if (!bookLive || isSettling || Math.abs(event.deltaX) <= Math.abs(event.deltaY) * 1.2) {
      return; // vertical wheel scrolling stays native
    }

    event.preventDefault(); // also stops the browser's horizontal "back" swipe

    if (!wheelDrag) {

      const forward = event.deltaX > 0;

      if (forward && currentPage < PAGE_COUNT - 1) {
        wheelDrag = { dir: 1, index: currentPage, value: progress[currentPage] };
      } else if (!forward && currentPage > 0) {
        wheelDrag = { dir: -1, index: currentPage - 1, value: progress[currentPage - 1] };
      } else {
        return;
      }
    }

    const width = bookScene.clientWidth || window.innerWidth;

    wheelDrag.value = clamp(wheelDrag.value + event.deltaX / width, 0, 1);
    progress[wheelDrag.index] = wheelDrag.value;
    renderPage(wheelDrag.index);

    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(releaseWheel, 110);

  }, { passive: false });

  function releaseWheel() {

    if (!wheelDrag) {
      return;
    }

    const { index, dir, value } = wheelDrag;
    const along = dir === 1 ? value : 1 - value;
    const to = dir === 1 ? (along >= COMMIT_PROGRESS ? 1 : 0) : (along >= COMMIT_PROGRESS ? 0 : 1);

    wheelDrag = null;
    settle({ index, dir, from: value, to, fromDrag: true });
  }


  /* =======================================================
     BUTTONS, DOTS, KEYBOARD — same settle animation
  ======================================================= */

  if (nextButton) {
    nextButton.addEventListener("click", () => turnBy(1));
  }

  if (previousButton) {
    previousButton.addEventListener("click", () => turnBy(-1));
  }

  dots.forEach((dot, index) => dot.addEventListener("click", () => goToPage(index)));

  document.addEventListener("keydown", (event) => {

    /* the book lives inside the home view; ignore keys while another view is showing */
    if (!bookLive || !storyEl.offsetHeight) {
      return;
    }

    const tag = (event.target.tagName || "").toLowerCase();

    if (tag === "input" || tag === "textarea" || tag === "select") {
      return;
    }

    if (event.key === "ArrowRight") {
      turnBy(1);
    } else if (event.key === "ArrowLeft") {
      turnBy(-1);
    }
  });


  /* =======================================================
     SCROLL / RESIZE — one rAF-throttled listener, registered once
  ======================================================= */

  let ticking = false;

  window.addEventListener("scroll", () => {

    if (ticking) {
      return;
    }

    ticking = true;

    requestAnimationFrame(() => {
      updateStory();
      ticking = false;
    });

  }, { passive: true });

  let resizeTimer = null;

  window.addEventListener("resize", () => {

    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
      stripSets.forEach((set) => set && layoutStrips(set));
      updateStory();
    }, 120);
  });


  /* =======================================================
     INITIAL STATE
  ======================================================= */

  renderAll();
  updateStory();

  /* Video readiness is wired LAST, once every piece of state above exists —
     a cached video can already be ready here, and markVideoReady() calls
     updateStory(), which reads that state. */

  if (heroVideo.readyState >= 1) {
    markVideoReady();
  } else {
    heroVideo.addEventListener("loadedmetadata", markVideoReady, { once: true });
    heroVideo.addEventListener("durationchange", markVideoReady);
    heroVideo.load();
  }

  /* The home view is hidden while other routes are showing, so nothing can
     be measured then. The router calls refresh() when home is shown again:
     it re-measures the strips and re-syncs the stage to the scroll position,
     so a stale "live" book can never sit on top of the video. */

  return {
    refresh() {
      stripSets.forEach((set) => set && layoutStrips(set));
      updateStory();
    }
  };
}
