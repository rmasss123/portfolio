/* =====================================================
   night-shift data console — interactions
   ===================================================== */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ---------- IST clock ---------- */
  const clock1 = document.getElementById('ist-clock');
  const clock2 = document.getElementById('ist-clock-2');
  const tickClock = () => {
    const t = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false });
    if (clock1) clock1.textContent = t + ' IST';
    if (clock2) clock2.textContent = t;
  };
  tickClock();
  setInterval(tickClock, 1000);

  /* ---------- scroll progress ---------- */
  const bar = document.querySelector('.scroll-progress');
  const onScrollBar = () => {
    const h = document.documentElement;
    const pct = h.scrollTop / (h.scrollHeight - h.clientHeight) * 100;
    bar.style.width = pct + '%';
  };
  document.addEventListener('scroll', onScrollBar, { passive: true });

  /* ---------- custom cursor ---------- */
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (fine && !reduced) {
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a, button, .chip, .stage-card').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
    });
  } else {
    dot.remove(); ring.remove();
  }

  /* ---------- terminal typing ---------- */
  const termEl = document.getElementById('term-typed');
  const termText = 'python gangajal_pipeline.py --source calls --extract signal';
  if (termEl) {
    if (reduced) { termEl.textContent = termText; }
    else {
      let i = 0;
      (function typeTerm() {
        if (i <= termText.length) {
          termEl.textContent = termText.slice(0, i++);
          setTimeout(typeTerm, 34);
        }
      })();
    }
  }

  /* ---------- role typing ---------- */
  const roleEl = document.getElementById('role-typed');
  const roles = ['AI & Data Engineer', 'LLM Pipeline Builder', 'ML Enthusiast', 'Problem Solver'];
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

  /* ---------- waveform canvas ---------- */
  const canvas = document.getElementById('wave');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, t = 0;
    let mouseX = -9999, mouseY = 0;

    const resize = () => {
      const r = canvas.parentElement.getBoundingClientRect();
      W = canvas.width = r.width * devicePixelRatio;
      H = canvas.height = r.height * devicePixelRatio;
      canvas.style.width = r.width + 'px';
      canvas.style.height = r.height + 'px';
    };
    resize();
    addEventListener('resize', resize);

    canvas.parentElement.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      mouseX = (e.clientX - r.left) * devicePixelRatio;
      mouseY = (e.clientY - r.top) * devicePixelRatio;
    });
    canvas.parentElement.addEventListener('mouseleave', () => { mouseX = -9999; });

    const lines = [
      { yPct: 0.80, amp: 26, freq: 0.0042, speed: 0.018, color: 'rgba(94,231,255,0.55)', width: 1.4 },
      { yPct: 0.84, amp: 40, freq: 0.0030, speed: 0.012, color: 'rgba(94,231,255,0.22)', width: 1.0 },
      { yPct: 0.87, amp: 18, freq: 0.0058, speed: 0.026, color: 'rgba(255,180,84,0.5)', width: 1.3 },
      { yPct: 0.91, amp: 30, freq: 0.0024, speed: 0.009, color: 'rgba(255,180,84,0.18)', width: 1.0 },
    ];

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const dpr = devicePixelRatio;
      lines.forEach(L => {
        ctx.beginPath();
        const baseY = H * L.yPct;
        for (let x = 0; x <= W; x += 4 * dpr) {
          // mouse adds a local gaussian bump
          const d = (x - mouseX) / (140 * dpr);
          const bump = Math.exp(-d * d) * 60 * dpr * (mouseY < H ? 1 : 0);
          const y = baseY
            + Math.sin(x * L.freq + t * L.speed * 60) * L.amp * dpr
            + Math.sin(x * L.freq * 2.7 + t * L.speed * 90) * L.amp * 0.3 * dpr
            - bump;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = L.color;
        ctx.lineWidth = L.width * dpr;
        ctx.stroke();
      });
      t += 1;
    };

    if (reduced) { draw(); }
    else {
      (function animate() { draw(); requestAnimationFrame(animate); })();
    }
  }

  /* ---------- insight chips popping off the wave ---------- */
  const chipLayer = document.getElementById('chip-layer');
  const chipTexts = [
    ['sentiment: positive', 'cyan'], ['score: 96.5', 'amber'],
    ['isl_asked: true', 'cyan'], ['cohort: happy', 'amber'],
    ['lang: tamil → en', 'cyan'], ['intent: high', 'amber'],
    ['risk: low', 'cyan'], ['moment_coverage: 0.92', 'amber'],
    ['drop_off: flagged', 'amber'], ['turns: 148', 'cyan'],
  ];
  if (chipLayer && !reduced && innerWidth >= 720) {
    setInterval(() => {
      if (document.hidden) return;
      const [txt, tone] = chipTexts[Math.floor(Math.random() * chipTexts.length)];
      const el = document.createElement('span');
      el.className = 'insight-chip' + (tone === 'amber' ? ' amber' : '');
      el.textContent = txt;
      el.style.left = (44 + Math.random() * 44) + '%';
      el.style.top = (72 + Math.random() * 15) + '%';
      chipLayer.appendChild(el);
      setTimeout(() => el.remove(), 3500);
    }, 1400);
  }

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---------- count-up stats ---------- */
  const statIO = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      statIO.unobserve(el);
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const decimals = parseInt(el.dataset.decimals || (Number.isInteger(target) ? 0 : 1));
      if (reduced) { el.textContent = target.toFixed(decimals) + suffix; return; }
      const dur = 1400, start = performance.now();
      (function step(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(step);
      })(start);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.stat-num').forEach(el => statIO.observe(el));

  /* ---------- 3D tilt on cards ---------- */
  if (fine && !reduced) {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      let raf = null;
      card.addEventListener('mousemove', e => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform = `perspective(900px) rotateX(${py * -4}deg) rotateY(${px * 5}deg) translateY(-2px)`;
          raf = null;
        });
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ---------- magnetic buttons ---------- */
  if (fine && !reduced) {
    document.querySelectorAll('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.18}px, ${y * 0.22}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- active nav link ---------- */
  const sections = [...document.querySelectorAll('section[id]')];
  const navLinks = [...document.querySelectorAll('.nav-links a')];
  const navIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      navLinks.forEach(a => a.style.color = a.getAttribute('href') === '#' + e.target.id ? 'var(--text)' : '');
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => navIO.observe(s));
})();
