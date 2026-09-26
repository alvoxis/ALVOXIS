/* =========================================================
   ALVOXIS — CINEMATIC VIDEO + 3D BOOK
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =======================================================
     ELEMENTS
  ======================================================= */

  const videoSection =
    document.querySelector(".video-experience");

  const videoScene =
    document.querySelector(".video-scene");

  const heroVideo =
    document.getElementById("heroVideo");

  const videoContent =
    document.getElementById("videoContent");

  const videoOverlay =
    document.querySelector(".video-overlay");

  const videoTransition =
    document.getElementById("videoTransition");

  const videoProgressBar =
    document.getElementById("videoProgressBar");

  const videoCounter =
    document.getElementById("videoCounter");


  const collectionSection =
    document.getElementById("collection");

  const collectionSticky =
    document.querySelector(".collection-sticky");

  const bookScene =
    document.getElementById("bookScene");

  const book =
    document.getElementById("alvoxisBook");

  const bookCover =
    document.querySelector(".book-cover");

  const pages =
    Array.from(
      document.querySelectorAll(".book-page")
    );

  const previousButton =
    document.getElementById("previousCard");

  const nextButton =
    document.getElementById("nextCard");

  const dots =
    Array.from(
      document.querySelectorAll(
        "#collectionDots span"
      )
    );

  const counter =
    document.getElementById(
      "collectionCounter"
    );

  const scrollHint =
    document.querySelector(
      ".book-scroll-hint"
    );


  /* =======================================================
     SAFETY CHECK
  ======================================================= */

  if (
    !videoSection ||
    !heroVideo ||
    !collectionSection ||
    !book ||
    !pages.length
  ) {
    console.warn(
      "ALVOXIS: required elements are missing."
    );

    return;
  }


  /* =======================================================
     VIDEO STATE
  ======================================================= */

  let videoReady = false;

  let videoDuration = 0;

  let videoProgress = 0;

  let videoFinished = false;


  /* =======================================================
     BOOK STATE
  ======================================================= */

  let currentPage = 0;

  let isAnimating = false;

  let lastWheelTime = 0;

  let wheelAccumulator = 0;

  let touchStartX = 0;

  let touchStartY = 0;

  let touchStartTime = 0;


  const PAGE_COUNT =
    pages.length;


  /* =======================================================
     HELPERS
  ======================================================= */

  function clamp(
    value,
    min,
    max
  ) {
    return Math.min(
      Math.max(value, min),
      max
    );
  }


  function easeInOutCubic(t) {

    t = clamp(t, 0, 1);

    return t < 0.5
      ? 4 * t * t * t
      : 1 -
        Math.pow(
          -2 * t + 2,
          3
        ) / 2;
  }


  /* =======================================================
     VIDEO INITIALIZATION
  ======================================================= */

  function initializeVideo() {

    if (
      heroVideo.readyState >= 1 &&
      heroVideo.duration
    ) {

      videoReady = true;

      videoDuration =
        heroVideo.duration;

      return;
    }


    heroVideo.addEventListener(
      "loadedmetadata",
      () => {

        videoReady = true;

        videoDuration =
          heroVideo.duration;

      },
      {
        once: true
      }
    );


    heroVideo.addEventListener(
      "durationchange",
      () => {

        if (
          Number.isFinite(
            heroVideo.duration
          )
        ) {

          videoReady = true;

          videoDuration =
            heroVideo.duration;

        }

      }
    );


    heroVideo.load();
  }


  initializeVideo();


  /* =======================================================
     VIDEO SCROLL PROGRESS
  ======================================================= */

  function updateVideoFromScroll() {

    if (
      !videoReady ||
      !videoDuration
    ) {
      return;
    }


    const rect =
      videoSection.getBoundingClientRect();


    const scrollableDistance =
      videoSection.offsetHeight -
      window.innerHeight;


    if (
      scrollableDistance <= 0
    ) {
      return;
    }


    const passed =
      clamp(
        -rect.top,
        0,
        scrollableDistance
      );


    const progress =
      passed /
      scrollableDistance;


    videoProgress =
      progress;


    /*
      The final part of the video is reserved
      for the cinematic transition.
    */

    const cinematicStart = 0.84;

    const videoPlaybackProgress =
      clamp(
        progress /
        cinematicStart,
        0,
        1
      );


    const targetTime =
      videoPlaybackProgress *
      videoDuration;


    /*
      Avoid unnecessary currentTime writes.
    */

    if (
      Math.abs(
        heroVideo.currentTime -
        targetTime
      ) > 0.015
    ) {

      try {

        heroVideo.currentTime =
          targetTime;

      } catch (error) {

        console.warn(
          "ALVOXIS video seek error:",
          error
        );

      }

    }


    /*
      Progress bar.
    */

    if (videoProgressBar) {

      videoProgressBar.style.width =
        `${progress * 100}%`;

    }


    /*
      Text gradually disappears.
    */

    const textFade =
      clamp(
        (progress - 0.55) /
        0.22,
        0,
        1
      );


    if (videoContent) {

      videoContent.style.opacity =
        String(
          1 - textFade
        );

      videoContent.style.transform =
        `translate3d(0, ${textFade * -35}px, 0)`;

    }


    /*
      Cinematic transition.
    */

    const transitionProgress =
      clamp(
        (progress - cinematicStart) /
        (1 - cinematicStart),
        0,
        1
      );


    const transitionEase =
      easeInOutCubic(
        transitionProgress
      );


    if (videoTransition) {

      videoTransition.style.opacity =
        String(
          transitionEase
        );

      videoTransition.style.transform =
        `scale(${1.08 - transitionEase * 0.08})`;

    }


    /*
      Video itself slowly zooms and disappears.
    */

    const videoScale =
      1 +
      transitionEase * 0.035;


    const videoOpacity =
      1 -
      transitionEase;


    heroVideo.style.transform =
      `scale(${videoScale})`;

    heroVideo.style.opacity =
      String(videoOpacity);


    /*
      Slight blur at the very end.
    */

    const blur =
      transitionEase * 4;

    heroVideo.style.filter =
      `blur(${blur}px)`;


    /*
      Overlay gets darker.
    */

    if (videoOverlay) {

      videoOverlay.style.opacity =
        String(
          1 +
          transitionEase * 0.15
        );

    }


    /*
      Once the end is reached,
      the book becomes visible.
    */

    if (
      transitionProgress >= 0.98
    ) {

      if (!videoFinished) {

        videoFinished = true;

        enterBookScene();

      }

    } else {

      if (videoFinished) {

        videoFinished = false;

        exitBookScene();

      }

    }


    /*
      Counter.
    */

    if (videoCounter) {

      const percent =
        Math.round(
          progress * 100
        );

      videoCounter.textContent =
        `${String(percent).padStart(2, "0")} / 100`;

    }

  }


  /* =======================================================
     BOOK INTRO
  ======================================================= */

  function enterBookScene() {

    if (!bookScene) {
      return;
    }


    bookScene.classList.add(
      "is-visible"
    );


    /*
      Initial cinematic movement.
    */

    book.style.transition =
      "transform 1.5s cubic-bezier(0.22, 1, 0.36, 1)";


    book.style.transform =
      `
        translate3d(0, 0, -120px)
        rotateX(2deg)
        rotateY(0deg)
        scale(0.94)
      `;


    requestAnimationFrame(() => {

      requestAnimationFrame(() => {

        book.style.transform =
          `
            translate3d(0, 0, 0)
            rotateX(0deg)
            rotateY(0deg)
            scale(1)
          `;

      });

    });


    /*
      Remove transition after intro.
    */

    setTimeout(() => {

      book.style.transition =
        "";

    }, 1600);

  }


  function exitBookScene() {

    if (!bookScene) {
      return;
    }


    bookScene.classList.remove(
      "is-visible"
    );

  }


  /* =======================================================
     PAGE VISUAL STATE
  ======================================================= */

  function updatePageVisuals(
    immediate = false
  ) {

    pages.forEach(
      (page, index) => {

        page.classList.remove(
          "page-current",
          "page-previous",
          "page-next"
        );


        if (
          index === currentPage
        ) {

          page.classList.add(
            "page-current"
          );

        }


        if (
          index < currentPage
        ) {

          page.classList.add(
            "page-previous"
          );

        }


        if (
          index > currentPage
        ) {

          page.classList.add(
            "page-next"
          );

        }

      }
    );


    /*
      The CSS is responsible for the
      physical 3D page state.

      We additionally set a subtle
      book rotation for depth.
    */

    const bookRotation =
      (currentPage * -0.6);


    book.style.transform =
      `
        translate3d(0, 0, 0)
        rotateX(0deg)
        rotateY(${bookRotation}deg)
        scale(1)
      `;


    /*
      Dots.
    */

    dots.forEach(
      (dot, index) => {

        dot.classList.toggle(
          "active",
          index === currentPage
        );

      }
    );


    /*
      Counter.
    */

    if (counter) {

      counter.textContent =
        `${String(currentPage + 1).padStart(2, "0")} / ${String(PAGE_COUNT).padStart(2, "0")}`;

    }


    /*
      Hide scroll hint after first movement.
    */

    if (
      scrollHint
    ) {

      scrollHint.style.opacity =
        currentPage === 0
          ? "1"
          : "0";

    }


    /*
      Arrow state.
    */

    if (previousButton) {

      previousButton.disabled =
        currentPage === 0;

    }


    if (nextButton) {

      nextButton.disabled =
        currentPage ===
        PAGE_COUNT - 1;

    }

  }


  /* =======================================================
     PAGE TURN
  ======================================================= */

  function turnPage(
    direction
  ) {

    if (isAnimating) {
      return;
    }


    if (
      direction === 1 &&
      currentPage >= PAGE_COUNT - 1
    ) {

      return;

    }


    if (
      direction === -1 &&
      currentPage <= 0
    ) {

      return;

    }


    isAnimating = true;


    const previousPage =
      currentPage;


    const nextPage =
      clamp(
        currentPage + direction,
        0,
        PAGE_COUNT - 1
      );


    currentPage =
      nextPage;


    /*
      Determine which page turns.
    */

    const turningPage =
      direction === 1
        ? pages[previousPage]
        : pages[nextPage];


    /*
      Add animation classes.
    */

    if (direction === 1) {

      turningPage.classList.add(
        "turn-forward"
      );

    } else {

      turningPage.classList.add(
        "turn-backward"
      );

    }


    updatePageVisuals();


    /*
      Remove animation class after animation.
    */

    setTimeout(() => {

      turningPage.classList.remove(
        "turn-forward",
        "turn-backward"
      );


      isAnimating = false;

    }, 1000);

  }


  /* =======================================================
     ARROW CONTROLS
  ======================================================= */

  if (nextButton) {

    nextButton.addEventListener(
      "click",
      () => {

        turnPage(1);

      }
    );

  }


  if (previousButton) {

    previousButton.addEventListener(
      "click",
      () => {

        turnPage(-1);

      }
    );

  }


  /* =======================================================
     DOT CONTROLS
  ======================================================= */

  dots.forEach(
    (dot, index) => {

      dot.addEventListener(
        "click",
        () => {

          if (
            index === currentPage ||
            isAnimating
          ) {
            return;
          }


          const direction =
            index >
            currentPage
              ? 1
              : -1;


          turnPage(
            direction
          );


          /*
            If several pages need to be skipped,
            continue automatically.
          */

          if (
            Math.abs(
              index -
              currentPage
            ) > 1
          ) {

            const target =
              index;


            const interval =
              setInterval(() => {

                if (
                  currentPage ===
                  target
                ) {

                  clearInterval(
                    interval
                  );

                  return;

                }


                turnPage(
                  target >
                  currentPage
                    ? 1
                    : -1
                );

              }, 1050);

          }

        }
      );

    }
  );


  /* =======================================================
     MOUSE WHEEL
  ======================================================= */

  window.addEventListener(
    "wheel",
    (event) => {

      /*
        Ignore tiny trackpad noise.
      */

      if (
        Math.abs(event.deltaY) <
        8
      ) {
        return;
      }


      const now =
        Date.now();


      /*
        Prevent accidental rapid
        page turning.
      */

      if (
        now -
        lastWheelTime <
        850
      ) {

        return;

      }


      /*
        Only control the book while
        collection is in view.
      */

      const rect =
        collectionSection.getBoundingClientRect();


      const visible =
        rect.top <
        window.innerHeight &&
        rect.bottom >
        0;


      if (!visible) {
        return;
      }


      /*
        If we're at the beginning/end,
        allow normal page scrolling.
      */

      if (
        event.deltaY > 0 &&
        currentPage >=
        PAGE_COUNT - 1
      ) {

        return;

      }


      if (
        event.deltaY < 0 &&
        currentPage <= 0
      ) {

        return;

      }


      event.preventDefault();


      wheelAccumulator +=
        event.deltaY;


      if (
        Math.abs(
          wheelAccumulator
        ) <
        35
      ) {

        return;

      }


      const direction =
        wheelAccumulator > 0
          ? 1
          : -1;


      wheelAccumulator = 0;

      lastWheelTime =
        now;


      turnPage(
        direction
      );

    },
    {
      passive: false
    }
  );


  /* =======================================================
     TOUCH / SWIPE
  ======================================================= */

  bookScene.addEventListener(
    "touchstart",
    (event) => {

      const touch =
        event.changedTouches[0];


      touchStartX =
        touch.clientX;

      touchStartY =
        touch.clientY;

      touchStartTime =
        Date.now();

    },
    {
      passive: true
    }
  );


  bookScene.addEventListener(
    "touchend",
    (event) => {

      const touch =
        event.changedTouches[0];


      const deltaX =
        touch.clientX -
        touchStartX;


      const deltaY =
        touch.clientY -
        touchStartY;


      const duration =
        Date.now() -
        touchStartTime;


      /*
        Horizontal swipe only.
      */

      if (
        Math.abs(deltaX) <
        45
      ) {
        return;
      }


      if (
        Math.abs(deltaX) <
        Math.abs(deltaY)
      ) {
        return;
      }


      if (
        duration >
        1000
      ) {
        return;
      }


      if (
        deltaX < 0
      ) {

        turnPage(1);

      } else {

        turnPage(-1);

      }

    },
    {
      passive: true
    }
  );


  /* =======================================================
     POINTER DRAG
  ======================================================= */

  let pointerDown =
    false;

  let pointerStartX =
    0;


  bookScene.addEventListener(
    "pointerdown",
    (event) => {

      /*
        Don't interfere with buttons.
      */

      if (
        event.target.closest(
          "button"
        )
      ) {
        return;
      }


      pointerDown =
        true;

      pointerStartX =
        event.clientX;

    }
  );


  bookScene.addEventListener(
    "pointerup",
    (event) => {

      if (!pointerDown) {
        return;
      }


      pointerDown =
        false;


      const delta =
        event.clientX -
        pointerStartX;


      if (
        Math.abs(delta) <
        55
      ) {
        return;
      }


      if (
        delta < 0
      ) {

        turnPage(1);

      } else {

        turnPage(-1);

      }

    }
  );


  bookScene.addEventListener(
    "pointercancel",
    () => {

      pointerDown =
        false;

    }
  );


  /* =======================================================
     KEYBOARD
  ======================================================= */

  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key ===
        "ArrowRight"
      ) {

        turnPage(1);

      }


      if (
        event.key ===
        "ArrowLeft"
      ) {

        turnPage(-1);

      }

    }
  );


  /* =======================================================
     PRODUCT BUTTONS
  ======================================================= */

  document
    .querySelectorAll(
      ".product-action"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          (event) => {

            event.stopPropagation();


            const product =
              button.dataset.product;


            console.log(
              "ALVOXIS product:",
              product
            );


            /*
              Existing checkout/cart
              logic can be connected here.
            */

          }
        );

      }
    );


  /* =======================================================
     SCROLL LOOP
  ======================================================= */

  let ticking =
    false;


  function handleScroll() {

    if (ticking) {
      return;
    }


    ticking = true;


    requestAnimationFrame(
      () => {

        updateVideoFromScroll();

        ticking = false;

      }
    );

  }


  window.addEventListener(
    "scroll",
    handleScroll,
    {
      passive: true
    }
  );


  /* =======================================================
     RESIZE
  ======================================================= */

  window.addEventListener(
    "resize",
    () => {

      updateVideoFromScroll();

    }
  );


  /* =======================================================
     INITIAL STATE
  ======================================================= */

  pages.forEach(
    (page) => {

      page.classList.remove(
        "page-current",
        "page-previous",
        "page-next",
        "turn-forward",
        "turn-backward"
      );

    }
  );


  updatePageVisuals(
    true
  );


  /*
    Make the first page/book state visible.
  */

  if (bookScene) {

    bookScene.classList.add(
      "is-visible"
    );

  }


  /*
    Initial video update.
  */

  updateVideoFromScroll();


  console.log(
    "ALVOXIS 3D Book initialized."
  );

});