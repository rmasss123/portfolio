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
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%@&!?><-_';
  function scrambleTo(el, text, duration, onDone) {
    if (!el) return;
    /* lock element width before scramble so layout never shifts */
    el.textContent = text;
    el.style.display = 'inline-block';
    el.style.minWidth = el.getBoundingClientRect().width + 'px';
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
    /* skip loader on back-navigation within same session */
    if (sessionStorage.getItem('st_loaded')) {
      loader.style.display = 'none';
      startHeroScramble();
      return;
    }
    sessionStorage.setItem('st_loaded', '1');

    const ldrLog = document.getElementById('ldr-log');
    const ldrBar = document.getElementById('ldr-bar');
    const ldrPct = document.getElementById('ldr-pct');

    const steps = [
      { text: '▸ loading sangam_tiwari.json...',       pct: 20 },
      { text: '▸ indexing 7 years of pattern-finding...', pct: 42 },
      { text: '▸ mounting gangajal pipeline...',       pct: 62 },
      { text: '▸ warming neural renderer...',          pct: 82 },
      { text: '▸ ready. the story starts now.',        pct: 100 },
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
    const ctx = neuralCanvas.getContext('2d');
    const DPR = Math.min(devicePixelRatio, 2);
    let W, H, nodes = [], pulses = [];
    let cmx = innerWidth * DPR / 2, cmy = innerHeight * DPR / 2;
    addEventListener('mousemove', e => { cmx = e.clientX * DPR; cmy = e.clientY * DPR; }, {passive:true});

    const COLS   = ['#5EE7FF', '#8b5cf6', '#a78bfa', '#FFB454'];
    const N      = Math.min(90, Math.floor(innerWidth * innerHeight / 14000));
    const REACH  = 200 * DPR;   /* max connection distance */
    const SPEED  = 0.28;        /* node drift speed */

    function build() {
      nodes = []; pulses = [];
      W = neuralCanvas.width  = innerWidth  * DPR;
      H = neuralCanvas.height = innerHeight * DPR;
      neuralCanvas.style.width  = innerWidth  + 'px';
      neuralCanvas.style.height = innerHeight + 'px';

      const count = Math.min(90, Math.floor(W * H / 14000));
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        nodes.push({
          x:     Math.random() * W,
          y:     Math.random() * H,
          vx:    Math.cos(angle) * SPEED * (0.3 + Math.random() * 0.7),
          vy:    Math.sin(angle) * SPEED * (0.3 + Math.random() * 0.7),
          color: COLS[Math.floor(Math.random() * COLS.length)],
          r:     (1.4 + Math.random() * 1.2) * DPR,
          glow:  0,
          phase: Math.random() * Math.PI * 2,  /* for breathing pulse */
        });
      }
    }

    function spawnPulse(from, to) {
      pulses.push({ from, to, t: 0, speed: 0.006 + Math.random() * 0.006, color: from.color });
    }

    let lastPulseSpawn = 0;
    function draw(ts) {
      ctx.clearRect(0, 0, W, H);

      /* move nodes, bounce off walls */
      const repR = 130 * DPR;
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        n.glow = Math.max(0, n.glow - 0.018);
        n.phase += 0.018;
        /* mouse repulsion */
        const dx = n.x - cmx, dy = n.y - cmy;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < repR && d > 1) { const f = (repR-d)/repR*1.4; n.x += dx/d*f; n.y += dy/d*f; }
      });

      /* draw edges between nearby nodes */
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > REACH) continue;

          const alpha = (1 - dist / REACH) * 0.28;
          const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
          g.addColorStop(0, a.color + Math.round(alpha * 255).toString(16).padStart(2,'0'));
          g.addColorStop(1, b.color + Math.round(alpha * 0.6 * 255).toString(16).padStart(2,'0'));
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = g;
          ctx.lineWidth = (0.5 + (1 - dist / REACH) * 0.7) * DPR;
          ctx.stroke();
        }
      }

      /* draw pulses */
      pulses = pulses.filter(p => {
        p.t += p.speed;
        if (p.t >= 1) { p.to.glow = 1; return false; }
        const x = p.from.x + (p.to.x - p.from.x) * p.t;
        const y = p.from.y + (p.to.y - p.from.y) * p.t;

        /* outer glow */
        const grd = ctx.createRadialGradient(x, y, 0, x, y, 11 * DPR);
        grd.addColorStop(0, p.color + 'cc');
        grd.addColorStop(0.4, p.color + '44');
        grd.addColorStop(1, p.color + '00');
        ctx.beginPath(); ctx.arc(x, y, 11 * DPR, 0, Math.PI * 2);
        ctx.fillStyle = grd; ctx.fill();

        /* hard core */
        ctx.beginPath(); ctx.arc(x, y, 2.2 * DPR, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.globalAlpha = 0.95; ctx.fill();
        ctx.globalAlpha = 1;
        return true;
      });

      /* draw nodes */
      nodes.forEach(n => {
        const breathe = 0.5 + 0.5 * Math.sin(n.phase);

        if (n.glow > 0.05) {
          const halo = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 22 * DPR);
          halo.addColorStop(0, n.color + Math.round(n.glow * 130).toString(16).padStart(2,'0'));
          halo.addColorStop(1, n.color + '00');
          ctx.beginPath(); ctx.arc(n.x, n.y, 22 * DPR, 0, Math.PI * 2);
          ctx.fillStyle = halo; ctx.fill();
        }

        /* outer ring */
        ctx.beginPath(); ctx.arc(n.x, n.y, (n.r + 3) * DPR, 0, Math.PI * 2);
        ctx.strokeStyle = n.color;
        ctx.lineWidth = 0.6 * DPR;
        ctx.globalAlpha = (0.12 + breathe * 0.08 + n.glow * 0.5);
        ctx.stroke();

        /* core dot */
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.globalAlpha = 0.3 + breathe * 0.15 + n.glow * 0.55;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      /* spawn pulses periodically */
      if (ts - lastPulseSpawn > 700) {
        lastPulseSpawn = ts;
        /* pick a random node and fire pulses along its nearby connections */
        const src = nodes[Math.floor(Math.random() * nodes.length)];
        let fired = 0;
        for (let i = 0; i < nodes.length && fired < 3; i++) {
          if (nodes[i] === src) continue;
          const dx = src.x - nodes[i].x, dy = src.y - nodes[i].y;
          if (Math.sqrt(dx*dx + dy*dy) < REACH && Math.random() < 0.4) {
            spawnPulse(src, nodes[i]);
            fired++;
          }
        }
      }

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
  const termText = 'python gangajal.py --source calls --mode score --lang all';
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

  /* =====================================================
     CONTACT FORM — Formspree AJAX submission
     ===================================================== */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const status  = document.getElementById('form-status');
    const btn     = contactForm.querySelector('.form-btn');
    const btnText = contactForm.querySelector('.form-btn-text');

    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      btnText.textContent = 'Sending...';
      btn.style.opacity = '.7';
      btn.disabled = true;

      try {
        const res  = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { Accept: 'application/json' },
        });
        const json = await res.json().catch(() => ({}));

        if (res.ok && !json.errors && !json.error) {
          btnText.textContent = 'Sent ✓';
          status.textContent  = '▸ message received — I\'ll reply within 24 hrs.';
          status.className    = 'form-note mono visible success';
          contactForm.reset();
        } else {
          /* surface the actual Formspree error so it's debuggable */
          const msg = json.error
            || (json.errors && json.errors.map(e => e.message).join(', '))
            || ('status ' + res.status);
          throw new Error(msg);
        }
      } catch(err) {
        btnText.textContent = 'Send message';
        btn.style.opacity   = '1';
        btn.disabled        = false;
        /* show the real error message in the status line */
        status.textContent  = '▸ ' + (err.message || 'something went wrong');
        status.className    = 'form-note mono visible error';
      }
    });
  }

  /* =====================================================
     RESUME MODAL — open inline, no navigation
     ===================================================== */
  function openResumeModal() {
    let modal = document.getElementById('resume-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'resume-modal';
      modal.className = 'resume-modal';
      modal.innerHTML =
        '<div class="resume-modal-bar">' +
          '<span class="resume-modal-name mono">Sangam_Tiwari_Resume.pdf</span>' +
          '<div style="display:flex;gap:10px;align-items:center">' +
            '<a class="btn btn-ghost" href="assets/Sangam_Tiwari_Resume.pdf" download ' +
              'style="padding:7px 14px;font-size:.72rem;">Download ↓</a>' +
            '<button class="btn btn-ghost resume-modal-close" ' +
              'style="padding:7px 14px;font-size:.72rem;">✕ Close</button>' +
          '</div>' +
        '</div>' +
        '<iframe src="assets/Sangam_Tiwari_Resume.pdf#toolbar=1" ' +
          'class="resume-modal-frame" title="Sangam Tiwari Resume"></iframe>' +
        '<div class="resume-modal-fallback">' +
          '<p>PDF preview isn\'t available on this device.</p>' +
          '<a class="btn btn-amber" href="assets/Sangam_Tiwari_Resume.pdf" download>Download Resume ↓</a>' +
        '</div>';
      document.body.appendChild(modal);

      const close = () => { modal.classList.remove('open'); document.body.style.overflow = ''; };
      modal.querySelector('.resume-modal-close').addEventListener('click', close);
      modal.addEventListener('click', e => { if (e.target === modal) close(); });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    }
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  /* intercept all resume links — must run BEFORE page-transitions listener */
  document.querySelectorAll('a[href="resume.html"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      e.stopImmediatePropagation();
      openResumeModal();
    });
  });

  /* =====================================================
     PAGE TRANSITIONS — glitch out then navigate
     ===================================================== */
  document.querySelectorAll('a[href]').forEach(a => {
    const h = a.getAttribute('href');
    if (h && /^(?!https?:|#|mailto:|tel:).*\.html/.test(h)) {
      a.addEventListener('click', e => {
        e.preventDefault();
        document.body.classList.add('leaving');
        setTimeout(() => { location.href = h; }, 360);
      });
    }
  });

  /* =====================================================
     CLICK BURST PARTICLES
     ===================================================== */
  if (!reduced) {
    const BC = ['#5EE7FF','#FFB454','#8b5cf6','#ffffff','#a78bfa'];
    document.addEventListener('click', e => {
      for (let i = 0; i < 16; i++) {
        const d = document.createElement('div');
        d.className = 'burst-dot';
        const angle = (i / 16) * Math.PI * 2 + (Math.random() - .5) * .9;
        const dist  = 28 + Math.random() * 85;
        const sz    = 2 + Math.random() * 5;
        d.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;` +
          `width:${sz}px;height:${sz}px;background:${BC[i % BC.length]};` +
          `--tx:${Math.cos(angle)*dist}px;--ty:${Math.sin(angle)*dist}px;` +
          `--dur:${(.3+Math.random()*.35).toFixed(2)}s;`;
        document.body.appendChild(d);
        setTimeout(() => d.remove(), 700);
      }
    });
  }

  /* =====================================================
     HERO 3D TILT ON MOUSE MOVE
     ===================================================== */
  const heroSec = document.querySelector('.hero');
  const heroInn = document.querySelector('.hero-inner');
  if (heroSec && heroInn && fine && !reduced) {
    let htRaf = null;
    heroSec.addEventListener('mousemove', e => {
      if (htRaf) return;
      htRaf = requestAnimationFrame(() => {
        const r  = heroSec.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width  - .5;
        const py = (e.clientY - r.top)  / r.height - .5;
        heroInn.style.transform = `perspective(1100px) rotateX(${(py*-3.5).toFixed(2)}deg) rotateY(${(px*4.5).toFixed(2)}deg)`;
        htRaf = null;
      });
    });
    heroSec.addEventListener('mouseleave', () => {
      heroInn.style.transform = '';
    });
  }

})();
