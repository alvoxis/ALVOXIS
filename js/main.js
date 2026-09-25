
document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  console.log("ALVOXIS website initialized");

  /* ========================================
     VIDEO EXPERIENCE
     ======================================== */

  const video = document.getElementById("heroVideo");
  const videoSection = document.getElementById("experience");
  const videoContent = document.getElementById("videoContent");
  const videoProgress = document.querySelector(".video-progress");
  const videoProgressBar = document.getElementById("videoProgressBar");
  const videoCounter = document.getElementById("videoCounter");

  let videoReady = false;
  let videoDuration = 0;
  let lastVideoTime = -1;
  let videoFrameRequested = false;

  if (video && videoSection) {
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    const prepareVideo = () => {
      if (
        !video.duration ||
        !Number.isFinite(video.duration)
      ) {
        return;
      }

      videoDuration = video.duration;
      videoReady = true;

      video.pause();

      console.log(
        "ALVOXIS video ready:",
        videoDuration,
        "seconds"
      );
    };

    video.addEventListener("loadedmetadata", prepareVideo);
    video.addEventListener("loadeddata", prepareVideo);
    video.addEventListener("canplay", prepareVideo);

    video.addEventListener("error", () => {
      console.error(
        "ALVOXIS video error:",
        video.error
      );
    });

    const updateVideo = () => {
      if (!videoReady || !videoDuration) {
        return;
      }

      const sectionTop = videoSection.offsetTop;
      const sectionHeight = videoSection.offsetHeight;
      const viewportHeight = window.innerHeight;

      const scrollPosition =
        window.scrollY - sectionTop;

      const scrollDistance = Math.max(
        sectionHeight - viewportHeight,
        1
      );

      let progress =
        scrollPosition / scrollDistance;

      progress = Math.max(
        0,
        Math.min(1, progress)
      );

      /*
      Управление кадром видео через прокрутку.
      */

      const videoProgressValue = Math.min(
        progress / 0.85,
        1
      );

      const targetTime =
        videoProgressValue *
        Math.max(videoDuration - 0.05, 0);

      if (
        Math.abs(targetTime - lastVideoTime) > 0.015 &&
        video.readyState >= 1
      ) {
        try {
          video.currentTime = targetTime;
          lastVideoTime = targetTime;
        } catch (error) {
          console.warn(
            "Video seek error:",
            error
          );
        }
      }

      /*
      Исчезновение видео в конце секции.
      */

      const fadeStart = 0.78;

      const fadeProgress =
        Math.max(0, progress - fadeStart) /
        Math.max(1 - fadeStart, 0.01);

      const fadeValue = Math.min(
        fadeProgress,
        1
      );

      video.style.opacity = String(
        1 - fadeValue * 0.95
      );

      video.style.transform =
        `scale(${1 + fadeValue * 0.08}) translateY(${-fadeValue * 4}%)`;

      /*
      Исчезновение текста.
      */

      if (videoContent) {
        const textOpacity = Math.max(
          0,
          1 - progress * 3.5
        );

        videoContent.style.opacity =
          String(textOpacity);

        videoContent.style.transform =
          `translateY(${Math.min(progress * 35, 35)}px)`;
      }

      /*
      Индикатор прогресса.
      */

      if (videoProgressBar) {
        videoProgressBar.style.width =
          `${Math.round(progress * 100)}%`;
      }

      if (videoProgress) {
        videoProgress.style.setProperty(
          "--video-progress",
          `${progress * 100}%`
        );
      }

      if (videoCounter) {
        videoCounter.textContent =
          `${String(Math.round(progress * 100)).padStart(2, "0")} / 100`;
      }
    };

    const requestVideoUpdate = () => {
      if (videoFrameRequested) {
        return;
      }

      videoFrameRequested = true;

      window.requestAnimationFrame(() => {
        updateVideo();
        videoFrameRequested = false;
      });
    };

    video.load();

    window.addEventListener(
      "scroll",
      requestVideoUpdate,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      requestVideoUpdate
    );

    setTimeout(requestVideoUpdate, 300);
  }

  /* ========================================
     COLLECTION — FULLSCREEN CARDS
     ======================================== */

  const stage = document.getElementById(
    "interactiveStage"
  );

  if (!stage) {
    console.error(
      "ALVOXIS error: interactiveStage not found"
    );

    return;
  }

  /*
  Находим карточки по текущему HTML-классу.
  */

  const cards = Array.from(
    stage.querySelectorAll(".interactive-card")
  );

  if (!cards.length) {
    console.error(
      "ALVOXIS error: no interactive cards found"
    );

    return;
  }

  /*
  Добавляем product-card автоматически,
  чтобы CSS-анимации также применялись.
  */

  cards.forEach((card) => {
    card.classList.add("product-card");
  });

  /*
  Находим настоящие ID из index.html.
  */

  const previousButton = document.getElementById(
    "previousCard"
  );

  const nextButton = document.getElementById(
    "nextCard"
  );

  const dotsContainer = document.getElementById(
    "collectionDots"
  );

  const dots = dotsContainer
    ? Array.from(dotsContainer.children)
    : [];

  const counter = document.getElementById(
    "collectionCounter"
  );

  let activeIndex = 0;
  let isTransitioning = false;

  const totalCards = cards.length;
  const transitionDuration = 850;

  /*
  ========================================
  CARD STATE
  ========================================
  */

  const clearCardClasses = (card) => {
    card.classList.remove(
      "is-active",
      "is-before",
      "is-after",
      "is-exiting-left",
      "is-exiting-right"
    );
  };

  const setCardState = (
    card,
    state,
    zIndex
  ) => {
    clearCardClasses(card);

    card.classList.add(state);
    card.style.zIndex = String(zIndex);
  };

  /*
  Начальное состояние всех карточек.
  */

  const renderCards = () => {
    cards.forEach((card, index) => {
      if (index === activeIndex) {
        setCardState(card, "is-active", 20);
      } else if (index < activeIndex) {
        setCardState(card, "is-before", 2);
      } else {
        setCardState(card, "is-after", 3);
      }
    });

    updateIndicators();
  };

  /*
  ========================================
  INDICATORS
  ========================================
  */

  const updateIndicators = () => {
    if (counter) {
      counter.textContent =
        `${String(activeIndex + 1).padStart(2, "0")} / ${String(totalCards).padStart(2, "0")}`;
    }

    dots.forEach((dot, index) => {
      dot.classList.toggle(
        "active",
        index === activeIndex
      );

      dot.classList.toggle(
        "is-active",
        index === activeIndex
      );

      dot.setAttribute(
        "aria-current",
        index === activeIndex
          ? "true"
          : "false"
      );
    });

    if (previousButton) {
      previousButton.disabled =
        activeIndex === 0;
    }

    if (nextButton) {
      nextButton.disabled =
        activeIndex === totalCards - 1;
    }
  };

  /*
  ========================================
  CARD TRANSITION
  ========================================
  */

  const changeCard = (direction) => {
    if (isTransitioning) {
      return;
    }

    const nextIndex = activeIndex + direction;

    if (
      nextIndex < 0 ||
      nextIndex >= totalCards
    ) {
      return;
    }

    const currentCard = cards[activeIndex];
    const nextCard = cards[nextIndex];

    if (!currentCard || !nextCard) {
      return;
    }

    isTransitioning = true;

    /*
    Подготавливаем следующую карточку.
    */

    clearCardClasses(nextCard);

    nextCard.classList.add(
      direction > 0
        ? "is-after"
        : "is-before"
    );

    nextCard.style.zIndex = "15";

    /*
    Текущая карточка уменьшается
    и исчезает в сторону.
    */

    clearCardClasses(currentCard);

    currentCard.classList.add(
      direction > 0
        ? "is-exiting-left"
        : "is-exiting-right"
    );

    currentCard.style.zIndex = "30";

    /*
    Обновляем активный индекс.
    */

    activeIndex = nextIndex;
    updateIndicators();

    /*
    Следующая карточка появляется
    из глубины экрана.
    */

    window.setTimeout(() => {
      clearCardClasses(nextCard);
      nextCard.classList.add("is-active");
      nextCard.style.zIndex = "20";
    }, 100);

    /*
    Завершение перехода.
    */

    window.setTimeout(() => {
      cards.forEach((card, index) => {
        if (index === activeIndex) {
          setCardState(card, "is-active", 20);
        } else if (index < activeIndex) {
          setCardState(card, "is-before", 2);
        } else {
          setCardState(card, "is-after", 3);
        }
      });

      isTransitioning = false;

      console.log(
        "ALVOXIS active card:",
        activeIndex + 1
      );
    }, transitionDuration);
  };

  /*
  ========================================
  ARROW BUTTONS
  ========================================
  */

  if (previousButton) {
    previousButton.addEventListener("click", (event) => {
      event.preventDefault();
      changeCard(-1);
    });

    console.log("Previous arrow connected");
  } else {
    console.error(
      "Previous arrow not found: #previousCard"
    );
  }

  if (nextButton) {
    nextButton.addEventListener("click", (event) => {
      event.preventDefault();
      changeCard(1);
    });

    console.log("Next arrow connected");
  } else {
    console.error(
      "Next arrow not found: #nextCard"
    );
  }

  /*
  ========================================
  DOT NAVIGATION
  ========================================
  */

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      if (
        isTransitioning ||
        index === activeIndex
      ) {
        return;
      }

      const direction =
        index > activeIndex ? 1 : -1;

      const steps = Math.abs(
        index - activeIndex
      );

      if (steps === 1) {
        changeCard(direction);
      }
    });
  });

  /*
  ========================================
  TOUCH SWIPE
  ========================================
  */

  let touchStartX = 0;
  let touchStartY = 0;
  let isTouching = false;

  stage.addEventListener(
    "touchstart",
    (event) => {
      if (!event.changedTouches.length) {
        return;
      }

      const touch = event.changedTouches[0];

      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      isTouching = true;
    },
    { passive: true }
  );

  stage.addEventListener(
    "touchend",
    (event) => {
      if (
        !isTouching ||
        !event.changedTouches.length
      ) {
        return;
      }

      isTouching = false;

      const touch = event.changedTouches[0];

      const deltaX =
        touch.clientX - touchStartX;

      const deltaY =
        touch.clientY - touchStartY;

      const minimumDistance = 40;

      /*
      Не реагируем на вертикальную прокрутку.
      */

      if (
        Math.abs(deltaX) < minimumDistance ||
        Math.abs(deltaX) <= Math.abs(deltaY)
      ) {
        return;
      }

      console.log(
        "ALVOXIS swipe:",
        deltaX < 0 ? "left" : "right"
      );

      if (deltaX < 0) {
        changeCard(1);
      } else {
        changeCard(-1);
      }
    },
    { passive: true }
  );

  /*
  ========================================
  MOUSE / TRACKPAD DRAG
  ========================================
  */

  let pointerStartX = 0;
  let pointerStartY = 0;
  let pointerActive = false;

  stage.addEventListener(
    "pointerdown",
    (event) => {
      if (event.pointerType !== "mouse") {
        return;
      }

      pointerStartX = event.clientX;
      pointerStartY = event.clientY;
      pointerActive = true;
    }
  );

  stage.addEventListener(
    "pointerup",
    (event) => {
      if (!pointerActive) {
        return;
      }

      pointerActive = false;

      const deltaX =
        event.clientX - pointerStartX;

      const deltaY =
        event.clientY - pointerStartY;

      if (
        Math.abs(deltaX) < 50 ||
        Math.abs(deltaX) <= Math.abs(deltaY)
      ) {
        return;
      }

      if (deltaX < 0) {
        changeCard(1);
      } else {
        changeCard(-1);
      }
    }
  );

  stage.addEventListener(
    "pointercancel",
    () => {
      pointerActive = false;
    }
  );

  /*
  ========================================
  KEYBOARD CONTROLS
  ========================================
  */

  document.addEventListener("keydown", (event) => {
    const tagName =
      document.activeElement?.tagName;

    if (
      tagName === "INPUT" ||
      tagName === "TEXTAREA" ||
      tagName === "BUTTON"
    ) {
      return;
    }

    if (event.key === "ArrowRight") {
      changeCard(1);
    }

    if (event.key === "ArrowLeft") {
      changeCard(-1);
    }
  });

  /*
  ========================================
  PRODUCT BUTTONS
  ========================================
  */

  const productButtons =
    document.querySelectorAll(
      "[data-product]"
    );

  productButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();

      const product =
        button.getAttribute("data-product");

      console.log(
        "Selected ALVOXIS product:",
        product
      );
    });
  });

  /*
  ========================================
  INITIALIZATION
  ========================================
  */

  renderCards();

  console.log(
    "ALVOXIS cards initialized:",
    totalCards
  );
});
