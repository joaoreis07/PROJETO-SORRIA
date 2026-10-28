const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menu');
  }));
}

function updateCountdown() {
  const days = document.querySelector('#days');
  if (!days) return;
  const now = new Date();
  let next = new Date(now.getFullYear(), 11, 12, 0, 0, 0);
  if (next <= now) next = new Date(now.getFullYear() + 1, 11, 12, 0, 0, 0);
  const seconds = Math.max(0, Math.floor((next - now) / 1000));
  days.textContent = String(Math.floor(seconds / 86400)).padStart(3, '0');
  document.querySelector('#hours').textContent = String(Math.floor(seconds % 86400 / 3600)).padStart(2, '0');
  document.querySelector('#minutes').textContent = String(Math.floor(seconds % 3600 / 60)).padStart(2, '0');
  document.querySelector('#seconds').textContent = String(seconds % 60).padStart(2, '0');
  document.querySelector('#event-label').textContent = '12 DE DEZEMBRO · ' + next.getFullYear();
}
updateCountdown();
if (document.querySelector('#days')) window.setInterval(updateCountdown, 1000);

const progressBar = document.querySelector('.scroll-progress');
function updateProgress() {
  if (!progressBar) return;
  const range = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (range > 0 ? (window.scrollY / range) * 100 : 0) + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

document.body.classList.add('js-motion');
const revealItems = document.querySelectorAll('[data-reveal]');
revealItems.forEach(item => item.style.setProperty('--delay', (item.dataset.delay || 0) + 'ms'));
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.13, rootMargin: '0px 0px -45px 0px' });
  revealItems.forEach(item => revealObserver.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('is-visible'));
}

const counters = document.querySelectorAll('[data-count]');
if ('IntersectionObserver' in window && counters.length) {
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const node = entry.target;
      const end = Number(node.dataset.count);
      const duration = 1300;
      const start = performance.now();
      const tick = now => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        node.textContent = new Intl.NumberFormat('pt-BR').format(Math.round(end * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterObserver.unobserve(node);
    });
  }, { threshold: 0.55 });
  counters.forEach(counter => counterObserver.observe(counter));
}
