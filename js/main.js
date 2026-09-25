
document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  /*
  ========================================
  ALVOXIS — VIDEO EXPERIENCE
  ========================================
  */

  const video = document.getElementById("heroVideo");
  const videoSection = document.querySelector(".video-experience");
  const openingContent = document.querySelector(".opening-content");
  const videoProgress = document.querySelector(".video-progress");

  let videoReady = false;
  let videoDuration = 0;
  let lastVideoTime = -1;

  if (video) {
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.preload = "auto";

    /*
    Загружаем видео вручную.
    Это помогает на iPhone и Safari.
    */
    video.load();

    const prepareVideo = () => {
      if (!video.duration || !Number.isFinite(video.duration)) {
        return;
      }

      videoDuration = video.duration;
      videoReady = true;

      video.pause();
      video.currentTime = 0;

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

    /*
    Прокрутка видео.
    Видео не запускается автоматически.
    Текущий кадр зависит от положения страницы.
    */
    const updateVideoByScroll = () => {
      if (!videoReady || !videoSection || !videoDuration) {
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

      /*
      Видео проигрывается примерно до 85% секции.
      Оставшееся пространство используется
      для красивого исчезновения сцены.
      */
      const videoProgressValue = Math.min(progress / 0.85, 1);

      const targetTime =
        videoProgressValue * Math.max(videoDuration - 0.05, 0);

      /*
      Не выполняем лишние seek-операции.
      Это уменьшает мерцание на iPhone.
      */
      if (Math.abs(targetTime - lastVideoTime) > 0.015) {
        try {
          video.currentTime = targetTime;
          lastVideoTime = targetTime;
        } catch (error) {
          console.warn("Video seek error:", error);
        }
      }

      /*
      Плавное исчезновение видео в конце.
      */
      const fadeStart = 0.78;
      const fadeProgress =
        Math.max(0, progress - fadeStart) /
        Math.max(1 - fadeStart, 0.01);

      const opacity = 1 - Math.min(fadeProgress, 1) * 0.95;
      const scale = 1 + Math.min(fadeProgress, 1) * 0.08;
      const translateY = Math.min(fadeProgress, 1) * -4;

      video.style.opacity = String(opacity);
      video.style.transform =
        `scale(${scale}) translateY(${translateY}%)`;

      /*
      Исчезновение вступительного текста.
      */
      if (openingContent) {
        const textOpacity = Math.max(
          0,
          1 - progress * 3.5
        );

        const textTranslate =
          Math.min(progress * 35, 35);

        openingContent.style.opacity =
          String(textOpacity);

        openingContent.style.transform =
          `translateY(${textTranslate}px)`;
      }

      /*
      Индикатор прогресса, если он есть.
      */
      if (videoProgress) {
        videoProgress.style.width =
          `${Math.round(progress * 100)}%`;
      }
    };

    let scrollTicking = false;

    const requestVideoUpdate = () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(() => {
          updateVideoByScroll();
          scrollTicking = false;
        });

        scrollTicking = true;
      }
    };

    window.addEventListener("scroll", requestVideoUpdate, {
      passive: true
    });

    window.addEventListener("resize", requestVideoUpdate);

    /*
    Первичная инициализация.
    */
    setTimeout(() => {
      updateVideoByScroll();
    }, 300);
  }

  /*
  ========================================
  ALVOXIS — INTERACTIVE COLLECTION
  ========================================
  */

  const stage = document.getElementById("interactiveStage");

  if (!stage) {
    return;
  }

  const cards = Array.from(
    stage.querySelectorAll(".product-card")
  );

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

  /*
  Обновление положения карточек.
  */
  const renderCards = (direction = "next") => {
    cards.forEach((card, index) => {
      card.classList.remove(
        "is-active",
        "is-before",
        "is-after",
        "is-exiting-left",
        "is-exiting-right"
      );

      card.style.zIndex = String(
        totalCards - Math.abs(index - activeCardIndex)
      );

      if (index === activeCardIndex) {
        card.classList.add("is-active");
      } else if (index < activeCardIndex) {
        card.classList.add("is-before");
      } else {
        card.classList.add("is-after");
      }
    });

    if (counter) {
      counter.textContent =
        `${String(activeCardIndex + 1).padStart(2, "0")} / ${String(totalCards).padStart(2, "0")}`;
    }

    dots.forEach((dot, index) => {
      dot.classList.toggle(
        "is-active",
        index === activeCardIndex
      );

      dot.setAttribute(
        "aria-current",
        index === activeCardIndex
          ? "true"
          : "false"
      );
    });
  };

  /*
  Переключение карточки.
  */
  const changeCard = (direction) => {
    if (isTransitioning) {
      return;
    }

    const nextIndex = activeCardIndex + direction;

    if (nextIndex < 0 || nextIndex >= totalCards) {
      return;
    }

    isTransitioning = true;

    const currentCard = cards[activeCardIndex];

    if (currentCard) {
      currentCard.classList.add(
        direction > 0
          ? "is-exiting-left"
          : "is-exiting-right"
      );
    }

    activeCardIndex = nextIndex;

    renderCards(
      direction > 0 ? "next" : "previous"
    );

    window.setTimeout(() => {
      isTransitioning = false;
    }, 650);
  };

  /*
  Кнопки навигации.
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
  Точки навигации.
  */
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      if (index === activeCardIndex) {
        return;
      }

      const direction =
        index > activeCardIndex ? 1 : -1;

      if (isTransitioning) {
        return;
      }

      isTransitioning = true;

      activeCardIndex = index;
      renderCards(
        direction > 0 ? "next" : "previous"
      );

      window.setTimeout(() => {
        isTransitioning = false;
      }, 650);
    });
  });

  /*
  Свайп на телефоне.
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

      const minimumSwipeDistance = 45;

      /*
      Реагируем только на горизонтальный свайп.
      Вертикальная прокрутка страницы не блокируется.
      */
      if (
        Math.abs(deltaX) < minimumSwipeDistance ||
        Math.abs(deltaX) < Math.abs(deltaY)
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
  Перетаскивание мышью на компьютере.
  */
  let pointerStartX = 0;
  let pointerStartY = 0;
  let pointerActive = false;

  stage.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse") {
      pointerStartX = event.clientX;
      pointerStartY = event.clientY;
      pointerActive = true;
    }
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
      Math.abs(deltaX) < Math.abs(deltaY)
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
  Горизонтальное колесо мыши/трекпада.
  */
  let wheelLocked = false;

  stage.addEventListener(
    "wheel",
    (event) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
        return;
      }

      if (wheelLocked) {
        return;
      }

      wheelLocked = true;

      if (event.deltaX > 0) {
        changeCard(1);
      } else {
        changeCard(-1);
      }

      window.setTimeout(() => {
        wheelLocked = false;
      }, 700);
    },
    { passive: true }
  );

  /*
  Управление стрелками клавиатуры.
  */
  document.addEventListener("keydown", (event) => {
    const tagName = document.activeElement?.tagName;

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
  Кнопки товаров.
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
  Начальное состояние карточек.
  */
  renderCards("next");

  console.log("ALVOXIS interactive collection initialized.");
});
