
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


/* =========================================
   VIDEO INITIALIZATION
========================================= */

if (titleVideo) {
  titleVideo.muted = true;
  titleVideo.volume = 0;

  // Видео не запускается само.
  // Им управляет положение страницы.
  titleVideo.pause();

  titleVideo.addEventListener("loadedmetadata", () => {
    videoReady = true;

    try {
      titleVideo.currentTime = 0;
    } catch (error) {
      console.warn(
        "Could not set initial video time:",
        error
      );
    }

    updateExperience();
  });

  titleVideo.addEventListener("loadeddata", () => {
    videoReady = true;

    updateExperience();
  });

  titleVideo.addEventListener("canplay", () => {
    videoReady = true;

    updateExperience();
  });

  titleVideo.addEventListener("error", () => {
    console.error(
      "ALVOXIS video could not be loaded.",
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
   SCROLL-CONTROLLED VIDEO
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
    VIDEO PLAYBACK PHASE

    0.00–0.55:
    Видео проигрывается полностью
    под управлением скролла.

    В этой фазе видео остаётся
    большим и полностью видимым.
  */

  const playbackProgress = easeInOut(
    getProgress(progress, 0, 0.55)
  );

  const targetTime =
    playbackProgress * duration;

  const difference = Math.abs(
    titleVideo.currentTime - targetTime
  );

  if (difference > 0.016) {
    try {
      titleVideo.currentTime = targetTime;
    } catch (error) {
      console.warn(
        "Could not update video playback:",
        error
      );
    }
  }

  // Запрещаем самостоятельное воспроизведение.
  titleVideo.pause();
}


/* =========================================
   MAIN EXPERIENCE
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
     2. VIDEO DEPTH EXIT
  ----------------------------------------- */

  /*
    До 55% видео не уменьшается.

    С 55% до 78%:
    видео уменьшается, уходит в глубину
    и полностью исчезает.
  */

  const disappearanceProgress = easeInOut(
    getProgress(progress, 0.55, 0.78)
  );

  const videoScale =
    1 - disappearanceProgress * 0.84;

  const videoY =
    disappearanceProgress * -8;

  const videoZ =
    disappearanceProgress * -1100;

  const videoOpacity =
    1 - easeInOut(
      getProgress(progress, 0.64, 0.78)
    );

  videoScene.style.transform = `
    translate3d(
      0,
      ${videoY}%,
      ${videoZ}px
    )
    scale(${videoScale})
  `;

  videoScene.style.opacity = videoOpacity;

  /*
    Скрываем видео только после
    полного исчезновения.
  */

  if (videoOpacity <= 0.005) {
    videoScene.style.visibility = "hidden";
  } else {
    videoScene.style.visibility = "visible";
  }


  /* -----------------------------------------
     3. OPENING TEXT
  ----------------------------------------- */

  /*
    Начальный текст исчезает
    во время первой части скролла.
  */

  const openingProgress = easeInOut(
    getProgress(progress, 0.08, 0.38)
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

  /*
    Новый текст появляется
    после исчезновения видео.
  */

  const textIn = easeInOut(
    getProgress(progress, 0.75, 0.89)
  );

  const textOut = easeInOut(
    getProgress(progress, 0.91, 1)
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

  /*
    Обложка выбора подарка появляется
    после основного текста.
  */

  const coverIn = easeInOut(
    getProgress(progress, 0.86, 0.97)
  );

  const coverOut = easeInOut(
    getProgress(progress, 0.98, 1)
  );

  const coverOpacity =
    coverIn * (1 - coverOut);

  const coverScale =
    0.84 + coverIn * 0.16 - coverOut * 0.05;

  const coverY =
    65 - coverIn * 65 - coverOut * 20;

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
      getProgress(progress, 0.04, 0.2)
    );

  scrollIndicator.style.opacity =
    indicatorOpacity;


  /* -----------------------------------------
     7. PROGRESS INDICATOR
  ----------------------------------------- */

  scrollProgress.style.opacity =
    0.35 + progress * 0.65;

  let sceneNumber = 1;

  if (progress >= 0.38) {
    sceneNumber = 2;
  }

  if (progress >= 0.78) {
    sceneNumber = 3;
  }

  if (progress >= 0.91) {
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
