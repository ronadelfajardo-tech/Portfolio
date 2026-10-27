const toggle = document.getElementById('menuToggle');
const nav = document.getElementById('siteNav');
const closeMenu = () => { if (!toggle || !nav) return; nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-label','Open menu'); };
if (toggle && nav) {
  toggle.addEventListener('click', () => { const open = nav.classList.toggle('is-open'); toggle.setAttribute('aria-expanded',String(open)); toggle.setAttribute('aria-label',open ? 'Close menu' : 'Open menu'); });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
}
const filters = document.querySelectorAll('[data-filter]');
const cards = document.querySelectorAll('[data-category]');
filters.forEach(button => button.addEventListener('click', () => {
  const value = button.dataset.filter;
  filters.forEach(b => { const selected = b === button; b.classList.toggle('is-active',selected); b.setAttribute('aria-pressed',String(selected)); });
  cards.forEach(c => c.hidden = value !== 'all' && c.dataset.category !== value);
}));
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
