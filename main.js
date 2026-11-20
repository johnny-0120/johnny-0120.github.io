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

// ---------- 開場：5、6、7、8，第 8 拍燈亮 ----------
const intro = document.querySelector('.intro');
if (intro && !document.documentElement.classList.contains('no-intro')) {
  document.body.style.overflow = 'hidden';
  const open = () => {
    if (intro.classList.contains('open')) return;
    intro.classList.add('open');
    document.body.style.overflow = '';
    try { sessionStorage.setItem('introSeen', '1'); } catch (e) {}
    setTimeout(() => intro.remove(), 750);
  };
  setTimeout(open, 1750);
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
  document.querySelectorAll('.work, .cert-grid figure').forEach(el => {
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

// ---------- 封面舞台：追光燈找經歷 ----------
(() => {
  const st = document.querySelector('.hero.stage');
  if (!st) return;
  const propsBox = st.querySelector('.props');
  const poly = st.querySelector('.st-beam polygon');
  const svg = st.querySelector('.st-beam');
  const line = st.querySelector('.cue-line');
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lis = [...document.querySelectorAll('.tl li[data-c]')];
  const n = lis.length;
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem('cueFound') || '[]'); } catch (e) {}

  const items = lis.map((li, i) => {
    const title = li.querySelector('h3')?.textContent.trim() || '';
    const SHORT = { '越南':'TDTU 交流', '職涯探索':'職涯探索佳作', '火星':'火星車競賽', '全國智慧運算':'量子競賽', 'TRC':'TRC 競賽', 'WordMemo':'WordMemo', '中原機會雷達':'機會雷達', 'NUVA':'NUVA 大使', '學生會':'學生會公關部', '捲線器':'捲線器', '國防':'國防 AI 競賽', '桃園之星':'創天下競賽', '班代':'班代', 'ESP32':'ESP32 小車', 'Fusion':'3D 列印', 'AI 英文單字':'單字網站', '社會組跨考':'跨考自然組', '青年百億':'青年百億', '活動影片':'影片剪輯', '熱舞社':'熱舞社幹部', '丹麥':'丹麥交流主持', '班級英文簡報':'英文簡報' };
    const key = Object.keys(SHORT).find(k => title.includes(k));
    const short = key ? SHORT[key] : title.replace(/^2026\s*/, '').split(/[　、（]/)[0];
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'prop';
    b.innerHTML = `<i></i><span></span><b></b>`;
    b.querySelector('span').textContent = li.querySelector('time')?.textContent.trim() || '';
    b.querySelector('b').textContent = short;
    b.setAttribute('aria-label', title);
    propsBox.appendChild(b);
    const it = { li, el: b, title, time: b.querySelector('span').textContent, desc: li.querySelector('h3 + p')?.textContent.trim() || '', st: li.querySelector('.st')?.outerHTML || '', got: saved.includes(title), x: 0, y: 0, lit: 0 };
    if (it.got) b.classList.add('got');
    b.addEventListener('click', e => { e.stopPropagation(); if (it.lit > 0.5 || it.got) call(it); else aim(it.x, it.y); });
    return it;
  });
  st.querySelectorAll('.total').forEach(e => e.textContent = String(n).padStart(2, '0'));
  const count = () => st.querySelectorAll('.got').forEach(e => { if (e.tagName === 'SPAN') e.textContent = String(items.filter(i => i.got).length).padStart(2, '0'); });
  count();

  // 把經歷散在舞台上：桌機放右半邊，手機放在照片那一塊
  let W = 0, H = 0, mobile = false;
  function layout() {
    W = st.clientWidth; H = st.clientHeight; mobile = W < 900;
    const x0 = mobile ? 0.06 : 0.47, x1 = mobile ? 0.94 : 0.97;
    const y0 = mobile ? 0.04 : 0.1, y1 = mobile ? Math.min(0.5, (innerHeight * 0.58) / H) : 0.92;
    const cols = mobile ? 3 : 5, rows = Math.ceil(n / cols);
    items.forEach((it, i) => {
      const c = i % cols, r = Math.floor(i / cols);
      const jx = ((i * 0.618) % 1 - 0.5) * 0.35, jy = ((i * 0.381) % 1 - 0.5) * 0.35;
      it.x = (x0 + (x1 - x0) * ((c + 0.5 + jx) / cols)) * W;
      it.y = (y0 + (y1 - y0) * ((r + 0.5 + jy) / rows)) * H;
      it.x = Math.max(56, Math.min(W - 56, it.x));
      it.el.style.left = it.x + 'px'; it.el.style.top = it.y + 'px';
    });
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  }

  // 追光燈：滑鼠帶著走，沒動的時候自己在台上搜尋
  let sx = 0, sy = 0, tx = 0, ty = 0, R = 170, lastMove = -1e9, t0 = performance.now(), hot = null;
  function aim(x, y) { tx = x; ty = y; lastMove = performance.now(); }
  st.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const b = st.getBoundingClientRect(); aim(e.clientX - b.left, e.clientY - b.top);
  });
  st.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse') return;
    const b = st.getBoundingClientRect(); aim(e.clientX - b.left, e.clientY - b.top);
  });

  function frame(now) {
    if (st.classList.contains('showing')) {           // 正在介紹某件作品：燈打在舞台中央
      tx = mobile ? W * 0.5 : W * 0.7; ty = mobile ? H * 0.22 : H * 0.48;
    } else if (now - lastMove > 2600 && !calm) {                 // 閒置：追光燈在台上畫 8 字找人
      const t = (now - t0) / 1000;
      const cx = mobile ? W * 0.5 : W * 0.72, cy = mobile ? H * 0.25 : H * 0.5;
      tx = cx + Math.sin(t * 0.55) * W * (mobile ? 0.32 : 0.2);
      ty = cy + Math.sin(t * 1.1) * H * (mobile ? 0.15 : 0.28);
    }
    const k = calm ? 1 : 0.12;
    sx += (tx - sx) * k; sy += (ty - sy) * k;
    const showing = st.classList.contains('showing');
    R += ((showing ? (mobile ? 170 : 300) : (mobile ? 120 : 170)) - R) * 0.12;
    st.style.setProperty('--x', sx + 'px'); st.style.setProperty('--y', sy + 'px'); st.style.setProperty('--r', R + 'px');
    // 光束：從舞台上方的燈打下來
    const lx = W * (mobile ? 0.5 : 0.62), ly = -40, ang = Math.atan2(sy - ly, sx - lx), px = Math.cos(ang + Math.PI / 2) * R * 0.9, py = Math.sin(ang + Math.PI / 2) * R * 0.9;
    poly.setAttribute('points', `${lx - 6},${ly} ${lx + 6},${ly} ${sx + px},${sy + py} ${sx - px},${sy - py}`);
    hot = null;
    for (const it of items) {
      const d = Math.hypot(it.x - sx, it.y - sy);
      it.lit = Math.max(0, Math.min(1, (R * 0.95 - d) / (R * 0.35)));
      it.el.style.opacity = Math.max(it.lit, it.got ? 0.55 : 0);
      if (it.lit > 0.6 && (!hot || d < Math.hypot(hot.x - sx, hot.y - sy))) hot = it;
      it.el.classList.toggle('hot', it === hot);
    }
    requestAnimationFrame(frame);
  }

  function call(it) {
    it.got = true; it.el.classList.add('got');
    try { localStorage.setItem('cueFound', JSON.stringify(items.filter(i => i.got).map(i => i.title))); } catch (e) {}
    const got = items.filter(i => i.got).length;
    line.classList.remove('pop'); void line.offsetWidth; line.classList.add('pop');
    line.innerHTML = `<p class="k">CUE ${String(got).padStart(2, '0')} / ${String(n).padStart(2, '0')}　${it.time}</p><h3></h3><p class="d"></p><button class="go" type="button">看這段經歷 ↓</button>
      <p class="again">${got === n ? '全部找到了。想聊聊的話，到最下面的聯絡區找我' : '繼續移動燈光，台上還有別的'}</p>`;
    line.querySelector('h3').textContent = it.title;
    line.querySelector('.d').textContent = it.desc;
    line.querySelector('.go').addEventListener('click', () => {
      const d = it.li.querySelector('details'); if (d) d.open = true;
      it.li.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' });
      it.li.classList.remove('flash'); void it.li.offsetWidth; it.li.classList.add('flash');
    });
  }

  st.addEventListener('click', e => { if (hot && e.target.closest('.program') == null) call(hot); });

  // 節目單：滑過去，舞台換成那件作品；點了跳到詳細經歷
  const photos = [...st.querySelectorAll('.st-photo')];
  const base = photos[0].getAttribute('src');
  let swapT = null, curSrc = base;
  function showPhoto(src, pos) {
    if (src === curSrc) return;
    curSrc = src; clearTimeout(swapT);
    st.classList.toggle('showing', src !== base);
    st.classList.add('swapping');
    swapT = setTimeout(() => {
      photos.forEach(p => { p.src = src; p.style.objectPosition = pos; });
      st.classList.remove('swapping');
    }, 180);
  }
  const pgItems = [...st.querySelectorAll('.pg-item')];
  pgItems.forEach(btn => {
    const img = new Image(); img.src = btn.dataset.img;           // 先載好，換的時候不會閃
    btn.addEventListener('mouseenter', () => {
      pgItems.forEach(b => b.classList.toggle('on', b === btn));
      showPhoto(btn.dataset.img, '50% 45%');
    });
    btn.addEventListener('focus', () => showPhoto(btn.dataset.img, '50% 45%'));
    btn.addEventListener('click', () => {
      const li = lis.find(l => (l.querySelector('h3')?.textContent || '').includes(btn.dataset.find));
      if (!li) return;
      const d = li.querySelector('details'); if (d) d.open = true;
      li.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' });
      li.classList.remove('flash'); void li.offsetWidth; li.classList.add('flash');
    });
  });
  st.querySelector('.pg-list').addEventListener('mouseleave', () => {
    pgItems.forEach(b => b.classList.remove('on'));
    showPhoto(base, '');
  });
  addEventListener('resize', layout);
  layout(); sx = tx = W * (mobile ? 0.55 : 0.62); sy = ty = H * (mobile ? 0.25 : 0.45);
  requestAnimationFrame(frame);
})();
