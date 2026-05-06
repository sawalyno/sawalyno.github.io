/* main.js — sawalyno.jp */

/* ---- Clock ---- */
(function initClock() {
  const el = document.getElementById('clock');
  if (!el) return;

  function tick() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    el.textContent = `${h}:${m}:${s}`;
  }

  tick();
  let timer = setInterval(tick, 1000);

  function onVisibilityChange() {
    if (document.hidden) {
      clearInterval(timer);
    } else {
      tick();
      timer = setInterval(tick, 1000);
    }
  }

  document.addEventListener('visibilitychange', onVisibilityChange);

  /* Cleanup when the clock element is removed from the DOM */
  if (typeof MutationObserver !== 'undefined') {
    const mo = new MutationObserver(() => {
      if (!document.contains(el)) {
        clearInterval(timer);
        document.removeEventListener('visibilitychange', onVisibilityChange);
        mo.disconnect();
      }
    });
    mo.observe(document, { childList: true, subtree: true });
  }
})();

/* ---- Terminal typing animation ----
   Simulates a real terminal session: command lines are typed character
   by character (random 35-90ms/char), output lines appear instantly.
   Total sequence ≈ 7s.
   ----------------------------------------------------------------- */
(function initTerminal() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lines = document.querySelectorAll('.terminal-line');
  const heroCta = document.querySelector('.hero-cta');
  if (!lines.length) return;

  if (reduced) {
    lines.forEach(l => {
      if (l.dataset.text) {
        const cursorEl = l.querySelector('.cursor');
        const node = document.createTextNode(l.dataset.text);
        if (cursorEl) l.insertBefore(node, cursorEl);
        else l.appendChild(node);
      }
      l.classList.add('visible');
    });
    if (heroCta) heroCta.classList.add('visible');
    return;
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  /* Type text into el char by char; resolves when done */
  function typeInto(el, text, minMs, maxMs) {
    return new Promise(resolve => {
      const cursorEl = el.querySelector('.cursor');
      const node = document.createTextNode('');
      if (cursorEl) el.insertBefore(node, cursorEl);
      else el.appendChild(node);
      let i = 0;
      (function next() {
        if (i >= text.length) { resolve(); return; }
        node.textContent = text.slice(0, ++i);
        setTimeout(next, rand(minMs, maxMs));
      })();
    });
  }

  function show(el) { el.classList.add('visible'); }
  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

  const all = Array.from(lines);
  const taglineIdx = all.findIndex(l => l.dataset.text);

  /* Extract text from prompt lines and clear them for re-typing.
     Output lines keep their text — they just get .visible added. */
  const texts = all.map((l, i) => {
    if (i === taglineIdx) return l.dataset.text || '';
    const t = l.textContent.trim();
    if (l.classList.contains('prompt-line')) l.textContent = '';
    return t;
  });

  async function run() {
    for (let i = 0; i < all.length; i++) {
      const el = all[i];
      const text = texts[i];

      if (el.classList.contains('blank-line')) {
        /* Empty line: pause then reveal (simulates pressing Enter) */
        await wait(150);
        show(el);
        await wait(100);
      } else if (i === taglineIdx) {
        /* Tagline: type with cursor */
        show(el);
        await typeInto(el, text, 40, 90);
        await wait(200);
      } else if (el.classList.contains('prompt-line')) {
        /* Command: type character by character */
        show(el);
        await typeInto(el, text, 38, 88);
        await wait(100);
      } else {
        /* Output line: appear instantly with slight stagger */
        show(el);
        await wait(55);
      }
    }

    await wait(120);
    if (heroCta) heroCta.classList.add('visible');
  }

  run();
})();

/* ---- Section fade-in via IntersectionObserver ---- */
(function initFade() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const sections = document.querySelectorAll('.fade-section');
  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  sections.forEach(s => observer.observe(s));
})();
