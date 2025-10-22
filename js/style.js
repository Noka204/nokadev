/* =========================
   Nhu Khanh • Site Scripts
   ========================= */

/* ---- DOM helpers ---- */
const $  = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

/* ---- Elements ---- */
const header      = $('#site-header');
const navToggle   = $('.nav-toggle');
const navLinks    = $('#primary-nav');
const backdrop    = $('.nav-backdrop');
const linkEls     = $$('[data-scroll]');
const sections    = $$('.section');
const typingEl    = $('#typing');
const snapRoot    = $('#snap');

/* ---- Constants ---- */
const HEADER_H = parseInt(getComputedStyle(document.documentElement)
  .getPropertyValue('--header-h')) || 64;

/* =========================
   Mobile nav: open/close
   ========================= */
function setMenu(open) {
  if (!navLinks) return;
  navLinks.classList.toggle('open', open);
  backdrop.hidden = !open;
  navToggle?.setAttribute('aria-expanded', String(open));

  // đổi icon
  const openI  = navToggle?.querySelector('.icon-open');
  const closeI = navToggle?.querySelector('.icon-close');
  if (openI && closeI) {
    openI.style.display  = open ? 'none' : '';
    closeI.style.display = open ? '' : 'none';
  }
}

navToggle?.addEventListener('click', () => {
  setMenu(!navLinks.classList.contains('open'));
});
backdrop?.addEventListener('click', () => setMenu(false));
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') setMenu(false);
});

/* =========================
   Smooth scroll with offset
   ========================= */
function scrollToId(id) {
  const target = document.querySelector(id);
  if (!target) return;

  const top = target.getBoundingClientRect().top + window.scrollY - HEADER_H + 1;
  window.scrollTo({ top, behavior: 'smooth' });
}

linkEls.forEach(a => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      setMenu(false);
      history.pushState(null, '', href);
      scrollToId(href);
    }
  });
});

/* Khi load trang có hash sẵn */
window.addEventListener('load', () => {
  if (location.hash) {
    setTimeout(() => scrollToId(location.hash), 50);
  }
});

/* ======================================
   Active nav link theo section đang hiện
   ====================================== */
const linkByHash = new Map(
  linkEls.map(a => [a.getAttribute('href') || '', a])
);

const obs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const id = `#${entry.target.id}`;
    const link = linkByHash.get(id);
    if (!link) return;

    if (entry.isIntersecting) {
      linkEls.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  });
}, {
  root: snapRoot,                               // cuộn bên trong #snap
  rootMargin: `-${HEADER_H + 10}px 0px -45% 0px`,
  threshold: 0.6                                // cần ~60% section trong khung mới active
});

sections.forEach(sec => obs.observe(sec));

/* =========================
   Typing effect (gõ chữ)
   ========================= */
if (typingEl) {
  const lines = [
    'Định hướng Backend với C#∕.NET — ổn định & bảo mật |',
    'Tối ưu UX/UI, giữ giao diện mượt mà |',
    'Triển khai API sạch, dễ mở rộng |'
  ];

  let lineIdx = 0;
  let charIdx = 0;
  let deleting = false;

  const TYPE_SPEED  = 46;   // ms mỗi ký tự
  const ERASE_SPEED = 28;   // ms mỗi ký tự xóa
  const HOLD_END    = 1200; // ms giữ khi gõ xong
  const HOLD_EMPTY  = 300;  // ms giữ khi xoá xong

  function tick() {
    const text = lines[lineIdx];

    if (!deleting) {
      // gõ
      typingEl.textContent = text.slice(0, charIdx++);
      if (charIdx <= text.length) {
        setTimeout(tick, TYPE_SPEED);
      } else {
        deleting = true;
        setTimeout(tick, HOLD_END);
      }
    } else {
      // xoá
      typingEl.textContent = text.slice(0, charIdx--);
      if (charIdx >= 0) {
        setTimeout(tick, ERASE_SPEED);
      } else {
        deleting = false;
        lineIdx = (lineIdx + 1) % lines.length;
        setTimeout(tick, HOLD_EMPTY);
      }
    }
  }

  tick();
}
