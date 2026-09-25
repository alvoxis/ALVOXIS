
document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  /* ========================================
     ALVOXIS — VIDEO EXPERIENCE
     ======================================== */

  const video = document.getElementById("heroVideo");
  const videoSection = document.querySelector(".video-experience");
  const openingContent = document.querySelector(".opening-content");
  const videoProgress = document.querySelector(".video-progress");

  let videoReady = false;
  let videoDuration = 0;
  let lastVideoTime = -1;
  let videoScrollTicking = false;

  if (video && videoSection) {
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.preload = "auto";

    video.load();

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

      if (video.currentTime !== 0) {
        try {
          video.currentTime = 0;
        } catch (error) {
          console.warn("Initial video seek error:", error);
        }
      }

      console.log(
        "ALVOXIS video ready:",
        videoDuration.toFixed(2),
        "seconds"
      );
    };

    video.addEventListener("loadedmetadata", prepareVideo);
    video.addEventListener("loadeddata", prepareVideo);
    video.addEventListener("canplay", prepareVideo);

    video.addEventListener("error", () => {
      console.error("ALVOXIS video error:", video.error);
    });

    const updateVideoByScroll = () => {
      if (!videoReady || !videoDuration) {
        return;
      }

      const sectionTop = videoSection.offsetTop;
      const sectionHeight = videoSection.offsetHeight;
      const viewportHeight = window.innerHeight;

      const scrollPosition = window.scrollY - sectionTop;
      const scrollDistance = Math.max(
        sectionHeight - viewportHeight,
        1
      );

      let progress = scrollPosition / scrollDistance;
      progress = Math.max(0, Math.min(1, progress));

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
          console.warn("Video seek error:", error);
        }
      }

      const fadeStart = 0.78;

      const fadeProgress =
        Math.max(0, progress - fadeStart) /
        Math.max(1 - fadeStart, 0.01);

      const fadeValue = Math.min(fadeProgress, 1);

      video.style.opacity = String(1 - fadeValue * 0.95);

      video.style.transform =
        `scale(${1 + fadeValue * 0.08}) translateY(${-fadeValue * 4}%)`;

      if (openingContent) {
        const textOpacity = Math.max(
          0,
          1 - progress * 3.5
        );

        openingContent.style.opacity =
          String(textOpacity);

        openingContent.style.transform =
          `translateY(${Math.min(progress * 35, 35)}px)`;
      }

      if (videoProgress) {
        videoProgress.style.width =
          `${Math.round(progress * 100)}%`;
      }
    };

    const requestVideoUpdate = () => {
      if (videoScrollTicking) {
        return;
      }

      videoScrollTicking = true;

      window.requestAnimationFrame(() => {
        updateVideoByScroll();
        videoScrollTicking = false;
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

    setTimeout(updateVideoByScroll, 300);
  }

  /* ========================================
     ALVOXIS — FULLSCREEN CARD EXPERIENCE
     ======================================== */

  const stage = document.getElementById(
    "interactiveStage"
  );

  if (!stage) {
    console.warn(
      "ALVOXIS interactive stage not found."
    );

    return;
  }

  const cards = Array.from(
    stage.querySelectorAll(".product-card")
  );

  if (!cards.length) {
    console.warn(
      "ALVOXIS product cards not found."
    );

    return;
  }

  const previousButton = document.querySelector(
    "[data-direction='previous']"
  );

  const nextButton = document.querySelector(
    "[data-direction='next']"
  );

  const dots = Array.from(
    document.querySelectorAll(".collection-dot")
  );

  const counter = document.querySelector(
    ".collection-counter"
  );

  let activeCardIndex = 0;
  let isTransitioning = false;

  const totalCards = cards.length;
  const transitionDuration = 850;

  /*
  Устанавливаем начальное положение карточек.
  */

  const setCardState = (
    card,
    state,
    index
  ) => {
    card.classList.remove(
      "is-active",
      "is-before",
      "is-after",
      "is-exiting-left",
      "is-exiting-right"
    );

    card.style.zIndex = String(
      totalCards - Math.abs(index - activeCardIndex) + 5
    );

    if (state) {
      card.classList.add(state);
    }
  };

  /*
  Обновление индикаторов.
  */

  const updateIndicators = () => {
    if (counter) {
      counter.textContent =
        `${String(activeCardIndex + 1).padStart(2, "0")} / ${String(totalCards).padStart(2, "0")}`;
    }

    dots.forEach((dot, index) => {
      const isActive = index === activeCardIndex;

      dot.classList.toggle(
        "is-active",
        isActive
      );

      dot.setAttribute(
        "aria-current",
        isActive ? "true" : "false"
      );
    });

    if (previousButton) {
      previousButton.disabled =
        activeCardIndex === 0;
    }

    if (nextButton) {
      nextButton.disabled =
        activeCardIndex === totalCards - 1;
    }
  };

  /*
  Начальное расположение карточек.
  */

  const initializeCards = () => {
    cards.forEach((card, index) => {
      if (index === activeCardIndex) {
        setCardState(card, "is-active", index);
      } else if (index < activeCardIndex) {
        setCardState(card, "is-before", index);
      } else {
        setCardState(card, "is-after", index);
      }
    });

    updateIndicators();
  };

  /*
  Переход между карточками.

  Важно:
  Сначала запускаем исчезновение
  текущей карточки.
  Затем после короткой задержки
  показываем следующую.
  */

  const changeCard = (direction) => {
    if (isTransitioning) {
      return;
    }

    const nextIndex = activeCardIndex + direction;

    if (
      nextIndex < 0 ||
      nextIndex >= totalCards
    ) {
      return;
    }

    const currentIndex = activeCardIndex;
    const currentCard = cards[currentIndex];
    const nextCard = cards[nextIndex];

    if (!currentCard || !nextCard) {
      return;
    }

    isTransitioning = true;

    /*
    Подготавливаем следующую карточку
    в глубине сцены.
    */

    nextCard.classList.remove(
      "is-active",
      "is-before",
      "is-after",
      "is-exiting-left",
      "is-exiting-right"
    );

    nextCard.classList.add(
      direction > 0
        ? "is-after"
        : "is-before"
    );

    nextCard.style.zIndex = "15";

    /*
    Текущая карточка уменьшается
    и уходит за пределы экрана.
    */

    currentCard.classList.remove(
      "is-active",
      "is-before",
      "is-after"
    );

    currentCard.classList.add(
      direction > 0
        ? "is-exiting-left"
        : "is-exiting-right"
    );

    currentCard.style.zIndex = "30";

    /*
    Меняем активный индекс.
    */

    activeCardIndex = nextIndex;
    updateIndicators();

    /*
    Небольшая задержка перед появлением
    следующего бокса.
    */

    window.setTimeout(() => {
      nextCard.classList.remove(
        "is-before",
        "is-after",
        "is-exiting-left",
        "is-exiting-right"
      );

      nextCard.classList.add("is-active");

      nextCard.style.zIndex = "20";
    }, 80);

    /*
    После завершения анимации
    очищаем старую карточку.
    */

    window.setTimeout(() => {
      cards.forEach((card, index) => {
        if (index === activeCardIndex) {
          card.classList.remove(
            "is-before",
            "is-after",
            "is-exiting-left",
            "is-exiting-right"
          );

          card.classList.add("is-active");
          card.style.zIndex = "20";
        } else if (index < activeCardIndex) {
          card.classList.remove(
            "is-active",
            "is-after",
            "is-exiting-left",
            "is-exiting-right"
          );

          card.classList.add("is-before");
          card.style.zIndex = "2";
        } else {
          card.classList.remove(
            "is-active",
            "is-before",
            "is-exiting-left",
            "is-exiting-right"
          );

          card.classList.add("is-after");
          card.style.zIndex = "3";
        }
      });

      isTransitioning = false;
    }, transitionDuration);
  };

  /*
  Кнопки.
  */

  if (previousButton) {
    previousButton.addEventListener("click", () => {
      changeCard(-1);
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      changeCard(1);
    });
  }

  /*
  Точки.
  */

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      if (
        isTransitioning ||
        index === activeCardIndex ||
        index < 0 ||
        index >= totalCards
      ) {
        return;
      }

      const direction =
        index > activeCardIndex ? 1 : -1;

      const steps = Math.abs(
        index - activeCardIndex
      );

      /*
      Для точек переходим к выбранной карточке.
      */

      if (steps === 1) {
        changeCard(direction);
        return;
      }

      isTransitioning = true;

      const currentCard = cards[activeCardIndex];
      const targetCard = cards[index];

      if (currentCard) {
        currentCard.classList.remove("is-active");

        currentCard.classList.add(
          direction > 0
            ? "is-exiting-left"
            : "is-exiting-right"
        );
      }

      activeCardIndex = index;

      if (targetCard) {
        targetCard.classList.remove(
          "is-before",
          "is-after"
        );

        targetCard.classList.add("is-active");
      }

      updateIndicators();

      window.setTimeout(() => {
        initializeCards();
        isTransitioning = false;
      }, transitionDuration);
    });
  });

  /*
  ========================================
  TOUCH SWIPE
  ========================================
  */

  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  stage.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.changedTouches[0];

      touchStartX = touch.clientX;
      touchStartY = touch.clientY;

      touchEndX = touch.clientX;
      touchEndY = touch.clientY;
    },
    { passive: true }
  );

  stage.addEventListener(
    "touchmove",
    (event) => {
      const touch = event.changedTouches[0];

      touchEndX = touch.clientX;
      touchEndY = touch.clientY;
    },
    { passive: true }
  );

  stage.addEventListener(
    "touchend",
    () => {
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      const minimumDistance = 45;

      /*
      Обрабатываем только горизонтальный свайп.
      Вертикальная прокрутка страницы остаётся свободной.
      */

      if (
        Math.abs(deltaX) < minimumDistance ||
        Math.abs(deltaX) <= Math.abs(deltaY)
      ) {
        return;
      }

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
  POINTER SWIPE FOR DESKTOP
  ========================================
  */

  let pointerStartX = 0;
  let pointerStartY = 0;
  let pointerActive = false;

  stage.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse") {
      return;
    }

    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    pointerActive = true;
  });

  stage.addEventListener("pointerup", (event) => {
    if (!pointerActive) {
      return;
    }

    pointerActive = false;

    const deltaX = event.clientX - pointerStartX;
    const deltaY = event.clientY - pointerStartY;

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
  });

  stage.addEventListener("pointercancel", () => {
    pointerActive = false;
  });

  /*
  ========================================
  KEYBOARD NAVIGATION
  ========================================
  */

  document.addEventListener("keydown", (event) => {
    const activeElement = document.activeElement;
    const tagName = activeElement?.tagName;

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

  const productButtons = document.querySelectorAll(
    "[data-product]"
  );

  productButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const productName =
        button.getAttribute("data-product");

      console.log(
        "Selected ALVOXIS product:",
        productName
      );
    });
  });

  /*
  Инициализация.
  */

  initializeCards();

  console.log(
    "ALVOXIS fullscreen card experience initialized."
  );
});
