// 介面文字：中文版、英文版共用同一支程式
const EN = (document.documentElement.lang || '').startsWith('en');
const T = EN
  ? { menu: 'Menu', close: 'Close', dark: 'Dark', light: 'Light', go: 'See this one ↓', all: 'You found them all. If you want to talk, the contact details are at the bottom.', more: 'Keep moving the light, there is more on stage.' }
  : { menu: '選單', close: '關閉', dark: '深色', light: '淺色', go: '看這段經歷 ↓', all: '全部找到了。想聊聊的話，到最下面的聯絡區找我', more: '繼續移動燈光，台上還有別的' };

// 中／英切換：保留現在看到的段落
document.querySelectorAll('.lang-btn').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  const sec = [...document.querySelectorAll('main section[id]')].reverse().find(s => s.getBoundingClientRect().top < innerHeight * 0.4);
  try { localStorage.setItem('lang', EN ? 'zh' : 'en'); } catch (err) {}
  location.href = a.getAttribute('href') + (sec ? '#' + sec.id : '');
}));

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
const secs = links.map(a => { const h = a.getAttribute('href'); return h.startsWith('#') ? document.querySelector(h) : null; });
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
}), { rootMargin: '-40% 0px -55% 0px' });
secs.forEach(s => s && spy.observe(s));

// 手機選單
const bar = document.querySelector('.bar');
const mb = document.querySelector('.menu-btn');
if (mb) mb.addEventListener('click', () => {
  const o = bar.classList.toggle('open');
  mb.setAttribute('aria-expanded', o); mb.textContent = o ? T.close : T.menu;
});
if (mb) links.forEach(a => a.addEventListener('click', () => { bar.classList.remove('open'); mb.setAttribute('aria-expanded', false); mb.textContent = T.menu; }));

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
  if (lbl) lbl.textContent = d ? T.light : T.dark;
}
document.querySelector('.theme-btn')?.addEventListener('click', () => {
  const next = isDark() ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch (e) {}
  applyTheme();
});
darkMQ.addEventListener?.('change', applyTheme);
applyTheme();

// ---------- 開場：舞台燈閃兩下後亮起 ----------
(() => {
  const st = document.querySelector('.hero.stage');
  if (!st) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { st.classList.remove('lamp-off'); return; }
  setTimeout(() => { st.classList.remove('lamp-off'); st.classList.add('lamp-on'); }, 350);
})();

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
  const idOf = li => li.id || li.querySelector('h3')?.textContent.trim();

  // 手繪小圖形：依經歷內容配，線條故意不太規則
  const D = {
    star:   'M12 2.6 L14.4 9.3 L21.4 9.1 L15.9 13.6 L18.3 20.6 L12.2 16.4 L6.1 20.8 L8.1 13.8 L2.6 9.7 L9.6 9.1 Z',
    note:   'M8.6 18.6 C8.4 20.6 4.6 21.2 4.5 19 C4.4 17.1 7.8 16.2 8.6 17.4 L9 5.2 L18.8 3.4 L18.6 16.1 C18.4 18.1 14.7 18.7 14.5 16.6 C14.4 14.7 17.8 13.8 18.6 15 M9 8.6 L18.7 6.9',
    plane:  'M2.6 11.4 L21.3 3.2 L15.6 20.6 L11.3 13.2 Z M11.3 13.2 L21.3 3.2 M11.3 13.2 L10.6 18.9 L13.4 16.1',
    planet: 'M12.2 6.4 C16 6.3 18.1 9.4 17.8 12.4 C17.4 15.8 14.6 17.9 11.6 17.6 C8.3 17.3 6.1 14.6 6.4 11.5 C6.7 8.6 9.1 6.5 12.2 6.4 Z M6.9 9.6 C2.1 10.6 1.4 13.4 4.6 14.1 C8 14.9 15.4 12.9 19.2 10.8 C22.4 9 21.9 7.3 17.6 7.9',
    atom:   'M12 3.1 C15.1 3.3 16.1 8 15.6 12.4 C15 17.3 13.4 21 11.8 20.9 C9.2 20.8 8.2 15.9 8.6 11.4 C9 6.6 10.4 3 12 3.1 Z M3.6 8.1 C5.1 5.5 10.1 6.9 13.9 9.2 C18.2 11.8 21.4 15 20.5 16.4 C19.2 18.6 14.1 17.4 10 15 C5.7 12.5 2.6 9.6 3.6 8.1 Z M12 11.4 L12.2 12.6',
    gear:   'M12 8.6 C14 8.5 15.5 10.1 15.4 12.1 C15.3 14 13.8 15.4 11.9 15.4 C10 15.3 8.6 13.8 8.6 11.9 C8.7 10 10.1 8.6 12 8.6 Z M11.1 2.9 L12.9 3 L13.3 5.6 L15.7 6.6 L17.8 5 L19.1 6.3 L17.6 8.5 L18.5 10.8 L21.1 11.2 L21 13 L18.4 13.5 L17.4 15.8 L18.9 17.9 L17.6 19.2 L15.5 17.7 L13.2 18.6 L12.8 21.2 L11 21.1 L10.6 18.5 L8.3 17.5 L6.2 19 L4.9 17.6 L6.4 15.6 L5.5 13.3 L2.9 12.8 L3 11 L5.6 10.6 L6.5 8.3 L5.1 6.2 L6.4 4.9 L8.5 6.4 L10.7 5.5 Z',
    book:   'M12 6.2 C9.5 4.6 6.1 4.4 3.2 5 L3.4 18.8 C6.3 18.2 9.6 18.5 12 20 C14.4 18.4 17.8 18.1 20.7 18.7 L20.6 4.9 C17.8 4.3 14.4 4.6 12 6.2 Z M12 6.2 L12 20',
    radar:  'M4.3 19.6 C3.1 12 7.9 5.1 15.2 4 M7.6 19.4 C7 14.2 10.4 9.2 15.4 8.4 M11 19.3 C10.9 16.2 12.9 13.5 15.6 12.9 M3.4 20.1 L20.6 19.8 M15.6 12.9 L18.4 10.1',
    bulb:   'M12 2.8 C15.9 2.9 18.3 5.7 18.1 8.9 C17.9 11.6 16 12.9 15.3 14.9 L8.9 15 C8.1 13 6.1 11.8 5.9 9 C5.7 5.6 8.3 2.7 12 2.8 Z M9.2 17.6 L14.9 17.5 M10 20.4 L14.1 20.3 M12 15 L11.9 10.6 L10.2 8.8 M11.9 10.6 L13.8 8.9',
    flag:   'M5.2 21.4 L5.6 3 M5.6 4.1 C9.1 2 12.2 6.5 15.6 4.6 C17.2 3.8 18.6 3.6 19.6 4.1 L19.3 12.4 C16.4 11.2 13.6 14.6 10.1 13.1 C8.1 12.2 6.8 12.3 5.5 13',
    eye:    'M2.4 12.1 C5.6 6.6 10.4 5.1 14.2 5.7 C17.4 6.2 20 8.4 21.6 11.8 C18.6 17.2 13.6 18.9 9.6 18.2 C6.4 17.6 4 15.4 2.4 12.1 Z M12 9.1 C13.8 9 15 10.4 14.9 12.1 C14.8 13.7 13.5 14.9 11.9 14.8 C10.3 14.7 9.1 13.4 9.2 11.9 C9.3 10.3 10.5 9.1 12 9.1 Z',
    pencil: 'M15.6 3.6 L20.4 8.3 L8.6 20.2 L3.2 21 L3.9 15.5 Z M13.4 5.9 L18.1 10.5 M3.9 15.5 L8.6 20.2',
    play:   'M4.1 5.3 L19.8 5.1 L20 18.8 L4 19 Z M10 8.9 L15.6 12 L10.1 15.3 Z M4.1 8.4 L6.4 8.4 M4 15.6 L6.3 15.6 M17.7 8.3 L19.9 8.3 M17.8 15.5 L20 15.5',
    bubble: 'M4.2 5.1 C9.4 3.6 15.2 3.6 19.8 5.3 C21.2 8.6 21 12.2 19.7 15.1 C16.4 16.3 13.2 16.5 10.1 16.2 L5.6 20.4 L6.3 15.6 C4.8 15.1 3.6 14.6 3.4 13.8 C2.6 11 2.9 7.8 4.2 5.1 Z',
    heart:  'M12 20.2 C5.1 15.1 2.7 11.3 4.5 7.6 C6.2 4.3 10.2 4.9 12 8.4 C13.9 4.7 18.1 4.2 19.7 7.7 C21.3 11.4 18.7 15.3 12 20.2 Z',
    sparkle:'M12 2.2 C12.6 8.1 13.2 10.9 21.2 12 C13.3 12.9 12.7 15.1 12.1 21.8 C11.4 15.3 10.7 12.8 2.8 12.2 C10.8 11.1 11.4 8.4 12 2.2 Z',
  };
  const PICK = [['越南','plane'],['職涯','star'],['火星','planet'],['量子','atom'],['TRC','gear'],['WordMemo','book'],['機會雷達','radar'],['NUVA','bulb'],
    ['學生會','flag'],['捲線器','gear'],['國防','eye'],['創天下','bulb'],['班代','flag'],['ESP32','gear'],['Fusion','gear'],['單字網站','book'],
    ['跨考','pencil'],['青年百億','plane'],['影片','play'],['熱舞社','note'],['丹麥','bubble'],['英文簡報','bubble']];
  const shapeFor = (li, t) => D[li.dataset.shape] || D[(PICK.find(([k]) => t.includes(k)) || [0, 'sparkle'])[1]];
  const items = lis.map((li, i) => {
    const title = li.querySelector('h3')?.textContent.trim() || '';
    const SHORT = { '越南':'TDTU 交流', '職涯探索':'職涯探索佳作', '火星':'火星車競賽', '全國智慧運算':'量子競賽', 'TRC':'TRC 競賽', 'WordMemo':'WordMemo', '中原機會雷達':'機會雷達', 'NUVA':'NUVA 大使', '學生會':'學生會公關部', '捲線器':'捲線器', '國防':'國防 AI 競賽', '桃園之星':'創天下競賽', '班代':'班代', 'ESP32':'ESP32 小車', 'Fusion':'3D 列印', 'AI 英文單字':'單字網站', '社會組跨考':'跨考自然組', '青年百億':'青年百億', '活動影片':'影片剪輯', '熱舞社':'熱舞社幹部', '丹麥':'丹麥交流主持', '班級英文簡報':'英文簡報' };
    const key = Object.keys(SHORT).find(k => title.includes(k));
    const short = li.dataset.short || (key ? SHORT[key] : title.replace(/^2026\s*/, '').split(/[　、（]/)[0]);
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'prop';
    b.innerHTML = `<svg class="doodle" viewBox="0 0 24 24" aria-hidden="true"><path d="${shapeFor(li, title)}"/></svg><span></span><b></b>`;
    b.querySelector('span').textContent = li.querySelector('time')?.textContent.trim() || '';
    b.querySelector('b').textContent = short;
    b.setAttribute('aria-label', title);
    propsBox.appendChild(b);
    const it = { li, el: b, title, time: b.querySelector('span').textContent, desc: li.querySelector('h3 + p')?.textContent.trim() || '', st: li.querySelector('.st')?.outerHTML || '', got: saved.includes(idOf(li)) || saved.includes(title), x: 0, y: 0, lit: 0 };
    if (it.got) b.classList.add('got');
    b.addEventListener('click', e => { e.stopPropagation(); if (it.lit > 0.5 || it.got || e.detail === 0) call(it); else aim(it.x, it.y); });
    b.addEventListener('focus', () => { aim(it.x, it.y); lastMove = performance.now() + 60000; });
    b.addEventListener('blur', () => { lastMove = performance.now(); });
    return it;
  });
  st.querySelectorAll('.total').forEach(e => e.textContent = String(n).padStart(2, '0'));
  const count = () => st.querySelectorAll('.got').forEach(e => { if (e.tagName === 'SPAN') e.textContent = String(items.filter(i => i.got).length).padStart(2, '0'); });
  count();

  // 把經歷散在舞台上：桌機放右半邊，手機放在照片那一塊
  let W = 0, H = 0, mobile = false;
  // 散開擺放：位置隨機但固定（同一個種子），放之前先檢查不會碰到別人和節目單
  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function layout() {
    W = st.clientWidth; mobile = W < 900;
    const program = st.querySelector('.program');
    program.style.paddingTop = ''; st.style.minHeight = '';
    // 先量每個標籤的大小（用最大的狀態量，日期也算進去）
    items.forEach(it => { it.el.style.width = 'auto'; it.el.classList.add('measure'); });
    const sizes = items.map(it => { const r = it.el.getBoundingClientRect(); return [Math.ceil(r.width) + 14, Math.ceil(r.height) + 12]; });
    items.forEach(it => it.el.classList.remove('measure'));
    const sb = st.getBoundingClientRect();
    const blocks = mobile ? [] : [...program.children].map(e => { const r = e.getBoundingClientRect(); return [r.left - sb.left - 20, r.top - sb.top - 10, r.right - sb.left + 20, r.bottom - sb.top + 10]; });
    let x0, x1, y0, y1;
    if (mobile) { x0 = 8; x1 = W - 8; y0 = 20; y1 = Math.max(innerHeight * 0.62, 460); }
    else { H = st.clientHeight; x0 = W * 0.46; x1 = W - 16; y0 = H * 0.06; y1 = H * 0.95; }
    let placedOk = false;
    for (let attempt = 0; attempt < 24; attempt++) {
      const rand = rng(20261121 + attempt), placed = []; let ok = true;
      for (let i = 0; i < n && ok; i++) {
        const [w, h] = sizes[i]; let done = false;
        for (let k = 0; k < 600 && !done; k++) {
          const x = x0 + w / 2 + rand() * Math.max(1, x1 - x0 - w), y = y0 + h / 2 + rand() * Math.max(1, y1 - y0 - h);
          const box = [x - w / 2, y - h / 2, x + w / 2, y + h / 2];
          const hit = a => box[0] < a[2] && a[0] < box[2] && box[1] < a[3] && a[1] < box[3];
          if (placed.some(p => hit(p.box)) || blocks.some(hit)) continue;
          placed.push({ i, x, y, box }); done = true;
        }
        if (!done) ok = false;
      }
      if (ok) { placed.forEach(p => { const it = items[p.i]; it.x = p.x; it.y = p.y; }); placedOk = true; break; }
      y1 += 80;                                   // 放不下就把舞台拉長一點再試
      if (!mobile) st.style.minHeight = (y1 + 30) + 'px';
    }
    if (!placedOk) {                               // 保險：真的放不下就排成不重疊的格子
      const cols = mobile ? 3 : 4, cw = (x1 - x0) / cols, rh = Math.max(...sizes.map(s => s[1]));
      items.forEach((it, i) => { it.x = x0 + cw * (i % cols + 0.5); it.y = y0 + rh * (Math.floor(i / cols) + 0.5); });
      y1 = y0 + rh * Math.ceil(n / cols);
      if (!mobile) st.style.minHeight = (y1 + 30) + 'px';
    }
    if (mobile) program.style.paddingTop = (y1 + 28) + 'px';
    H = st.clientHeight;
    items.forEach(it => { it.el.style.left = it.x + 'px'; it.el.style.top = it.y + 'px'; it.el.style.width = ''; });
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
      it.el.style.opacity = it.el === document.activeElement ? 1 : Math.max(it.lit, it.got ? 0.55 : 0);
      if (it.lit > 0.6 && (!hot || d < Math.hypot(hot.x - sx, hot.y - sy))) hot = it;
      it.el.classList.toggle('hot', it === hot);
    }
    requestAnimationFrame(frame);
  }

  function call(it) {
    it.got = true; it.el.classList.add('got');
    try { localStorage.setItem('cueFound', JSON.stringify(items.filter(i => i.got).map(i => idOf(i.li)))); } catch (e) {}
    const got = items.filter(i => i.got).length;
    line.classList.remove('pop'); void line.offsetWidth; line.classList.add('pop');
    line.innerHTML = `<p class="k">CUE ${String(got).padStart(2, '0')} / ${String(n).padStart(2, '0')}　${it.time}</p><h3></h3><p class="d"></p><button class="go" type="button">${T.go}</button>
      <p class="again">${got === n ? T.all : T.more}</p>`;
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
      if (btn.dataset.page) { location.href = btn.dataset.page; return; }
      const li = document.querySelector(btn.dataset.target);
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
  // 舞台排完之後高度可能變了，網址有 #段落 的話再對準一次（中英切換時用得到）
  const reHash = () => { const t = location.hash && document.querySelector(location.hash); if (t) t.scrollIntoView({ behavior: 'auto' }); };
  reHash(); addEventListener('load', reHash, { once: true });
  requestAnimationFrame(frame);
})();
