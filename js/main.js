
// =========================================
// ALVOXIS — INITIAL VIDEO SETUP
// =========================================

const heroVideo = document.querySelector(".hero-video");

if (heroVideo) {
  heroVideo.muted = true;
  heroVideo.volume = 0;

  const startVideo = () => {
    heroVideo.play().catch(() => {
      // Autoplay may be restricted by the browser.
    });
  };

  if (heroVideo.readyState >= 2) {
    startVideo();
  } else {
    heroVideo.addEventListener("canplay", startVideo, {
      once: true
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      heroVideo.pause();
    } else {
      startVideo();
    }
  });
}
