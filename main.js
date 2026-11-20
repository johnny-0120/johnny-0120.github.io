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
