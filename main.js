// 經歷篩選
const btns = document.querySelectorAll('.filters button');
const items = document.querySelectorAll('.tl li[data-c]');
const years = document.querySelectorAll('.tl-year');
btns.forEach(b => b.addEventListener('click', () => {
  btns.forEach(x => x.classList.toggle('on', x === b));
  const f = b.dataset.f;
  items.forEach(li => { li.hidden = f !== 'all' && !li.dataset.c.split(' ').includes(f); });
  // 某年份底下全被篩掉就把年份標題也藏起來
  years.forEach(y => {
    let n = y.nextElementSibling, any = false;
    while (n && !n.classList.contains('tl-year')) { if (!n.hidden) any = true; n = n.nextElementSibling; }
    y.hidden = !any;
  });
}));

// 相簿放大
const lb = document.querySelector('.lightbox');
const lbImg = lb.querySelector('img');
const openLb = i => { lbImg.src = i.src; lbImg.alt = i.alt; lb.hidden = false; };
document.querySelectorAll('.ph').forEach(p => p.addEventListener('click', () => openLb(p.querySelector('img'))));
document.querySelectorAll('.more-photos img').forEach(i => i.addEventListener('click', () => openLb(i)));
const close = () => { lb.hidden = true; lbImg.src = ''; };
lb.addEventListener('click', e => { if (e.target !== lbImg) close(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) close(); });

// 捲動時標示目前在哪一段
const links = [...document.querySelectorAll('.bar-nav a')];
const secs = links.map(a => document.querySelector(a.getAttribute('href')));
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
}), { rootMargin: '-40% 0px -55% 0px' });
secs.forEach(s => s && spy.observe(s));

// 手機選單
const bar = document.querySelector('.bar');
const mb = document.querySelector('.menu-btn');
mb.addEventListener('click', () => {
  const o = bar.classList.toggle('open');
  mb.setAttribute('aria-expanded', o); mb.textContent = o ? '關閉' : '選單';
});
links.forEach(a => a.addEventListener('click', () => { bar.classList.remove('open'); mb.setAttribute('aria-expanded', false); mb.textContent = '選單'; }));

// ---------- 深色／淺色 ----------
const theme = { ink: '23,36,58', acc: '81,109,152', dot: '145,174,210' };
const darkMQ = matchMedia('(prefers-color-scheme: dark)');
const isDark = () => (document.documentElement.getAttribute('data-theme') || (darkMQ.matches ? 'dark' : 'light')) === 'dark';
function applyTheme() {
  const cs = getComputedStyle(document.documentElement);
  theme.ink = cs.getPropertyValue('--radar-ink').trim();
  theme.acc = cs.getPropertyValue('--radar-acc').trim();
  theme.dot = cs.getPropertyValue('--dot').trim();
  const d = isDark();
  document.querySelectorAll('img[data-dark]').forEach(img => {
    if (!img.dataset.light) img.dataset.light = img.getAttribute('src');
    const want = d ? img.dataset.dark : img.dataset.light;
    if (img.getAttribute('src') !== want) img.setAttribute('src', want);
  });
  const lbl = document.querySelector('.theme-btn .lbl');
  if (lbl) lbl.textContent = d ? '淺色' : '深色';
}
document.querySelector('.theme-btn')?.addEventListener('click', () => {
  const next = isDark() ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch (e) {}
  applyTheme();
});
darkMQ.addEventListener?.('change', applyTheme);
applyTheme();

// ---------- 開場動畫 ----------
const intro = document.querySelector('.intro');
if (intro && !document.documentElement.classList.contains('no-intro')) {
  document.body.style.overflow = 'hidden';
  const open = () => {
    if (intro.classList.contains('open')) return;
    intro.classList.add('open');
    document.body.style.overflow = '';
    try { sessionStorage.setItem('introSeen', '1'); } catch (e) {}
    setTimeout(() => intro.classList.add('gone'), 1000);
  };
  setTimeout(open, 1900);
  intro.addEventListener('click', open);
}

const fine = matchMedia('(pointer: fine)').matches;
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- 首頁背景：會跟著滑鼠亮起來的點陣 ----------
(() => {
  const cv = document.querySelector('.hero-bg');
  if (!cv || calm) return;
  const hero = cv.parentElement, ctx = cv.getContext('2d');
  let w, h, dpr, pts = [], mx = -999, my = -999, t = 0, vis = true;
  const GAP = 30;
  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = hero.clientWidth; h = hero.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pts = [];
    for (let y = GAP / 2; y < h; y += GAP) for (let x = GAP / 2; x < w; x += GAP) pts.push([x, y]);
  }
  function frame() {
    if (vis) {
      t += 0.012;
      ctx.clearRect(0, 0, w, h);
      for (const [x, y] of pts) {
        const dx = x - mx, dy = y - my, d = Math.hypot(dx, dy), R = 190;
        let px = x, py = y, r = 1.1, a = 0.28;
        const wave = Math.sin(x * 0.012 + y * 0.008 + t) * 0.5 + 0.5;
        a += wave * 0.12;
        if (d < R) {
          const k = 1 - d / R, e = k * k;
          px += (dx / (d || 1)) * e * 20; py += (dy / (d || 1)) * e * 20;
          r += e * 3.2; a = Math.min(1, a + e * 0.9);
          if (d < R * 0.75) {
            ctx.strokeStyle = `rgba(${theme.acc},${k * 0.35})`; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(px, py); ctx.stroke();
          }
          ctx.fillStyle = `rgba(${theme.acc},${a})`;
        } else ctx.fillStyle = `rgba(${theme.dot},${a})`;
        ctx.beginPath(); ctx.arc(px, py, r, 0, 6.283); ctx.fill();
      }
    }
    requestAnimationFrame(frame);
  }
  hero.addEventListener('pointermove', e => { const b = hero.getBoundingClientRect(); mx = e.clientX - b.left; my = e.clientY - b.top; });
  hero.addEventListener('pointerleave', () => { mx = my = -999; });
  new IntersectionObserver(es => { vis = es[0].isIntersecting; }).observe(hero);
  addEventListener('resize', size); size(); frame();
})();

// ---------- 封面照片 3D 傾斜 + 反光 ----------
(() => {
  const f = document.querySelector('.frame.tilt');
  if (!f || !fine || calm) return;
  f.addEventListener('pointermove', e => {
    const b = f.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
    f.style.transform = `perspective(900px) rotateY(${(x - .5) * 12}deg) rotateX(${(.5 - y) * 10}deg)`;
    f.style.setProperty('--gx', x * 100 + '%'); f.style.setProperty('--gy', y * 100 + '%');
  });
  f.addEventListener('pointerleave', () => { f.style.transform = ''; });
})();

// ---------- 卡片微傾斜、按鈕被滑鼠吸過去 ----------
if (fine && !calm) {
  document.querySelectorAll('.work, .miss, .cert-grid figure').forEach(el => {
    el.addEventListener('pointermove', e => {
      const b = el.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5;
      el.style.transform = `perspective(1000px) translateY(-6px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
  document.querySelectorAll('.hero .btn').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const b = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - b.left - b.width / 2) * .25}px, ${(e.clientY - b.top - b.height / 2) * .35}px)`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });
}

// ---------- 封面雷達：經歷資料直接從下方時間軸讀 ----------
(() => {
  const cv = document.querySelector('.radar');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const stage = cv.parentElement;
  const CAT = { build: ['做東西', '#4F7FB8'], stage: ['舞台與活動', '#8B6FD1'], contest: ['競賽與申請', '#D07A55'] };
  const lis = [...document.querySelectorAll('.tl li[data-c]')];
  const n = lis.length;
  const items = lis.map((li, i) => {
    const cat = li.dataset.c.split(' ')[0];
    const photo = li.querySelector('.more-photos img');
    return {
      li, cat,
      ang: (i * 2.39996 + 0.4) % (Math.PI * 2),
      rad: 0.5 + 0.44 * ((i * 0.618) % 1),
      time: li.querySelector('time')?.textContent.trim() || '',
      title: li.querySelector('h3')?.textContent.trim() || '',
      desc: li.querySelector('h3 + p')?.textContent.trim() || '',
      st: li.querySelector('.st')?.outerHTML || '',
      photo: photo ? photo.getAttribute('src') : null,
      seen: -1, caught: false,
    };
  });
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem('radarCaught') || '[]'); } catch (e) {}
  items.forEach(it => { if (saved.includes(it.title)) it.caught = true; });

  const gotEl = stage.querySelector('.got'), totEl = stage.querySelector('.total');
  const tip = stage.querySelector('.radar-tip');
  const rps = [...stage.querySelectorAll('.rp')];
  const photoBox = stage.querySelector('.radar-photo');
  const card = document.querySelector('.hero .scan-card');
  totEl.textContent = n;
  const calmR = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, dpr = 1, sweep = -Math.PI / 2, last = performance.now(), hover = null, active = null, vis = false;
  let mx = -1, my = -1, parts = [], lock = null, pings = [];
  if (calmR) items.forEach(it => { it.seen = 0; });

  const updCount = () => { gotEl.textContent = items.filter(i => i.caught).length; };
  updCount();

  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.clientWidth; cv.width = W * dpr; cv.height = W * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const R = () => W * 0.48;
  const pos = it => [W / 2 + Math.cos(it.ang) * it.rad * R(), W / 2 + Math.sin(it.ang) * it.rad * R()];
  const norm = a => ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const hexA = (hex, a) => { const v = parseInt(hex.slice(1), 16); return `rgba(${v >> 16},${(v >> 8) & 255},${v & 255},${a})`; };

  function draw(now) {
    const dt = Math.min(0.2, Math.max(0, (now - last) / 1000)); last = now;
    const prev = sweep;
    if (!calmR) sweep += dt * 1.0;
    const step = sweep - prev, c = W / 2, r = R();
    ctx.clearRect(0, 0, W, W);

    // 外圈刻度，慢慢轉
    ctx.save(); ctx.translate(c, c); ctx.rotate(now / 9000);
    for (let k = 0; k < 72; k++) {
      const a = k / 72 * Math.PI * 2, long = k % 6 === 0;
      ctx.strokeStyle = long ? `rgba(${theme.ink},.5)` : `rgba(${theme.ink},.2)`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); ctx.lineTo(Math.cos(a) * (r - (long ? 10 : 5)), Math.sin(a) * (r - (long ? 10 : 5))); ctx.stroke();
    }
    ctx.restore();
    // 同心圓
    ctx.strokeStyle = `rgba(${theme.acc},.22)`;
    for (let k = 1; k <= 3; k++) { ctx.beginPath(); ctx.arc(c, c, r * (0.4 + k * 0.2), 0, 7); ctx.stroke(); }
    ctx.setLineDash([3, 6]); ctx.beginPath(); ctx.arc(c, c, r * 0.97, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    // 聲納波：每 2.6 秒從照片邊緣往外擴散
    if (!calmR) {
      const ph = (now / 2600) % 1;
      ctx.strokeStyle = `rgba(${theme.acc},${0.35 * (1 - ph)})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(c, c, r * (0.42 + ph * 0.58), 0, 7); ctx.stroke(); ctx.lineWidth = 1;
    }
    // 掃描扇形
    if (!calmR) {
      for (let k = 0; k < 40; k++) {
        const a0 = sweep - k * 0.028;
        ctx.fillStyle = `rgba(${theme.acc},${0.16 * (1 - k / 40)})`;
        ctx.beginPath(); ctx.moveTo(c, c); ctx.arc(c, c, r, a0 - 0.028, a0); ctx.closePath(); ctx.fill();
      }
      ctx.save(); ctx.shadowColor = `rgba(${theme.acc},.9)`; ctx.shadowBlur = 12;
      ctx.strokeStyle = `rgba(${theme.ink},.85)`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(c, c); ctx.lineTo(c + Math.cos(sweep) * r, c + Math.sin(sweep) * r); ctx.stroke(); ctx.restore();
    }
    // 滑鼠準星
    if (mx >= 0 && !hover) {
      ctx.strokeStyle = `rgba(${theme.ink},.25)`; ctx.setLineDash([2, 4]);
      ctx.beginPath(); ctx.moveTo(mx, 0); ctx.lineTo(mx, W); ctx.moveTo(0, my); ctx.lineTo(W, my); ctx.stroke(); ctx.setLineDash([]);
    }
    // 亮點
    for (const it of items) {
      if (step > 0 && norm(it.ang - prev) <= step) { it.seen = now; }
      if (it.seen < 0 && !it.caught) continue;
      const age = it.seen < 0 ? 99 : (now - it.seen) / 1000;
      const glow = Math.max(0.5, 1 - age / 3);
      const [x, y] = pos(it), col = CAT[it.cat][1];
      const big = it === hover || it === active;
      if (age < 1.2 && !calmR) {
        ctx.strokeStyle = hexA(col, 1 - age / 1.2); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(x, y, 6 + age * 18, 0, 7); ctx.stroke();
      }
      if (big) {
        ctx.strokeStyle = hexA(col, .6); ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(c, c); ctx.lineTo(x, y); ctx.stroke(); ctx.setLineDash([]);
      }
      ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = big ? 18 : 10;
      ctx.fillStyle = hexA(col, it.caught ? 1 : glow);
      ctx.beginPath(); ctx.arc(x, y, big ? 8 : 5.5, 0, 7); ctx.fill(); ctx.restore();
      if (it.caught) { ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, big ? 14 : 10, 0, 7); ctx.stroke(); }
    }
    // 鎖定動畫：四個角往內收
    if (lock) {
      const t = (now - lock.t) / 500;
      if (t > 1.6) lock = null; else {
        const [x, y] = pos(lock.it), s = 34 - Math.min(1, t) * 18, col = CAT[lock.it.cat][1];
        ctx.strokeStyle = col; ctx.lineWidth = 2;
        for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
          ctx.beginPath(); ctx.moveTo(x + sx * s, y + sy * (s - 7)); ctx.lineTo(x + sx * s, y + sy * s); ctx.lineTo(x + sx * (s - 7), y + sy * s); ctx.stroke();
        }
      }
    }
    // 粒子
    parts = parts.filter(p => p.life > 0);
    for (const p of parts) {
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.94; p.vy *= 0.94; p.life -= dt;
      ctx.fillStyle = hexA(p.col, Math.max(0, p.life / p.max));
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
    }
    if (vis) requestAnimationFrame(draw);
  }

  function pick(x, y) {
    let best = null, bd = 26;
    for (const it of items) {
      if (it.seen < 0 && !it.caught) continue;
      const [px, py] = pos(it), d = Math.hypot(px - x, py - y);
      if (d < bd) { bd = d; best = it; }
    }
    return best;
  }

  function burst(it) {
    const [x, y] = pos(it), col = CAT[it.cat][1];
    for (let k = 0; k < 26; k++) {
      const a = Math.random() * 6.283, sp = 60 + Math.random() * 160;
      parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 1 + Math.random() * 2.2, life: .6 + Math.random() * .5, max: 1.1, col });
    }
    lock = { it, t: performance.now() };
  }

  // 標題逐字解碼
  function decode(el, text) {
    const glyph = '01#%&*+=<>/\\ABCDEFGHJKLMNPQRSTUVWXYZ';
    let f = 0; const total = 14;
    const tick = () => {
      f++;
      const keep = Math.floor(text.length * f / total);
      el.textContent = text.slice(0, keep) + [...text.slice(keep)].map(ch => ch === ' ' ? ' ' : glyph[Math.random() * glyph.length | 0]).join('').slice(0, Math.max(0, text.length - keep));
      if (f < total) setTimeout(tick, 35); else el.textContent = text;
    };
    if (calmR) el.textContent = text; else tick();
  }

  function setPhoto(src, alt, col) {
    stage.style.setProperty('--ring', col);
    if (!src) return;
    const curEl = rps.find(r => r.classList.contains('on'));
    if (curEl && curEl.getAttribute('src') === src) return;
    const next = rps.find(r => r !== curEl);
    next.onload = () => { curEl.classList.remove('on'); next.classList.add('on'); };
    next.alt = alt; next.src = src;
    if (next.complete && next.naturalWidth) next.onload();
  }

  function show(it) {
    active = it;
    const col = CAT[it.cat][1];
    setPhoto(it.photo, it.title, col);
    card.style.setProperty('--ring', col);
    const got = items.filter(i => i.caught).length, all = got === n;
    card.classList.remove('empty', 'pop'); void card.offsetWidth; card.classList.add('pop');
    card.innerHTML = `<p class="k">${it.time}　${CAT[it.cat][0]}</p><h3></h3><p class="d"></p>
      <div class="row">${it.st}<button class="go" type="button">看詳細 ↓</button></div>
      ${all ? '<p class="k" style="margin-top:10px">全部找到了。想聊聊的話，<a href="#contact">到聯絡區找我</a>。</p>' : ''}`;
    decode(card.querySelector('h3'), it.title);
    card.querySelector('.d').textContent = it.desc;
    card.querySelector('.go').addEventListener('click', () => {
      const d = it.li.querySelector('details'); if (d) d.open = true;
      it.li.scrollIntoView({ behavior: calmR ? 'auto' : 'smooth', block: 'center' });
      it.li.classList.remove('flash'); void it.li.offsetWidth; it.li.classList.add('flash');
    });
    updCount();
  }

  cv.addEventListener('pointermove', e => {
    const b = cv.getBoundingClientRect(); mx = e.clientX - b.left; my = e.clientY - b.top;
    hover = pick(mx, my); cv.style.cursor = hover ? 'pointer' : 'crosshair';
    if (hover) {
      const [x, y] = pos(hover);
      tip.textContent = hover.title; tip.style.left = x + 'px'; tip.style.top = y + 'px'; tip.hidden = false;
    } else tip.hidden = true;
  });
  cv.addEventListener('pointerleave', () => { hover = null; mx = my = -1; tip.hidden = true; });
  cv.addEventListener('click', e => {
    const b = cv.getBoundingClientRect(), it = pick(e.clientX - b.left, e.clientY - b.top);
    if (!it) return;
    it.caught = true;
    try { localStorage.setItem('radarCaught', JSON.stringify(items.filter(i => i.caught).map(i => i.title))); } catch (e) {}
    burst(it); show(it);
  });

  addEventListener('resize', size); size();
  new IntersectionObserver(es => {
    const v = es[0].isIntersecting;
    if (v && !vis) { vis = true; last = performance.now(); requestAnimationFrame(draw); }
    vis = v;
  }).observe(cv);
})();
