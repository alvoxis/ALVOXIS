
// =========================================
// ALVOXIS HERO CONTROLLER
// =========================================

"use strict";


// =========================================
// ELEMENTS
// =========================================

const hero = document.querySelector("#hero");
const siteHeader = document.querySelector("#siteHeader");

const videoScenes = Array.from(
  document.querySelectorAll(".video-scene")
);

const sceneVideos = Array.from(
  document.querySelectorAll(".scene-video")
);

const progressItems = Array.from(
  document.querySelectorAll(".progress-item")
);

const sceneCurrent = document.querySelector("#sceneCurrent");

const previousSceneButton =
  document.querySelector("#previousScene");

const nextSceneButton =
  document.querySelector("#nextScene");

const soundToggle =
  document.querySelector("#soundToggle");

const menuButton =
  document.querySelector("#menuButton");

const mobileMenu =
  document.querySelector("#mobileMenu");

const menuLinks =
  document.querySelectorAll("[data-menu-link]");

const heroEyebrow =
  document.querySelector("#heroEyebrow");

const heroTitle =
  document.querySelector("#heroTitle");

const heroDescription =
  document.querySelector("#heroDescription");

const heroButton =
  document.querySelector("#heroButton");


// =========================================
// SCENE CONTENT
// =========================================

const sceneContent = [
  {
    eyebrow: "ALVOXIS COLLECTION",

    title: "Some moments",
    highlight: "deserve to be remembered.",

    description:
      "Thoughtfully designed gifts made to preserve the moments that matter.",

    button: "Discover the collection"
  },

  {
    eyebrow: "THE ART OF GIVING",

    title: "A detail",

    highlight: "can hold a feeling.",

    description:
      "Carefully selected elements come together to create something personal.",

    button: "Explore the details"
  },

  {
    eyebrow: "MAKE IT PERSONAL",

    title: "Your memory",

    highlight: "becomes part of the gift.",

    description:
      "Create a meaningful present with a personal photograph and a message.",

    button: "Personalize your gift"
  },

  {
    eyebrow: "THE ALVOXIS EXPERIENCE",

    title: "Give a moment",

    highlight: "worth remembering.",

    description:
      "Discover the ALVOXIS collection and find a gift made for someone special.",

    button: "View the collection"
  }
];


// =========================================
// STATE
// =========================================

let currentScene = 0;

let isTransitioning = false;

let soundEnabled = false;

let touchStartY = 0;

let touchStartX = 0;

let wheelLocked = false;

const totalScenes = videoScenes.length;

const transitionDuration = 1100;

const minimumSwipeDistance = 45;


// =========================================
// HELPERS
// =========================================

function formatSceneNumber(number) {
  return String(number + 1).padStart(2, "0");
}


function updateSceneContent(index) {
  const content = sceneContent[index];

  if (!content) {
    return;
  }

  heroEyebrow.textContent = content.eyebrow;

  heroTitle.innerHTML = `
    ${content.title}
    <span>${content.highlight}</span>
  `;

  heroDescription.textContent =
    content.description;

  heroButton.innerHTML = `
    ${content.button}
    <span>↗</span>
  `;
}


function pauseAllVideos() {
  sceneVideos.forEach((video) => {
    video.pause();
  });
}


function resetVideo(video) {
  try {
    video.currentTime = 0;
  } catch (error) {
    console.warn("Unable to reset video:", error);
  }
}


function updateProgress(index) {
  progressItems.forEach((item, itemIndex) => {
    item.classList.toggle(
      "is-active",
      itemIndex === index
    );
  });

  sceneCurrent.textContent =
    formatSceneNumber(index);
}


function updateSoundState() {
  sceneVideos.forEach((video) => {
    video.muted = !soundEnabled;
  });

  soundToggle.textContent =
    soundEnabled ? "SOUND ON" : "SOUND OFF";

  soundToggle.setAttribute(
    "aria-label",
    soundEnabled ? "Disable sound" : "Enable sound"
  );
}


// =========================================
// VIDEO PLAYBACK
// =========================================

function playVideo(index) {
  const video = sceneVideos[index];

  if (!video) {
    return;
  }

  video.muted = !soundEnabled;

  const playback = video.play();

  if (playback && typeof playback.catch === "function") {
    playback.catch((error) => {
      console.warn("Video autoplay was prevented:", error);
    });
  }
}


// =========================================
// SCENE TRANSITION
// =========================================

function goToScene(nextIndex, direction = 1) {
  if (isTransitioning) {
    return;
  }

  if (nextIndex < 0 || nextIndex >= totalScenes) {
    return;
  }

  if (nextIndex === currentScene) {
    return;
  }

  const previousIndex = currentScene;

  const previousScene = videoScenes[previousIndex];

  const nextScene = videoScenes[nextIndex];

  if (!previousScene || !nextScene) {
    return;
  }

  isTransitioning = true;

  previousScene.classList.remove("is-active");
  previousScene.classList.add("is-leaving");

  nextScene.classList.remove("is-leaving");
  nextScene.classList.add("is-active");

  pauseAllVideos();

  resetVideo(sceneVideos[nextIndex]);

  playVideo(nextIndex);

  currentScene = nextIndex;

  updateProgress(currentScene);

  updateSceneContent(currentScene);

  hero.dataset.direction = String(direction);

  window.setTimeout(() => {
    previousScene.classList.remove("is-leaving");

    resetVideo(sceneVideos[previousIndex]);

    isTransitioning = false;
  }, transitionDuration);
}


function goNext() {
  if (currentScene < totalScenes - 1) {
    goToScene(currentScene + 1, 1);
  }
}


function goPrevious() {
  if (currentScene > 0) {
    goToScene(currentScene - 1, -1);
  }
}


// =========================================
// PROGRESS BUTTONS
// =========================================

progressItems.forEach((item) => {
  item.addEventListener("click", () => {
    const targetIndex = Number(
      item.dataset.goTo
    );

    const direction =
      targetIndex > currentScene ? 1 : -1;

    goToScene(targetIndex, direction);
  });
});


// =========================================
// ARROW BUTTONS
// =========================================

previousSceneButton.addEventListener(
  "click",
  goPrevious
);

nextSceneButton.addEventListener(
  "click",
  goNext
);


// =========================================
// TOUCH SWIPE
// =========================================

hero.addEventListener(
  "touchstart",
  (event) => {
    const touch = event.changedTouches[0];

    touchStartY = touch.clientY;
    touchStartX = touch.clientX;
  },
  { passive: true }
);


hero.addEventListener(
  "touchend",
  (event) => {
    const touch = event.changedTouches[0];

    const touchEndY = touch.clientY;
    const touchEndX = touch.clientX;

    const distanceY =
      touchEndY - touchStartY;

    const distanceX =
      touchEndX - touchStartX;

    const isVerticalSwipe =
      Math.abs(distanceY) > Math.abs(distanceX);

    if (
      !isVerticalSwipe ||
      Math.abs(distanceY) < minimumSwipeDistance
    ) {
      return;
    }

    if (distanceY < 0) {
      goNext();
    } else {
      goPrevious();
    }
  },
  { passive: true }
);


// =========================================
// MOUSE WHEEL
// =========================================

hero.addEventListener(
  "wheel",
  (event) => {
    if (wheelLocked) {
      return;
    }

    if (Math.abs(event.deltaY) < 15) {
      return;
    }

    wheelLocked = true;

    if (event.deltaY > 0) {
      goNext();
    } else {
      goPrevious();
    }

    window.setTimeout(() => {
      wheelLocked = false;
    }, 1300);
  },
  { passive: true }
);


// =========================================
// KEYBOARD NAVIGATION
// =========================================

document.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "ArrowDown") {
      goNext();
    }

    if (event.key === "ArrowUp") {
      goPrevious();
    }
  }
);


// =========================================
// SOUND CONTROL
// =========================================

soundToggle.addEventListener(
  "click",
  () => {
    soundEnabled = !soundEnabled;

    updateSoundState();

    playVideo(currentScene);
  }
);


// =========================================
// MOBILE MENU
// =========================================

function setMenuState(isOpen) {
  menuButton.classList.toggle("is-open", isOpen);

  mobileMenu.classList.toggle("is-open", isOpen);

  mobileMenu.setAttribute(
    "aria-hidden",
    String(!isOpen)
  );

  menuButton.setAttribute(
    "aria-expanded",
    String(isOpen)
  );

  document.body.classList.toggle(
    "is-locked",
    isOpen
  );
}


menuButton.addEventListener(
  "click",
  () => {
    const isOpen =
      !mobileMenu.classList.contains("is-open");

    setMenuState(isOpen);
  }
);


menuLinks.forEach((link) => {
  link.addEventListener(
    "click",
    () => {
      setMenuState(false);
    }
  );
});


// =========================================
// HEADER SCROLL EFFECT
// =========================================

window.addEventListener(
  "scroll",
  () => {
    siteHeader.classList.toggle(
      "is-scrolled",
      window.scrollY > 30
    );
  },
  { passive: true }
);


// =========================================
// INITIALIZATION
// =========================================

function initializeHero() {
  updateProgress(currentScene);

  updateSceneContent(currentScene);

  updateSoundState();

  sceneVideos.forEach((video, index) => {
    video.muted = true;

    video.playsInline = true;

    if (index !== currentScene) {
      video.pause();
    }
  });

  playVideo(currentScene);
}


initializeHero();
