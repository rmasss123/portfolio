/* =====================================================
   SANGAM TIWARI — Neural Interface v5.0
   Pure vanilla JS — no CDN dependencies
   ===================================================== */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine    = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* =====================================================
     TEXT SCRAMBLE
     ===================================================== */
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオ#$%@&!?><-_';
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
    scrambleTo(w1, 'SANGAM', 1200, () => {
      setTimeout(() => scrambleTo(w2, 'TIWARI', 1000), 100);
    });
  }

  /* =====================================================
     LOADER SEQUENCE
     ===================================================== */
  const loader = document.getElementById('loader');
  function runLoader() {
    if (!loader || reduced) { startHeroScramble(); return; }

    const ldrLog = document.getElementById('ldr-log');
    const ldrBar = document.getElementById('ldr-bar');
    const ldrPct = document.getElementById('ldr-pct');

    const steps = [
      { text: '▸ loading language model weights...', pct: 22 },
      { text: '▸ connecting to BigQuery pipeline...',  pct: 44 },
      { text: '▸ initializing neural renderer...',     pct: 66 },
      { text: '▸ calibrating particle dynamics...',    pct: 88 },
      { text: '▸ all systems nominal.',                pct: 100 },
    ];

    steps.forEach(({ text, pct }, i) => {
      setTimeout(() => {
        if (ldrLog) {
          const line = document.createElement('div');
          line.className = 'ldr-line';
          line.textContent = text;
          ldrLog.appendChild(line);
        }
        if (ldrBar) ldrBar.style.width = pct + '%';
        if (ldrPct) ldrPct.textContent = pct + '%';
        if (pct === 100) {
          const ready = document.getElementById('ldr-ready');
          if (ready) ready.style.opacity = '1';
        }
      }, 340 * (i + 1));
    });

    const totalDelay = 340 * steps.length + 480;
    setTimeout(() => {
      loader.classList.add('ldr-out');
      setTimeout(() => {
        loader.style.display = 'none';
        startHeroScramble();
      }, 650);
    }, totalDelay);
  }

  runLoader();

  /* =====================================================
     2D CANVAS NEURAL NETWORK BACKGROUND
     ===================================================== */
  const neuralCanvas = document.getElementById('neural-bg');
  if (neuralCanvas && !reduced) {
    const ctx  = neuralCanvas.getContext('2d');
    const DPR  = Math.min(devicePixelRatio, 2);
    let W, H, nodes = [], edges = [], pulses = [];

    const LAYERS    = [5, 8, 10, 10, 8, 4];
    const LAYER_COL = ['#5EE7FF','#8b5cf6','#8b5cf6','#8b5cf6','#8b5cf6','#FFB454'];

    function build() {
      nodes = []; edges = []; pulses = [];
      const hero = neuralCanvas.closest('.hero') || neuralCanvas.parentElement;
      W = neuralCanvas.width  = hero.offsetWidth  * DPR;
      H = neuralCanvas.height = hero.offsetHeight * DPR;
      neuralCanvas.style.width  = hero.offsetWidth  + 'px';
      neuralCanvas.style.height = hero.offsetHeight + 'px';

      const L      = LAYERS.length;
      const xStart = W * 0.04, xEnd = W * 0.96;
      const xStep  = (xEnd - xStart) / (L - 1);

      LAYERS.forEach((cnt, li) => {
        const x    = xStart + xStep * li;
        const yGap = H / (cnt + 1);
        for (let ni = 0; ni < cnt; ni++) {
          nodes.push({ x, y: yGap * (ni + 1), layer: li, color: LAYER_COL[li], r: 2.8 * DPR, glow: 0 });
        }
      });

      for (let li = 0; li < L - 1; li++) {
        const from = nodes.filter(n => n.layer === li);
        const to   = nodes.filter(n => n.layer === li + 1);
        from.forEach(f => to.forEach(t => {
          if (Math.random() < 0.5) edges.push({ from: f, to: t });
        }));
      }
    }

    function spawnPulse() {
      const inputs = nodes.filter(n => n.layer === 0);
      const start  = inputs[Math.floor(Math.random() * inputs.length)];
      edges.filter(e => e.from === start && Math.random() < 0.65).forEach(e =>
        pulses.push({ edge: e, t: 0, speed: 0.004 + Math.random() * 0.005 }));
    }

    function propagate(node) {
      node.glow = 1;
      if (node.layer >= LAYERS.length - 1) return;
      edges.filter(e => e.from === node && Math.random() < 0.55).slice(0, 5).forEach(e =>
        setTimeout(() => pulses.push({ edge: e, t: 0, speed: 0.004 + Math.random() * 0.005 }), 40));
    }

    let lastSpawn = 0;
    function draw(ts) {
      ctx.clearRect(0, 0, W, H);

      edges.forEach(e => {
        const g = ctx.createLinearGradient(e.from.x, e.from.y, e.to.x, e.to.y);
        g.addColorStop(0, e.from.color + '22');
        g.addColorStop(1, e.to.color   + '15');
        ctx.beginPath();
        ctx.moveTo(e.from.x, e.from.y);
        ctx.lineTo(e.to.x,   e.to.y);
        ctx.strokeStyle = g;
        ctx.lineWidth = 0.8 * DPR;
        ctx.stroke();
      });

      pulses = pulses.filter(p => {
        p.t += p.speed;
        if (p.t >= 1) { propagate(p.edge.to); return false; }
        const x   = p.edge.from.x + (p.edge.to.x - p.edge.from.x) * p.t;
        const y   = p.edge.from.y + (p.edge.to.y - p.edge.from.y) * p.t;
        const col = p.edge.from.color;
        const grd = ctx.createRadialGradient(x, y, 0, x, y, 9 * DPR);
        grd.addColorStop(0, col + '88');
        grd.addColorStop(1, col + '00');
        ctx.beginPath(); ctx.arc(x, y, 9 * DPR, 0, Math.PI * 2);
        ctx.fillStyle = grd; ctx.fill();
        ctx.beginPath(); ctx.arc(x, y, 2 * DPR, 0, Math.PI * 2);
        ctx.fillStyle = col; ctx.globalAlpha = 0.9; ctx.fill(); ctx.globalAlpha = 1;
        return true;
      });

      nodes.forEach(n => {
        n.glow = Math.max(0, n.glow - 0.022);
        if (n.glow > 0.04) {
          const halo = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 18 * DPR);
          halo.addColorStop(0, n.color + Math.round(n.glow * 110).toString(16).padStart(2, '0'));
          halo.addColorStop(1, n.color + '00');
          ctx.beginPath(); ctx.arc(n.x, n.y, 18 * DPR, 0, Math.PI * 2);
          ctx.fillStyle = halo; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 2.5 * DPR, 0, Math.PI * 2);
        ctx.strokeStyle = n.color; ctx.lineWidth = 0.7 * DPR;
        ctx.globalAlpha = 0.18 + n.glow * 0.5; ctx.stroke();
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.color; ctx.globalAlpha = 0.32 + n.glow * 0.68; ctx.fill();
        ctx.globalAlpha = 1;
      });

      if (ts - lastSpawn > 900) { spawnPulse(); lastSpawn = ts; }
      requestAnimationFrame(draw);
    }

    build();
    addEventListener('resize', () => { build(); });
    requestAnimationFrame(draw);
  }

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
  tickClock(); setInterval(tickClock, 1000);

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
      rx += (curMx - rx) * 0.16; ry += (curMy - ry) * 0.16;
      if (curDot)  curDot.style.transform  = `translate(${curMx}px,${curMy}px) translate(-50%,-50%)`;
      if (curRing) curRing.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(cursorLoop);
    })();

    document.querySelectorAll('a,button,.chip,.stage-card,.project-card').forEach(el => {
      el.addEventListener('mouseenter', () => curRing && curRing.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => curRing && curRing.classList.remove('is-hover'));
    });

    /* snake particle trail */
    const TRAIL_N = 8;
    const trails  = Array.from({ length: TRAIL_N }, (_, i) => {
      const el = document.createElement('div');
      el.className = 'trail-dot';
      const sz = 3.5 - i * 0.3;
      el.style.cssText = `width:${sz}px;height:${sz}px;opacity:${((1 - i / TRAIL_N) * 0.65).toFixed(2)}`;
      document.body.appendChild(el);
      return { el, x: curMx, y: curMy };
    });

    (function trailLoop() {
      let px = curMx, py = curMy;
      trails.forEach(t => {
        t.x += (px - t.x) * 0.4; t.y += (py - t.y) * 0.4;
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
     SCROLL REVEAL (IntersectionObserver — no library needed)
     ===================================================== */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* =====================================================
     COUNT-UP STATS
     ===================================================== */
  const statIO = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target; statIO.unobserve(el);
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
