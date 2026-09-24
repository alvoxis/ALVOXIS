
// =========================================
// ALVOXIS — CINEMATIC SCROLL ANIMATION
// =========================================

const experience = document.querySelector("#experience");
const videoScene = document.querySelector("#videoScene");
const titleVideo = document.querySelector("#titleVideo");
const openingContent = document.querySelector("#openingContent");
const distanceContent = document.querySelector("#distanceContent");
const scrollIndicator = document.querySelector("#scrollIndicator");
const scrollProgress = document.querySelector(".scroll-progress");
const progressValue = document.querySelector("#progressValue");

let animationFrame = null;


// =========================================
// VIDEO SETTINGS
// =========================================

if (titleVideo) {
  titleVideo.muted = true;
  titleVideo.volume = 0;

  const playVideo = () => {
    titleVideo.play().catch(() => {
      // Autoplay may be restricted by the browser.
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

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function easeInOut(value) {
  return value * value * (3 - 2 * value);
}

function rangeProgress(value, start, end) {
  return clamp((value - start) / (end - start), 0, 1);
}


// =========================================
// SCROLL ANIMATION
// =========================================

function updateExperience() {
  if (!experience) {
    return;
  }

  const experienceTop = experience.getBoundingClientRect().top;
  const scrollDistance = experience.offsetHeight - window.innerHeight;

  if (scrollDistance <= 0) {
    return;
  }

  const rawProgress = -experienceTop / scrollDistance;
  const progress = clamp(rawProgress, 0, 1);


  // -----------------------------------------
  // 1. VIDEO MOVES INTO THE DISTANCE
  // -----------------------------------------

  const videoProgress = easeInOut(
    rangeProgress(progress, 0, 0.34)
  );

  const videoScale = 1 - videoProgress * 0.72;
  const videoY = videoProgress * -7;
  const videoZ = videoProgress * -480;
  const videoOpacity = 1 - videoProgress * 0.88;

  videoScene.style.transform =
    `translate3d(0, ${videoY}%, ${videoZ}px) scale(${videoScale})`;

  videoScene.style.opacity = videoOpacity;


  // -----------------------------------------
  // 2. OPENING TEXT FADES AWAY
  // -----------------------------------------

  const openingOut = easeInOut(
    rangeProgress(progress, 0.04, 0.27)
  );

  const openingScale = 1 - openingOut * 0.22;
  const openingY = openingOut * -40;
  const openingOpacity = 1 - openingOut;

  openingContent.style.transform =
    `translate(-50%, calc(-50% + ${openingY}px)) scale(${openingScale})`;

  openingContent.style.opacity = openingOpacity;


  // -----------------------------------------
  // 3. DISTANCE TEXT APPEARS
  // -----------------------------------------

  const textIn = easeInOut(
    rangeProgress(progress, 0.22, 0.52)
  );

  const textOut = easeInOut(
    rangeProgress(progress, 0.65, 0.86)
  );

  const textOpacity = textIn * (1 - textOut);
  const textScale = 0.72 + textIn * 0.28 - textOut * 0.12;
  const textY = 60 - textIn * 60 - textOut * 35;

  distanceContent.style.transform =
    `translate(-50%, calc(-50% + ${textY}px)) scale(${textScale})`;

  distanceContent.style.opacity = textOpacity;


  // -----------------------------------------
  // 4. SCROLL INDICATORS
  // -----------------------------------------

  const indicatorOpacity = 1 - easeInOut(
    rangeProgress(progress, 0.02, 0.18)
  );

  scrollIndicator.style.opacity = indicatorOpacity;

  scrollProgress.style.opacity = 0.35 + progress * 0.65;


  // -----------------------------------------
  // 5. PROGRESS NUMBER
  // -----------------------------------------

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

  progressValue.textContent = String(sceneNumber).padStart(2, "0");
}


// =========================================
// OPTIMIZED SCROLL LISTENER
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

window.addEventListener("scroll", requestExperienceUpdate, {
  passive: true
});

window.addEventListener("resize", requestExperienceUpdate);

window.addEventListener("orientationchange", requestExperienceUpdate);


// INITIAL UPDATE
updateExperience();
