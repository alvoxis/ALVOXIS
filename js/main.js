/* =========================================================
   ALVOXIS — CINEMATIC VIDEO + FULLSCREEN BOOK
   ========================================================= */

export function initHomeExperience() {

  /* =======================================================
     ELEMENTS
  ======================================================= */

  const videoSection = document.querySelector(".video-experience");
  const heroVideo = document.getElementById("heroVideo");
  const videoContent = document.getElementById("videoContent");
  const videoOverlay = document.querySelector(".video-overlay");
  const videoCoverReveal = document.getElementById("videoCoverReveal");
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
  let bookRevealed = false;

  let currentPage = 0;
  let isAnimating = false;
  let lastWheelTime = 0;
  let wheelAccumulator = 0;

  const PAGE_COUNT = pages.length;
  const TURN_DURATION = window.matchMedia("(max-width: 700px)").matches ? 850 : 1000;


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
     VIDEO SCROLL PROGRESS + CINEMATIC REVEAL

     The last portion of the video's scroll range is
     reserved for a single continuous "camera move":
     the video shrinks and fades into the distance while
     the ALVOXIS cover grows out of the depth to replace
     it, at full screen size, on the same sticky scene.
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

    /*
      The final 22% of this section's scroll is the
      cinematic hand-off to the book.
    */

    const revealStart = 0.78;

    const videoPlaybackProgress = clamp(progress / revealStart, 0, 1);
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

    /*
      Text gradually disappears well before the reveal.
    */

    const textFade = clamp((progress - 0.45) / 0.2, 0, 1);

    if (videoContent) {
      videoContent.style.opacity = String(1 - textFade);
      videoContent.style.transform = `translate3d(0, ${textFade * -35}px, 0)`;
    }

    /*
      The cinematic reveal itself.
    */

    const revealProgress = clamp((progress - revealStart) / (1 - revealStart), 0, 1);
    const revealEase = easeInOutCubic(revealProgress);

    /* Video recedes into the distance. */

    const videoScale = 1 - revealEase * 0.22;
    const videoOpacity = 1 - revealEase;
    const videoBlur = revealEase * 10;

    heroVideo.style.transform = `scale(${videoScale})`;
    heroVideo.style.opacity = String(videoOpacity);
    heroVideo.style.filter = `blur(${videoBlur}px)`;

    if (videoOverlay) {
      videoOverlay.style.opacity = String(1 - revealEase * 0.6);
    }

    /* Cover approaches from far away. */

    if (videoCoverReveal) {

      const coverScale = 0.55 + revealEase * 0.45;
      const coverBlur = (1 - revealEase) * 14;

      videoCoverReveal.style.opacity = String(revealEase);
      videoCoverReveal.style.transform = `scale(${coverScale})`;
      videoCoverReveal.style.filter = `blur(${coverBlur}px)`;
    }

    /*
      Once the reveal completes, hand off to the real
      sticky book section seamlessly.
    */

    if (revealProgress >= 0.99) {

      if (!bookRevealed) {
        bookRevealed = true;
        bookScene.classList.add("is-visible");
      }

    } else if (bookRevealed) {

      bookRevealed = false;
      bookScene.classList.remove("is-visible");
    }

    if (videoCounter) {
      const percent = Math.round(progress * 100);
      videoCounter.textContent = `${String(percent).padStart(2, "0")} / 100`;
    }
  }


  /* =======================================================
     PAGE VISUAL STATE
  ======================================================= */

  function updatePageVisuals() {

    pages.forEach((page, index) => {

      page.classList.remove("page-current", "page-previous", "page-next");

      if (index === currentPage) {
        page.classList.add("page-current");
      } else if (index < currentPage) {
        page.classList.add("page-previous");
      } else {
        page.classList.add("page-next");
      }
    });

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
     PAGE TURN

     The turning leaf is given an explicit inline rotation
     so the browser can animate a real intermediate value
     (0 -> -180 or -180 -> 0) via the page's own CSS
     transition, instead of jumping between two classes.
  ======================================================= */

  function turnPage(direction) {

    if (isAnimating) {
      return;
    }

    if (direction === 1 && currentPage >= PAGE_COUNT - 1) {
      return;
    }

    if (direction === -1 && currentPage <= 0) {
      return;
    }

    isAnimating = true;

    const previousPage = currentPage;
    const nextPage = clamp(currentPage + direction, 0, PAGE_COUNT - 1);
    const turningPage = direction === 1 ? pages[previousPage] : pages[nextPage];

    currentPage = nextPage;

    turningPage.classList.add("is-turning");

    /* Force the starting transform before animating. */

    turningPage.style.transition = "none";
    turningPage.style.transform = direction === 1 ? "rotateY(0deg)" : "rotateY(-180deg)";

    // eslint-disable-next-line no-unused-expressions
    turningPage.offsetHeight;

    turningPage.style.transition = "";
    turningPage.style.transform = direction === 1 ? "rotateY(-180deg)" : "rotateY(0deg)";

    updatePageVisuals();

    setTimeout(() => {

      turningPage.classList.remove("is-turning");
      turningPage.style.transition = "";
      turningPage.style.transform = "";

      isAnimating = false;

    }, TURN_DURATION + 40);
  }


  /* =======================================================
     ARROW CONTROLS
  ======================================================= */

  if (nextButton) {
    nextButton.addEventListener("click", () => turnPage(1));
  }

  if (previousButton) {
    previousButton.addEventListener("click", () => turnPage(-1));
  }


  /* =======================================================
     DOT CONTROLS
  ======================================================= */

  dots.forEach((dot, index) => {

    dot.addEventListener("click", () => {

      if (index === currentPage || isAnimating) {
        return;
      }

      const target = index;
      const direction = target > currentPage ? 1 : -1;

      turnPage(direction);

      if (Math.abs(target - currentPage) > 0) {

        const interval = setInterval(() => {

          if (currentPage === target || isAnimating === false && currentPage === target) {
            clearInterval(interval);
            return;
          }

          if (!isAnimating) {
            turnPage(target > currentPage ? 1 : -1);
          }

          if (currentPage === target) {
            clearInterval(interval);
          }

        }, TURN_DURATION + 80);
      }
    });
  });


  /* =======================================================
     MOUSE WHEEL
  ======================================================= */

  window.addEventListener(
    "wheel",
    (event) => {

      if (Math.abs(event.deltaY) < 8) {
        return;
      }

      const now = Date.now();

      if (now - lastWheelTime < TURN_DURATION - 100) {
        return;
      }

      const rect = collectionSection.getBoundingClientRect();
      const visible = rect.top < window.innerHeight && rect.bottom > 0;

      if (!visible) {
        return;
      }

      if (event.deltaY > 0 && currentPage >= PAGE_COUNT - 1) {
        return;
      }

      if (event.deltaY < 0 && currentPage <= 0) {
        return;
      }

      event.preventDefault();

      wheelAccumulator += event.deltaY;

      if (Math.abs(wheelAccumulator) < 35) {
        return;
      }

      const direction = wheelAccumulator > 0 ? 1 : -1;

      wheelAccumulator = 0;
      lastWheelTime = now;

      turnPage(direction);
    },
    { passive: false }
  );


  /* =======================================================
     TOUCH / SWIPE
  ======================================================= */

  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;

  bookScene.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = Date.now();
    },
    { passive: true }
  );

  bookScene.addEventListener(
    "touchend",
    (event) => {

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      const duration = Date.now() - touchStartTime;

      if (Math.abs(deltaX) < 45) return;
      if (Math.abs(deltaX) < Math.abs(deltaY)) return;
      if (duration > 1000) return;

      if (deltaX < 0) {
        turnPage(1);
      } else {
        turnPage(-1);
      }
    },
    { passive: true }
  );


  /* =======================================================
     KEYBOARD
  ======================================================= */

  document.addEventListener("keydown", (event) => {

    if (event.key === "ArrowRight") {
      turnPage(1);
    }

    if (event.key === "ArrowLeft") {
      turnPage(-1);
    }
  });


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
      ticking = false;
    });
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", () => updateVideoFromScroll());


  /* =======================================================
     INITIAL STATE
  ======================================================= */

  pages.forEach((page) => {
    page.classList.remove("page-current", "page-previous", "page-next", "is-turning");
  });

  updatePageVisuals();

  updateVideoFromScroll();

  console.log("ALVOXIS book initialized.");

}
