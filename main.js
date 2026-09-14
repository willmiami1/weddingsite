// ============ DESTINY RANCH EVENTS — MAIN JS ============

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');
navToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  })
);

// Header shadow on scroll
const header = document.getElementById('header');
window.addEventListener(
  'scroll',
  () => header.classList.toggle('scrolled', window.scrollY > 10),
  { passive: true }
);

// Current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Reveal-on-scroll animation
const revealTargets = document.querySelectorAll(
  '.section-head, .about-copy, .about-banner, .stat-band, ' +
    '.rate-card, .rate-disclaimer, .included, .gallery-placeholder, ' +
    '.quote-card, .faq-item, .contact-card, .contact-map'
);
revealTargets.forEach((el) => el.classList.add('reveal'));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealTargets.forEach((el) => observer.observe(el));

// Only one FAQ open at a time
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach((item) =>
  item.addEventListener('toggle', () => {
    if (item.open) faqItems.forEach((o) => { if (o !== item) o.open = false; });
  })
);
