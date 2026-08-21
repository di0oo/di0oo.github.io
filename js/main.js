/* =========================================================================
   DIO — PORTFOLIO — MAIN SCRIPT
   -------------------------------------------------------------------------
   Table of contents:
   1.  Artwork data (edit here to add / remove portfolio pieces)
   2.  Preloader
   3.  Navigation (scroll state, mobile menu, active link)
   4.  Starfield canvas (hero background)
   5.  Scroll-reveal (IntersectionObserver)
   6.  Portfolio grid render + series filter
   7.  Lightbox
   8.  Misc (footer year, hero parallax)
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* -----------------------------------------------------------------------
     1. ARTWORK DATA
     To add a new piece: drop a thumbnail in assets/img/thumb/ and a larger
     version in assets/img/full/, then add one object below.
     `series` must be either "geometria" or "cosmos" to match the filter tabs.
     ----------------------------------------------------------------------- */
  const artworks = [
    { series: 'geometria', title: 'Eternal Halo', desc: 'A face divided between relic and radiance, crowned in light.',
      thumb: 'assets/img/thumb/geometria-eternal-halo.webp', full: 'assets/img/full/geometria-eternal-halo.webp' },
    { series: 'geometria', title: 'Ascension', desc: 'Geometry as growth — a figure rebuilt in colour and shape.',
      thumb: 'assets/img/thumb/geometria-ascension.webp', full: 'assets/img/full/geometria-ascension.webp' },
    { series: 'geometria', title: 'Divine Mind', desc: 'Fragmented symbols mapping the inside of a thought.',
      thumb: 'assets/img/thumb/geometria-divine-mind.webp', full: 'assets/img/full/geometria-divine-mind.webp' },
    { series: 'geometria', title: 'Soul Spectrum', desc: 'A portrait rendered in the full range of a single feeling.',
      thumb: 'assets/img/thumb/geometria-soul-spectrum.webp', full: 'assets/img/full/geometria-soul-spectrum.webp' },
    { series: 'geometria', title: 'Astral Rift', desc: 'Where a face splits open into something wider than itself.',
      thumb: 'assets/img/thumb/geometria-astral-rift.webp', full: 'assets/img/full/geometria-astral-rift.webp' },
    { series: 'geometria', title: 'Eternal Light', desc: 'Warmth held inside a cool, patterned architecture.',
      thumb: 'assets/img/thumb/geometria-eternal-light.webp', full: 'assets/img/full/geometria-eternal-light.webp' },
    { series: 'geometria', title: 'Geometria Soul', desc: 'The series namesake — pattern as identity.',
      thumb: 'assets/img/thumb/geometria-geometria-soul.webp', full: 'assets/img/full/geometria-geometria-soul.webp' },
    { series: 'geometria', title: 'Eternal Symmetry', desc: 'Balance built from mismatched, hand-placed pieces.',
      thumb: 'assets/img/thumb/geometria-eternal-symmetry.webp', full: 'assets/img/full/geometria-eternal-symmetry.webp' },
    { series: 'geometria', title: 'Infinite Consciousness', desc: 'Layers of colour standing in for layers of thought.',
      thumb: 'assets/img/thumb/geometria-infinite-consciousness.webp', full: 'assets/img/full/geometria-infinite-consciousness.webp' },
    { series: 'geometria', title: 'Divine Essence', desc: 'A quieter study in symbol, texture and restraint.',
      thumb: 'assets/img/thumb/geometria-divine-essence.webp', full: 'assets/img/full/geometria-divine-essence.webp' },
    { series: 'geometria', title: 'Dimensional Soul', desc: 'A figure caught mid-shift between two versions of itself.',
      thumb: 'assets/img/thumb/geometria-dimensional-soul.webp', full: 'assets/img/full/geometria-dimensional-soul.webp' },
    { series: 'geometria', title: 'Primordial Self', desc: 'The earliest pattern beneath every later one.',
      thumb: 'assets/img/thumb/geometria-primordial-self.webp', full: 'assets/img/full/geometria-primordial-self.webp' },
    { series: 'geometria', title: 'Void', desc: 'Stripped back to the shapes that hold everything else up.',
      thumb: 'assets/img/thumb/geometria-void.webp', full: 'assets/img/full/geometria-void.webp' },

    { series: 'cosmos', title: 'Red Planet', desc: 'A lone figure walking toward a threshold beneath a giant world.',
      thumb: 'assets/img/thumb/cosmos-red-planet.webp', full: 'assets/img/full/cosmos-red-planet.webp' },
    { series: 'cosmos', title: 'Forsaken Monument', desc: 'What remains standing long after the builders are gone.',
      thumb: 'assets/img/thumb/cosmos-forsaken-monument.webp', full: 'assets/img/full/cosmos-forsaken-monument.webp' },
    { series: 'cosmos', title: 'Spaceship', desc: 'A quiet machine, dwarfed by the scale of where it is headed.',
      thumb: 'assets/img/thumb/cosmos-spaceship.webp', full: 'assets/img/full/cosmos-spaceship.webp' },
    { series: 'cosmos', title: 'The Gatewatch', desc: 'Something ancient, still keeping watch over the doorway.',
      thumb: 'assets/img/thumb/cosmos-the-gatewatch.webp', full: 'assets/img/full/cosmos-the-gatewatch.webp' },
    { series: 'cosmos', title: 'Into the Portal', desc: 'The moment right before stepping through to somewhere else.',
      thumb: 'assets/img/thumb/cosmos-into-the-portal.webp', full: 'assets/img/full/cosmos-into-the-portal.webp' },
    { series: 'cosmos', title: 'Whispering Void', desc: 'Empty space that somehow still feels like it is speaking.',
      thumb: 'assets/img/thumb/cosmos-whispering-void.webp', full: 'assets/img/full/cosmos-whispering-void.webp' },
    { series: 'cosmos', title: 'Desolate Cosmos', desc: 'Stillness across a landscape with no one left to see it.',
      thumb: 'assets/img/thumb/cosmos-desolate-cosmos.webp', full: 'assets/img/full/cosmos-desolate-cosmos.webp' },
    { series: 'cosmos', title: 'Tower of Calamities', desc: 'A structure built from everything that went wrong.',
      thumb: 'assets/img/thumb/cosmos-tower-of-calamities.webp', full: 'assets/img/full/cosmos-tower-of-calamities.webp' },
    { series: 'cosmos', title: 'Menhirs', desc: 'Old stones, older stories, standing in for both.',
      thumb: 'assets/img/thumb/cosmos-menhirs.webp', full: 'assets/img/full/cosmos-menhirs.webp' },
    { series: 'cosmos', title: 'The Light of the Stars', desc: 'Distant light reaching a landscape it will never touch.',
      thumb: 'assets/img/thumb/cosmos-the-light-of-the-stars.webp', full: 'assets/img/full/cosmos-the-light-of-the-stars.webp' },
  ];

  /* -----------------------------------------------------------------------
     2. PRELOADER
     ----------------------------------------------------------------------- */
  const preloader = document.getElementById('preloader');
  const hidePreloader = () => {
    preloader.classList.add('is-hidden');
    document.body.classList.remove('no-scroll');
  };
  document.body.classList.add('no-scroll');
  window.addEventListener('load', () => {
    // small extra delay so the draw-on animation gets to finish gracefully
    setTimeout(hidePreloader, 700);
  });
  // safety net in case 'load' never fires cleanly
  setTimeout(hidePreloader, 3500);

  /* -----------------------------------------------------------------------
     3. NAVIGATION
     ----------------------------------------------------------------------- */
  const nav = document.getElementById('siteNav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.classList.toggle('is-active', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
    document.body.classList.toggle('no-scroll', isOpen);
  });

  document.querySelectorAll('[data-nav-link]').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navToggle.classList.remove('is-active');
      document.body.classList.remove('no-scroll');
    });
  });

  /* -----------------------------------------------------------------------
     4. STARFIELD CANVAS — signature ambient background for the hero
     ----------------------------------------------------------------------- */
  const canvas = document.getElementById('starfield');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let stars = [];
    let mouse = { x: null, y: null };
    let rafId;

    function resize() {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      const count = Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 9000);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: (Math.random() * 1.3 + 0.3) * devicePixelRatio,
        baseAlpha: Math.random() * 0.6 + 0.2,
        drift: (Math.random() - 0.5) * 0.06,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = Date.now() * 0.001;

      stars.forEach(s => {
        s.y += s.drift;
        if (s.y > canvas.height) s.y = 0;
        if (s.y < 0) s.y = canvas.height;

        const twinkle = s.baseAlpha + Math.sin(t + s.x) * 0.15;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(236,232,222,${Math.max(0, twinkle)})`;
        ctx.fill();
      });

      // faint constellation lines near the pointer
      if (mouse.x !== null) {
        stars.forEach(s => {
          const dx = s.x - mouse.x;
          const dy = s.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140 * devicePixelRatio) {
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(232,178,61,${0.22 * (1 - dist / (140 * devicePixelRatio))})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      }

      rafId = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) * devicePixelRatio;
      mouse.y = (e.clientY - rect.top) * devicePixelRatio;
    });
    window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
  }

  /* -----------------------------------------------------------------------
     5. SCROLL-REVEAL
     ----------------------------------------------------------------------- */
  const revealTargets = document.querySelectorAll('[data-reveal], [data-reveal-stagger], .tool-card');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealTargets.forEach(el => io.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('is-visible'));
  }

  /* -----------------------------------------------------------------------
     6. PORTFOLIO GRID — render + filter
     ----------------------------------------------------------------------- */
  const grid = document.getElementById('workGrid');
  const tabs = document.querySelectorAll('#seriesTabs button');
  let activeFilter = 'all';

  function cardTemplate(art, index) {
    const div = document.createElement('div');
    div.className = 'work-card';
    div.dataset.series = art.series;
    div.dataset.index = index;
    div.setAttribute('tabindex', '0');
    div.setAttribute('role', 'button');
    div.setAttribute('aria-label', `Open ${art.title}`);
    div.innerHTML = `
      <img src="${art.thumb}" alt="${art.title} — ${art.series} series illustration by Dio" loading="lazy" width="560" height="700">
      <span class="work-card-expand">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/></svg>
      </span>
      <div class="work-card-info">
        <span class="series-tag">${art.series}</span>
        <h3>${art.title}</h3>
      </div>
    `;
    div.addEventListener('click', () => openLightbox(index));
    div.addEventListener('keypress', (e) => { if (e.key === 'Enter') openLightbox(index); });
    return div;
  }

  function renderGrid() {
    grid.innerHTML = '';
    artworks.forEach((art, i) => grid.appendChild(cardTemplate(art, i)));
    applyFilter(activeFilter, false);
  }

  function applyFilter(filter, animate = true) {
    activeFilter = filter;
    const cards = grid.querySelectorAll('.work-card');
    cards.forEach(card => {
      const match = filter === 'all' || card.dataset.series === filter;
      if (animate) {
        card.style.transition = 'opacity .35s ease, transform .35s ease';
      }
      if (match) {
        card.style.display = '';
        requestAnimationFrame(() => {
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
        });
      } else {
        card.style.opacity = '0';
        card.style.transform = 'scale(.96)';
        setTimeout(() => { if (activeFilter === filter) card.style.display = 'none'; }, animate ? 320 : 0);
      }
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      applyFilter(tab.dataset.filter);
    });
  });

  renderGrid();

  /* -----------------------------------------------------------------------
     7. LIGHTBOX
     ----------------------------------------------------------------------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxSeries = document.getElementById('lightboxSeries');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    updateLightbox();
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }

  function updateLightbox() {
    const art = artworks[currentIndex];
    lightboxImg.src = art.full;
    lightboxImg.alt = `${art.title} — full view`;
    lightboxTitle.textContent = art.title;
    lightboxSeries.textContent = art.series;
  }

  function step(delta) {
    currentIndex = (currentIndex + delta + artworks.length) % artworks.length;
    updateLightbox();
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => step(-1));
  lightboxNext.addEventListener('click', () => step(1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  /* -----------------------------------------------------------------------
     8. MISC
     ----------------------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // gentle parallax tilt on the hero artwork
  const heroArt = document.querySelector('.hero-art img');
  if (heroArt && !prefersReducedMotion) {
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      heroArt.style.transform = `scale(1.04) translate(${x * -0.4}px, ${y * -0.4}px)`;
    });
  }

});
