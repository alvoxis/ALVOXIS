
document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  /* ========================================
     HELPERS
  ======================================== */

  const clamp = (value, min = 0, max = 1) => {
    return Math.min(Math.max(value, min), max);
  };

  const lerp = (start, end, amount) => {
    return start + (end - start) * amount;
  };

  const easeOutCubic = (value) => {
    return 1 - Math.pow(1 - clamp(value), 3);
  };

  const easeInOut = (value) => {
    const x = clamp(value);
    return x < 0.5
      ? 4 * x * x * x
      : 1 - Math.pow(-2 * x + 2, 3) / 2;
  };


  /* ========================================
     VIDEO SCROLL EXPERIENCE
  ======================================== */

  const videoSection = document.querySelector("#experience");
  const video = document.querySelector("#heroVideo");
  const videoContent = document.querySelector("#videoContent");
  const videoProgressBar = document.querySelector("#videoProgressBar");
  const videoCounter = document.querySelector("#videoCounter");

  let videoDuration = 0;
  let videoReady = false;
  let lastVideoTime = -1;
  let animationFrame = null;

  if (videoSection && video) {

    video.muted = true;
    video.volume = 0;
    video.autoplay = false;
    video.loop = false;
    video.controls = false;
    video.playsInline = true;

    video.removeAttribute("autoplay");
    video.pause();

    const prepareVideo = () => {
      if (
        Number.isFinite(video.duration) &&
        video.duration > 0
      ) {
        videoDuration = video.duration;
        videoReady = true;
      }
    };

    video.addEventListener("loadedmetadata", prepareVideo);
    video.addEventListener("loadeddata", prepareVideo);
    video.addEventListener("canplay", prepareVideo);

    video.addEventListener("error", () => {
      console.warn(
        "ALVOXIS: Video could not be loaded.",
        video.error
      );
    });


    const getSectionProgress = () => {
      const rect = videoSection.getBoundingClientRect();
      const scrollableDistance =
        videoSection.offsetHeight - window.innerHeight;

      if (scrollableDistance <= 0) {
        return 0;
      }

      return clamp(-rect.top / scrollableDistance);
    };


    const updateVideo = () => {

      if (!videoReady || !videoDuration) {
        return;
      }

      const progress = getSectionProgress();

      /*
        Video plays through the first 76% of the
        scrolling experience.
      */

      const videoProgress = clamp(progress / 0.76);

      const easedProgress = easeInOut(videoProgress);

      const targetTime = clamp(
        easedProgress * (videoDuration - 0.05),
        0,
        videoDuration - 0.05
      );

      /*
        Update currentTime only when the difference
        is large enough to avoid excessive seeking.
      */

      if (Math.abs(targetTime - lastVideoTime) > 0.025) {

        try {
          video.currentTime = targetTime;
          lastVideoTime = targetTime;
        } catch (error) {
          console.warn(
            "ALVOXIS: Video seeking error.",
            error
          );
        }

      }


      /*
        Video moves into the depth and disappears
        during the final part of the section.
      */

      const exitProgress = clamp(
        (progress - 0.76) / 0.24
      );

      const exitEased = easeInOut(exitProgress);

      const videoScale = lerp(1, 0.12, exitEased);
      const videoTranslateY = lerp(0, -10, exitEased);
      const videoTranslateZ = lerp(0, -650, exitEased);
      const videoOpacity = lerp(1, 0, exitEased);

      video.style.transform = `
        translate3d(0, ${videoTranslateY}%, ${videoTranslateZ}px)
        scale(${videoScale})
      `;

      video.style.opacity = videoOpacity.toFixed(3);


      /*
        Fade out the opening text.
      */

      if (videoContent) {

        const textProgress = clamp(progress / 0.27);
        const textEased = easeOutCubic(textProgress);

        videoContent.style.opacity = (
          1 - textEased
        ).toFixed(3);

        videoContent.style.transform = `
          translate3d(0, ${-35 * textEased}px, 0)
        `;

      }


      /*
        Update progress bar and counter.
      */

      if (videoProgressBar) {
        videoProgressBar.style.width = `${progress * 100}%`;
      }

      if (videoCounter) {

        let counterText = "01 / 03";

        if (progress > 0.33 && progress <= 0.66) {
          counterText = "02 / 03";
        }

        if (progress > 0.66) {
          counterText = "03 / 03";
        }

        videoCounter.textContent = counterText;

      }

    };


    const requestVideoUpdate = () => {

      if (animationFrame) {
        return;
      }

      animationFrame = requestAnimationFrame(() => {
        animationFrame = null;
        updateVideo();
      });

    };


    window.addEventListener(
      "scroll",
      requestVideoUpdate,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      requestVideoUpdate
    );

    video.addEventListener(
      "loadedmetadata",
      requestVideoUpdate
    );

    requestVideoUpdate();

  }


  /* ========================================
     INTERACTIVE HORIZONTAL CARDS
  ======================================== */

  const collectionSection = document.querySelector(
    "#collection"
  );

  const stage = document.querySelector(
    "#interactiveStage"
  );

  const cards = Array.from(
    document.querySelectorAll(".interactive-card")
  );

  const previousButton = document.querySelector(
    "#previousCard"
  );

  const nextButton = document.querySelector(
    "#nextCard"
  );

  const collectionCounter = document.querySelector(
    "#collectionCounter"
  );

  const collectionDots = Array.from(
    document.querySelectorAll("#collectionDots span")
  );

  let activeCardIndex = 0;
  let isCardAnimating = false;

  let touchStartX = 0;
  let touchStartY = 0;
  let touchCurrentX = 0;

  let pointerStartX = 0;
  let pointerStartY = 0;
  let pointerIsDown = false;

  let wheelLocked = false;


  if (
    collectionSection &&
    stage &&
    cards.length > 0
  ) {


    /*
      Apply the visual position of each card.
    */

    const renderCards = (
      direction = "next",
      immediate = false
    ) => {

      cards.forEach((card, index) => {

        card.classList.remove(
          "is-active",
          "is-before",
          "is-after",
          "is-exiting-left",
          "is-exiting-right"
        );

        if (index === activeCardIndex) {

          card.classList.add("is-active");

          if (immediate) {
            card.style.transition = "none";
          } else {
            card.style.transition = "";
          }

        } else if (index < activeCardIndex) {

          card.classList.add("is-before");

        } else {

          card.classList.add("is-after");

        }

      });


      /*
        Update counter.
      */

      if (collectionCounter) {

        const currentNumber = String(
          activeCardIndex + 1
        ).padStart(2, "0");

        const totalNumber = String(
          cards.length
        ).padStart(2, "0");

        collectionCounter.textContent =
          `${currentNumber} / ${totalNumber}`;

      }


      /*
        Update dots.
      */

      collectionDots.forEach((dot, index) => {
        dot.classList.toggle(
          "active",
          index === activeCardIndex
        );
      });


      /*
        Update arrow states.
      */

      if (previousButton) {
        previousButton.disabled = activeCardIndex === 0;
      }

      if (nextButton) {
        nextButton.disabled =
          activeCardIndex === cards.length - 1;
      }

    };


    /*
      Change active card.
    */

    const changeCard = (newIndex, direction = "next") => {

      if (isCardAnimating) {
        return;
      }

      const boundedIndex = Math.max(
        0,
        Math.min(cards.length - 1, newIndex)
      );

      if (boundedIndex === activeCardIndex) {
        return;
      }

      isCardAnimating = true;

      const previousIndex = activeCardIndex;

      const previousCard = cards[previousIndex];
      const nextCardElement = cards[boundedIndex];

      if (previousCard) {

        previousCard.classList.remove(
          "is-active",
          "is-before",
          "is-after"
        );

        previousCard.classList.add(
          direction === "next"
            ? "is-exiting-left"
            : "is-exiting-right"
        );

      }

      activeCardIndex = boundedIndex;

      if (nextCardElement) {

        nextCardElement.classList.remove(
          "is-before",
          "is-after"
        );

        nextCardElement.classList.add("is-active");

      }

      if (collectionCounter) {

        const currentNumber = String(
          activeCardIndex + 1
        ).padStart(2, "0");

        const totalNumber = String(
          cards.length
        ).padStart(2, "0");

        collectionCounter.textContent =
          `${currentNumber} / ${totalNumber}`;

      }

      collectionDots.forEach((dot, index) => {
        dot.classList.toggle(
          "active",
          index === activeCardIndex
        );
      });

      if (previousButton) {
        previousButton.disabled = activeCardIndex === 0;
      }

      if (nextButton) {
        nextButton.disabled =
          activeCardIndex === cards.length - 1;
      }


      window.setTimeout(() => {

        renderCards(direction);

        window.setTimeout(() => {
          isCardAnimating = false;
        }, 100);

      }, 700);

    };


    /*
      Buttons.
    */

    if (previousButton) {

      previousButton.addEventListener("click", () => {
        changeCard(activeCardIndex - 1, "previous");
      });

    }

    if (nextButton) {

      nextButton.addEventListener("click", () => {
        changeCard(activeCardIndex + 1, "next");
      });

    }


    /*
      Touch swipe on mobile.
    */

    stage.addEventListener(
      "touchstart",
      (event) => {

        if (!event.touches || !event.touches[0]) {
          return;
        }

        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
        touchCurrentX = touchStartX;

      },
      { passive: true }
    );


    stage.addEventListener(
      "touchmove",
      (event) => {

        if (!event.touches || !event.touches[0]) {
          return;
        }

        touchCurrentX = event.touches[0].clientX;

      },
      { passive: true }
    );


    stage.addEventListener(
      "touchend",
      () => {

        const horizontalDistance =
          touchCurrentX - touchStartX;

        const verticalDistance =
          Math.abs(touchStartY - touchStartY);

        const swipeThreshold = 55;

        if (
          Math.abs(horizontalDistance) <
          swipeThreshold
        ) {
          return;
        }

        if (horizontalDistance < 0) {

          changeCard(
            activeCardIndex + 1,
            "next"
          );

        } else {

          changeCard(
            activeCardIndex - 1,
            "previous"
          );

        }

      },
      { passive: true }
    );


    /*
      Mouse drag support for desktop.
    */

    stage.addEventListener(
      "pointerdown",
      (event) => {

        if (event.pointerType === "touch") {
          return;
        }

        pointerIsDown = true;
        pointerStartX = event.clientX;
        pointerStartY = event.clientY;

        stage.setPointerCapture?.(event.pointerId);

      }
    );


    stage.addEventListener(
      "pointerup",
      (event) => {

        if (!pointerIsDown) {
          return;
        }

        pointerIsDown = false;

        const distanceX =
          event.clientX - pointerStartX;

        const distanceY =
          event.clientY - pointerStartY;

        const threshold = 55;

        if (
          Math.abs(distanceX) < threshold ||
          Math.abs(distanceX) < Math.abs(distanceY)
        ) {
          return;
        }

        if (distanceX < 0) {

          changeCard(
            activeCardIndex + 1,
            "next"
          );

        } else {

          changeCard(
            activeCardIndex - 1,
            "previous"
          );

        }

      }
    );


    stage.addEventListener(
      "pointercancel",
      () => {
        pointerIsDown = false;
      }
    );


    /*
      Mouse wheel horizontal navigation.

      Vertical scrolling is not blocked permanently.
      A horizontal gesture can change the card.
    */

    stage.addEventListener(
      "wheel",
      (event) => {

        if (wheelLocked) {
          return;
        }

        const horizontalIntent =
          Math.abs(event.deltaX) > Math.abs(event.deltaY);

        if (!horizontalIntent) {
          return;
        }

        if (Math.abs(event.deltaX) < 20) {
          return;
        }

        wheelLocked = true;

        if (event.deltaX > 0) {

          changeCard(
            activeCardIndex + 1,
            "next"
          );

        } else {

          changeCard(
            activeCardIndex - 1,
            "previous"
          );

        }

        window.setTimeout(() => {
          wheelLocked = false;
        }, 850);

      },
      { passive: true }
    );


    /*
      Keyboard support.
    */

    document.addEventListener("keydown", (event) => {

      const activeElement = document.activeElement;

      const isTyping =
        activeElement &&
        (
          activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA"
        );

      if (isTyping) {
        return;
      }

      if (event.key === "ArrowRight") {

        changeCard(
          activeCardIndex + 1,
          "next"
        );

      }

      if (event.key === "ArrowLeft") {

        changeCard(
          activeCardIndex - 1,
          "previous"
        );

      }

    });


    /*
      Product buttons.
    */

    const productButtons = document.querySelectorAll(
      ".product-action"
    );

    productButtons.forEach((button) => {

      button.addEventListener("click", (event) => {

        event.stopPropagation();

        const product = button.dataset.product;

        console.log(
          "ALVOXIS product selected:",
          product
        );

      });

    });


    /*
      Initial state.
    */

    renderCards("next", true);

  }

});
