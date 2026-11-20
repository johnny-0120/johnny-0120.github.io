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
document.querySelectorAll('.ph').forEach(p => p.addEventListener('click', () => {
  const i = p.querySelector('img');
  lbImg.src = i.src; lbImg.alt = i.alt; lb.hidden = false;
}));
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

// 淡入
const rv = document.querySelectorAll('.sec-title, .quick-grid article, .tl li, .work, .stage-grid figure, .miss, .contact-big');
rv.forEach(el => el.classList.add('rv'));
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .12 });
rv.forEach(el => io.observe(el));
