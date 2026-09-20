/* ─────────────────────────────────────────
   CONVICTION — script.js
   Discipline is identity.
───────────────────────────────────────── */

'use strict';

/* ── HEADER SCROLL STATE ── */
const header = document.querySelector('[data-header]');

function setHeader() {
  if (header) header.classList.toggle('scrolled', window.scrollY > 28);
}
setHeader();
window.addEventListener('scroll', setHeader, { passive: true });

/* ── MOBILE MENU ── */
const menuToggle  = document.querySelector('[data-menu-toggle]');
const mobileMenu  = document.querySelector('[data-mobile-menu]');

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    menuToggle.classList.toggle('active', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

/* ── SCROLL REVEAL — IntersectionObserver ── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const el = entry.target;

      // stagger siblings inside a parent marked reveal-stagger
      const staggerParent = el.closest('.reveal-stagger');
      if (staggerParent) {
        const siblings = [...staggerParent.querySelectorAll('.reveal, .reveal-media')];
        const idx = siblings.indexOf(el);
        el.style.transitionDelay = `${idx * 0.1}s`;
      }

      el.classList.add('is-visible');
      revealObserver.unobserve(el);
    });
  },
  { threshold: 0.09, rootMargin: '0px 0px -56px 0px' }
);

document.querySelectorAll('.reveal, .reveal-media').forEach((el) => {
  revealObserver.observe(el);
});

/* ── HERO IMAGE KEN BURNS ── */
const heroImg = document.querySelector('.hero-media img');
if (heroImg) {
  heroImg.addEventListener('load', () => heroImg.classList.add('loaded'), { once: true });
  if (heroImg.complete) heroImg.classList.add('loaded');
}

/* ── SMOOTH SCROLL — natural easing for anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (!targetId || targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    const headerH = header ? header.offsetHeight : 0;
    const targetY = target.getBoundingClientRect().top + window.scrollY - headerH;

    smoothScrollTo(targetY, 900);
  });
});

function smoothScrollTo(target, duration) {
  const start     = window.scrollY;
  const distance  = target - start;
  let   startTime = null;

  function ease(t) {
    // cubic ease-in-out for natural feel
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed  = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, start + distance * ease(progress));
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

/* ── SUBTLE PARALLAX on image sections ── */
(function initParallax() {
  const targets = document.querySelectorAll(
    '.hero-media, .image-quote > img, .contact-photo img'
  );
  if (!targets.length) return;

  // disable on mobile for perf
  const mq = window.matchMedia('(min-width: 900px) and (prefers-reduced-motion: no-preference)');

  function onScroll() {
    if (!mq.matches) return;

    targets.forEach((el) => {
      const rect   = el.closest('section, .hero') ?
        el.closest('section, .hero').getBoundingClientRect() :
        el.getBoundingClientRect();
      const vh     = window.innerHeight;
      const inView = rect.top < vh && rect.bottom > 0;
      if (!inView) return;

      const ratio = (rect.top - vh) / (vh + rect.height);   // -1 to 1
      const shift = ratio * 40;                               // max 40px shift
      el.style.transform = `translateY(${shift}px)`;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── TICKER — pause on hover ── */
const ticker = document.querySelector('.ticker-track');
if (ticker) {
  const parent = ticker.parentElement;
  parent.addEventListener('mouseenter', () => ticker.style.animationPlayState = 'paused');
  parent.addEventListener('mouseleave', () => ticker.style.animationPlayState = 'running');
}

/* ── SERVICE CARDS — keyboard accessibility ── */
document.querySelectorAll('.service-card').forEach((card) => {
  card.setAttribute('tabindex', '0');
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') card.querySelector('a')?.click();
  });
});

/* ── CONTACT FORM → WHATSAPP ── */
const form = document.querySelector('[data-application-form]');
const note = document.querySelector('[data-form-note]');

if (form && note) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data   = new FormData(form);
    const phone  = '584123074064';
    const msg    =
      `Hola Conviction, quiero aplicar al coaching.\n\n` +
      `*Nombre:* ${data.get('name')}\n` +
      `*Email:* ${data.get('email')}\n` +
      `*Objetivo principal:* ${data.get('goal')}\n\n` +
      `*¿Qué quiero cambiar?*\n${data.get('message')}`;

    note.textContent = 'Abriendo WhatsApp…';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  });
}
