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
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
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

/* ── 02 COACHING LEAD MODALS & MAILTO ── */
function construirMailto(ruta, datos) {
  const asunto = `Aplicación Conviction — ${ruta}`;
  const cuerpo =
    `Nombre: ${datos.nombre} ${datos.apellido}%0D%0A` +
    `Correo: ${datos.correo}%0D%0A` +
    `Teléfono: ${datos.telefono}%0D%0A` +
    `Ruta elegida: ${ruta}`;
  return `mailto:cvnclubb@gmail.com?subject=${encodeURIComponent(asunto)}&body=${cuerpo}`;
}

let activeTrigger = null;

function closeAllCoachingModals(restoreFocus = true) {
  const openModals = document.querySelectorAll('.coaching-modal.is-open');
  openModals.forEach((modal) => {
    modal.classList.remove('is-open');
    setTimeout(() => {
      modal.setAttribute('hidden', '');
      modal.setAttribute('aria-hidden', 'true');
    }, 240);
  });

  document.body.style.overflow = '';

  if (restoreFocus && activeTrigger) {
    activeTrigger.focus();
    activeTrigger = null;
  }
}

function openCoachingModal(modalId, triggerEl) {
  const targetModal = document.getElementById(modalId);
  if (!targetModal) return;

  // Ensure only one modal is open at a time
  closeAllCoachingModals(false);

  activeTrigger = triggerEl || null;

  targetModal.removeAttribute('hidden');
  targetModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  requestAnimationFrame(() => {
    targetModal.classList.add('is-open');
  });

  const firstInput = targetModal.querySelector('input[name="nombre"]');
  if (firstInput) {
    setTimeout(() => firstInput.focus(), 80);
  }
}

function closeCoachingModal(modal) {
  if (!modal) return;
  modal.classList.remove('is-open');
  setTimeout(() => {
    modal.setAttribute('hidden', '');
    modal.setAttribute('aria-hidden', 'true');
  }, 240);

  const stillOpen = document.querySelectorAll('.coaching-modal.is-open');
  if (stillOpen.length <= 1) {
    document.body.style.overflow = '';
  }

  if (activeTrigger) {
    activeTrigger.focus();
    activeTrigger = null;
  }
}

// Triggers on .service-arrow buttons
document.querySelectorAll('[data-open-modal]').forEach((trigger) => {
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const modalId = trigger.getAttribute('data-open-modal');
    openCoachingModal(modalId, trigger);
  });
});

// Close buttons and overlay backdrops
document.querySelectorAll('.coaching-modal [data-close-modal]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const modal = btn.closest('.coaching-modal');
    if (modal) closeCoachingModal(modal);
  });
});

// ESC key to close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const openModal = document.querySelector('.coaching-modal.is-open');
    if (openModal) closeCoachingModal(openModal);
  }
});

// Per-modal form & commitment validation
document.querySelectorAll('.coaching-modal').forEach((modal) => {
  const formEl = modal.querySelector('.modal-form');
  if (!formEl) return;

  const commitInput = formEl.querySelector('.modal-commit-input');
  const submitBtn   = formEl.querySelector('.modal-submit-btn');
  const hintEl      = formEl.querySelector('.modal-hint');
  const noteEl      = formEl.querySelector('.modal-confirm-note');

  function checkCommitment() {
    if (!commitInput || !submitBtn) return false;
    const value = commitInput.value.trim().toUpperCase();
    const isValid = value === 'CONVICTION';

    if (isValid) {
      submitBtn.removeAttribute('disabled');
      if (hintEl) {
        hintEl.textContent = '✓ Compromiso verificado.';
        hintEl.classList.add('is-valid');
      }
    } else {
      submitBtn.setAttribute('disabled', 'true');
      if (hintEl) {
        hintEl.textContent = 'Escribe "CONVICTION" para desbloquear tu aplicación.';
        hintEl.classList.remove('is-valid');
      }
    }
    return isValid;
  }

  if (commitInput) {
    commitInput.addEventListener('input', checkCommitment);
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      // 1. Native required/type/pattern validation
      if (!formEl.checkValidity()) {
        formEl.reportValidity();
        return;
      }

      // 2. Commitment check
      if (!checkCommitment()) {
        commitInput.focus();
        return;
      }

      const formData = new FormData(formEl);
      const ruta = formEl.getAttribute('data-ruta') || 'Coaching Conviction';
      const datos = {
        nombre: (formData.get('nombre') || '').toString().trim(),
        apellido: (formData.get('apellido') || '').toString().trim(),
        correo: (formData.get('correo') || '').toString().trim(),
        telefono: (formData.get('telefono') || '').toString().trim()
      };

      const mailtoLink = construirMailto(ruta, datos);

      if (noteEl) {
        noteEl.textContent = 'Se abrirá tu correo con la solicitud lista para enviar.';
      }

      window.location.href = mailtoLink;

      setTimeout(() => {
        closeCoachingModal(modal);
        formEl.reset();
        checkCommitment();
        if (noteEl) noteEl.textContent = '';
      }, 1500);
    });
  }
});
