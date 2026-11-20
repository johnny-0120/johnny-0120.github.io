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
