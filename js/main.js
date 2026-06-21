/* =====================================================
   SANGAM TIWARI — Neural Interface v4.0
   Three.js · GSAP · Lenis · Holographic · Scramble
   ===================================================== */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine    = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* =====================================================
     LENIS SMOOTH SCROLL
     ===================================================== */
  let lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothTouch: false,
    });
    (function rafLoop(time) {
      lenis.raf(time);
      requestAnimationFrame(rafLoop);
    })(0);
  }

  /* =====================================================
     GSAP + SCROLLTRIGGER SETUP
     ===================================================== */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(time => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* =====================================================
     TEXT SCRAMBLE
     ===================================================== */
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオカキクケコ#$%@&!?><-_';
  function scrambleTo(el, text, duration, onDone) {
    if (!el) return;
    let startTs = null;
    function frame(ts) {
      if (!startTs) startTs = ts;
      const t = Math.min((ts - startTs) / duration, 1);
      const lockIdx = Math.floor(t * text.length);
      let out = '';
      for (let i = 0; i < text.length; i++) {
        out += i < lockIdx ? text[i] : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      el.textContent = out;
      if (t < 1) requestAnimationFrame(frame);
      else { el.textContent = text; if (onDone) onDone(); }
    }
    requestAnimationFrame(frame);
  }

  function startHeroScramble() {
    const w1 = document.getElementById('hero-w1');
    const w2 = document.getElementById('hero-w2');
    if (reduced) {
      if (w1) w1.textContent = 'SANGAM';
      if (w2) w2.textContent = 'TIWARI';
      return;
    }
    scrambleTo(w1, 'SANGAM', 1300, () => {
      setTimeout(() => scrambleTo(w2, 'TIWARI', 1100), 100);
    });
  }

  /* =====================================================
     LOADER SEQUENCE
     ===================================================== */
  const loader = document.getElementById('loader');
  const ldrLog = document.getElementById('ldr-log');
  const ldrBar = document.getElementById('ldr-bar');
  const ldrPct = document.getElementById('ldr-pct');

  function runLoader() {
    if (!loader) { startHeroScramble(); return; }

    const steps = [
      { text: '▸ loading language model weights...', pct: 22 },
      { text: '▸ connecting to BigQuery pipeline...', pct: 44 },
      { text: '▸ initializing neural renderer...', pct: 66 },
      { text: '▸ calibrating particle dynamics...', pct: 88 },
      { text: '▸ all systems nominal.', pct: 100 },
    ];

    steps.forEach(({ text, pct }, i) => {
      setTimeout(() => {
        const line = document.createElement('div');
        line.className = 'ldr-line';
        line.textContent = text;
        if (ldrLog) ldrLog.appendChild(line);
        if (ldrBar) ldrBar.style.width = pct + '%';
        if (ldrPct) ldrPct.textContent = pct + '%';
        if (pct === 100) {
          const ready = document.getElementById('ldr-ready');
          if (ready) ready.style.opacity = '1';
        }
      }, 380 * (i + 1));
    });

    setTimeout(() => {
      if (loader) loader.classList.add('ldr-out');
      setTimeout(() => {
        if (loader) loader.style.display = 'none';
        startHeroScramble();
      }, 700);
    }, 380 * steps.length + 520);
  }

  runLoader();

  /* =====================================================
     THREE.JS 3D NEURAL NETWORK (fixed full-viewport bg)
     ===================================================== */
  function initThree() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas || !window.THREE) return;

    const { Scene, PerspectiveCamera, WebGLRenderer, BufferGeometry,
            BufferAttribute, Points, PointsMaterial,
            LineSegments, LineBasicMaterial, Group } = THREE;

    const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new Scene();
    const camera = new PerspectiveCamera(55, innerWidth / innerHeight, 1, 2000);
    camera.position.z = 620;

    const group = new Group();
    scene.add(group);

    /* Layered neural-net node positions */
    const LAYERS  = [20, 35, 45, 35, 25];
    const N       = LAYERS.reduce((a, b) => a + b, 0);
    const LAYER_X = [-310, -155, 0, 155, 310];
    const LAYER_RGB = [
      [0.37, 0.91, 1.00],  // cyan  — input
      [0.56, 0.52, 0.98],  // violet-blue
      [0.55, 0.36, 0.96],  // purple — hidden
      [0.56, 0.52, 0.98],  // violet-blue
      [1.00, 0.71, 0.33],  // amber  — output
    ];

    const nodePos  = new Float32Array(N * 3);
    const nodeCols = new Float32Array(N * 3);
    let ni = 0;
    LAYERS.forEach((cnt, li) => {
      for (let k = 0; k < cnt; k++) {
        nodePos[ni * 3]     = LAYER_X[li] + (Math.random() - 0.5) * 70;
        nodePos[ni * 3 + 1] = (Math.random() - 0.5) * 520;
        nodePos[ni * 3 + 2] = (Math.random() - 0.5) * 180;
        const [r, g, b] = LAYER_RGB[li];
        nodeCols[ni * 3]     = r + (Math.random() - 0.5) * 0.12;
        nodeCols[ni * 3 + 1] = g + (Math.random() - 0.5) * 0.12;
        nodeCols[ni * 3 + 2] = b + (Math.random() - 0.5) * 0.12;
        ni++;
      }
    });

    const nodeGeo = new BufferGeometry();
    nodeGeo.setAttribute('position', new BufferAttribute(nodePos, 3));
    nodeGeo.setAttribute('color',    new BufferAttribute(nodeCols, 3));
    group.add(new Points(nodeGeo, new PointsMaterial({
      size: 3.2, vertexColors: true, transparent: true, opacity: 0.72, sizeAttenuation: true,
    })));

    /* Sparse connections between adjacent layers */
    const MAX_LINES = 5000;
    const linePos   = new Float32Array(MAX_LINES * 6);
    let lc = 0, cursor = 0;
    LAYERS.forEach((cnt, li) => {
      if (li === LAYERS.length - 1) { cursor += cnt; return; }
      const fStart = cursor, fEnd = cursor + cnt;
      const tStart = cursor + cnt, tEnd = tStart + LAYERS[li + 1];
      for (let fi = fStart; fi < fEnd; fi++) {
        let conn = 0;
        for (let ti = tStart; ti < tEnd && conn < 4 && lc < MAX_LINES; ti++) {
          if (Math.random() < 0.38) {
            const idx = lc * 6;
            linePos[idx]     = nodePos[fi * 3];     linePos[idx + 1] = nodePos[fi * 3 + 1]; linePos[idx + 2] = nodePos[fi * 3 + 2];
            linePos[idx + 3] = nodePos[ti * 3];     linePos[idx + 4] = nodePos[ti * 3 + 1]; linePos[idx + 5] = nodePos[ti * 3 + 2];
            lc++; conn++;
          }
        }
      }
      cursor += cnt;
    });

    const lineGeo = new BufferGeometry();
    lineGeo.setAttribute('position', new BufferAttribute(linePos, 3));
    lineGeo.setDrawRange(0, lc * 2);
    group.add(new LineSegments(lineGeo, new LineBasicMaterial({ color: 0x5EE7FF, transparent: true, opacity: 0.09 })));

    /* Mouse parallax */
    let mx = 0, my = 0, camX = 0, camY = 0;
    document.addEventListener('mousemove', e => {
      mx = (e.clientX / innerWidth  - 0.5) * 2;
      my = (e.clientY / innerHeight - 0.5) * 2;
    });

    (function tick() {
      group.rotation.y += 0.00045;
      group.rotation.x += 0.00018;
      camX += (mx * 45 - camX) * 0.028;
      camY += (-my * 28 - camY) * 0.028;
      camera.position.x = camX;
      camera.position.y = camY;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    })();

    addEventListener('resize', () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    });
  }

  initThree();

  /* =====================================================
     IST CLOCK
     ===================================================== */
  const clock1 = document.getElementById('ist-clock');
  const clock2 = document.getElementById('ist-clock-2');
  const tickClock = () => {
    const t = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false });
    if (clock1) clock1.textContent = t + ' IST';
    if (clock2) clock2.textContent = t;
  };
  tickClock();
  setInterval(tickClock, 1000);

  /* =====================================================
     SCROLL PROGRESS BAR
     ===================================================== */
  const progressBar = document.querySelector('.scroll-progress');
  if (progressBar) {
    document.addEventListener('scroll', () => {
      const h = document.documentElement;
      progressBar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
    }, { passive: true });
  }

  /* =====================================================
     CUSTOM CURSOR + PARTICLE TRAIL
     ===================================================== */
  const curDot  = document.querySelector('.cursor-dot');
  const curRing = document.querySelector('.cursor-ring');

  if (fine && !reduced) {
    let curMx = innerWidth / 2, curMy = innerHeight / 2, rx = curMx, ry = curMy;
    addEventListener('mousemove', e => { curMx = e.clientX; curMy = e.clientY; });

    (function cursorLoop() {
      rx += (curMx - rx) * 0.16;
      ry += (curMy - ry) * 0.16;
      if (curDot)  curDot.style.transform  = `translate(${curMx}px,${curMy}px) translate(-50%,-50%)`;
      if (curRing) curRing.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(cursorLoop);
    })();

    document.querySelectorAll('a,button,.chip,.stage-card,.project-card').forEach(el => {
      el.addEventListener('mouseenter', () => curRing && curRing.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => curRing && curRing.classList.remove('is-hover'));
    });

    /* snake particle trail */
    const TRAIL_N = 10;
    const trails  = Array.from({ length: TRAIL_N }, (_, i) => {
      const el = document.createElement('div');
      el.className = 'trail-dot';
      const sz = 3.8 - i * 0.28;
      el.style.cssText = `width:${sz}px;height:${sz}px;opacity:${((1 - i / TRAIL_N) * 0.7).toFixed(2)}`;
      document.body.appendChild(el);
      return { el, x: curMx, y: curMy };
    });

    (function trailLoop() {
      let px = curMx, py = curMy;
      trails.forEach(t => {
        t.x += (px - t.x) * 0.38;
        t.y += (py - t.y) * 0.38;
        t.el.style.transform = `translate(${t.x}px,${t.y}px) translate(-50%,-50%)`;
        px = t.x; py = t.y;
      });
      requestAnimationFrame(trailLoop);
    })();
  } else {
    if (curDot)  curDot.remove();
    if (curRing) curRing.remove();
  }

  /* =====================================================
     TERMINAL TYPING
     ===================================================== */
  const termEl   = document.getElementById('term-typed');
  const termText = 'python gangajal_pipeline.py --source calls --extract signal';
  if (termEl) {
    if (reduced) { termEl.textContent = termText; }
    else {
      let i = 0;
      (function typeTerm() {
        if (i <= termText.length) { termEl.textContent = termText.slice(0, i++); setTimeout(typeTerm, 34); }
      })();
    }
  }

  /* =====================================================
     ROLE TYPING
     ===================================================== */
  const roleEl = document.getElementById('role-typed');
  const roles  = ['AI & Data Engineer', 'LLM Pipeline Builder', 'ML Enthusiast', 'Problem Solver'];
  if (roleEl) {
    if (reduced) { roleEl.textContent = roles[0]; }
    else {
      let ri = 0, ci = 0, typing = true;
      (function typeRole() {
        const cur = roles[ri];
        roleEl.textContent = cur.slice(0, ci);
        if (typing) {
          if (ci < cur.length) { ci++; setTimeout(typeRole, 75); }
          else { typing = false; setTimeout(typeRole, 1700); }
        } else {
          if (ci > 0) { ci--; setTimeout(typeRole, 32); }
          else { typing = true; ri = (ri + 1) % roles.length; setTimeout(typeRole, 350); }
        }
      })();
    }
  }

  /* =====================================================
     INSIGHT CHIPS
     ===================================================== */
  const chipLayer = document.getElementById('chip-layer');
  const chipTexts = [
    ['sentiment: positive','cyan'],['score: 96.5','amber'],
    ['isl_asked: true','cyan'],['cohort: happy','amber'],
    ['lang: tamil → en','cyan'],['intent: high','amber'],
    ['risk: low','cyan'],['moment_coverage: 0.92','amber'],
    ['drop_off: flagged','amber'],['turns: 148','cyan'],
  ];
  if (chipLayer && !reduced && innerWidth >= 720) {
    setInterval(() => {
      if (document.hidden) return;
      const [txt, tone] = chipTexts[Math.floor(Math.random() * chipTexts.length)];
      const el = document.createElement('span');
      el.className = 'insight-chip' + (tone === 'amber' ? ' amber' : '');
      el.textContent = txt;
      el.style.left = (44 + Math.random() * 44) + '%';
      el.style.top  = (72 + Math.random() * 15) + '%';
      chipLayer.appendChild(el);
      setTimeout(() => el.remove(), 3500);
    }, 1400);
  }

  /* =====================================================
     GSAP SCROLL ANIMATIONS
     ===================================================== */
  if (window.gsap && window.ScrollTrigger && !reduced) {
    const ease = 'power3.out';

    document.querySelectorAll('.section-head').forEach(el =>
      gsap.from(el, { scrollTrigger: { trigger: el, start: 'top 84%' }, y: 55, opacity: 0, duration: 0.9, ease }));

    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      gsap.from('.about-photo', { scrollTrigger: { trigger: aboutSection, start: 'top 76%' }, x: -70, opacity: 0, duration: 1.0, ease });
      gsap.from('.about-copy',  { scrollTrigger: { trigger: aboutSection, start: 'top 76%' }, x:  70, opacity: 0, duration: 1.0, delay: 0.15, ease });
    }

    const statsEl = document.querySelector('.stats');
    if (statsEl)
      gsap.from('.stat', { scrollTrigger: { trigger: statsEl, start: 'top 88%' }, scale: 0.8, opacity: 0, duration: 0.6, stagger: 0.1, ease });

    document.querySelectorAll('.stage').forEach((stage, i) =>
      gsap.from(stage, { scrollTrigger: { trigger: stage, start: 'top 88%' }, x: -55, opacity: 0, duration: 0.8, delay: i * 0.04, ease }));

    const pgrid = document.querySelector('.projects-grid');
    if (pgrid)
      gsap.from('.project-card', { scrollTrigger: { trigger: pgrid, start: 'top 82%' }, y: 80, opacity: 0, duration: 0.75, stagger: 0.1, ease });

    document.querySelectorAll('.skill-row').forEach((row, i) =>
      gsap.from(row, { scrollTrigger: { trigger: row, start: 'top 88%' }, y: 40, opacity: 0, duration: 0.7, delay: i * 0.08, ease }));

    ['.log', '.contact-row'].forEach(sel => {
      const el = document.querySelector(sel);
      if (el) gsap.from(el, { scrollTrigger: { trigger: el, start: 'top 88%' }, y: 40, opacity: 0, duration: 0.8, ease });
    });

  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  }

  /* =====================================================
     COUNT-UP STATS
     ===================================================== */
  const statIO = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      statIO.unobserve(el);
      const target   = parseFloat(el.dataset.count);
      const suffix   = el.dataset.suffix || '';
      const decimals = parseInt(el.dataset.decimals || (Number.isInteger(target) ? 0 : 1));
      if (reduced) { el.textContent = target.toFixed(decimals) + suffix; return; }
      const dur = 1400, t0 = performance.now();
      (function step(now) {
        const p = Math.min((now - t0) / dur, 1);
        el.textContent = (target * (1 - Math.pow(1 - p, 3))).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.stat-num').forEach(el => statIO.observe(el));

  /* =====================================================
     HOLOGRAPHIC CARD SPOTLIGHT
     ===================================================== */
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--px', ((e.clientX - r.left) / r.width  * 100) + '%');
      card.style.setProperty('--py', ((e.clientY - r.top)  / r.height * 100) + '%');
    });
  });

  /* =====================================================
     3D TILT
     ===================================================== */
  if (fine && !reduced) {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      let raf = null;
      card.addEventListener('mousemove', e => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width  - 0.5;
          const py = (e.clientY - r.top)  / r.height - 0.5;
          card.style.transform = `perspective(900px) rotateX(${py * -5}deg) rotateY(${px * 6}deg) translateY(-2px)`;
          raf = null;
        });
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* =====================================================
     MAGNETIC BUTTONS
     ===================================================== */
  if (fine && !reduced) {
    document.querySelectorAll('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.2}px,${(e.clientY - r.top - r.height / 2) * 0.24}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* =====================================================
     ACTIVE NAV LINK
     ===================================================== */
  const sections = [...document.querySelectorAll('section[id]')];
  const navLinks = [...document.querySelectorAll('.nav-links a')];
  const navIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      navLinks.forEach(a => a.style.color = a.getAttribute('href') === '#' + e.target.id ? 'var(--text)' : '');
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => navIO.observe(s));

  /* =====================================================
     GLITCH HEADINGS — inject data-text
     ===================================================== */
  document.querySelectorAll('.section-head h2').forEach(h => { h.dataset.text = h.textContent; });

  /* =====================================================
     KONAMI CODE — ↑↑↓↓←→←→BA
     ===================================================== */
  const KONAMI = [38,38,40,40,37,39,37,39,66,65];
  let kIdx = 0;
  document.addEventListener('keydown', e => {
    kIdx = e.keyCode === KONAMI[kIdx] ? kIdx + 1 : (e.keyCode === KONAMI[0] ? 1 : 0);
    if (kIdx === KONAMI.length) {
      kIdx = 0;
      document.body.classList.toggle('overdrive');
      const msg = document.createElement('div');
      msg.className = 'overdrive-msg mono';
      msg.textContent = document.body.classList.contains('overdrive') ? '⚡ NEURAL OVERDRIVE' : '■ SYSTEMS NOMINAL';
      document.body.appendChild(msg);
      setTimeout(() => msg.remove(), 2200);
    }
  });

})();
