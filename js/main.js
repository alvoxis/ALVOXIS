
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
let videoMetadataReady = false;


/* =========================================
   VIDEO INITIALIZATION
========================================= */

if (titleVideo) {
  titleVideo.muted = true;
  titleVideo.volume = 0;

  // Видео не запускается автоматически.
  // Его временем управляет положение скролла.
  titleVideo.pause();

  titleVideo.addEventListener("loadedmetadata", () => {
    videoMetadataReady = true;
    updateExperience();
  });

  titleVideo.addEventListener("canplay", () => {
    videoMetadataReady = true;
    updateExperience();
  });
}


/* =========================================
   HELPER FUNCTIONS
========================================= */

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}


function easeInOut(value) {
  const clampedValue = clamp(value, 0, 1);

  return clampedValue < 0.5
    ? 2 * clampedValue * clampedValue
    : 1 - Math.pow(-2 * clampedValue + 2, 2) / 2;
}


function getProgress(value, start, end) {
  if (end <= start) {
    return value >= end ? 1 : 0;
  }

  return clamp((value - start) / (end - start), 0, 1);
}


/* =========================================
   SCROLL-DRIVEN VIDEO
========================================= */

function updateScrollVideo(progress) {
  if (!titleVideo || !videoMetadataReady) {
    return;
  }

  if (!Number.isFinite(titleVideo.duration)) {
    return;
  }

  if (titleVideo.duration <= 0) {
    return;
  }

  /*
    Видео проигрывается в первой части сцены.

    Скролл вниз:
    currentTime увеличивается.

    Скролл вверх:
    currentTime уменьшается.

    При остановке скролла:
    видео остаётся на текущем кадре.
  */

  const videoPlaybackProgress = easeInOut(
    getProgress(progress, 0, 0.34)
  );

  const targetTime =
    videoPlaybackProgress * titleVideo.duration;

  const currentTimeDifference =
    Math.abs(titleVideo.currentTime - targetTime);

  if (currentTimeDifference > 0.016) {
    try {
      titleVideo.currentTime = targetTime;
    } catch (error) {
      console.warn("Video time update failed:", error);
    }
  }

  // Не даём видео автоматически проигрываться.
  titleVideo.pause();
}


/* =========================================
   MAIN EXPERIENCE ANIMATION
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
     1. VIDEO PLAYBACK
  ----------------------------------------- */

  updateScrollVideo(progress);


  /* -----------------------------------------
     2. VIDEO MOVEMENT AND DISAPPEARANCE
  ----------------------------------------- */

  const videoProgress =
    easeInOut(getProgress(progress, 0, 0.34));

  const videoScale =
    1 - videoProgress * 0.72;

  const videoY =
    videoProgress * -7;

  const videoZ =
    videoProgress * -480;

  /*
    Видео начинает полностью исчезать
    ближе к окончанию своей сцены.
  */

  const videoOpacity =
    1 - easeInOut(
      getProgress(progress, 0.16, 0.34)
    );

  videoScene.style.transform = `
    translate3d(0, ${videoY}%, ${videoZ}px)
    scale(${videoScale})
  `;

  videoScene.style.opacity = videoOpacity;

  /*
    После исчезновения видео полностью
    скрываем его визуальный слой.
  */

  if (videoOpacity <= 0.01) {
    videoScene.style.visibility = "hidden";
  } else {
    videoScene.style.visibility = "visible";
  }


  /* -----------------------------------------
     3. OPENING TEXT
  ----------------------------------------- */

  const openingProgress =
    easeInOut(getProgress(progress, 0.04, 0.27));

  const openingScale =
    1 - openingProgress * 0.22;

  const openingY =
    openingProgress * -40;

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

  const textIn =
    easeInOut(getProgress(progress, 0.22, 0.52));

  const textOut =
    easeInOut(getProgress(progress, 0.65, 0.86));

  const textOpacity =
    textIn * (1 - textOut);

  const textScale =
    0.72 + textIn * 0.28 - textOut * 0.12;

  const textY =
    60 - textIn * 60 - textOut * 35;

  distanceContent.style.transform = `
    translate(-50%, calc(-50% + ${textY}px))
    scale(${textScale})
  `;

  distanceContent.style.opacity =
    textOpacity;


  /* -----------------------------------------
     5. SELECTION COVER
  ----------------------------------------- */

  /*
    Обложка появляется после основного текста.

    Позже здесь можно будет подключить
    горизонтальный свайп между Mini и Classic.
  */

  const coverIn =
    easeInOut(getProgress(progress, 0.68, 0.88));

  const coverOut =
    easeInOut(getProgress(progress, 0.92, 1));

  const coverOpacity =
    coverIn * (1 - coverOut);

  const coverScale =
    0.82 + coverIn * 0.18 - coverOut * 0.08;

  const coverY =
    70 - coverIn * 70 - coverOut * 20;

  selectionCover.style.transform = `
    translate(-50%, calc(-50% + ${coverY}px))
    scale(${coverScale})
  `;

  selectionCover.style.opacity =
    coverOpacity;


  /* -----------------------------------------
     6. SCROLL INDICATOR
  ----------------------------------------- */

  const indicatorOpacity =
    1 - easeInOut(
      getProgress(progress, 0.02, 0.18)
    );

  scrollIndicator.style.opacity =
    indicatorOpacity;


  /* -----------------------------------------
     7. PROGRESS INDICATOR
  ----------------------------------------- */

  scrollProgress.style.opacity =
    0.35 + progress * 0.65;

  let sceneNumber = 1;

  if (progress >= 0.25) {
    sceneNumber = 2;
  }

  if (progress >= 0.62) {
    sceneNumber = 3;
  }

  if (progress >= 0.86) {
    sceneNumber = 4;
  }

  progressValue.textContent =
    String(sceneNumber).padStart(2, "0");
}


/* =========================================
   OPTIMIZED SCROLL UPDATE
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
   EVENT LISTENERS
========================================= */

window.addEventListener(
  "scroll",
  requestExperienceUpdate,
  { passive: true }
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
