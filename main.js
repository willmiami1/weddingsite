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
    '.rate-card, .rate-disclaimer, .included, .gallery-item, ' +
    '.testimonial-card, .faq-item, .contact-card, .contact-map, .tour-promo, .calc-card'
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

// ============ GALLERY LIGHTBOX ============
const galleryItems = Array.from(
  document.querySelectorAll('.gallery-item, .testimonial-card')
);
const lightbox = document.getElementById('lightbox');
const lbContent = document.getElementById('lbContent');
let current = 0;

const showItem = (i) => {
  current = (i + galleryItems.length) % galleryItems.length;
  const full = galleryItems[current].getAttribute('data-full');
  lbContent.innerHTML = `<img src="${full}" alt="Destiny Ranch wedding photo">`;
};

const openLightbox = (i) => {
  showItem(i);
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
};

const closeLightbox = () => {
  lightbox.hidden = true;
  lbContent.innerHTML = '';
  document.body.style.overflow = '';
};

if (lightbox) {
  galleryItems.forEach((item, i) =>
    item.addEventListener('click', () => openLightbox(i))
  );
  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  document.getElementById('lbPrev').addEventListener('click', () => showItem(current - 1));
  document.getElementById('lbNext').addEventListener('click', () => showItem(current + 1));
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showItem(current - 1);
    if (e.key === 'ArrowRight') showItem(current + 1);
  });
}

// Only one FAQ open at a time
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach((item) =>
  item.addEventListener('toggle', () => {
    if (item.open) faqItems.forEach((o) => { if (o !== item) o.open = false; });
  })
);

// ============ CONVERSION TRACKING ============
// Google Ads conversion labels (Goals > Conversions > See event snippet).
// Leave '' to disable the Google Ads conversion for that action.
const ADS_ID = 'AW-11395806061';
const ADS_LABELS = {
  book_tour_open: 'WCHXCOzBh_gcEO3m-Lkq',
  phone_call_click: '',
  email_click: '',
  get_directions_click: '',
};
const trackedOnce = new Set();
const trackConversion = (name, fbEvent, fbCustom) => {
  if (trackedOnce.has(name)) return; // once per page load
  trackedOnce.add(name);
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name });
  if (typeof fbq === 'function' && fbEvent) {
    fbq(fbCustom ? 'trackCustom' : 'track', fbEvent);
  }
  if (ADS_LABELS[name] && typeof gtag === 'function') {
    gtag('event', 'conversion', {
      send_to: ADS_ID + '/' + ADS_LABELS[name],
      value: 1.0,
      currency: 'USD',
    });
  }
};

// Phone, email and directions link clicks
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href]');
  if (!link) return;
  const href = link.getAttribute('href');
  if (href.startsWith('tel:')) trackConversion('phone_call_click', 'Contact');
  else if (href.startsWith('mailto:')) trackConversion('email_click', 'Contact');
  else if (href.includes('maps.google.com')) trackConversion('get_directions_click', 'FindLocation');
});

// ============ WEDDING CALCULATOR ============
const calcBudget = document.getElementById('calcBudget');
if (calcBudget) {
  const fmt = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
  const catInputs = Array.from(document.querySelectorAll('.calc-cat'));
  const packageSel = document.getElementById('calcPackage');
  const venueInput = document.getElementById('calcVenue');
  const totalOut = document.getElementById('calcTotal');
  const budgetOut = document.getElementById('calcBudgetOut');
  const barFill = document.getElementById('calcBarFill');
  const remainingOut = document.getElementById('calcRemaining');

  const parse = (el) => Number((el.value || '').replace(/[^0-9]/g, '')) || 0;
  const formatField = (el) => { el.value = parse(el).toLocaleString('en-US'); };

  const update = () => {
    const budget = parse(calcBudget);
    const total = catInputs.reduce((sum, el) => sum + parse(el), 0);

    totalOut.textContent = fmt.format(total);
    budgetOut.textContent = fmt.format(budget);

    catInputs.forEach((el) => {
      const share = el.closest('.calc-row').querySelector('.calc-share');
      const val = parse(el);
      share.textContent = total && val ? Math.round((val / total) * 100) + '%' : '—';
    });

    const over = total > budget;
    barFill.style.width = (budget ? Math.min((total / budget) * 100, 100) : total ? 100 : 0) + '%';
    barFill.classList.toggle('over', over);
    remainingOut.classList.toggle('over', over);
    remainingOut.classList.toggle('under', !over);
    remainingOut.textContent = over
      ? fmt.format(total - budget) + ' over budget'
      : fmt.format(budget - total) + ' left in your budget';
  };

  [calcBudget, ...catInputs].forEach((el) => {
    el.addEventListener('input', () => {
      trackConversion('calculator_used', 'WeddingCalculatorUsed', true);
      update();
    });
    el.addEventListener('blur', () => { formatField(el); update(); });
  });

  packageSel.addEventListener('change', () => {
    trackConversion('calculator_used', 'WeddingCalculatorUsed', true);
    if (packageSel.value !== 'custom') {
      venueInput.value = Number(packageSel.value).toLocaleString('en-US');
      update();
    }
  });
  venueInput.addEventListener('input', () => {
    if (String(parse(venueInput)) !== packageSel.value) packageSel.value = 'custom';
  });

  document.getElementById('calcReset').addEventListener('click', () => {
    [calcBudget, ...catInputs].forEach((el) => {
      el.value = Number(el.dataset.default).toLocaleString('en-US');
    });
    packageSel.value = '3995';
    update();
  });

  update();
}

// ============ BOOK A TOUR MODAL ============
const tourModal = document.getElementById('tourModal');
if (tourModal) {
  const tourBtn = document.getElementById('tourPromoBtn');
  const tourFrame = document.getElementById('tourFrame');
  const tourClose = document.getElementById('tourModalClose');
  const tourTriggers = [tourBtn, ...document.querySelectorAll('[data-open-tour]')];

  let tourTracked = false;
  const trackTourOpen = () => {
    if (tourTracked) return;
    tourTracked = true;
    trackConversion('book_tour_open', 'Schedule');
  };

  const openTourModal = () => {
    if (!tourFrame.src) tourFrame.src = tourFrame.dataset.src;
    tourModal.hidden = false;
    document.body.style.overflow = 'hidden';
    trackTourOpen();
  };
  const closeTourModal = () => {
    tourModal.hidden = true;
    document.body.style.overflow = '';
  };

  tourTriggers.forEach((t) => t.addEventListener('click', openTourModal));
  tourClose.addEventListener('click', closeTourModal);
  tourModal.addEventListener('click', (e) => {
    if (e.target === tourModal) closeTourModal();
  });
  document.addEventListener('keydown', (e) => {
    if (!tourModal.hidden && e.key === 'Escape') closeTourModal();
  });

  // Support direct links (and testing) via ?tour=1
  if (new URLSearchParams(location.search).get('tour') === '1') openTourModal();
}
