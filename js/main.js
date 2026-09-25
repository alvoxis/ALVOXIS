
document.addEventListener('DOMContentLoaded', () => {

  const experience = document.querySelector('#experience');
  const heroVideo = document.querySelector('#heroVideo');
  const videoBackground = document.querySelector('.video-background');

  const experienceIntro = document.querySelector('#experienceIntro');
  const experienceDistance = document.querySelector('#experienceDistance');
  const experienceFinish = document.querySelector('#experienceFinish');

  const experienceProgressBar = document.querySelector('#experienceProgressBar');
  const experienceCounter = document.querySelector('#experienceCounter');

  const productsSlider = document.querySelector('#productsSlider');
  const sliderPrev = document.querySelector('#sliderPrev');
  const sliderNext = document.querySelector('#sliderNext');
  const sliderProgressBar = document.querySelector('#sliderProgressBar');

  const productCards = productsSlider
    ? Array.from(productsSlider.querySelectorAll('.product-card'))
    : [];

  let videoReady = false;
  let videoDuration = 0;
  let isUpdatingVideo = false;
  let currentSliderIndex = 0;
  let ticking = false;


  const clamp = (value, min = 0, max = 1) => {
    return Math.min(Math.max(value, min), max);
  };


  const easeInOut = (value) => {
    const t = clamp(value);

    return t < 0.5
      ? 2 * t * t
      : 1 - Math.pow(-2 * t + 2, 2) / 2;
  };


  const easeOutCubic = (value) => {
    return 1 - Math.pow(1 - clamp(value), 3);
  };


  const getExperienceProgress = () => {

    if (!experience) {
      return 0;
    }

    const rect = experience.getBoundingClientRect();
    const scrollableHeight = experience.offsetHeight - window.innerHeight;

    if (scrollableHeight <= 0) {
      return 0;
    }

    return clamp(-rect.top / scrollableHeight);

  };


  if (heroVideo) {

    heroVideo.muted = true;
    heroVideo.volume = 0;
    heroVideo.autoplay = false;
    heroVideo.loop = false;
    heroVideo.controls = false;
    heroVideo.playsInline = true;

    heroVideo.removeAttribute('autoplay');
    heroVideo.pause();


    const markVideoReady = () => {

      if (!Number.isFinite(heroVideo.duration)) {
        return;
      }

      if (heroVideo.duration <= 0) {
        return;
      }

      videoDuration = heroVideo.duration;
      videoReady = true;

      heroVideo.pause();

      updateExperience();

    };


    heroVideo.addEventListener('loadedmetadata', markVideoReady);
    heroVideo.addEventListener('loadeddata', markVideoReady);
    heroVideo.addEventListener('canplay', markVideoReady);


    heroVideo.addEventListener('play', () => {

      if (!isUpdatingVideo) {
        heroVideo.pause();
      }

    });


    heroVideo.addEventListener('ended', () => {
      heroVideo.pause();
    });

  }


  const updateScrollVideo = (progress) => {

    if (!heroVideo || !videoReady || !videoDuration) {
      return;
    }

    const videoProgress = clamp(progress / 0.82);
    const easedProgress = easeInOut(videoProgress);
    const targetTime = easedProgress * videoDuration;


    if (Math.abs(heroVideo.currentTime - targetTime) > 0.025) {

      isUpdatingVideo = true;

      try {
        heroVideo.currentTime = targetTime;
      } catch (error) {
        console.warn('Unable to update video time:', error);
      }

      window.setTimeout(() => {
        isUpdatingVideo = false;
      }, 30);

    }

    heroVideo.pause();

  };


  const updateExperience = () => {

    if (!experience) {
      return;
    }

    const progress = getExperienceProgress();

    updateScrollVideo(progress);


    const videoExitProgress = clamp((progress - 0.78) / 0.22);
    const exitEased = easeInOut(videoExitProgress);

    const scale = 1 - exitEased * 0.72;
    const translateY = -exitEased * 7;
    const translateZ = -exitEased * 450;
    const opacity = 1 - exitEased;


    if (videoBackground) {

      videoBackground.style.transform = `
        translate3d(0, ${translateY}%, ${translateZ}px)
        scale(${scale})
      `;

      videoBackground.style.opacity = String(opacity);

    }


    const introOpacity = 1 - clamp(progress / 0.3);

    if (experienceIntro) {

      experienceIntro.style.opacity = String(introOpacity);

      experienceIntro.style.transform = `
        translateY(${-progress * 45}px)
      `;

    }


    const distanceStart = 0.42;
    const distanceEnd = 0.74;

    const distanceProgress = clamp(
      (progress - distanceStart) / (distanceEnd - distanceStart)
    );

    let distanceOpacity = 0;

    if (distanceProgress < 0.2) {
      distanceOpacity = distanceProgress / 0.2;
    } else if (distanceProgress > 0.78) {
      distanceOpacity = 1 - (distanceProgress - 0.78) / 0.22;
    } else {
      distanceOpacity = 1;
    }


    if (experienceDistance) {

      experienceDistance.style.opacity = String(
        clamp(distanceOpacity)
      );

      experienceDistance.style.transform = `
        translateY(${(1 - distanceProgress) * 35}px)
      `;

    }


    const finishProgress = clamp((progress - 0.78) / 0.22);

    if (experienceFinish) {

      experienceFinish.style.opacity = String(
        easeOutCubic(finishProgress)
      );

      experienceFinish.style.transform = `
        translateY(${(1 - finishProgress) * 25}px)
      `;

    }


    if (experienceProgressBar) {
      experienceProgressBar.style.width = `${progress * 100}%`;
    }


    if (experienceCounter) {

      if (progress < 0.38) {
        experienceCounter.textContent = '01 / 03';
      } else if (progress < 0.78) {
        experienceCounter.textContent = '02 / 03';
      } else {
        experienceCounter.textContent = '03 / 03';
      }

    }

  };


  const requestExperienceUpdate = () => {

    if (ticking) {
      return;
    }

    ticking = true;

    window.requestAnimationFrame(() => {
      updateExperience();
      ticking = false;
    });

  };


  window.addEventListener(
    'scroll',
    requestExperienceUpdate,
    { passive: true }
  );


  window.addEventListener(
    'resize',
    requestExperienceUpdate
  );


  window.addEventListener(
    'orientationchange',
    requestExperienceUpdate
  );


  const updateSliderProgress = () => {

    if (!productsSlider || !sliderProgressBar) {
      return;
    }

    const maxScroll =
      productsSlider.scrollWidth - productsSlider.clientWidth;

    if (maxScroll <= 0) {
      sliderProgressBar.style.width = '100%';
      return;
    }

    const scrollProgress =
      productsSlider.scrollLeft / maxScroll;

    sliderProgressBar.style.width = `${clamp(scrollProgress) * 100}%`;

  };


  const getCardScrollPosition = (index) => {

    if (!productsSlider || !productCards[index]) {
      return 0;
    }

    const card = productCards[index];

    return card.offsetLeft -
      (productsSlider.clientWidth - card.offsetWidth) / 2;

  };


  const goToSliderIndex = (index) => {

    if (!productsSlider || productCards.length === 0) {
      return;
    }

    currentSliderIndex = Math.max(
      0,
      Math.min(index, productCards.length - 1)
    );

    const targetPosition = getCardScrollPosition(currentSliderIndex);

    productsSlider.scrollTo({
      left: targetPosition,
      behavior: 'smooth'
    });

    updateSliderProgress();

  };


  if (productsSlider) {

    productsSlider.addEventListener(
      'scroll',
      () => {

        updateSliderProgress();

        const currentScroll = productsSlider.scrollLeft;

        let closestIndex = 0;
        let closestDistance = Infinity;

        productCards.forEach((card, index) => {

          const targetPosition = getCardScrollPosition(index);
          const distance = Math.abs(currentScroll - targetPosition);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }

        });

        currentSliderIndex = closestIndex;

      },
      { passive: true }
    );

  }


  if (sliderPrev) {

    sliderPrev.addEventListener('click', () => {
      goToSliderIndex(currentSliderIndex - 1);
    });

  }


  if (sliderNext) {

    sliderNext.addEventListener('click', () => {
      goToSliderIndex(currentSliderIndex + 1);
    });

  }


  const productButtons = document.querySelectorAll(
    '.product-button[data-product]'
  );


  productButtons.forEach((button) => {

    button.addEventListener('click', () => {

      const productName = button.dataset.product;

      console.log(`Selected product: ${productName}`);

      /*
       * Здесь позднее можно подключить
       * персонализацию, корзину и Stripe.
       */

    });

  });


  updateExperience();
  updateSliderProgress();


  window.addEventListener('load', () => {

    updateExperience();
    updateSliderProgress();

  });

});
