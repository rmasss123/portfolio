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

  /* ---------- neural network background ---------- */
  const neuralCanvas = document.getElementById('neural-bg');
  if (neuralCanvas) {
    const ctx = neuralCanvas.getContext('2d');
    const DPR = Math.min(devicePixelRatio, 2);
    let W, H, nodes = [], edges = [], pulses = [];
    // layer colours: input=cyan  hidden=violet  output=amber
    const LAYER_COLOR = ['#5EE7FF', '#8b5cf6', '#8b5cf6', '#8b5cf6', '#8b5cf6', '#FFB454'];
    const LAYER_COUNTS = [5, 8, 10, 10, 8, 4];

    function buildNetwork() {
      nodes = []; edges = []; pulses = [];
      const L = LAYER_COUNTS.length;
      const xStart = W * 0.05, xEnd = W * 0.95;
      const xStep = (xEnd - xStart) / (L - 1);
      LAYER_COUNTS.forEach((count, li) => {
        const x = xStart + xStep * li;
        const yGap = H / (count + 1);
        for (let ni = 0; ni < count; ni++) {
          nodes.push({ x, y: yGap * (ni + 1), layer: li, color: LAYER_COLOR[li], r: 3 * DPR, glow: 0 });
        }
      });
      // sparse connections between adjacent layers
      for (let li = 0; li < L - 1; li++) {
        const from = nodes.filter(n => n.layer === li);
        const to   = nodes.filter(n => n.layer === li + 1);
        from.forEach(f => {
          to.forEach(t => {
            if (Math.random() < 0.55) {
              edges.push({ from: f, to: t, alpha: 0.07 + Math.random() * 0.13 });
            }
          });
        });
      }
    }

    function resize() {
      const hero = neuralCanvas.closest('.hero');
      W = neuralCanvas.width  = hero.offsetWidth  * DPR;
      H = neuralCanvas.height = hero.offsetHeight * DPR;
      neuralCanvas.style.width  = hero.offsetWidth  + 'px';
      neuralCanvas.style.height = hero.offsetHeight + 'px';
      buildNetwork();
    }

    function spawnPulse() {
      const inputs = nodes.filter(n => n.layer === 0);
      const start  = inputs[Math.floor(Math.random() * inputs.length)];
      edges.filter(e => e.from === start && Math.random() < 0.7).forEach(e => {
        pulses.push({ edge: e, t: 0, speed: 0.0035 + Math.random() * 0.005 });
      });
    }

    function propagate(node) {
      node.glow = 1;
      const next = edges.filter(e => e.from === node);
      if (!next.length) return;
      next.filter(() => Math.random() < 0.55).slice(0, 5).forEach(e => {
        setTimeout(() => pulses.push({ edge: e, t: 0, speed: 0.0035 + Math.random() * 0.005 }), 30 + Math.random() * 80);
      });
    }

    let lastSpawn = 0;
    function draw(ts) {
      ctx.clearRect(0, 0, W, H);

      // edges
      edges.forEach(e => {
        const g = ctx.createLinearGradient(e.from.x, e.from.y, e.to.x, e.to.y);
        g.addColorStop(0, e.from.color + '28');
        g.addColorStop(1, e.to.color   + '18');
        ctx.beginPath();
        ctx.moveTo(e.from.x, e.from.y);
        ctx.lineTo(e.to.x,   e.to.y);
        ctx.strokeStyle = g;
        ctx.lineWidth = 0.9 * DPR;
        ctx.stroke();
      });

      // pulses
      pulses = pulses.filter(p => {
        p.t += p.speed;
        if (p.t >= 1) { propagate(p.edge.to); return false; }
        const x = p.edge.from.x + (p.edge.to.x - p.edge.from.x) * p.t;
        const y = p.edge.from.y + (p.edge.to.y - p.edge.from.y) * p.t;
        const col = p.edge.from.color;
        // glow halo
        const grd = ctx.createRadialGradient(x, y, 0, x, y, 10 * DPR);
        grd.addColorStop(0, col + '77');
        grd.addColorStop(1, col + '00');
        ctx.beginPath(); ctx.arc(x, y, 10 * DPR, 0, Math.PI * 2);
        ctx.fillStyle = grd; ctx.fill();
        // core dot
        ctx.beginPath(); ctx.arc(x, y, 2.2 * DPR, 0, Math.PI * 2);
        ctx.fillStyle = col; ctx.globalAlpha = 0.95; ctx.fill(); ctx.globalAlpha = 1;
        return true;
      });

      // nodes
      nodes.forEach(n => {
        n.glow = Math.max(0, n.glow - 0.022);
        if (n.glow > 0.04) {
          const halo = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 20 * DPR);
          halo.addColorStop(0, n.color + Math.round(n.glow * 110).toString(16).padStart(2, '0'));
          halo.addColorStop(1, n.color + '00');
          ctx.beginPath(); ctx.arc(n.x, n.y, 20 * DPR, 0, Math.PI * 2);
          ctx.fillStyle = halo; ctx.fill();
        }
        // outer ring
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 3.5 * DPR, 0, Math.PI * 2);
        ctx.strokeStyle = n.color;
        ctx.lineWidth   = 0.75 * DPR;
        ctx.globalAlpha = 0.15 + n.glow * 0.55;
        ctx.stroke();
        // fill
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle   = n.color;
        ctx.globalAlpha = 0.3 + n.glow * 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      if (ts - lastSpawn > 800) { spawnPulse(); lastSpawn = ts; }
      requestAnimationFrame(draw);
    }

    resize();
    addEventListener('resize', () => resize());
    if (!reduced) requestAnimationFrame(draw);
    else buildNetwork(); // draw static snapshot for reduced-motion
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
