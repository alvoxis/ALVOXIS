
// =========================================
// ALVOXIS — COMPLETE SCROLL ENGINE
// =========================================

const experience = document.querySelector("#experience");
const videoScene = document.querySelector("#videoScene");
const titleVideo = document.querySelector("#titleVideo");
const openingContent = document.querySelector("#openingContent");
const distanceContent = document.querySelector("#distanceContent");
const scrollIndicator = document.querySelector("#scrollIndicator");
const scrollProgress = document.querySelector("#scrollProgress");
const progressValue = document.querySelector("#progressValue");

let animationFrame = null;


// =========================================
// VIDEO
// =========================================

if (titleVideo) {

  titleVideo.muted = true;
  titleVideo.volume = 0;

  const playVideo = () => {
    titleVideo.play().catch(() => {
      // Browser autoplay restrictions are ignored.
    });
  };

  if (titleVideo.readyState >= 2) {
    playVideo();
  } else {
    titleVideo.addEventListener("canplay", playVideo, {
      once: true
    });
  }

  document.addEventListener("visibilitychange", () => {

    if (document.hidden) {
      titleVideo.pause();
    } else {
      playVideo();
    }

  });

}


// =========================================
// HELPERS
// =========================================

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function easeInOut(value) {
  return value * value * (3 - 2 * value);
}

function getProgress(value, start, end) {
  return clamp(
    (value - start) / (end - start),
    0,
    1
  );
}


// =========================================
// MAIN SCROLL ANIMATION
// =========================================

function updateExperience() {

  if (!experience) {
    return;
  }

  const experienceRect = experience.getBoundingClientRect();

  const totalScrollDistance =
    experience.offsetHeight - window.innerHeight;

  if (totalScrollDistance <= 0) {
    return;
  }

  /*
    Progress is calculated from the whole scroll section.
    0 = beginning
    1 = end
  */

  const rawProgress =
    -experienceRect.top / totalScrollDistance;

  const progress = clamp(rawProgress, 0, 1);


  // =========================================
  // SCENE 1 — VIDEO MOVES INTO THE DISTANCE
  // =========================================

  const videoProgress = easeInOut(
    getProgress(progress, 0, 0.34)
  );

  const videoScale =
    1 - videoProgress * 0.72;

  const videoY =
    videoProgress * -7;

  const videoZ =
    videoProgress * -480;

  const videoOpacity =
    1 - videoProgress * 0.88;

  videoScene.style.transform =
    `translate3d(0, ${videoY}%, ${videoZ}px) scale(${videoScale})`;

  videoScene.style.opacity =
    videoOpacity;


  // =========================================
  // SCENE 1 — HERO TEXT DISAPPEARS
  // =========================================

  const openingProgress = easeInOut(
    getProgress(progress, 0.04, 0.27)
  );

  const openingScale =
    1 - openingProgress * 0.22;

  const openingY =
    openingProgress * -40;

  const openingOpacity =
    1 - openingProgress;

  openingContent.style.transform =
    `translate(-50%, calc(-50% + ${openingY}px)) scale(${openingScale})`;

  openingContent.style.opacity =
    openingOpacity;


  // =========================================
  // SCENE 2 — TEXT COMES FROM THE DISTANCE
  // =========================================

  const textIn = easeInOut(
    getProgress(progress, 0.22, 0.52)
  );

  const textOut = easeInOut(
    getProgress(progress, 0.65, 0.86)
  );

  const textOpacity =
    textIn * (1 - textOut);

  const textScale =
    0.72 + textIn * 0.28 - textOut * 0.12;

  const textY =
    60 - textIn * 60 - textOut * 35;

  distanceContent.style.transform =
    `translate(-50%, calc(-50% + ${textY}px)) scale(${textScale})`;

  distanceContent.style.opacity =
    textOpacity;


  // =========================================
  // SCROLL INDICATORS
  // =========================================

  const indicatorOpacity =
    1 - easeInOut(
      getProgress(progress, 0.02, 0.18)
    );

  scrollIndicator.style.opacity =
    indicatorOpacity;

  scrollProgress.style.opacity =
    0.35 + progress * 0.65;


  // =========================================
  // SCENE NUMBER
  // =========================================

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


// =========================================
// PERFORMANCE-FRIENDLY SCROLL
// =========================================

function requestExperienceUpdate() {

  if (animationFrame !== null) {
    return;
  }

  animationFrame = requestAnimationFrame(() => {

    updateExperience();

    animationFrame = null;

  });

}


// =========================================
// EVENT LISTENERS
// =========================================

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


// =========================================
// INITIALIZATION
// =========================================

updateExperience();
