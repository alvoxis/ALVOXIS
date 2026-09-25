
const experience = document.querySelector("#experience");

const videoScene = document.querySelector("#videoScene");
const titleVideo = document.querySelector("#titleVideo");

const openingContent = document.querySelector("#openingContent");
const distanceContent = document.querySelector("#distanceContent");
const selectionCover = document.querySelector("#selectionCover");

const scrollIndicator = document.querySelector("#scrollIndicator");
const scrollProgress = document.querySelector("#scrollProgress");
const progressValue = document.querySelector("#progressValue");

let animationFrame = null;
let videoReady = false;
let isUpdatingVideo = false;


/* =========================================
   VIDEO INITIALIZATION
========================================= */

if (titleVideo) {
  titleVideo.muted = true;
  titleVideo.volume = 0;

  /*
    Полностью запрещаем автоматическое
    воспроизведение.
  */

  titleVideo.autoplay = false;
  titleVideo.removeAttribute("autoplay");

  titleVideo.pause();

  /*
    Если браузер или старый код пытается
    запустить видео, немедленно останавливаем.
  */

  titleVideo.addEventListener("play", () => {
    if (!isUpdatingVideo) {
      titleVideo.pause();
    }
  });

  titleVideo.addEventListener("loadedmetadata", () => {
    videoReady = true;

    titleVideo.pause();

    try {
      titleVideo.currentTime = 0;
    } catch (error) {
      console.warn(
        "Could not reset video:",
        error
      );
    }

    updateExperience();
  });

  titleVideo.addEventListener("loadeddata", () => {
    videoReady = true;
    titleVideo.pause();

    updateExperience();
  });

  titleVideo.addEventListener("canplay", () => {
    videoReady = true;
    titleVideo.pause();

    updateExperience();
  });

  titleVideo.addEventListener("error", () => {
    console.error(
      "ALVOXIS video could not be loaded:",
      titleVideo.error
    );
  });
}


/* =========================================
   HELPER FUNCTIONS
========================================= */

function clamp(value, minimum, maximum) {
  return Math.min(
    Math.max(value, minimum),
    maximum
  );
}


function easeInOut(value) {
  const progress = clamp(value, 0, 1);

  return progress < 0.5
    ? 2 * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 2) / 2;
}


function getProgress(value, start, end) {
  if (end <= start) {
    return value >= end ? 1 : 0;
  }

  return clamp(
    (value - start) / (end - start),
    0,
    1
  );
}


/* =========================================
   SCROLL VIDEO
========================================= */

function updateScrollVideo(progress) {
  if (!titleVideo || !videoReady) {
    return;
  }

  const duration = titleVideo.duration;

  if (!Number.isFinite(duration) || duration <= 0) {
    return;
  }

  /*
    VIDEO PLAYBACK

    0%–85%:
    Видео проигрывается скроллом.

    Оно не уменьшается и не исчезает
    в течение этого периода.
  */

  const playbackProgress = easeInOut(
    getProgress(progress, 0, 0.85)
  );

  const targetTime =
    playbackProgress * duration;

  const difference = Math.abs(
    titleVideo.currentTime - targetTime
  );

  /*
    Перематываем видео только вручную
    через currentTime.
  */

  if (difference > 0.01) {
    isUpdatingVideo = true;

    try {
      titleVideo.pause();
      titleVideo.currentTime = targetTime;
      titleVideo.pause();
    } catch (error) {
      console.warn(
        "Video seeking failed:",
        error
      );
    }

    isUpdatingVideo = false;
  }

  /*
    Дополнительная защита от автоматического
    запуска после перемотки.
  */

  titleVideo.pause();
}


/* =========================================
   MAIN ANIMATION
========================================= */

function updateExperience() {
  if (!experience) {
    return;
  }

  const experienceRect =
    experience.getBoundingClientRect();

  const totalScrollDistance =
    experience.offsetHeight - window.innerHeight;

  if (totalScrollDistance <= 0) {
    return;
  }

  const rawProgress =
    -experienceRect.top / totalScrollDistance;

  const progress =
    clamp(rawProgress, 0, 1);


  /* -----------------------------------------
     1. SCROLL VIDEO
  ----------------------------------------- */

  updateScrollVideo(progress);


  /* -----------------------------------------
     2. VIDEO DISAPPEARANCE

     Последние 15% сцены —
     отдельный переход примерно
     на 2 секунды скролла.
  ----------------------------------------- */

  const disappearanceProgress = easeInOut(
    getProgress(progress, 0.85, 1)
  );

  const videoScale =
    1 - disappearanceProgress * 0.86;

  const videoY =
    disappearanceProgress * -8;

  const videoZ =
    disappearanceProgress * -1200;

  const videoOpacity =
    1 - disappearanceProgress;

  videoScene.style.transform = `
    translate3d(
      0,
      ${videoY}%,
      ${videoZ}px
    )
    scale(${videoScale})
  `;

  videoScene.style.opacity = videoOpacity;

  if (videoOpacity <= 0.005) {
    videoScene.style.visibility = "hidden";
  } else {
    videoScene.style.visibility = "visible";
  }


  /* -----------------------------------------
     3. OPENING TEXT
  ----------------------------------------- */

  const openingProgress = easeInOut(
    getProgress(progress, 0.08, 0.42)
  );

  const openingScale =
    1 - openingProgress * 0.22;

  const openingY =
    openingProgress * -45;

  const openingOpacity =
    1 - openingProgress;

  openingContent.style.transform = `
    translate(-50%, calc(-50% + ${openingY}px))
    scale(${openingScale})
  `;

  openingContent.style.opacity =
    openingOpacity;


  /* -----------------------------------------
     4. DISTANCE TEXT
  ----------------------------------------- */

  const textIn = easeInOut(
    getProgress(progress, 0.88, 0.96)
  );

  const textOut = easeInOut(
    getProgress(progress, 0.97, 1)
  );

  const textOpacity =
    textIn * (1 - textOut);

  const textScale =
    0.78 + textIn * 0.22 - textOut * 0.08;

  const textY =
    70 - textIn * 70 - textOut * 25;

  distanceContent.style.transform = `
    translate(-50%, calc(-50% + ${textY}px))
    scale(${textScale})
  `;

  distanceContent.style.opacity =
    textOpacity;


  /* -----------------------------------------
     5. SELECTION COVER
  ----------------------------------------- */

  const coverIn = easeInOut(
    getProgress(progress, 0.94, 1)
  );

  const coverScale =
    0.86 + coverIn * 0.14;

  const coverY =
    65 - coverIn * 65;

  selectionCover.style.transform = `
    translate(-50%, calc(-50% + ${coverY}px))
    scale(${coverScale})
  `;

  selectionCover.style.opacity =
    coverIn;


  /* -----------------------------------------
     6. SCROLL INDICATOR
  ----------------------------------------- */

  const indicatorOpacity =
    1 - easeInOut(
      getProgress(progress, 0.04, 0.2)
    );

  scrollIndicator.style.opacity =
    indicatorOpacity;


  /* -----------------------------------------
     7. PROGRESS
  ----------------------------------------- */

  scrollProgress.style.opacity =
    0.35 + progress * 0.65;

  let sceneNumber = 1;

  if (progress >= 0.42) {
    sceneNumber = 2;
  }

  if (progress >= 0.85) {
    sceneNumber = 3;
  }

  if (progress >= 0.95) {
    sceneNumber = 4;
  }

  progressValue.textContent =
    String(sceneNumber).padStart(2, "0");
}


/* =========================================
   OPTIMIZED SCROLL
========================================= */

function requestExperienceUpdate() {
  if (animationFrame !== null) {
    return;
  }

  animationFrame = requestAnimationFrame(() => {
    updateExperience();

    animationFrame = null;
  });
}


/* =========================================
   EVENTS
========================================= */

window.addEventListener(
  "scroll",
  requestExperienceUpdate,
  {
    passive: true
  }
);

window.addEventListener(
  "resize",
  requestExperienceUpdate
);

window.addEventListener(
  "orientationchange",
  requestExperienceUpdate
);

document.addEventListener(
  "visibilitychange",
  () => {
    if (document.hidden && titleVideo) {
      titleVideo.pause();
    }
  }
);


/* =========================================
   INITIAL UPDATE
========================================= */

updateExperience();
