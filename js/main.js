/* =========================================================================
   DIORZAKARIA - SURREALIST ARTIST - MAIN SCRIPT
   -------------------------------------------------------------------------
   1.  Artwork data  (edit here to add / remove / reorder plates)
   2.  Helpers & shared state
   3.  Text splitting
   4.  Preloader
   5.  Fog (WebGL) + motes (2D)
   6.  Hero (name, doorway, lantern, worlds)
   7.  Navigation, progress, chapter index
   8.  Reveals, manifesto, counters, parallax, marquee
   9.  Chapters (pinned horizontal galleries)
   10. Motifs (floating preview)
   11. Lightbox
   12. Cursor
   13. Main loop
   ========================================================================= */
(() => {
  'use strict';

  /* -----------------------------------------------------------------------
     1. ARTWORK DATA
     To add a plate: drop a thumbnail in assets/img/thumb/ and a larger
     version in assets/img/full/, then add one object below.
     `series` must be "geometria" or "cosmos".
     ----------------------------------------------------------------------- */
  const artworks = [
    { series: 'geometria', title: 'Eternal Halo', desc: 'A face divided between relic and radiance, crowned in light.', slug: 'geometria-eternal-halo' },
    { series: 'geometria', title: 'Ascension', desc: 'Geometry as growth: a figure rebuilt in colour and shape.', slug: 'geometria-ascension' },
    { series: 'geometria', title: 'Divine Mind', desc: 'Fragmented symbols mapping the inside of a thought.', slug: 'geometria-divine-mind' },
    { series: 'geometria', title: 'Soul Spectrum', desc: 'A portrait rendered in the full range of a single feeling.', slug: 'geometria-soul-spectrum' },
    { series: 'geometria', title: 'Astral Rift', desc: 'Where a face splits open into something wider than itself.', slug: 'geometria-astral-rift' },
    { series: 'geometria', title: 'Eternal Light', desc: 'Warmth held inside a cool, patterned architecture.', slug: 'geometria-eternal-light' },
    { series: 'geometria', title: 'Geometria Soul', desc: 'The series namesake: pattern as identity.', slug: 'geometria-geometria-soul' },
    { series: 'geometria', title: 'Eternal Symmetry', desc: 'Balance built from mismatched, hand-placed pieces.', slug: 'geometria-eternal-symmetry' },
    { series: 'geometria', title: 'Infinite Consciousness', desc: 'Layers of colour standing in for layers of thought.', slug: 'geometria-infinite-consciousness' },
    { series: 'geometria', title: 'Divine Essence', desc: 'A quieter study in symbol, texture and restraint.', slug: 'geometria-divine-essence' },
    { series: 'geometria', title: 'Dimensional Soul', desc: 'A figure caught mid-shift between two versions of itself.', slug: 'geometria-dimensional-soul' },
    { series: 'geometria', title: 'Primordial Self', desc: 'The earliest pattern beneath every later one.', slug: 'geometria-primordial-self' },
    { series: 'geometria', title: 'Void', desc: 'Stripped back to the shapes that hold everything else up.', slug: 'geometria-void' },

    { series: 'cosmos', title: 'Red Planet', desc: 'A lone figure walking toward a threshold beneath a giant world.', slug: 'cosmos-red-planet' },
    { series: 'cosmos', title: 'Forsaken Monument', desc: 'What remains standing long after the builders are gone.', slug: 'cosmos-forsaken-monument' },
    { series: 'cosmos', title: 'Spaceship', desc: 'A quiet vessel, dwarfed by the scale of where it is headed.', slug: 'cosmos-spaceship' },
    { series: 'cosmos', title: 'The Gatewatch', desc: 'Something ancient, still keeping watch over the doorway.', slug: 'cosmos-the-gatewatch' },
    { series: 'cosmos', title: 'Into the Portal', desc: 'The moment right before stepping through to somewhere else.', slug: 'cosmos-into-the-portal' },
    { series: 'cosmos', title: 'Whispering Void', desc: 'Empty space that somehow still feels like it is speaking.', slug: 'cosmos-whispering-void' },
    { series: 'cosmos', title: 'Desolate Cosmos', desc: 'Stillness across a landscape with no one left to see it.', slug: 'cosmos-desolate-cosmos' },
    { series: 'cosmos', title: 'Tower of Calamities', desc: 'A structure built from everything that went wrong.', slug: 'cosmos-tower-of-calamities' },
    { series: 'cosmos', title: 'Menhirs', desc: 'Old stones, older stories, standing in for both.', slug: 'cosmos-menhirs' },
    { series: 'cosmos', title: 'The Light of the Stars', desc: 'Distant light reaching a landscape it will never touch.', slug: 'cosmos-the-light-of-the-stars' },
  ];
  artworks.forEach(a => {
    a.thumb = `assets/img/thumb/${a.slug}.webp`;
    a.full = `assets/img/full/${a.slug}.webp`;
  });
  const seriesName = { geometria: 'Geometria', cosmos: 'Cosmos' };

  /* -----------------------------------------------------------------------
     2. HELPERS & SHARED STATE
     ----------------------------------------------------------------------- */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const pad2 = n => String(n).padStart(2, '0');

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const mobileMQ = window.matchMedia('(max-width: 860px)');

  const S = {
    vw: window.innerWidth,
    vh: window.innerHeight,
    y: window.scrollY,
    lastY: window.scrollY,
    vel: 0,
    px: window.innerWidth / 2,
    py: window.innerHeight / 2,
    pnx: 0, pny: 0,         // pointer, -1..1
    plast: 0,               // last pointer move time
    heroVisible: true,
  };

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  window.addEventListener('mousemove', e => {
    S.px = e.clientX; S.py = e.clientY;
    S.pnx = (e.clientX / S.vw) * 2 - 1;
    S.pny = (e.clientY / S.vh) * 2 - 1;
    S.plast = performance.now();
  }, { passive: true });

  /* -----------------------------------------------------------------------
     3. TEXT SPLITTING
     ----------------------------------------------------------------------- */
  // Wraps every word in a masked span so lines can rise into view.
  function splitWordsMasked(el) {
    let wi = 0;
    const walk = node => {
      Array.from(node.childNodes).forEach(ch => {
        if (ch.nodeType === 3) {
          const frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(tok => {
            if (!tok) return;
            if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
            const sw = document.createElement('span'); sw.className = 'sw';
            const inner = document.createElement('span'); inner.style.setProperty('--wi', wi++);
            inner.textContent = tok; sw.appendChild(inner); frag.appendChild(sw);
          });
          node.replaceChild(frag, ch);
        } else if (ch.nodeType === 1 && ch.tagName !== 'BR') walk(ch);
      });
    };
    walk(el);
  }

  // Wraps every word in a span whose opacity is driven by scroll.
  function splitWordsPlain(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = '';
    return words.map((w, i) => {
      const s = document.createElement('span');
      s.className = 'w'; s.setAttribute('aria-hidden', 'true'); s.textContent = w;
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
      return s;
    });
  }

  /* -----------------------------------------------------------------------
     4. PRELOADER
     ----------------------------------------------------------------------- */
  const preloader = $('#preloader');
  const preBar = $('#preloaderBar');
  const heroName = $('#heroName');
  let loaded = false, minTimeDone = false, revealed = false;

  function reveal() {
    if (revealed) return;
    revealed = true;
    preBar.style.transform = 'scaleX(1)';
    setTimeout(() => {
      preloader.classList.add('is-hidden');
      document.body.classList.remove('is-loading');
      heroName.classList.add('is-in');
      setTimeout(() => preloader.classList.add('is-gone'), 1900);
    }, 250);
  }
  const maybeReveal = () => { if (loaded && minTimeDone) reveal(); };

  (function progressTick() {
    let p = 0;
    const id = setInterval(() => {
      p += (loaded ? 0.22 : 0.035) * (1 - p) + 0.004;
      preBar.style.transform = `scaleX(${clamp(p, 0, .96)})`;
      if (revealed) clearInterval(id);
    }, 90);
  })();
  setTimeout(() => { minTimeDone = true; maybeReveal(); }, reduced ? 200 : 2400);
  window.addEventListener('load', () => { loaded = true; window.scrollTo(0, 0); maybeReveal(); });
  setTimeout(() => { loaded = true; minTimeDone = true; reveal(); }, 7000); // safety net

  /* -----------------------------------------------------------------------
     5a. FOG - a slow WebGL smoke that leans toward the pointer
     ----------------------------------------------------------------------- */
  const fog = (() => {
    const canvas = $('#fog');
    const hero = $('#hero');
    const fail = () => { hero.classList.add('no-gl'); if (canvas) canvas.style.display = 'none'; return { render() {}, resize() {} }; };
    if (!canvas) return { render() {}, resize() {} };
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) return fail();

    const vsSrc = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    const fsSrc = `
      #ifdef GL_FRAGMENT_PRECISION_HIGH
      precision highp float;
      #else
      precision mediump float;
      #endif
      uniform vec2 r; uniform float t; uniform vec2 m;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n(vec2 p){
        vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
        return mix(mix(h(i), h(i+vec2(1.,0.)), f.x), mix(h(i+vec2(0.,1.)), h(i+vec2(1.,1.)), f.x), f.y);
      }
      float fbm(vec2 p){
        float v = 0., a = .5;
        for(int i = 0; i < 5; i++){ v += a * n(p); p = p * 2.03 + vec2(1.7, 9.2); a *= .5; }
        return v;
      }
      void main(){
        vec2 p = (gl_FragCoord.xy - .5 * r) / r.y;
        vec2 mm = (m * r - .5 * r) / r.y;
        float d = length(p - mm);
        vec2 q = vec2(fbm(p * 1.4 + vec2(0., t * .025)), fbm(p * 1.4 + vec2(5.2, 1.3) - t * .02));
        // the pointer parts the smoke
        vec2 away = normalize(p - mm + 1e-4) * exp(-d * 2.6) * .35;
        float f = fbm(p * 2.1 + q * 1.9 + away + t * .035);
        vec3 col = mix(vec3(.018, .018, .032), vec3(.085, .085, .19), smoothstep(.15, .85, f));
        col += vec3(.30, .13, .07) * smoothstep(.58, .95, f) * .55;
        col += vec3(.55, .42, .30) * exp(-d * 2.8) * .10 * (f + .35);
        col *= smoothstep(1.25, .15, length(p * vec2(.9, 1.1)));
        col += (h(gl_FragCoord.xy + t) - .5) / 220.;
        gl_FragColor = vec4(col, 1.);
      }`;

    const compile = (type, src) => {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = compile(gl.VERTEX_SHADER, vsSrc), fs = compile(gl.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) return fail();
    const prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return fail();
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(prog, 'r'), uT = gl.getUniformLocation(prog, 't'), uM = gl.getUniformLocation(prog, 'm');

    const SCALE = 0.5;
    const resize = () => {
      const w = Math.max(2, Math.floor(canvas.clientWidth * SCALE));
      const h = Math.max(2, Math.floor(canvas.clientHeight * SCALE));
      canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h);
    };
    resize();

    let mx = 0.5, my = 0.5;
    return {
      resize,
      render(now) {
        const tx = clamp(S.px / S.vw, 0, 1), ty = 1 - clamp(S.py / S.vh, 0, 1);
        mx = lerp(mx, tx, 0.05); my = lerp(my, ty, 0.05);
        gl.uniform2f(uR, canvas.width, canvas.height);
        gl.uniform1f(uT, reduced ? 20 : now * 0.001);
        gl.uniform2f(uM, mx, my);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
    };
  })();

  /* -----------------------------------------------------------------------
     5b. MOTES - drifting dust that shies away from the pointer
     ----------------------------------------------------------------------- */
  const motes = (() => {
    const canvas = $('#motes');
    if (!canvas || reduced) return { draw() {}, resize() {} };
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = 1, list = [];
    const make = () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: (Math.random() * 1.4 + .3) * dpr,
      vx: (Math.random() - .5) * .12 * dpr, vy: (-Math.random() * .22 - .03) * dpr,
      a: Math.random() * .5 + .12, ph: Math.random() * 6.28,
      gold: Math.random() < .25,
    });
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = Math.floor(S.vw * dpr); h = canvas.height = Math.floor(S.vh * dpr);
      const count = clamp(Math.floor((S.vw * S.vh) / 22000), 28, 90);
      list = Array.from({ length: count }, make);
    };
    resize();
    return {
      resize,
      draw(now) {
        ctx.clearRect(0, 0, w, h);
        const px = S.px * dpr, py = S.py * dpr, rad = 150 * dpr;
        for (const m of list) {
          m.x += m.vx + Math.sin(now * .0004 + m.ph) * .12 * dpr;
          m.y += m.vy - S.vel * .02 * dpr;
          const dx = m.x - px, dy = m.y - py, d2 = dx * dx + dy * dy;
          if (d2 < rad * rad) { const d = Math.sqrt(d2) || 1, f = (1 - d / rad) * 1.6 * dpr; m.x += dx / d * f; m.y += dy / d * f; }
          if (m.y < -10) { m.y = h + 10; m.x = Math.random() * w; }
          if (m.y > h + 10) m.y = -10;
          if (m.x < -10) m.x = w + 10; else if (m.x > w + 10) m.x = -10;
          const tw = m.a * (0.65 + 0.35 * Math.sin(now * .0015 + m.ph));
          ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 6.2832);
          ctx.fillStyle = m.gold ? `rgba(217,194,154,${tw})` : `rgba(232,227,214,${tw * .8})`;
          ctx.fill();
        }
      },
    };
  })();

  /* -----------------------------------------------------------------------
     6. HERO
     ----------------------------------------------------------------------- */
  const hero = $('#hero');
  const heroStage = $('.hero-stage');
  const doorway = $('#doorway');
  const doorInner = $('.doorway-inner', doorway);
  const lantern = $('#lantern');
  const worlds = $$('.world');

  // split the name into letters
  const nameInner = $('.hero-name-inner', heroName);
  const letters = 'Diorzakaria'.split('').map((c, i) => {
    const ch = document.createElement('span'); ch.className = 'ch'; ch.style.setProperty('--i', i);
    const inner = document.createElement('i'); inner.textContent = c; ch.appendChild(inner);
    nameInner.appendChild(ch);
    return ch;
  });

  const heroState = { sx: 0, sy: 0, lx: 50, ly: 40 };

  function updateHero(now) {
    const t = now * 0.001;
    // pointer-following tilt of the doorway
    heroState.sx = lerp(heroState.sx, S.pnx, 0.05);
    heroState.sy = lerp(heroState.sy, S.pny, 0.05);
    if (!reduced) {
      doorInner.style.transform =
        `perspective(1100px) rotateY(${(heroState.sx * 5).toFixed(2)}deg) rotateX(${(-heroState.sy * 4).toFixed(2)}deg) translate3d(${(-heroState.sx * 10).toFixed(1)}px, ${(-heroState.sy * 8).toFixed(1)}px, 0)`;
    }

    // lantern: follows the pointer, or wanders on its own when idle
    const r = doorInner.getBoundingClientRect();
    const recent = now - S.plast < 2600;
    let tx, ty;
    if (recent && r.width) {
      tx = ((S.px - r.left) / r.width) * 100; ty = ((S.py - r.top) / r.height) * 100;
    } else {
      tx = 50 + Math.sin(t * .45) * 28; ty = 42 + Math.cos(t * .33) * 22;
    }
    heroState.lx = lerp(heroState.lx, tx, 0.07); heroState.ly = lerp(heroState.ly, ty, 0.07);
    lantern.style.setProperty('--lx', heroState.lx.toFixed(1) + '%');
    lantern.style.setProperty('--ly', heroState.ly.toFixed(1) + '%');

    // each world drifts at its own depth
    worlds.forEach(w => {
      const d = parseFloat(w.dataset.depth) || 1;
      w.style.translate = `${(-heroState.sx * 34 * d).toFixed(1)}px ${(-heroState.sy * 26 * d + S.y * .08 * d).toFixed(1)}px`;
    });

    // letters bend toward the light
    letters.forEach((ch, i) => {
      const rc = ch.getBoundingClientRect();
      const cx = rc.left + rc.width / 2, cy = rc.top + rc.height / 2;
      const dx = (S.px - cx) / (rc.width * 1.7), dy = (S.py - cy) / (rc.height * 1.1);
      const inf = recent || finePointer ? Math.max(0, 1 - Math.hypot(dx, dy)) : 0;
      const idle = reduced ? 0 : Math.sin(t * 1.1 + i * .55) * 3;
      ch.style.setProperty('--ty', (-(inf * inf) * 34 + idle).toFixed(1) + 'px');
      ch.style.setProperty('--sk', (-dx * inf * 9).toFixed(1) + 'deg');
      ch.classList.toggle('is-lit', inf > .5);
    });

    // the stage lifts away as you leave
    const fade = clamp(1 - S.y / (S.vh * .85), 0, 1);
    heroStage.style.transform = `translate3d(0, ${(S.y * .16).toFixed(1)}px, 0)`;
    heroStage.style.opacity = fade.toFixed(3);
  }

  /* -----------------------------------------------------------------------
     7. NAVIGATION, PROGRESS, CHAPTER INDEX
     ----------------------------------------------------------------------- */
  const nav = $('#siteNav');
  const navToggle = $('#navToggle');
  const navLinks = $('#navLinks');
  const progressBar = $('#progressBar');
  const indexLinks = $$('#chapterIndex a');
  const sections = { top: $('#hero'), statement: $('#statement'), geometria: $('#geometria'), cosmos: $('#cosmos'), motifs: $('#motifs'), contact: $('#contact') };

  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('is-open');
    navToggle.classList.toggle('is-active', open);
    navToggle.setAttribute('aria-expanded', open);
    document.body.classList.toggle('no-scroll', open);
  });

  // smooth in-page anchors
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const target = id === '#top' ? document.body : $(id);
    if (!target) return;
    e.preventDefault();
    navLinks.classList.remove('is-open'); navToggle.classList.remove('is-active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
    const y = id === '#top' ? 0 : target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
  });

  function updateChrome() {
    nav.classList.toggle('is-scrolled', S.y > 40);
    const goingDown = S.y > S.lastY + 3, goingUp = S.y < S.lastY - 3;
    if (S.y > 500 && goingDown && !navLinks.classList.contains('is-open')) nav.classList.add('is-hidden');
    else if (goingUp || S.y < 500) nav.classList.remove('is-hidden');

    const max = document.documentElement.scrollHeight - S.vh;
    progressBar.style.transform = `scaleY(${max > 0 ? clamp(S.y / max, 0, 1) : 0})`;

    let current = 'top';
    for (const key in sections) {
      const r = sections[key].getBoundingClientRect();
      if (r.top <= S.vh * .5 && r.bottom > S.vh * .5) current = key;
    }
    indexLinks.forEach(l => l.classList.toggle('is-active', l.dataset.index === current));
  }

  /* -----------------------------------------------------------------------
     8. REVEALS, MANIFESTO, COUNTERS, PARALLAX, MARQUEE
     ----------------------------------------------------------------------- */
  // headline word-masks
  $$('[data-split]').forEach(splitWordsMasked);

  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal], [data-split]').forEach(el => io.observe(el));

  // count-up
  function animateCount(el) {
    const target = parseFloat(el.dataset.count); if (Number.isNaN(target)) return;
    const suffix = el.dataset.suffix || '', pad = parseInt(el.dataset.pad, 10) || 0, dur = 1800, t0 = performance.now();
    const step = now => {
      const p = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = String(Math.round(target * e)).padStart(pad, '0') + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    reduced ? (el.textContent = String(target).padStart(pad, '0') + suffix) : requestAnimationFrame(step);
  }
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { animateCount(en.target); countIO.unobserve(en.target); } });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(el => countIO.observe(el));

  // manifesto: words ignite as you read down the page
  const manifesto = $('#manifesto');
  const manifestoWords = manifesto ? splitWordsPlain(manifesto) : [];
  function updateManifesto() {
    if (!manifestoWords.length) return;
    const r = manifesto.getBoundingClientRect();
    if (r.bottom < -100 || r.top > S.vh + 100) return;
    const p = clamp((S.vh * .82 - r.top) / (r.height + S.vh * .32), 0, 1);
    const n = manifestoWords.length, lit = p * (n + 3);
    manifestoWords.forEach((w, i) => {
      const v = clamp(lit - i, 0, 1);
      w.style.opacity = (.14 + .86 * v).toFixed(3);
      w.classList.toggle('is-lit', v > .6);
    });
  }

  // statement collage parallax
  const statementVisual = $('#statementVisual');
  const parallaxEls = $$('.sv[data-speed]');
  function updateStatement() {
    if (!statementVisual) return;
    const r = statementVisual.getBoundingClientRect();
    if (r.bottom < -200 || r.top > S.vh + 200) return;
    const off = (r.top + r.height / 2) - S.vh / 2;
    parallaxEls.forEach(el => { el.style.transform = `translate3d(0, ${(off * parseFloat(el.dataset.speed)).toFixed(1)}px, 0)`; });
  }

  // marquee - drifts on its own, surges with your scroll
  const marqueeTrack = $('#marqueeTrack');
  let marqueeX = 0, marqueeDir = -1;
  function updateMarquee() {
    if (!marqueeTrack) return;
    const half = marqueeTrack.scrollWidth / 2;
    if (Math.abs(S.vel) > .4) marqueeDir = S.vel > 0 ? -1 : 1;
    marqueeX += marqueeDir * (reduced ? 0 : .55 + Math.abs(S.vel) * .35);
    if (marqueeX <= -half) marqueeX += half;
    if (marqueeX > 0) marqueeX -= half;
    marqueeTrack.style.transform = `translate3d(${marqueeX.toFixed(2)}px,0,0)`;
  }

  /* -----------------------------------------------------------------------
     9. CHAPTERS - pinned horizontal galleries
     ----------------------------------------------------------------------- */
  const SPEED = 1.15; // horizontal px travelled per px scrolled
  const chapters = $$('.chapter').map(sec => {
    const series = sec.dataset.series;
    const track = $('[data-track]', sec);
    const items = artworks.map((a, i) => ({ a, i })).filter(o => o.a.series === series);
    items.forEach((o, n) => {
      const plate = document.createElement('article');
      plate.className = 'plate'; plate.dataset.index = o.i;
      plate.setAttribute('tabindex', '0'); plate.setAttribute('role', 'button');
      plate.setAttribute('aria-label', `Open ${o.a.title}`);
      plate.innerHTML = `
        <div class="plate-frame" data-cursor="View">
          <img src="${o.a.full}" alt="${o.a.title}, ${seriesName[series]} series, surrealist artwork by Diorzakaria" width="1080" height="1350" decoding="async" ${n < 4 ? '' : 'loading="lazy"'}>
        </div>
        <div class="plate-cap"><span class="plate-no">Plate ${pad2(n + 1)}</span><h3>${o.a.title}</h3></div>`;
      plate.addEventListener('click', () => openLightbox(o.i, plate));
      plate.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(o.i, plate); } });
      track.appendChild(plate);
    });
    return {
      sec, track, series,
      plates: $$('.plate', track),
      hudCur: $('[data-hud-current]', sec), hudBar: $('[data-hud-bar]', sec), hudTotal: $('[data-hud-total]', sec),
      dist: 0, range: 1, top: 0, cur: 0, ready: false, lastShown: -1,
    };
  });
  chapters.forEach(c => { if (c.hudTotal) c.hudTotal.textContent = pad2(c.plates.length); });

  const seenIO = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-seen'); seenIO.unobserve(en.target); } });
  }, { threshold: 0.05 });
  chapters.forEach(c => seenIO.observe(c.sec));

  function measureChapters() {
    const mobile = mobileMQ.matches;
    chapters.forEach(c => {
      if (mobile) {
        c.sec.style.height = ''; c.track.style.transform = '';
        c.plates.forEach(p => { p.style.removeProperty('--focus'); p.querySelector('.plate-frame img').style.removeProperty('--px'); });
        c.plates.forEach(p => p.style.removeProperty('--px'));
        c.dist = 0; c.ready = false; return;
      }
      c.track.style.transform = 'translate3d(0,0,0)';
      c.dist = Math.max(0, c.track.scrollWidth - S.vw);
      c.range = Math.max(1, c.dist / SPEED);
      c.sec.style.height = Math.round(c.range + S.vh) + 'px';
      c.top = c.sec.getBoundingClientRect().top + window.scrollY;
      c.ready = true;
    });
  }

  function updateChapters() {
    if (mobileMQ.matches) return;
    chapters.forEach(c => {
      if (!c.ready) return;
      const r = c.sec.getBoundingClientRect();
      if (r.bottom < -S.vh * .3 || r.top > S.vh * 1.3) return;
      const p = clamp(-r.top / c.range, 0, 1);
      const target = p * c.dist;
      c.cur = Math.abs(target - c.cur) < .2 ? target : lerp(c.cur, target, reduced ? 1 : 0.11);
      c.track.style.transform = `translate3d(${(-c.cur).toFixed(2)}px,0,0)`;

      let best = 0, bestF = -1;
      c.plates.forEach((pl, idx) => {
        const pr = pl.getBoundingClientRect();
        if (pr.right < -300 || pr.left > S.vw + 300) { if (pl._f !== 0.18) { pl.style.setProperty('--focus', '0.18'); pl._f = 0.18; } return; }
        const d = ((pr.left + pr.width / 2) - S.vw / 2) / (S.vw * .5);
        const f = clamp(1 - Math.abs(d) * .85, .18, 1);
        pl._f = f;
        pl.style.setProperty('--focus', f.toFixed(3));
        pl.style.setProperty('--px', (clamp(-d * 46, -60, 60)).toFixed(1) + 'px');
        pl.querySelector('.plate-frame').style.setProperty('--px', (clamp(-d * 46, -60, 60)).toFixed(1) + 'px');
        if (f > bestF) { bestF = f; best = idx; }
      });
      if (c.hudCur && c.lastShown !== best) { c.hudCur.textContent = pad2(best + 1); c.lastShown = best; }
      if (c.hudBar) c.hudBar.style.transform = `scaleX(${p.toFixed(4)})`;
    });
  }

  /* -----------------------------------------------------------------------
     10. MOTIFS - a ghost image trails the pointer
     ----------------------------------------------------------------------- */
  const motifList = $('#motifList');
  const motifPreview = $('#motifPreview');
  const motifImg = $('#motifPreviewImg');
  const mp = { x: 0, y: 0, tx: 0, ty: 0, rot: 0 };

  if (motifList) {
    $$('.motif', motifList).forEach(li => {
      const slug = li.dataset.art;
      const idx = artworks.findIndex(a => a.slug === slug);
      li.dataset.cursor = 'Open';
      li.addEventListener('mouseenter', () => {
        if (!finePointer) return;
        motifImg.src = `assets/img/thumb/${slug}.webp`;
        motifPreview.classList.add('is-on');
      });
      li.addEventListener('mouseleave', () => motifPreview.classList.remove('is-on'));
      li.addEventListener('click', () => { if (idx > -1) openLightbox(idx, li); });
      li.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && idx > -1) { e.preventDefault(); openLightbox(idx, li); } });
    });
  }
  function updateMotifPreview() {
    if (!motifPreview || !finePointer) return;
    const w = motifPreview.offsetWidth, h = motifPreview.offsetHeight;
    mp.tx = clamp(S.px + 36, 10, S.vw - w - 10);
    mp.ty = clamp(S.py - h / 2, 10, S.vh - h - 10);
    const px = mp.x;
    mp.x = lerp(mp.x, mp.tx, 0.12); mp.y = lerp(mp.y, mp.ty, 0.12);
    mp.rot = lerp(mp.rot, clamp((mp.x - px) * 1.4, -9, 9), 0.2);
    motifPreview.style.transform = `translate3d(${mp.x.toFixed(1)}px, ${mp.y.toFixed(1)}px, 0) rotate(${mp.rot.toFixed(2)}deg)`;
  }

  /* -----------------------------------------------------------------------
     11. LIGHTBOX
     ----------------------------------------------------------------------- */
  const lb = $('#lightbox'), lbStage = $('#lbStage'), lbImg = $('#lbImg');
  const lbTitle = $('#lbTitle'), lbDesc = $('#lbDesc'), lbMeta = $('#lbMeta'), lbHint = $('.lb-hint');
  let lbIndex = 0, lbOpener = null;
  if (!finePointer && lbHint) lbHint.textContent = 'Swipe to move';

  function plateNumber(i) {
    const s = artworks[i].series;
    return pad2(artworks.filter((a, k) => a.series === s && k <= i).length);
  }
  function fillLightbox(i, instant) {
    const a = artworks[i];
    const apply = () => {
      lbImg.src = a.full; lbImg.alt = `${a.title}, full view`;
      lbTitle.textContent = a.title; lbDesc.textContent = a.desc;
      lbMeta.textContent = `${seriesName[a.series]}, Plate ${plateNumber(i)}`;
    };
    if (instant) { apply(); return; }
    lbStage.classList.add('is-swap');
    setTimeout(() => { apply(); lbImg.onload = () => lbStage.classList.remove('is-swap'); if (lbImg.complete) lbStage.classList.remove('is-swap'); }, 260);
  }
  function openLightbox(i, opener) {
    lbIndex = i; lbOpener = opener || null;
    fillLightbox(i, true);
    lbStage.classList.remove('is-zoomed');
    lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    setTimeout(() => $('#lbClose').focus({ preventScroll: true }), 50);
    [i - 1, i + 1].forEach(k => { const a = artworks[(k + artworks.length) % artworks.length]; new Image().src = a.full; });
  }
  function closeLightbox() {
    lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true');
    lbStage.classList.remove('is-zoomed');
    document.body.classList.remove('no-scroll');
    if (lbOpener) lbOpener.focus({ preventScroll: true });
  }
  function stepLightbox(d) {
    lbIndex = (lbIndex + d + artworks.length) % artworks.length;
    lbStage.classList.remove('is-zoomed');
    fillLightbox(lbIndex, false);
    const nx = artworks[(lbIndex + d + artworks.length) % artworks.length]; new Image().src = nx.full;
  }
  $('#lbClose').addEventListener('click', closeLightbox);
  $('#lbPrev').addEventListener('click', () => stepLightbox(-1));
  $('#lbNext').addEventListener('click', () => stepLightbox(1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
  lbStage.addEventListener('click', () => { if (finePointer) lbStage.classList.toggle('is-zoomed'); });
  lbStage.addEventListener('mousemove', e => {
    if (!lbStage.classList.contains('is-zoomed')) return;
    const r = lbStage.getBoundingClientRect();
    lbImg.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
  });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') stepLightbox(-1);
    if (e.key === 'ArrowRight') stepLightbox(1);
  });
  let touchX = null;
  lb.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX; touchX = null;
    if (Math.abs(dx) > 50) stepLightbox(dx < 0 ? 1 : -1);
  }, { passive: true });

  /* -----------------------------------------------------------------------
     12. CURSOR
     ----------------------------------------------------------------------- */
  const cursor = $('#cursor'), cursorLabel = $('#cursorLabel');
  const cur = { x: S.px, y: S.py };
  if (finePointer && !reduced) {
    document.documentElement.classList.add('has-cursor');
    window.addEventListener('mousemove', () => cursor.classList.add('is-on'), { once: true });
    document.addEventListener('mouseleave', () => cursor.classList.remove('is-on'));
    document.addEventListener('mouseenter', () => cursor.classList.add('is-on'));
    document.addEventListener('mousedown', () => cursor.classList.add('is-down'));
    document.addEventListener('mouseup', () => cursor.classList.remove('is-down'));
    document.addEventListener('mouseover', e => {
      const view = e.target.closest('[data-cursor]');
      const link = e.target.closest('a, button, [role="button"]');
      cursor.classList.toggle('is-view', !!view);
      cursor.classList.toggle('is-link', !view && !!link);
      cursorLabel.textContent = view ? view.dataset.cursor : '';
    });
    // lightbox stage label
    lbStage.dataset.cursor = 'Zoom';
    lbStage.addEventListener('click', () => { lbStage.dataset.cursor = lbStage.classList.contains('is-zoomed') ? 'Out' : 'Zoom'; cursorLabel.textContent = lbStage.dataset.cursor; });

    // magnetic call-to-action
    $$('.nav-cta, .contact-link').forEach(el => {
      const k = el.classList.contains('nav-cta') ? .3 : .0;
      if (!k) return;
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * k).toFixed(1)}px, ${((e.clientY - r.top - r.height / 2) * k).toFixed(1)}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }
  function updateCursor() {
    cur.x = lerp(cur.x, S.px, 0.2); cur.y = lerp(cur.y, S.py, 0.2);
    cursor.style.transform = `translate3d(${cur.x.toFixed(1)}px, ${cur.y.toFixed(1)}px, 0)`;
  }

  /* -----------------------------------------------------------------------
     13. MAIN LOOP
     ----------------------------------------------------------------------- */
  const yearEl = $('#year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

  const heroIO = new IntersectionObserver(en => { S.heroVisible = en[0].isIntersecting; }, { threshold: 0 });
  heroIO.observe(hero);

  function onResize() {
    S.vw = window.innerWidth; S.vh = window.innerHeight;
    fog.resize(); motes.resize(); measureChapters();
  }
  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(onResize, 120); });
  mobileMQ.addEventListener ? mobileMQ.addEventListener('change', onResize) : mobileMQ.addListener(onResize);
  window.addEventListener('load', () => { measureChapters(); setTimeout(measureChapters, 600); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureChapters);
  measureChapters();

  function frame(now) {
    S.y = window.scrollY;
    S.vel = lerp(S.vel, S.y - S.lastY, 0.14);

    if (S.heroVisible) { fog.render(now); updateHero(now); }
    motes.draw(now);
    updateChrome();
    updateMarquee();
    updateManifesto();
    updateStatement();
    updateChapters();
    updateMotifPreview();
    if (finePointer && !reduced) updateCursor();

    S.lastY = S.y;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
