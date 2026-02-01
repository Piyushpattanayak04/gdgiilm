// Migrated from `gdg.app/main/script.js` — served as an ES module via Vite.
// NOTE: This file expects the global libraries (gsap, ScrollTrigger, Lenis, barba, Draggable, etc.)
// to be provided by the HTML via CDN script tags (keeps original behavior).
import "./script.js";

// Wait for GSAP and other CDN libraries to be available, then initialize
function waitForLibraries(callback, attempts = 0, maxAttempts = 300) {
  const gsapReady = typeof gsap !== 'undefined';
  const scrollTriggerReady = typeof ScrollTrigger !== 'undefined';
  // CustomEase is optional/premium, so we don't block on it, but we check it for logging
  const customEaseReady = typeof CustomEase !== 'undefined';

  if (attempts === 0) {
    console.log('[Waiting for libraries...] gsap:', gsapReady, 'ScrollTrigger:', scrollTriggerReady);
  }

  if (gsapReady && scrollTriggerReady) {
    console.log('[Libraries loaded successfully after', attempts, 'attempts]');
    callback();
  } else if (attempts < maxAttempts) {
    setTimeout(() => waitForLibraries(callback, attempts + 1, maxAttempts), 50);
  } else {
    console.error('CDN libraries failed to load after', maxAttempts * 50, 'ms. gsap:', gsapReady, 'ScrollTrigger:', scrollTriggerReady);
    // Force hide loader so user isn't stuck
    const loader = document.querySelector('.loading-screen');
    if (loader) {
      loader.style.opacity = '0';
      loader.style.pointerEvents = 'none';
    }
    const main = document.querySelector('main');
    if (main) {
      main.style.opacity = '1';
      main.style.visibility = 'visible';
    }
  }
}

waitForLibraries(() => {
  // Safely register plugins
  const plugins = [ScrollTrigger];
  if (typeof CustomEase !== 'undefined') plugins.push(CustomEase);
  if (typeof DrawSVGPlugin !== 'undefined') plugins.push(DrawSVGPlugin);
  if (typeof TextPlugin !== 'undefined') plugins.push(TextPlugin);
  if (typeof Draggable !== 'undefined') plugins.push(Draggable);

  gsap.registerPlugin(...plugins);

  console.log('[Main] Plugins registered:', plugins.map(p => p ? p.name || 'Unknown' : 'Unknown'));

  let loader = true;
  let lenis;
  let staggerDefault = 0.07;
  let durationDefault = 1.47;
  let transitionOffset = 25; /* ms */
  const _sunTransformEl = document.querySelector('.welcome-sun__transform .chat-cloud__p');
  const sunTransformText = _sunTransformEl ? (_sunTransformEl.textContent || '').trim() : '';

  if (typeof CustomEase !== 'undefined') {
    CustomEase.create("cubic-default", "0.625, 0.05, 0, 1");
    gsap.defaults({ ease: "cubic-default", duration: durationDefault });
  } else {
    console.warn('[Main] CustomEase not found, falling back to standard ease');
    gsap.defaults({ ease: "power2.out", duration: durationDefault });
  }

  initPageTransitions();




  // Animate rainbows function
  function animateRainbow(selector, mode, count, duration = 4, delay = 0, stagger = 0.075, rainbowTimeline = null, scrollTriggerConfig = null) {
    // if they passed a scrollTrigger config but no timeline, create it
    if (!rainbowTimeline && scrollTriggerConfig) {
      rainbowTimeline = gsap.timeline({ scrollTrigger: scrollTriggerConfig });
    }

    const paths = document.querySelectorAll(selector + ' path');
    const isFrom = mode === 'fromStart' || mode === 'fromEnd';
    const draw = mode.endsWith('Start') ? '0% 0%' : '100% 100%';

    for (let i = 0; i < count; i++) {
      const targets = [paths[i], paths[i + count]];
      const pos = delay + i * stagger;

      if (rainbowTimeline) {
        rainbowTimeline[isFrom ? 'from' : 'to'](
          targets,
          { drawSVG: draw, duration: duration, ease: "Power1.easeOut" },
          pos
        );
      } else {
        gsap[isFrom ? 'from' : 'to'](
          targets,
          { drawSVG: draw, duration: duration, delay: pos, ease: "Power2.easeInOut" }
        );
      }
    }
  }

  function rainbowsScrolltrigger() {
    animateRainbow('.rainbow-sides__right', 'toStart', 4, 0.75, 0.125, 0.075, null, { trigger: '.stacked-cards__collection', start: 'clamp(top bottom)', end: 'bottom top', scrub: 0 });
    animateRainbow('.rainbow-sides__left', 'toEnd', 4, 0.75, 0, 0.075, null, { trigger: '.stacked-cards__collection', start: 'clamp(top bottom)', end: 'bottom top', scrub: 0 });
    animateRainbow('.rainbow-vertical__1', 'fromStart', 9, 0.5, 0, 0.0375, null, { trigger: '.welcome', start: 'clamp(top bottom)', endTrigger: ".about__tile", end: 'bottom bottom', scrub: 0 });
    animateRainbow('.rainbow-vertical__3', 'fromStart', 9, 0.5, 0, 0.075, null, { trigger: '.about__bottom', start: 'top 100%', end: 'bottom 50%', scrub: 0 });
  }

  // Animation - Page Loader
  function initLoaderShort() {

    var tl = gsap.timeline();

    // Don't stop lenis for members page - let it scroll immediately

    tl.call(function () {
      pageTransitionOut();
      rainbowsScrolltrigger();
    }, null, 0);

    tl.set(document.querySelector('.loading-screen'), {
      autoAlpha: 0,
    });
  }


  // Animation - Page Loader
  function initLoader() {

    var tl = gsap.timeline();

    tl.set(document.querySelector('main'), {
      overflow: "clip",
      height: "100svh"
    });

    // Set the sun
    tl.set(document.querySelector('.welcome-sun__transform'), {
      y: () => {
        const h = window.innerHeight;
        const el = document.querySelector('.welcome-sun__transform');
        const elH = el ? el.getBoundingClientRect().height : 0;
        const top = el ? el.getBoundingClientRect().top : 0; // distance from viewport top
        return (h - elH) / 2 - top;
      }
    });

    tl.set(document.querySelector('.welcome-sun__transform .chat-cloud__p'), {
      text: "...",
    });

    tl.to(document.querySelector('.loading-screen'), {
      autoAlpha: 0,
      duration: 0.3,
      ease: "none",
      delay: 0.1
    });

    tl.to(document.querySelector('.welcome-sun__transform .chat-cloud__p'), {
      duration: 0.4,
      text: "Hi Friends!",
      ease: "none",
      delay: 0.2
    });

    tl.to(document.querySelector('.welcome-sun__transform .chat-cloud__p'), {
      duration: 0.25,
      text: "...",
      ease: "none",
      delay: 1,
    });

    tl.to(document.querySelector('.welcome-sun__transform .chat-cloud__p'), {
      duration: 0.5,
      text: "We are back...",
      ease: "none",
    });

    tl.to(document.querySelector('.welcome-sun__transform .chat-cloud__p'), {
      duration: 0.25,
      text: "...",
      ease: "none",
      delay: 1,
    });

    tl.to(document.querySelector('.welcome-sun__transform .chat-cloud__p'), {
      duration: 0.5,
      text: sunTransformText,
      ease: "none",
    });

    tl.to(document.querySelector('.welcome-sun__transform'), {
      y: 0,
    }, "< -1");

    tl.from(document.querySelector('.nav-bar'), {
      yPercent: -102,
    }, "<");

    tl.from(document.querySelectorAll('.welcome__row-cards'), {
      duration: 1,
      y: "3em",
      autoAlpha: 0,
      stagger: -0.025,
      ease: "Expo.easeOut"
    }, "< 0.5")

    tl.from(document.querySelectorAll('.welcome__h1 > span, .welcome__h2-box-wrap'), {
      duration: 1,
      yPercent: 100,
      autoAlpha: 0,
      stagger: -0.025,
      ease: "Expo.easeOut",
    }, "< 0.0025")

    tl.call(function () {
      lenis.stop();
    }, null, 0);

    // 4 pairs, 3s each, starting at 0.5s, 0.075s stagger
    animateRainbow('.rainbow-sides__right', 'fromStart', 4, 2, 0.5, 0.075);
    animateRainbow('.rainbow-sides__left', 'fromEnd', 4, 2, 1, 0.075);

    tl.call(function () {
      pageTransitionOut();

      gsap.set(document.querySelector('main'), {
        clearProps: "all"
      });

      rainbowsScrolltrigger();
    }, null, 3);
  }

  // Animation - Page Leave
  function pageTransitionIn() {
    var tl = gsap.timeline();

    if (document.querySelector('.lorem-ipsum')) { }

    tl.call(function () {
      lenis.stop();
    });

  }

  // Animation - Page Enter
  function pageTransitionOut() {
    var tl = gsap.timeline();

    tl.call(function () {
      lenis.start();
    }, null, 0);

  }

  function initPageTransitions() {

    // # Common: leave (Before Offset)
    async function commonLeaveBeforeOffset(data) {
      pageTransitionIn(data.current);
      initBasicFunctions();
      document.querySelectorAll('[data-navigation-status]').forEach(el => el.setAttribute('data-navigation-status', 'not-active'));
    }

    // # Common: leave (After Offset)
    async function commonLeaveAfterOffset(data) {
      lenis.destroy();
      killAllScrollTriggers();
      data.current.container.remove();
      document.querySelectorAll('[data-navigation-status]').forEach(el => el.setAttribute('data-navigation-status', 'not-active'));
      document.querySelectorAll('[data-scrolling-direction]').forEach(el => el.setAttribute('data-scrolling-direction', 'down'));
      document.querySelectorAll('[data-scrolling-started]').forEach(el => el.setAttribute('data-scrolling-started', 'false'));
    }

    // # Common: enter
    async function commonEnter(data) {
      initBarbaNavUpdate(data);
      updateHead(data); // Add head update
      pageTransitionOut(data.next);
    }

    // # Common: beforeEnter
    async function commonBeforeEnter(data) {
      ScrollTrigger.getAll().forEach(t => t.kill());
      // initResetWebflow(data);
      initSmoothScroll(data.next.container);
      initScript();
    }

    // # Common: afterEnter
    async function commonAfterEnter(data) {
      window.scrollTo(0, 0);
      ScrollTrigger.refresh();
    }

    barba.init({
      sync: true,
      debug: true,
      timeout: 7000,
      preventRunning: true,
      prevent: function ({ el }) {
        if (el.hasAttribute("data-barba-prevent")) {
          return true;
        }
      },
      transitions: [{
        name: 'members',
        from: {
          namespace: ['members']
        },
        once(data) {
          console.log('[Members Page] Initializing without Lenis smooth scroll');
          // CSS handled by native load or updateHead
          document.fonts.ready.then(function () {
            // Don't initialize Lenis for members page - use native scroll
            initScript();

            // Remove any Lenis classes and ensure members-page class
            document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped');
            document.documentElement.classList.add('members-page');
            document.body.classList.add('members-page');

            // Force native scroll styles
            document.documentElement.style.overflow = 'auto';
            document.documentElement.style.height = 'auto';
            document.body.style.overflow = 'auto';
            document.body.style.height = 'auto';

            const mainWrap = document.querySelector('.main-wrap');
            if (mainWrap) {
              mainWrap.style.overflow = 'visible';
              mainWrap.style.height = 'auto';
            }

            // Hide loading screen
            gsap.set(document.querySelector('.loading-screen'), {
              autoAlpha: 0,
            });

            console.log('[Members Page] Initialization complete - native scrolling enabled');
          });
        },
        async leave(data) {
          await commonLeaveBeforeOffset(data);
          await delay(transitionOffset);
          await commonLeaveAfterOffset(data);
        },
        async enter(data) {
          // CSS handled by commonEnter -> updateHead
          await commonEnter(data);
        },
        async beforeEnter(data) {
          // Skip Lenis initialization for members page - use native scroll
          ScrollTrigger.getAll().forEach(t => t.kill());

          // Remove any Lenis classes and ensure members-page class
          document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped');
          document.documentElement.classList.add('members-page');
          document.body.classList.add('members-page');

          // Force native scroll styles
          document.documentElement.style.overflow = 'auto';
          document.documentElement.style.height = 'auto';
          document.body.style.overflow = 'auto';
          document.body.style.height = 'auto';

          initScript();
        },
        async afterEnter(data) {
          await commonAfterEnter(data);
        }
      }, {
        name: 'self',
        async leave(data) {
          await commonLeaveBeforeOffset(data);
          await delay(transitionOffset);
          await commonLeaveAfterOffset(data);
        },
        async enter(data) {
          await commonEnter(data);
        },
        async beforeEnter(data) {
          await commonBeforeEnter(data);
        },
        async afterEnter(data) {
          await commonAfterEnter(data);
        }
      }, {
        name: 'default',
        once(data) {
          document.fonts.ready.then(function () {
            initSmoothScroll(data.next.container);
            initScript();
            if (loader === true) {
              initLoader();
            } else {
              initLoaderShort();
            }
          });;
        },
        async leave(data) {
          await commonLeaveBeforeOffset(data);
          await delay(transitionOffset);
          await commonLeaveAfterOffset(data);
        },
        async enter(data) {
          await commonEnter(data);
        },
        async beforeEnter(data) {
          await commonBeforeEnter(data);
        },
        async afterEnter(data) {
          await commonAfterEnter(data);
        }
      }]
    });

    function initSmoothScroll(container) {
      initLenis();
      ScrollTrigger.refresh();
    }

    // Function to kill all ScrollTrigger data
    function killAllScrollTriggers() {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.killAll(); // Kill all ScrollTrigger instances
      }
    }

    // Reset scroll on page next
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }

  function initLenis() {

    // Check if we're on members page - skip Lenis initialization
    const mainElement = document.querySelector('main[data-barba-namespace="members"]');
    if (mainElement) {
      console.log('[Lenis] Skipping initialization for members page');
      return;
    }

    console.log('[Lenis] Initializing smooth scroll');

    // Lenis: https://github.com/studio-freight/lenis
    lenis = new Lenis({
      // duration: 1,
      lerp: 0.165,
      wheelMultiplier: 1.25,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Add Lenis classes to html for proper styling
    document.documentElement.classList.add('lenis', 'lenis-smooth');

    console.log('[Lenis] Initialization complete');
  }

  // Don't touch
  function delay(n) {
    n = n || 2000;
    return new Promise((done) => {
      setTimeout(() => {
        done();
      }, n);
    });
  }

  /**
   * Fire all scripts on page load
   */
  function initScript() {
    console.log('[Main] initScript starting...');
    initCheckWindowHeight();
    initBasicFunctions();
    initStackedCardsDrag();
    initSunnyFollowMouse();
    initLenisCheckScrollUpDown();
    initScrollToAnchorLenis();
    initCSSMarquee();
    initStickyCursor();
    initAccordionCSS();
    initMembersFilter();
  }

  /**
   * Reset Webflow
   */
  function initResetWebflow(data) {
    let parser = new DOMParser();
    let dom = parser.parseFromString(data.next.html, "text/html");
    let webflowPageId = dom.querySelector("html").getAttribute('data-wf-page');
    document.documentElement.setAttribute('data-wf-page', webflowPageId);
    window.Webflow.destroy();
    window.Webflow.ready();
    // window.Webflow.require("ix2").init();
  }

  /**
   * Update Head Elements (Styles & Title)
   */
  function updateHead(data) {
    const parser = new DOMParser();
    const nextDoc = parser.parseFromString(data.next.html, 'text/html');

    // Update Title
    const title = nextDoc.querySelector('title');
    if (title) {
      document.title = title.textContent;
    }

    // Update Meta Tags (optional but recommended)
    // ... (can implement if needed)

    // Update Stylesheets
    const nextLinks = nextDoc.querySelectorAll('link[rel="stylesheet"]');
    nextLinks.forEach(nextLink => {
      const href = nextLink.getAttribute('href');
      // Check if this stylesheet is already in the document
      if (!document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) {
        console.log('[Barba] Injecting new stylesheet:', href);
        const newLink = document.createElement('link');
        newLink.rel = 'stylesheet';
        newLink.type = 'text/css';
        newLink.href = href;
        document.head.appendChild(newLink);
      }
    });
  }

  /**
   * Barba Update Links outside Main on page Transition
   */
  function initBarbaNavUpdate(data) {

    // Parse the incoming HTML string and copy attributes for elements marked with
    // `data-barba-update` from the next page into the current page.
    const parser = new DOMParser();
    const dom = parser.parseFromString(data.next.html, 'text/html');
    const updateItems = Array.from(dom.querySelectorAll('[data-barba-update]'));

    document.querySelectorAll('[data-barba-update]').forEach(function (el, index) {
      const newItem = updateItems[index];
      if (newItem) {
        const newLinkStatus = newItem.getAttribute('data-link-status');
        if (newLinkStatus !== null) el.setAttribute('data-link-status', newLinkStatus);
      }
    });
  }

  /**
   * Window Inner Height Check
   */
  function initCheckWindowHeight() {
    // https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh-in-px', `${vh}px`);
  }

  /**
   * Basic Functions
   */
  function initBasicFunctions() {

    // Toggle YT Modal
    document.querySelectorAll('[data-yt-modal-toggle="toggle"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const statusEl = document.querySelector('[data-yt-modal-status]');
        if (!statusEl) return;
        const status = statusEl.getAttribute('data-yt-modal-status');
        if (status === 'not-active') {
          statusEl.setAttribute('data-yt-modal-status', 'active');
          if (lenis && typeof lenis.stop === 'function') lenis.stop();
        } else {
          statusEl.setAttribute('data-yt-modal-status', 'not-active');
          if (lenis && typeof lenis.start === 'function') lenis.start();
        }
      });
    });

    // Close YT Modal
    document.querySelectorAll('[data-yt-modal-toggle="close"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const statusEl = document.querySelector('[data-yt-modal-status]');
        if (statusEl) statusEl.setAttribute('data-yt-modal-status', 'not-active');
        if (lenis && typeof lenis.start === 'function') lenis.start();

        // Stop YouTube iframe by resetting their src
        document.querySelectorAll('iframe[src*="youtube.com"]').forEach(function (iframe) {
          const src = iframe.getAttribute('src');
          iframe.setAttribute('src', '');
          // re-add on next tick to ensure playback stops
          setTimeout(() => iframe.setAttribute('src', src), 0);
        });
      });
    });

    // Key ESC - Close YT Modal
    document.addEventListener('keydown', function (e) {
      const key = e.key || e.keyCode;
      if (key === 'Escape' || key === 'Esc' || key === 27) {
        const statusEl = document.querySelector('[data-yt-modal-status]');
        if (statusEl && statusEl.getAttribute('data-yt-modal-status') === 'active') {
          statusEl.setAttribute('data-yt-modal-status', 'not-active');
          if (lenis && typeof lenis.start === 'function') lenis.start();

          document.querySelectorAll('iframe[src*="youtube.com"]').forEach(function (iframe) {
            const src = iframe.getAttribute('src');
            iframe.setAttribute('src', '');
            setTimeout(() => iframe.setAttribute('src', src), 0);
          });
        }
      }
    });

    // Show and hide Sunny on Scroll
    gsap.set(".sunny-fixed", { xPercent: -200 });
    ScrollTrigger.create({
      trigger: ".welcome__col-sun",
      start: "bottom top",
      endTrigger: ".footer",
      end: "top bottom",
      onToggle: self => {
        gsap.to(".sunny-fixed", {
          xPercent: self.isActive ? 0 : -200,
          duration: 1.2,
          ease: "expo.inOut"
        });
      }
    });

    // Fixed Sunny Text on Hover
    gsap.set(".sunny-fixed .chat-cloud", { autoAlpha: 0 });

    const sunnyCloudP = document.querySelector('.sunny-fixed .chat-cloud__p');
    const sunnyCloud = document.querySelector('.sunny-fixed .chat-cloud');

    function showText() {
      if (sunnyCloudP) gsap.set(sunnyCloudP, { text: '...' });
      if (sunnyCloud) gsap.to(sunnyCloud, { duration: 0.2, autoAlpha: 1, ease: 'none' });
      if (sunnyCloudP) gsap.to(sunnyCloudP, { duration: 0.5, text: sunTransformText, ease: 'none', delay: 0.3 });
    }

    function hideText() {
      if (sunnyCloudP) gsap.to(sunnyCloudP, { duration: 0.3, text: '...', ease: 'none' });
      if (sunnyCloud) gsap.to(sunnyCloud, { duration: 0.2, autoAlpha: 0, ease: 'none', delay: 0.3 });
    }

    // desktop: hover in/out
    document.querySelectorAll('.sunny-fixed .sun-chat-combo').forEach(function (el) {
      el.addEventListener('mouseenter', showText);
      el.addEventListener('mouseleave', hideText);
      // mobile/touch: tap to show
      el.addEventListener('click', function (e) { e.stopPropagation(); showText(); });
      el.addEventListener('touchstart', function (e) { e.stopPropagation(); showText(); });
    });

    // tap outside to hide
    ['click', 'touchstart'].forEach(evt => {
      document.addEventListener(evt, function (e) {
        if (!e.target.closest || !document.querySelector('.sunny-fixed .sun-chat-combo')) return;
        if (!e.target.closest('.sunny-fixed .sun-chat-combo')) hideText();
      });
    });

    gsap.fromTo(document.querySelectorAll('.footer .sun'), { yPercent: 50 }, {
      yPercent: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: document.querySelector('.footer'),
        start: 'top bottom',
        end: 'bottom bottom',
        scrub: true
      }
    });

    document.querySelectorAll('.about__tile').forEach(function (tile) {
      let triggerElement = tile;
      let targetElementGroup = tile.querySelector('.rotate-circle__list');
      let targetElementSingle = tile.querySelector('.rotate-circle__image');
      const rotateMin = -15;
      const rtatePlus = 15;

      let tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerElement,
          start: '0% 100%',
          end: '100% 0%',
          scrub: 0
        }
      });

      tl.fromTo(targetElementGroup, { rotate: rtatePlus }, { rotate: rotateMin, ease: 'linear' });
      tl.fromTo(targetElementSingle, { rotate: rotateMin }, { rotate: rtatePlus, ease: 'linear' }, '<');
    });
  }

  /**
   * Stacked Cards with Drag
   */
  function initStackedCardsDrag() {
    if (typeof Draggable === 'undefined') {
      console.warn('[Main] Draggable not found, skipping stacked cards init');
      return;
    }

    document.querySelectorAll('[data-stacked-cards]').forEach(function (container) {

      // animation presets
      let easeBeforeRelease = { duration: 0.2, ease: 'Power2.easeOut' };
      let easeAfterRelease = { duration: 1, ease: 'elastic.out(1,0.75)' };
      let activeDeg = '3deg';
      let inactiveDeg = '-3deg';

      const list = container.querySelector('[data-stacked-cards-list]');

      // Skip if list element doesn't exist
      if (!list) return;

      // Draggable instances & cached elements
      let dragFirst, dragSecond;
      let firstItem, secondItem, firstEl, secondEl;
      let full, t;

      function restack() {
        const items = Array.from(list.querySelectorAll('[data-stacked-cards-item]'));
        items.forEach(it => { it.classList.remove('is--active', 'is--second'); });
        if (items[0]) {
          items[0].style.zIndex = 3;
          items[0].style.transform = `rotate(${activeDeg})`;
          items[0].style.pointerEvents = 'auto';
          items[0].classList.add('is--active');
        }
        if (items[1]) {
          items[1].style.zIndex = 2;
          items[1].style.transform = `rotate(${inactiveDeg})`;
          items[1].style.pointerEvents = 'none';
          items[1].classList.add('is--second');
        }
        if (items[2]) {
          items[2].style.zIndex = 1;
          items[2].style.transform = `rotate(${activeDeg})`;
        }
        items.slice(3).forEach(it => { it.style.zIndex = 0; it.style.transform = `rotate(${inactiveDeg})`; });
      }

      function setupDraggables() {
        restack();

        const items = Array.from(list.querySelectorAll('[data-stacked-cards-item]'));
        firstItem = items[0];
        secondItem = items[1];
        if (!firstItem) return;
        firstEl = firstItem.querySelector('[data-stacked-cards-card]');
        secondEl = secondItem ? secondItem.querySelector('[data-stacked-cards-card]') : null;

        const cardEl = firstItem.querySelector('[data-stacked-cards-card]');
        const width = cardEl ? cardEl.offsetWidth : 0;
        full = width * 1.15;
        t = width * 0.1;

        // kill old Draggables
        if (dragFirst && dragFirst.kill) dragFirst.kill();
        if (dragSecond && dragSecond.kill) dragSecond.kill();

        // --- First card draggable ---
        dragFirst = Draggable.create(firstEl, {
          type: 'x',
          cursor: 'inherit',
          activeCursor: 'inherit',
          onPress() {
            firstItem.querySelector('[data-stacked-cards-card]').classList.add('is--dragging');
          },
          onRelease() {
            firstItem.querySelector('[data-stacked-cards-card]').classList.remove('is--dragging');
          },
          onDrag() {
            let raw = this.x;
            if (Math.abs(raw) > full) {
              const over = Math.abs(raw) - full;
              raw = (raw > 0 ? 1 : -1) * (full + over * 0.1);
            }
            gsap.set(firstEl, { x: raw, rotation: 0 });
          },
          onDragEnd() {
            const x = this.x;
            const dir = x > 0 ? 'right' : 'left';

            // hand control to second card
            this.disable?.();
            if (dragSecond && dragSecond.enable) dragSecond.enable();
            firstItem.style.pointerEvents = 'none';
            if (secondItem) secondItem.style.pointerEvents = 'auto';

            if (Math.abs(x) <= t) {
              gsap.to(firstEl, { x: 0, rotation: 0, ...easeBeforeRelease, onComplete: resetCycle });
            }
            else if (Math.abs(x) <= full) {
              flick(dir, false, x);
            }
            else {
              flick(dir, true);
            }
          }
        })[0];

        // --- Second card draggable ---
        if (secondEl) {
          dragSecond = Draggable.create(secondEl, {
            type: 'x',
            cursor: 'inherit',
            activeCursor: 'inherit',
            onPress() { secondItem.querySelector('[data-stacked-cards-card]').classList.add('is--dragging'); },
            onRelease() { secondItem.querySelector('[data-stacked-cards-card]').classList.remove('is--dragging'); },
            onDrag() {
              let raw = this.x;
              if (Math.abs(raw) > full) {
                const over = Math.abs(raw) - full;
                raw = (raw > 0 ? 1 : -1) * (full + over * 0.2);
              }
              gsap.set(secondEl, { x: raw, rotation: 0 });
            },
            onDragEnd() { gsap.to(secondEl, { x: 0, rotation: 0, ...easeBeforeRelease }); }
          })[0];
        }

        // start with first card active
        dragFirst?.enable?.();
        dragSecond?.disable?.();
        firstItem.style.pointerEvents = 'auto';
        if (secondItem) secondItem.style.pointerEvents = 'none';
      }

      function flick(dir, skipHome = false, releaseX = 0) {
        if (!(dir === 'left' || dir === 'right')) dir = activeDeg === '3deg' ? 'right' : 'left';
        dragFirst?.disable?.();

        const items = Array.from(list.querySelectorAll('[data-stacked-cards-item]'));
        const item = items[0];
        const card = item ? item.querySelector('[data-stacked-cards-card]') : null;
        const exitX = dir === 'right' ? full : -full;

        if (!card) return;

        if (skipHome) {
          const visualX = gsap.getProperty(card, 'x');
          list.appendChild(item);
          [activeDeg, inactiveDeg] = [inactiveDeg, activeDeg];
          restack();
          gsap.fromTo(card, { x: visualX, rotation: 0 }, { x: 0, rotation: 0, ...easeAfterRelease, onComplete: resetCycle });
        } else {
          gsap.fromTo(card, { x: releaseX, rotation: 0 }, {
            x: exitX,
            ...easeBeforeRelease,
            onComplete() {
              gsap.set(card, { x: 0, rotation: 0 });
              list.appendChild(item);
              [activeDeg, inactiveDeg] = [inactiveDeg, activeDeg];
              resetCycle();
              const newCard = item.querySelector('[data-stacked-cards-card]');
              if (newCard) gsap.fromTo(newCard, { x: exitX }, { x: 0, ...easeAfterRelease, onComplete: resetCycle });
            }
          });
        }
      }

      function resetCycle() {
        list.querySelectorAll('[data-stacked-cards-card].is--dragging').forEach(el => el.classList.remove('is--dragging'));
        setupDraggables();
      }

      setupDraggables();

      // "Next" button support
      container.querySelectorAll('[data-stacked-cards="next"]').forEach(btn => btn.addEventListener('click', () => flick()));
    });
  }

  /**
   * Sunny Follow Mouse 
   */
  function initSunnyFollowMouse() {
    const faces = Array.from(document.querySelectorAll('[data-sunny-face]')).map(el => ({
      el,
      setX: gsap.quickTo(el, 'xPercent', { duration: 0.4, ease: 'power3' }),
      setY: gsap.quickTo(el, 'yPercent', { duration: 0.4, ease: 'power3' })
    }));

    window.addEventListener('mousemove', e => {
      const mx = e.clientX;
      const my = e.clientY;

      faces.forEach(face => {
        const r = face.el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const rx = r.width / 2;
        const ry = r.height / 2;

        // delta → raw normalized
        let nx = (mx - cx) / rx;
        let ny = (my - cy) / ry;

        // clamp to circle
        const mag = Math.hypot(nx, ny);
        if (mag > 1) {
          nx /= mag;
          ny /= mag;
        }

        const mappedX = nx * 66;
        const mappedY = ny * 66;

        face.setX(mappedX);
        face.setY(mappedY);
      });
    });
  }


  /**
   * Lenis - Check Scroll up or Down
   */

  function initLenisCheckScrollUpDown() {

    var lastScrollTop = 0;
    var threshold = 50;
    var thresholdTop = 50;

    var scrollHandler = function (e) {
      var nowScrollTop = e.targetScroll;

      if (Math.abs(lastScrollTop - nowScrollTop) >= threshold) {

        // Check Scroll Direction
        if (nowScrollTop > lastScrollTop) {
          document.querySelectorAll('[data-scrolling-direction]').forEach(el => el.setAttribute('data-scrolling-direction', 'down'));
        } else {
          document.querySelectorAll('[data-scrolling-direction]').forEach(el => el.setAttribute('data-scrolling-direction', 'up'));
        }
        lastScrollTop = nowScrollTop;

        // Check if Scroll Started
        if (nowScrollTop > thresholdTop) {
          document.querySelectorAll('[data-scrolling-started]').forEach(el => el.setAttribute('data-scrolling-started', 'true'));
        } else {
          document.querySelectorAll('[data-scrolling-started]').forEach(el => el.setAttribute('data-scrolling-started', 'false'));
        }
      }
    };

    function startCheckScroll() {
      if (lenis) {
        lenis.on('scroll', scrollHandler);
      }
    }

    function stopCheckScroll() {
      if (lenis) {
        lenis.off('scroll', scrollHandler);
      }
    }

    // Initialize the scroll check
    startCheckScroll();

    // Cleanup before leaving the page
    barba.hooks.beforeLeave(() => {
      stopCheckScroll(); // Clean up the scroll event listeners
      lastScrollTop = 0; // Reset scroll tracking data
    });

    // Reinitialize after page transition
    barba.hooks.after(() => {
      startCheckScroll(); // Reattach the scroll event listeners
    });
  }

  /**
   * Lenis - ScrollTo Anchor Links
   */
  function initScrollToAnchorLenis() {
    document.querySelectorAll('[data-anchor-target]').forEach(el => {
      el.addEventListener('click', function (evt) {
        const targetScrollToAnchorLenis = el.getAttribute('data-anchor-target');
        if (!targetScrollToAnchorLenis || !lenis) return;
        lenis.scrollTo(targetScrollToAnchorLenis, {
          easing: (x) => (x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2),
          duration: 1,
          offset: 0
        });
      });
    });
  }

  /**
   * CSS Marquee (Osmo)
   */
  function initCSSMarquee() {
    const pixelsPerSecond = 75; // Set the marquee speed (pixels per second)
    const marquees = document.querySelectorAll('[data-css-marquee]');

    // Duplicate each [data-css-marquee-list] element inside its container
    marquees.forEach(marquee => {
      marquee.querySelectorAll('[data-css-marquee-list]').forEach(list => {
        const duplicate = list.cloneNode(true);
        marquee.appendChild(duplicate);
      });
    });

    // Create an IntersectionObserver to check if the marquee container is in view
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        entry.target.querySelectorAll('[data-css-marquee-list]').forEach(list =>
          list.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused'
        );
      });
    }, { threshold: 0 });

    // Calculate the width and set the animation duration accordingly
    marquees.forEach(marquee => {
      marquee.querySelectorAll('[data-css-marquee-list]').forEach(list => {
        list.style.animationDuration = (list.offsetWidth / pixelsPerSecond) + 's';
        list.style.animationPlayState = 'paused';
      });
      observer.observe(marquee);
    });
  }

  /**
   * Sticky Cursor
   */
  function initStickyCursor() {

    const is_touch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (is_touch) return;

    // percent offsets of the target’s own dimensions
    const offset_x_pct = 8;
    const offset_y_pct = 40;

    const instances = [];

    document.querySelectorAll('[data-sticky-cursor]').forEach(function (container) {
      const target = container.querySelector('[data-sticky-cursor-target]');
      if (!target) return;

      gsap.set(target, { x: 0, y: 0 });

      // initial measure
      const cont_rect = container.getBoundingClientRect();
      const tgt_rect = target.getBoundingClientRect();
      let orig_x = tgt_rect.left - cont_rect.left;
      let orig_y = tgt_rect.top - cont_rect.top;

      let is_inside = false;
      let last_event = null;

      function animate_to(e) {
        const cR = container.getBoundingClientRect();
        const rel_x = e.clientX - cR.left;
        const rel_y = e.clientY - cR.top;

        // current target size
        const tR = target.getBoundingClientRect();
        const target_w = tR.width;
        const target_h = tR.height;

        const offset_x_px = (offset_x_pct / 100) * target_w;
        const offset_y_px = (offset_y_pct / 100) * target_h;

        gsap.to(target, {
          x: rel_x - orig_x + offset_x_px,
          y: rel_y - orig_y + offset_y_px,
          duration: 0.5,
          ease: 'Power3.easeOut',
          overwrite: 'auto'
        });
      }

      container.addEventListener('mouseenter', function (e) {
        is_inside = true;
        last_event = e;
        animate_to(e);
      });
      container.addEventListener('mousemove', function (e) {
        last_event = e;
        animate_to(e);
      });
      container.addEventListener('mouseleave', function () {
        is_inside = false;
        gsap.to(target, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'cubic-default',
          overwrite: 'auto'
        });
      });

      instances.push({
        container: container,
        target: target,
        get orig_x() { return orig_x; },
        set orig_x(v) { orig_x = v; },
        get orig_y() { return orig_y; },
        set orig_y(v) { orig_y = v; },
        is_inside: () => is_inside,
        get_last: () => last_event
      });
    });

    // on scroll, re‐apply last animation if still hovering
    window.addEventListener('scroll', function () {
      instances.forEach(function (inst) {
        if (!inst.is_inside()) return;
        const e = inst.get_last();
        if (!e) return;
        animateOnScrollOrResize(inst, e);
      });
    });

    // on resize, recalc each orig_x/orig_y and re‐apply if needed
    window.addEventListener('resize', function () {
      instances.forEach(function (inst) {
        const cR = inst.container.getBoundingClientRect();
        const tR = inst.target.getBoundingClientRect();
        inst.orig_x = tR.left - cR.left;
        inst.orig_y = tR.top - cR.top;

        if (inst.is_inside()) {
          const e = inst.get_last();
          if (e) animateOnScrollOrResize(inst, e);
        }
      });
    });

    // helper to reuse for scroll & resize
    function animateOnScrollOrResize(inst, e) {
      const cR = inst.container.getBoundingClientRect();
      const rel_x = e.clientX - cR.left;
      const rel_y = e.clientY - cR.top;
      const tR = inst.target.getBoundingClientRect();
      const target_w = tR.width;
      const target_h = tR.height;
      const offset_x_px = (offset_x_pct / 100) * target_w;
      const offset_y_px = (offset_y_pct / 100) * target_h;

      gsap.to(inst.target, {
        x: rel_x - inst.orig_x + offset_x_px,
        y: rel_y - inst.orig_y + offset_y_px,
        duration: 0.5,
        ease: 'Power3.easeOut',
        overwrite: 'auto'
      });
    }
  }

  /**
   * Accordion CSS (Osmo)
   */
  function initAccordionCSS() {
    document.querySelectorAll('[data-accordion-css-init]').forEach((accordion) => {
      const closeSiblings = accordion.getAttribute('data-accordion-close-siblings') === 'true';

      accordion.addEventListener('click', (event) => {
        const toggle = event.target.closest('[data-accordion-toggle]');
        if (!toggle) return; // Exit if the clicked element is not a toggle

        const singleAccordion = toggle.closest('[data-accordion-status]');
        if (!singleAccordion) return; // Exit if no accordion container is found

        const isActive = singleAccordion.getAttribute('data-accordion-status') === 'active';
        singleAccordion.setAttribute('data-accordion-status', isActive ? 'not-active' : 'active');

        // When [data-accordion-close-siblings="true"]
        if (closeSiblings && !isActive) {
          accordion.querySelectorAll('[data-accordion-status="active"]').forEach((sibling) => {
            if (sibling !== singleAccordion) sibling.setAttribute('data-accordion-status', 'not-active');
          });
        }
      });
    });
  }

  /**
   * Members Filter System
   */
  function initMembersFilter() {
    console.log('[initMembersFilter] Starting initialization...');

    // Query all filter buttons and member cards
    const filterButtons = document.querySelectorAll('[data-filter-category]');
    const memberCards = document.querySelectorAll('.speakers__col');

    console.log('[initMembersFilter] Found', filterButtons.length, 'filter buttons');
    console.log('[initMembersFilter] Found', memberCards.length, 'member cards');

    // Return early if elements don't exist (for other pages)
    if (filterButtons.length === 0 || memberCards.length === 0) {
      console.log('[initMembersFilter] No filter elements found, skipping initialization');
      return;
    }

    // Check if GSAP is available
    const hasGsap = typeof gsap !== 'undefined';
    console.log('[initMembersFilter] GSAP available:', hasGsap);

    // Initialize state variable for current filter
    let currentFilter = 'all';

    // Add filter button click event handlers
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const category = button.getAttribute('data-filter-category');
        console.log('[initMembersFilter] Button clicked:', category);

        // Prevent redundant filtering if same category clicked
        if (category === currentFilter) {
          console.log('[initMembersFilter] Same category, skipping');
          return;
        }

        // Call applyFilter() and updateButtonStates() functions
        applyFilter(category);
        updateButtonStates(button);

        // Update current filter state
        currentFilter = category;
      });
    });

    // Initialize default filter (all)
    applyFilter(currentFilter);
    updateButtonStates(document.querySelector('[data-filter-category="all"]'));

    console.log('[initMembersFilter] Event listeners attached successfully');

    // Implement applyFilter() function
    function applyFilter(category) {
      console.log('[initMembersFilter] Applying filter:', category);

      // Loop through all member cards
      memberCards.forEach(card => {
        // Check card category against selected filter
        const cardCategory = card.getAttribute('data-member-category');
        console.log('[initMembersFilter] Card category:', cardCategory, 'Filter:', category);

        // Show cards matching filter or with category "all"
        const shouldShow = category === 'all' || cardCategory === category || cardCategory === 'all';

        if (shouldShow) {
          showCard(card);
        } else {
          // Hide cards not matching filter
          hideCard(card);
        }
      });
    }

    // Implement showCard() animation function
    function showCard(card) {
      console.log('[initMembersFilter] Showing card');

      if (hasGsap) {
        // Use GSAP to animate opacity from current to 1
        // Animate scale from current to 1
        // Set duration to 0.4s with 'power2.out' easing
        // Reset display and pointer-events on animation start
        gsap.to(card, {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: 'power2.out',
          onStart: () => {
            card.style.display = '';
            card.style.pointerEvents = 'auto';
          }
        });
      } else {
        // Fallback without animation
        card.style.display = '';
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
        card.style.pointerEvents = 'auto';
      }
    }

    // Implement hideCard() animation function
    function hideCard(card) {
      console.log('[initMembersFilter] Hiding card');

      if (hasGsap) {
        // Use GSAP to animate opacity to 0
        // Animate scale to 0.95
        // Set duration to 0.3s with 'power2.in' easing
        // Set display:none and pointer-events:none on animation complete
        gsap.to(card, {
          opacity: 0,
          scale: 0.95,
          duration: 0.3,
          ease: 'power2.in',
          onComplete: () => {
            card.style.display = 'none';
            card.style.pointerEvents = 'none';
          }
        });
      } else {
        // Fallback without animation
        card.style.display = 'none';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        card.style.pointerEvents = 'none';
      }
    }

    // Implement updateButtonStates() function
    function updateButtonStates(activeButton) {
      console.log('[initMembersFilter] Updating button states');
      filterButtons.forEach(btn => {
        if (btn === activeButton) {
          // Add is--active class to clicked button
          btn.classList.add('is--active');
          // Update aria-pressed attributes accordingly
          btn.setAttribute('aria-pressed', 'true');
        } else {
          // Remove is--active from other buttons
          btn.classList.remove('is--active');
          // Update aria-pressed attributes accordingly
          btn.setAttribute('aria-pressed', 'false');
        }
      });
    }
  }
});
