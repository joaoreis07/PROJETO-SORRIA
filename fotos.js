const photos = Array.isArray(window.sorriaPhotos) ? window.sorriaPhotos : [];
const grid = document.querySelector('#photo-grid');
const empty = document.querySelector('#empty-state');
const resultLine = document.querySelector('#photo-results');
const search = document.querySelector('#photo-search');
const total = document.querySelector('#photo-total');
const allCount = document.querySelector('#all-count');
const filters = [...document.querySelectorAll('.filter-button')];
const lightbox = document.querySelector('#photo-lightbox');
const lightboxImage = document.querySelector('#lightbox-image');
const lightboxCaption = document.querySelector('#lightbox-caption');
let activePhotos = [];
let activeIndex = 0;

total.textContent = String(photos.length).padStart(3, '0');
allCount.textContent = photos.length;
document.querySelector('#year-25-count').textContent = photos.filter(photo => photo.year === '2025').length;
document.querySelector('#year-26-count').textContent = photos.filter(photo => photo.year === '2026').length;

function revealTile(tile) {
  if (!('IntersectionObserver' in window)) {
    tile.classList.add('is-visible');
    return;
  }
  tile.dataset.reveal = '';
  tile.style.setProperty('--delay', Math.min((grid.children.length % 8) * 35, 245) + 'ms');
  tileObserver.observe(tile);
}

const tileObserver = 'IntersectionObserver' in window
  ? new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        tileObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -35px 0px' })
  : null;

function render() {
  const selectedYear = document.querySelector('.filter-button.active')?.dataset.filter || 'all';
  const term = (search.value || '').trim().toLocaleLowerCase('pt-BR');
  activePhotos = photos.filter(photo => {
    const yearMatches = selectedYear === 'all' || photo.year === selectedYear;
    const textMatches = !term || (photo.year + ' ' + photo.title + ' ' + photo.alt).toLocaleLowerCase('pt-BR').includes(term);
    return yearMatches && textMatches;
  });

  grid.replaceChildren();
  activePhotos.forEach((photo, index) => {
    const tile = document.createElement('figure');
    tile.className = 'photo-tile';
    tile.tabIndex = 0;
    tile.setAttribute('role', 'button');
    tile.setAttribute('aria-label', 'Abrir foto: ' + photo.title + ', ' + photo.year);
    const image = document.createElement('img');
    image.src = photo.src;
    image.alt = photo.alt;
    image.loading = 'lazy';
    image.decoding = 'async';
    const caption = document.createElement('figcaption');
    const title = document.createElement('span');
    title.textContent = photo.title === 'Um dia de alegria'
      ? (photo.year === '2026' ? 'Páscoa 2026' : 'Ações 2025')
      : photo.title;
    const year = document.createElement('span');
    year.textContent = String(index + 1).padStart(3, '0');
    caption.append(title, year);
    tile.append(image, caption);
    tile.addEventListener('click', () => openPhoto(index));
    tile.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openPhoto(index);
      }
    });
    grid.append(tile);
    revealTile(tile);
  });

  empty.hidden = activePhotos.length > 0;
  resultLine.textContent = activePhotos.length + (activePhotos.length === 1 ? ' FOTO SELECIONADA' : ' FOTOS SELECIONADAS');
}

function showPhoto() {
  const photo = activePhotos[activeIndex];
  if (!photo) return;
  lightboxImage.src = photo.full || photo.src;
  lightboxImage.alt = photo.alt;
  const fileNumber = photo.alt.match(/IMG_\d+/)?.[0];
  const title = photo.title === 'Um dia de alegria' ? (fileNumber || 'Registro') : photo.title;
  lightboxCaption.textContent = title + ' · ' + (photo.year === '2026' ? 'PÁSCOA 2026' : 'AÇÕES 2025') + ' · ' + (activeIndex + 1) + ' / ' + activePhotos.length;
}
function openPhoto(index) {
  activeIndex = index;
  showPhoto();
  if (!lightbox.open) lightbox.showModal();
}
function movePhoto(direction) {
  if (!activePhotos.length) return;
  activeIndex = (activeIndex + direction + activePhotos.length) % activePhotos.length;
  showPhoto();
}
function closePhoto() {
  if (lightbox.open) lightbox.close();
}

filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(filter => {
    const active = filter === button;
    filter.classList.toggle('active', active);
    filter.setAttribute('aria-pressed', String(active));
  });
  render();
}));
search.addEventListener('input', render);
document.querySelector('.lightbox-close').addEventListener('click', closePhoto);
document.querySelector('.lightbox-prev').addEventListener('click', () => movePhoto(-1));
document.querySelector('.lightbox-next').addEventListener('click', () => movePhoto(1));
lightbox.addEventListener('click', event => {
  if (event.target === lightbox) closePhoto();
});
document.addEventListener('keydown', event => {
  if (!lightbox.open) return;
  if (event.key === 'ArrowLeft') movePhoto(-1);
  if (event.key === 'ArrowRight') movePhoto(1);
});
render();
