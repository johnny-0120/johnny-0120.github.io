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

// 首頁互動：選一個面向，換照片和一句話
const roles = [
  { text: '熱舞社成發主持、丹麥訪問團英文主持、NUVA 活動分享。', link: '#stage', label: '看舞台 ↓' },
  { text: '高中熱舞社的活動兼教學幹部，教舞、辦成果發表會。', link: '#stage', label: '看舞台 ↓' },
  { text: '做了 WordMemo 單字記憶和中原機會雷達，兩個都已經上線。', link: '#works', label: '看作品 ↓' },
  { text: 'ESP32 避障小車、火星車降落機體，還有自己設計棘輪和齒輪的捲線器。', link: '#timeline', label: '看經歷 ↓' },
];
const roleBox = document.querySelector('.roles');
const roleBtns = [...roleBox.querySelectorAll('button')];
const slides = [...document.querySelectorAll('.frame .slide')];
const line = document.querySelector('.role-line');
const lineText = line.querySelector('.role-text');
const lineLink = line.querySelector('.role-link');
let cur = 0, timer = null;
function show(i) {
  if (i === cur) return;
  cur = i;
  roleBtns.forEach((b, k) => { b.classList.toggle('on', k === i); b.setAttribute('aria-selected', k === i); });
  slides.forEach((s, k) => { if (k === i) s.loading = 'eager'; s.classList.toggle('on', k === i); });
  line.classList.add('fade');
  setTimeout(() => {
    lineText.textContent = roles[i].text;
    lineLink.href = roles[i].link; lineLink.textContent = roles[i].label;
    line.classList.remove('fade');
  }, 250);
}
function stopAuto() { clearInterval(timer); timer = null; roleBox.classList.remove('auto'); }
function restartBar() { roleBox.classList.remove('auto'); void roleBox.offsetWidth; roleBox.classList.add('auto'); }
roleBtns.forEach((b, k) => b.addEventListener('click', () => { stopAuto(); show(k); }));
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduce) {
  slides.forEach(s => { s.loading = 'eager'; });
  roleBox.classList.add('auto');
  timer = setInterval(() => { show((cur + 1) % roles.length); restartBar(); }, 4500);
}
