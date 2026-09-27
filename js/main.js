/* =========================================================
   ALVOXIS — CINEMATIC VIDEO + FULLSCREEN BOOK

   Both the hero video and the book are driven the same
   way: scroll position inside a tall, pinned (sticky)
   section is mapped to visual progress. Nothing here
   listens for wheel or touch gestures directly — normal
   scrolling (mouse wheel, trackpad, touch drag) already
   does the right thing, because the section is sticky.
   This is what makes the book feel native on mobile.
   ========================================================= */

export function initHomeExperience() {

  /* =======================================================
     ELEMENTS
  ======================================================= */

  const videoSection = document.querySelector(".video-experience");
  const heroVideo = document.getElementById("heroVideo");
  const videoContent = document.getElementById("videoContent");
  const videoOverlay = document.querySelector(".video-overlay");
  const videoProgressBar = document.getElementById("videoProgressBar");
  const videoCounter = document.getElementById("videoCounter");

  const collectionSection = document.getElementById("collection");
  const bookScene = document.getElementById("bookScene");
  const book = document.getElementById("alvoxisBook");
  const pages = Array.from(document.querySelectorAll(".book-page"));

  const previousButton = document.getElementById("previousCard");
  const nextButton = document.getElementById("nextCard");
  const dots = Array.from(document.querySelectorAll("#collectionDots span"));
  const counter = document.getElementById("collectionCounter");
  const scrollHint = document.querySelector(".book-scroll-hint");


  /* =======================================================
     SAFETY CHECK
  ======================================================= */

  if (!videoSection || !heroVideo || !collectionSection || !book || !pages.length) {
    console.warn("ALVOXIS: required elements are missing.");
    return;
  }


  /* =======================================================
     STATE
  ======================================================= */

  let videoReady = false;
  let videoDuration = 0;
  let currentPage = 0;

  const PAGE_COUNT = pages.length;

  /*
    Small hold at the very start and end of the book's
    scroll range, so the cover and the last page each get
    a moment to sit still before/after turning — this is
    what makes them read as deliberate pauses rather than
    the book turning pages the instant it's touched.
  */
  const HOLD_FRACTION = 0.05;


  /* =======================================================
     HELPERS
  ======================================================= */

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function easeInOutCubic(t) {
    t = clamp(t, 0, 1);
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }


  /* =======================================================
     VIDEO INITIALIZATION
  ======================================================= */

  function initializeVideo() {

    if (heroVideo.readyState >= 1 && heroVideo.duration) {
      videoReady = true;
      videoDuration = heroVideo.duration;
      return;
    }

    heroVideo.addEventListener(
      "loadedmetadata",
      () => {
        videoReady = true;
        videoDuration = heroVideo.duration;
      },
      { once: true }
    );

    heroVideo.addEventListener("durationchange", () => {
      if (Number.isFinite(heroVideo.duration)) {
        videoReady = true;
        videoDuration = heroVideo.duration;
      }
    });

    heroVideo.load();
  }

  initializeVideo();


  /* =======================================================
     VIDEO SCROLL PROGRESS

     In the final portion of this section's scroll range,
     the video recedes into darkness (shrinks, fades,
     blurs). It does NOT reveal any cover of its own —
     there is only ever one cover, and it lives inside the
     book below. This is what the video hands off to.
  ======================================================= */

  function updateVideoFromScroll() {

    if (!videoReady || !videoDuration) {
      return;
    }

    const rect = videoSection.getBoundingClientRect();
    const scrollableDistance = videoSection.offsetHeight - window.innerHeight;

    if (scrollableDistance <= 0) {
      return;
    }

    const passed = clamp(-rect.top, 0, scrollableDistance);
    const progress = passed / scrollableDistance;

    const recedeStart = 0.78;

    const videoPlaybackProgress = clamp(progress / recedeStart, 0, 1);
    const targetTime = videoPlaybackProgress * videoDuration;

    if (Math.abs(heroVideo.currentTime - targetTime) > 0.015) {
      try {
        heroVideo.currentTime = targetTime;
      } catch (error) {
        console.warn("ALVOXIS video seek error:", error);
      }
    }

    if (videoProgressBar) {
      videoProgressBar.style.width = `${progress * 100}%`;
    }

    const textFade = clamp((progress - 0.45) / 0.2, 0, 1);

    if (videoContent) {
      videoContent.style.opacity = String(1 - textFade);
      videoContent.style.transform = `translate3d(0, ${textFade * -35}px, 0)`;
    }

    const recedeProgress = clamp((progress - recedeStart) / (1 - recedeStart), 0, 1);
    const recedeEase = easeInOutCubic(recedeProgress);

    const videoScale = 1 - recedeEase * 0.22;
    const videoOpacity = 1 - recedeEase;
    const videoBlur = recedeEase * 10;

    heroVideo.style.transform = `scale(${videoScale})`;
    heroVideo.style.opacity = String(videoOpacity);
    heroVideo.style.filter = `blur(${videoBlur}px)`;

    if (videoOverlay) {
      videoOverlay.style.opacity = String(1 - recedeEase * 0.6);
    }

    if (videoCounter) {
      const percent = Math.round(progress * 100);
      videoCounter.textContent = `${String(percent).padStart(2, "0")} / 100`;
    }
  }


  /* =======================================================
     BOOK SCROLL PROGRESS

     Scroll position inside the pinned collection section
     is mapped directly to a continuous "book position"
     from 0 to (PAGE_COUNT - 1). This is exactly the same
     technique as the video above — nothing here reacts to
     wheel or touch events directly, so native scrolling
     (including touch momentum) drives the page turn for
     free, on every platform.
  ======================================================= */

  function updateBookFromScroll() {

    const rect = collectionSection.getBoundingClientRect();
    const scrollableDistance = collectionSection.offsetHeight - window.innerHeight;

    if (scrollableDistance <= 0) {
      return;
    }

    const passed = clamp(-rect.top, 0, scrollableDistance);
    const rawProgress = passed / scrollableDistance;

    const usable = clamp(
      (rawProgress - HOLD_FRACTION) / (1 - HOLD_FRACTION * 2),
      0,
      1
    );

    const bookPosition = usable * (PAGE_COUNT - 1);
    const activeIndex = clamp(Math.floor(bookPosition), 0, Math.max(PAGE_COUNT - 2, 0));
    const turnFraction = PAGE_COUNT > 1 ? clamp(bookPosition - activeIndex, 0, 1) : 0;

    currentPage = usable >= 1 ? PAGE_COUNT - 1 : Math.round(bookPosition);

    pages.forEach((page, index) => {

      let rotation = 0;
      let z = 100 - index; // upcoming pages stack: nearer pages on top
      let shadow = 0;
      let wobble = 0;

      if (index < activeIndex) {

        rotation = -180;
        z = index; // already-turned pages sit at the back, oldest furthest

      } else if (index === activeIndex) {

        rotation = -180 * turnFraction;
        z = 200; // the actively turning leaf is always on top
        shadow = Math.sin(turnFraction * Math.PI);
        wobble = Math.sin(turnFraction * Math.PI) * 2.2;
      }

      page.style.transform = `rotateY(${rotation}deg) rotateX(${wobble}deg)`;
      page.style.zIndex = String(z);
      page.style.setProperty("--shadow-opacity", String(shadow));
    });

    updateChrome();
  }


  /* =======================================================
     CHROME — dots, counter, arrows, scroll hint
  ======================================================= */

  function updateChrome() {

    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentPage);
    });

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
  }


  /* =======================================================
     GO TO PAGE — used by arrows, dots and keyboard.
     Translates a target page index into a scroll position
     and lets the browser's native smooth scroll animate it;
     updateBookFromScroll() then follows along every frame.
  ======================================================= */

  function goToPage(targetIndex) {

    const clampedTarget = clamp(targetIndex, 0, PAGE_COUNT - 1);
    const scrollableDistance = collectionSection.offsetHeight - window.innerHeight;

    if (scrollableDistance <= 0) {
      return;
    }

    const targetUsable = PAGE_COUNT > 1 ? clampedTarget / (PAGE_COUNT - 1) : 0;
    const targetProgress = HOLD_FRACTION + targetUsable * (1 - HOLD_FRACTION * 2);
    const targetScrollY = collectionSection.offsetTop + targetProgress * scrollableDistance;

    window.scrollTo({ top: targetScrollY, behavior: "smooth" });
  }


  /* =======================================================
     ARROW CONTROLS
  ======================================================= */

  if (nextButton) {
    nextButton.addEventListener("click", () => goToPage(currentPage + 1));
  }

  if (previousButton) {
    previousButton.addEventListener("click", () => goToPage(currentPage - 1));
  }


  /* =======================================================
     DOT CONTROLS
  ======================================================= */

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => goToPage(index));
  });


  /* =======================================================
     KEYBOARD
  ======================================================= */

  document.addEventListener("keydown", (event) => {

    const rect = collectionSection.getBoundingClientRect();
    const visible = rect.top < window.innerHeight && rect.bottom > 0;

    if (!visible) {
      return;
    }

    if (event.key === "ArrowRight") {
      goToPage(currentPage + 1);
    }

    if (event.key === "ArrowLeft") {
      goToPage(currentPage - 1);
    }
  });


  /* =======================================================
     OPTIONAL SWIPE SHORTCUT

     Scrolling already turns pages natively. A clear
     horizontal swipe is treated as a shortcut for "go to
     the next/previous page" on top of that — it does not
     replace normal scrolling, so a vertical drag still
     just scrolls, exactly as the user expects.
  ======================================================= */

  let touchStartX = 0;
  let touchStartY = 0;

  bookScene.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    },
    { passive: true }
  );

  bookScene.addEventListener(
    "touchend",
    (event) => {

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;

      if (Math.abs(deltaX) < 60) return;
      if (Math.abs(deltaX) < Math.abs(deltaY) * 1.4) return;

      if (deltaX < 0) {
        goToPage(currentPage + 1);
      } else {
        goToPage(currentPage - 1);
      }
    },
    { passive: true }
  );


  /* =======================================================
     SCROLL LOOP
  ======================================================= */

  let ticking = false;

  function handleScroll() {

    if (ticking) {
      return;
    }

    ticking = true;

    requestAnimationFrame(() => {
      updateVideoFromScroll();
      updateBookFromScroll();
      ticking = false;
    });
  }

  window.addEventListener("scroll", handleScroll, { passive: true });

  window.addEventListener("resize", () => {
    updateVideoFromScroll();
    updateBookFromScroll();
  });


  /* =======================================================
     INITIAL STATE
  ======================================================= */

  updateVideoFromScroll();
  updateBookFromScroll();

  console.log("ALVOXIS book initialized.");

}
