const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const mobileMenu = document.querySelector('[data-mobile-menu]');

const setHeader = () => header?.classList.toggle('scrolled', window.scrollY > 24);
setHeader();
window.addEventListener('scroll', setHeader, { passive: true });

menuToggle?.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  menuToggle.classList.toggle('active', open);
  menuToggle.setAttribute('aria-expanded', String(open));
});

mobileMenu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.11, rootMargin: '0px 0px -50px' });

document.querySelectorAll('.reveal, .reveal-media').forEach((el) => observer.observe(el));

const form = document.querySelector('[data-application-form]');
const note = document.querySelector('[data-form-note]');

form?.addEventListener('submit', (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const whatsappNumber = '584123074064';
  const message =
    `Hola Conviction, quiero aplicar al coaching.\n\n` +
    `*Nombre:* ${data.get('name')}\n` +
    `*Email:* ${data.get('email')}\n` +
    `*Objetivo principal:* ${data.get('goal')}\n\n` +
    `*¿Qué quiero cambiar?*\n${data.get('message')}`;

  note.textContent = 'Abriendo WhatsApp con tu aplicación…';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
});
