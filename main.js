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
            ctx.strokeStyle = `rgba(81,109,152,${k * 0.35})`; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(px, py); ctx.stroke();
          }
          ctx.fillStyle = `rgba(81,109,152,${a})`;
        } else ctx.fillStyle = `rgba(145,174,210,${a})`;
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

// ---------- 雷達掃描小遊戲：經歷資料直接從下方時間軸讀 ----------
(() => {
  const cv = document.querySelector('.radar');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const CAT = { build: ['做東西', '#A8C0DF'], stage: ['舞台與活動', '#C9B8F0'], contest: ['競賽與申請', '#E8A385'] };
  const lis = [...document.querySelectorAll('.tl li[data-c]')];
  const n = lis.length;
  const items = lis.map((li, i) => {
    const cat = li.dataset.c.split(' ')[0];
    const ang = (i * 2.39996) % (Math.PI * 2);           // 黃金角，點不會擠在一起
    const rad = 0.2 + 0.72 * Math.sqrt((i + 0.5) / n);
    return {
      li, cat, ang, rad,
      time: li.querySelector('time')?.textContent.trim() || '',
      title: li.querySelector('h3')?.textContent.trim() || '',
      desc: li.querySelector('h3 + p')?.textContent.trim() || '',
      tag: li.querySelector('.tag')?.textContent.trim() || '',
      tagCls: li.querySelector('.tag')?.className || 'tag',
      seen: -1, caught: false,
    };
  });
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem('radarCaught') || '[]'); } catch (e) {}
  items.forEach(it => { if (saved.includes(it.title)) it.caught = true; });

  const countB = document.querySelector('.scan-count b');
  const countT = document.querySelector('.scan-count span');
  const bar = document.querySelector('.scan-bar i');
  const card = document.querySelector('.scan-card');
  const chips = document.querySelector('.scan-chips');
  countT.textContent = n;

  const calmR = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, dpr = 1, sweep = -Math.PI / 2, last = performance.now(), hover = null, active = null, vis = false;
  if (calmR) items.forEach(it => { it.seen = 0; });

  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.clientWidth; cv.width = W * dpr; cv.height = W * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const pos = it => [W / 2 + Math.cos(it.ang) * it.rad * W * 0.46, W / 2 + Math.sin(it.ang) * it.rad * W * 0.46];
  const norm = a => ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

  function draw(now) {
    const dt = Math.min(0.2, Math.max(0, (now - last) / 1000)); last = now;
    const prev = sweep;
    if (!calmR) sweep += dt * 1.1;
    const c = W / 2, R = W * 0.46;
    ctx.clearRect(0, 0, W, W);
    // 底盤與刻度
    ctx.fillStyle = '#0D1626'; ctx.beginPath(); ctx.arc(c, c, R, 0, 7); ctx.fill();
    ctx.strokeStyle = '#2A3F5E'; ctx.lineWidth = 1;
    for (let k = 1; k <= 4; k++) { ctx.beginPath(); ctx.arc(c, c, R * k / 4, 0, 7); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(c - R, c); ctx.lineTo(c + R, c); ctx.moveTo(c, c - R); ctx.lineTo(c, c + R); ctx.stroke();
    // 掃描扇形
    if (!calmR) {
      for (let k = 0; k < 36; k++) {
        const a0 = sweep - k * 0.03;
        ctx.fillStyle = `rgba(168,192,223,${0.22 * (1 - k / 36)})`;
        ctx.beginPath(); ctx.moveTo(c, c); ctx.arc(c, c, R, a0 - 0.03, a0); ctx.closePath(); ctx.fill();
      }
      ctx.strokeStyle = 'rgba(237,244,252,.8)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(c, c); ctx.lineTo(c + Math.cos(sweep) * R, c + Math.sin(sweep) * R); ctx.stroke();
    }
    // 亮點
    const step = sweep - prev;
    for (const it of items) {
      if (step > 0 && norm(it.ang - prev) <= step) it.seen = now;   // 這一格掃過它
      if (it.seen < 0 && !it.caught) continue;
      const age = it.seen < 0 ? 99 : (now - it.seen) / 1000;
      const glow = Math.max(0.45, 1 - age / 2.5);
      const [x, y] = pos(it), col = CAT[it.cat][1];
      const big = it === hover || it === active;
      if (age < 1.2 && !calmR) {                             // 掃到時的擴散圈
        ctx.strokeStyle = col; ctx.globalAlpha = 1 - age / 1.2; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(x, y, 6 + age * 16, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
      }
      ctx.globalAlpha = it.caught ? 1 : glow;
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(x, y, (big ? 8 : 5.5) * (it.caught ? 1 : 0.9), 0, 7); ctx.fill();
      if (it.caught) { ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, big ? 13 : 10, 0, 7); ctx.stroke(); }
      ctx.globalAlpha = 1;
    }
    if (vis) requestAnimationFrame(draw); else last = 0;
  }

  function pick(e) {
    const b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
    let best = null, bd = 24;
    for (const it of items) {
      if (it.seen < 0 && !it.caught) continue;
      const [px, py] = pos(it), d = Math.hypot(px - x, py - y);
      if (d < bd) { bd = d; best = it; }
    }
    return best;
  }

  function save() { try { localStorage.setItem('radarCaught', JSON.stringify(items.filter(i => i.caught).map(i => i.title))); } catch (e) {} }

  function show(it) {
    active = it;
    const got = items.filter(i => i.caught).length;
    countB.textContent = got; bar.style.width = (got / n * 100) + '%';
    card.classList.remove('empty', 'pop'); void card.offsetWidth; card.classList.add('pop');
    const all = got === n;
    card.classList.toggle('done', all);
    card.innerHTML = `<p class="k">${it.time} · ${CAT[it.cat][0]}</p><h3></h3><p class="d"></p>
      <div class="row"><b class="${it.tagCls}"></b><button class="go" type="button">看詳細 ↓</button></div>
      ${all ? '<p class="k" style="margin-top:16px">全部找到了。想聊聊的話，<a href="#contact" style="color:#EDF4FC">到聯絡區找我</a>。</p>' : ''}`;
    card.querySelector('h3').textContent = it.title;
    card.querySelector('.d').textContent = it.desc;
    card.querySelector('.row b').textContent = it.tag;
    card.querySelector('.go').addEventListener('click', () => {
      const d = it.li.querySelector('details'); if (d) d.open = true;
      it.li.scrollIntoView({ behavior: calmR ? 'auto' : 'smooth', block: 'center' });
      it.li.classList.remove('flash'); void it.li.offsetWidth; it.li.classList.add('flash');
    });
    renderChips();
  }

  function renderChips() {
    chips.innerHTML = '';
    items.filter(i => i.caught).forEach(i => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = i.title;
      if (i === active) b.classList.add('on');
      b.addEventListener('click', () => show(i));
      chips.appendChild(b);
    });
  }

  cv.addEventListener('pointermove', e => { hover = pick(e); cv.style.cursor = hover ? 'pointer' : 'default'; });
  cv.addEventListener('pointerleave', () => { hover = null; });
  cv.addEventListener('click', e => {
    const it = pick(e); if (!it) return;
    it.caught = true; save(); show(it);
  });

  const got0 = items.filter(i => i.caught).length;
  countB.textContent = got0; bar.style.width = (got0 / n * 100) + '%'; renderChips();
  addEventListener('resize', size); size();
  new IntersectionObserver(es => {
    const v = es[0].isIntersecting;
    if (v && !vis) { vis = true; last = performance.now(); requestAnimationFrame(draw); }
    vis = v;
  }).observe(cv);
})();
