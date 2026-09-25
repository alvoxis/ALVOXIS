
document.addEventListener('DOMContentLoaded', () => {

  /*
  =========================================
  ELEMENTS
  =========================================
  */

  const experience = document.querySelector('#experience');

  const heroVideo = document.querySelector('#heroVideo');
  const videoBackground = document.querySelector('#videoBackground');

  const experienceIntro = document.querySelector('#experienceIntro');
  const experienceMiddle = document.querySelector('#experienceMiddle');
  const experienceFinish = document.querySelector('#experienceFinish');

  const experienceProgressBar =
    document.querySelector('#experienceProgressBar');

  const experienceCounter =
    document.querySelector('#experienceCounter');


  /*
  =========================================
  SLIDER ELEMENTS
  =========================================
  */

  const productsSlider =
    document.querySelector('#productsSlider');

  const sliderPrev =
    document.querySelector('#sliderPrev');

  const sliderNext =
    document.querySelector('#sliderNext');

  const sliderProgressBar =
    document.querySelector('#sliderProgressBar');

  const productCards = productsSlider
    ? Array.from(
        productsSlider.querySelectorAll('.product-card')
      )
    : [];


  /*
  =========================================
  STATE
  =========================================
  */

  let videoReady = false;
  let videoDuration = 0;

  let isUpdatingVideo = false;
  let isScrollTicking = false;

  let currentSliderIndex = 0;


  /*
  =========================================
  HELPERS
  =========================================
  */

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

    const scrollableHeight =
      experience.offsetHeight - window.innerHeight;

    if (scrollableHeight <= 0) {
      return 0;
    }

    return clamp(
      -rect.top / scrollableHeight
    );

  };


  /*
  =========================================
  VIDEO INITIALIZATION
  =========================================
  */

  if (heroVideo) {

    heroVideo.muted = true;
    heroVideo.volume = 0;

    heroVideo.autoplay = false;
    heroVideo.loop = false;
    heroVideo.controls = false;
    heroVideo.playsInline = true;

    heroVideo.removeAttribute('autoplay');

    heroVideo.pause();


    const initializeVideo = () => {

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


    heroVideo.addEventListener(
      'loadedmetadata',
      initializeVideo
    );

    heroVideo.addEventListener(
      'loadeddata',
      initializeVideo
    );

    heroVideo.addEventListener(
      'canplay',
      initializeVideo
    );


    /*
    Prevent autoplay.
    The video is controlled only by scrolling.
    */

    heroVideo.addEventListener('play', () => {

      if (!isUpdatingVideo) {
        heroVideo.pause();
      }

    });


    heroVideo.addEventListener('ended', () => {
      heroVideo.pause();
    });

  }


  /*
  =========================================
  VIDEO SCRUBBING
  =========================================
  */

  const updateScrollVideo = (experienceProgress) => {

    if (!heroVideo || !videoReady || !videoDuration) {
      return;
    }


    /*
    The video plays through the first 82%
    of the scroll experience.
    */

    const videoProgress = clamp(
      experienceProgress / 0.82
    );

    const easedProgress = easeInOut(videoProgress);

    const targetTime =
      easedProgress * Math.max(0, videoDuration - 0.05);


    /*
    Avoid unnecessary currentTime updates.
    */

    if (
      Math.abs(heroVideo.currentTime - targetTime) > 0.025
    ) {

      isUpdatingVideo = true;

      try {
        heroVideo.currentTime = targetTime;
      } catch (error) {
        console.warn(
          'Video time update failed:',
          error
        );
      }

      isUpdatingVideo = false;

    }


    heroVideo.pause();

  };


  /*
  =========================================
  EXPERIENCE ANIMATION
  =========================================
  */

  const updateExperience = () => {

    if (!experience) {
      return;
    }

    const progress = getExperienceProgress();


    /*
    VIDEO TIME
    */

    updateScrollVideo(progress);


    /*
    VIDEO EXIT ANIMATION

    At the beginning:
    video is full screen.

    At the end:
    video becomes smaller,
    moves upward and disappears.
    */

    const videoExitProgress = clamp(
      (progress - 0.76) / 0.24
    );

    const exitEased = easeInOut(
      videoExitProgress
    );


    const videoScale =
      1 - exitEased * 0.7;

    const videoTranslateY =
      -exitEased * 8;

    const videoTranslateZ =
      -exitEased * 500;

    const videoOpacity =
      1 - exitEased;


    if (videoBackground) {

      videoBackground.style.transform = `
        translate3d(
          0,
          ${videoTranslateY}%,
          ${videoTranslateZ}px
        )
        scale(${videoScale})
      `;

      videoBackground.style.opacity =
        String(videoOpacity);

    }


    /*
    INTRO TEXT
    */

    const introProgress = clamp(
      progress / 0.28
    );

    const introOpacity =
      1 - easeInOut(introProgress);


    if (experienceIntro) {

      experienceIntro.style.opacity =
        String(introOpacity);

      experienceIntro.style.transform = `
        translateY(${-introProgress * 45}px)
      `;

    }


    /*
    MIDDLE TEXT

    Appears in the middle of the scene.
    */

    const middleStart = 0.28;
    const middleEnd = 0.7;

    const middleProgress = clamp(
      (progress - middleStart) /
      (middleEnd - middleStart)
    );


    let middleOpacity = 0;

    if (middleProgress < 0.2) {

      middleOpacity =
        middleProgress / 0.2;

    } else if (middleProgress > 0.78) {

      middleOpacity =
        1 - (
          (middleProgress - 0.78) / 0.22
        );

    } else {

      middleOpacity = 1;

    }


    if (experienceMiddle) {

      experienceMiddle.style.opacity =
        String(clamp(middleOpacity));

      experienceMiddle.style.transform = `
        translateY(
          ${(1 - middleProgress) * 35}px
        )
      `;

    }


    /*
    FINAL TEXT
    */

    const finishProgress = clamp(
      (progress - 0.74) / 0.26
    );


    if (experienceFinish) {

      experienceFinish.style.opacity =
        String(easeOutCubic(finishProgress));

      experienceFinish.style.transform = `
        translateY(
          ${(1 - finishProgress) * 25}px
        )
      `;

    }


    /*
    EXPERIENCE PROGRESS BAR
    */

    if (experienceProgressBar) {

      experienceProgressBar.style.width =
        `${progress * 100}%`;

    }


    /*
    EXPERIENCE COUNTER
    */

    if (experienceCounter) {

      if (progress < 0.35) {

        experienceCounter.textContent =
          '01 / 03';

      } else if (progress < 0.76) {

        experienceCounter.textContent =
          '02 / 03';

      } else {

        experienceCounter.textContent =
          '03 / 03';

      }

    }

  };


  /*
  =========================================
  SCROLL PERFORMANCE
  =========================================
  */

  const requestExperienceUpdate = () => {

    if (isScrollTicking) {
      return;
    }

    isScrollTicking = true;


    window.requestAnimationFrame(() => {

      updateExperience();

      isScrollTicking = false;

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


  /*
  =========================================
  SLIDER PROGRESS
  =========================================
  */

  const updateSliderProgress = () => {

    if (!productsSlider || !sliderProgressBar) {
      return;
    }


    const maxScroll =
      productsSlider.scrollWidth -
      productsSlider.clientWidth;


    if (maxScroll <= 0) {

      sliderProgressBar.style.width =
        '100%';

      return;

    }


    const progress =
      productsSlider.scrollLeft / maxScroll;


    sliderProgressBar.style.width =
      `${clamp(progress) * 100}%`;

  };


  /*
  =========================================
  SLIDER CARD POSITION
  =========================================
  */

  const getCardScrollPosition = (index) => {

    if (
      !productsSlider ||
      !productCards[index]
    ) {
      return 0;
    }


    const card = productCards[index];


    const cardCenter =
      card.offsetLeft +
      card.offsetWidth / 2;


    const sliderCenter =
      productsSlider.clientWidth / 2;


    return cardCenter - sliderCenter;

  };


  /*
  =========================================
  GO TO SLIDER CARD
  =========================================
  */

  const goToSliderIndex = (index) => {

    if (
      !productsSlider ||
      productCards.length === 0
    ) {
      return;
    }


    currentSliderIndex = Math.max(
      0,
      Math.min(
        index,
        productCards.length - 1
      )
    );


    const targetPosition =
      getCardScrollPosition(
        currentSliderIndex
      );


    productsSlider.scrollTo({

      left: targetPosition,

      behavior: 'smooth'

    });


    updateSliderProgress();

  };


  /*
  =========================================
  DETECT ACTIVE SLIDER CARD
  =========================================
  */

  if (productsSlider) {

    productsSlider.addEventListener(
      'scroll',
      () => {

        updateSliderProgress();


        const currentScroll =
          productsSlider.scrollLeft;


        let closestIndex = 0;
        let closestDistance = Infinity;


        productCards.forEach((card, index) => {

          const targetPosition =
            getCardScrollPosition(index);


          const distance =
            Math.abs(
              currentScroll - targetPosition
            );


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


  /*
  =========================================
  SLIDER BUTTONS
  =========================================
  */

  if (sliderPrev) {

    sliderPrev.addEventListener(
      'click',
      () => {

        goToSliderIndex(
          currentSliderIndex - 1
        );

      }
    );

  }


  if (sliderNext) {

    sliderNext.addEventListener(
      'click',
      () => {

        goToSliderIndex(
          currentSliderIndex + 1
        );

      }
    );

  }


  /*
  =========================================
  PRODUCT BUTTONS
  =========================================
  */

  const productButtons =
    document.querySelectorAll(
      '.product-button[data-product]'
    );


  productButtons.forEach((button) => {

    button.addEventListener(
      'click',
      () => {

        const productName =
          button.dataset.product;


        console.log(
          `Selected product: ${productName}`
        );


        /*
        Future functionality:
        personalization,
        cart,
        Stripe checkout.
        */

      }
    );

  });


  /*
  =========================================
  INITIALIZATION
  =========================================
  */

  updateExperience();

  updateSliderProgress();


  window.addEventListener(
    'load',
    () => {

      updateExperience();

      updateSliderProgress();

    }
  );

});
