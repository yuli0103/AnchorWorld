(function () {
  const PLACEHOLDER_VIDEOS = [
    'static/videos/carousel1.mp4',
    'static/videos/carousel2.mp4',
    'static/videos/carousel3.mp4',
  ];

  const MANIFEST_URL = 'static/videos/videos-manifest.json';
  const VIDEO_CONTROLS_FALLBACK_HEIGHT = 44;

  function loadVideo(video) {
    if (!video || video.src || !video.dataset.src) return;
    video.src = video.dataset.src;
    video.load();
  }

  function initVideoControls(video, playBtn, progress) {
    const icon = playBtn.querySelector('i');

    function setPlayIcon(playing) {
      icon.className = playing ? 'fas fa-pause' : 'fas fa-play';
      playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    }

    function updateProgress() {
      if (!video.duration || Number.isNaN(video.duration)) return;
      progress.value = String((video.currentTime / video.duration) * 100);
    }

    playBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      if (video.paused) {
        loadVideo(video);
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });

    video.addEventListener('click', () => {
      if (video.paused) {
        loadVideo(video);
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', () => setPlayIcon(true));
    video.addEventListener('pause', () => setPlayIcon(false));
    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', updateProgress);
    video.addEventListener('durationchange', updateProgress);

    progress.addEventListener('input', () => {
      if (!video.duration || Number.isNaN(video.duration)) return;
      video.currentTime = (parseFloat(progress.value) / 100) * video.duration;
    });

    progress.addEventListener('click', (event) => {
      event.stopPropagation();
    });

    setPlayIcon(!video.paused);
    updateProgress();
  }

  function createVideoPlayer(src) {
    const player = document.createElement('div');
    player.className = 'video-player';

    const video = document.createElement('video');
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'none';
    video.dataset.src = src;

    const controls = document.createElement('div');
    controls.className = 'video-controls';

    const playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'video-play-btn';
    playBtn.setAttribute('aria-label', 'Play');
    playBtn.innerHTML = '<i class="fas fa-play"></i>';

    const progress = document.createElement('input');
    progress.type = 'range';
    progress.className = 'video-progress';
    progress.min = '0';
    progress.max = '100';
    progress.value = '0';
    progress.step = '0.1';
    progress.setAttribute('aria-label', 'Video progress');

    controls.appendChild(playBtn);
    controls.appendChild(progress);
    player.appendChild(video);
    player.appendChild(controls);
    initVideoControls(video, playBtn, progress);

    return player;
  }

  function createCarousel(videos) {
    const sources = videos.length ? videos : PLACEHOLDER_VIDEOS;
    const carousel = document.createElement('div');
    carousel.className = 'video-carousel';
    carousel.setAttribute('data-video-carousel', '');

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'carousel-nav carousel-prev';
    prevBtn.setAttribute('aria-label', 'Previous video');
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'carousel-nav carousel-next';
    nextBtn.setAttribute('aria-label', 'Next video');
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';

    const viewport = document.createElement('div');
    viewport.className = 'carousel-viewport';

    const track = document.createElement('div');
    track.className = 'carousel-track';

    sources.forEach((src, index) => {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';
      slide.dataset.index = String(index);

      slide.appendChild(createVideoPlayer(src));
      track.appendChild(slide);
    });

    viewport.appendChild(track);

    const footer = document.createElement('div');
    footer.className = 'carousel-footer';

    const indicator = document.createElement('span');
    indicator.className = 'carousel-indicator';
    indicator.textContent = `1 / ${sources.length}`;

    footer.appendChild(indicator);

    carousel.appendChild(prevBtn);
    carousel.appendChild(viewport);
    carousel.appendChild(nextBtn);
    carousel.appendChild(footer);

    return carousel;
  }

  function renderSectionBlock(section) {
    const block = document.createElement('article');
    block.className = 'video-topic';

    const title = document.createElement('h3');
    title.className = 'video-topic-title';
    title.textContent = section.title;
    block.appendChild(title);

    if (section.description) {
      const description = document.createElement('p');
      description.className = 'video-topic-description';
      description.textContent = section.description;
      block.appendChild(description);
    }

    section.items.forEach((item) => {
      const subsection = document.createElement('div');
      subsection.className = 'video-subsection';

      if (item.label) {
        const subtitle = document.createElement('h4');
        subtitle.className = 'video-subsection-title';
        subtitle.textContent = item.label;
        subsection.appendChild(subtitle);
      }

      if (item.description) {
        const description = document.createElement('p');
        description.className = 'video-subsection-description';
        description.textContent = item.description;
        subsection.appendChild(description);
      }

      subsection.appendChild(createCarousel(item.videos));
      block.appendChild(subsection);
    });

    return block;
  }

  function renderSections(containerId, sections) {
    const container = document.getElementById(containerId);
    if (!container) return;

    sections.forEach((section) => {
      container.appendChild(renderSectionBlock(section));
    });
  }

  function pauseInactiveVideos(carousel, activeIndex) {
    carousel.querySelectorAll('video').forEach((video, index) => {
      if (index === activeIndex) return;
      video.pause();
      if (video.readyState > 0) {
        video.currentTime = 0;
      }
    });
  }

  function initCarousel(carousel) {
    const viewport = carousel.querySelector('.carousel-viewport');
    const track = carousel.querySelector('.carousel-track');
    const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    const indicator = carousel.querySelector('.carousel-indicator');
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    let index = 0;

    if (slides.length <= 1) {
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      prevBtn.classList.add('is-hidden');
      nextBtn.classList.add('is-hidden');
    }

    function getControlsHeight(slide) {
      const controls = slide && slide.querySelector('.video-controls');
      return controls ? controls.offsetHeight : VIDEO_CONTROLS_FALLBACK_HEIGHT;
    }

    function refreshViewportHeight() {
      if (!viewport || slides.length === 0) return;
      const slide = slides[index];
      const video = slide && slide.querySelector('video');
      if (!video || !video.videoWidth || !video.videoHeight) {
        viewport.style.height = '';
        return;
      }
      const w = viewport.clientWidth;
      if (!w) return;
      const videoHeight = (video.videoHeight / video.videoWidth) * w;
      const controlsHeight = getControlsHeight(slide);
      const h = videoHeight + controlsHeight;
      viewport.style.height = `${Math.round(h * 1000) / 1000}px`;
    }

    function loadSlide(slideIndex) {
      const slide = slides[slideIndex];
      const video = slide && slide.querySelector('video');
      loadVideo(video);
    }

    function loadCurrentAndAdjacentSlides() {
      if (slides.length === 0) return;
      loadSlide(index);
      if (slides.length > 1) {
        loadSlide((index + 1) % slides.length);
      }
    }

    function update(shouldLoad = false) {
      if (shouldLoad) {
        loadCurrentAndAdjacentSlides();
      }
      track.style.transform = `translateX(-${index * 100}%)`;
      indicator.textContent = `${index + 1} / ${slides.length}`;
      if (slides.length <= 1) {
        prevBtn.disabled = true;
        nextBtn.disabled = true;
      } else {
        prevBtn.disabled = false;
        nextBtn.disabled = false;
      }
      pauseInactiveVideos(carousel, index);
      requestAnimationFrame(() => refreshViewportHeight());
    }

    prevBtn.addEventListener('click', () => {
      if (slides.length <= 1) return;
      index = (index - 1 + slides.length) % slides.length;
      update(true);
    });

    nextBtn.addEventListener('click', () => {
      if (slides.length <= 1) return;
      index = (index + 1) % slides.length;
      update(true);
    });

    slides.forEach((slide, i) => {
      const video = slide.querySelector('video');
      if (!video) return;
      const onDimsReady = () => {
        if (i === index) refreshViewportHeight();
      };
      video.addEventListener('loadedmetadata', onDimsReady);
      video.addEventListener('loadeddata', onDimsReady);
    });

    if (viewport && typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => refreshViewportHeight());
      ro.observe(viewport);
    } else {
      window.addEventListener('resize', refreshViewportHeight);
    }

    update();
  }

  function setupAutoplayObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
        if (entry.isIntersecting) {
          loadVideo(video);
          video.play().catch(() => {});
        } else {
            video.pause();
          }
        });
      },
      { threshold: 0.55 }
    );

    document.querySelectorAll('.video-carousel video').forEach((video) => {
      observer.observe(video);
    });
  }

  async function loadManifest() {
    const res = await fetch(MANIFEST_URL, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Manifest HTTP ${res.status}`);
    }
    return res.json();
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadManifest()
      .then((data) => {
        const comparisons = Array.isArray(data.comparisons) ? data.comparisons : [];
        const demos = Array.isArray(data.demos) ? data.demos : [];
        renderSections('comparisons-videos', comparisons);
        renderSections('demos-videos', demos);
        document.querySelectorAll('[data-video-carousel]').forEach(initCarousel);
        setupAutoplayObserver();
      })
      .catch((err) => {
        console.warn('Could not load video manifest; using placeholders.', err);
        renderSections('comparisons-videos', [
          {
            title: 'Video manifest unavailable',
            items: [{ label: null, videos: PLACEHOLDER_VIDEOS }],
          },
        ]);
        renderSections('demos-videos', [
          {
            title: 'Video manifest unavailable',
            items: [{ label: null, videos: PLACEHOLDER_VIDEOS }],
          },
        ]);
        document.querySelectorAll('[data-video-carousel]').forEach(initCarousel);
        setupAutoplayObserver();
      });
  });
})();
