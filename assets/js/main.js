/* main.js — sawalyno.jp
   No libraries, no build step. Sections:
     1. helpers          4. apps explorer     7. clock
     2. window manager   5. terminal          8. boot sequence
     3. desktop / start  6. mode switching                              */
(function () {
  'use strict';

  const root = document.documentElement;
  const $ = (sel, el) => (el || document).querySelector(sel);
  const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const osQuery = window.matchMedia('(min-width: 900px) and (min-height: 480px) and (pointer: fine)');
  const isOS = () => root.classList.contains('os');
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  /* Web Animations wrapper: resolves at once when motion is reduced. */
  const animate = (node, frames, opts) => {
    if (reduced || !node.animate) return Promise.resolve();
    return node.animate(frames, opts).finished.catch(() => {});
  };

  const desktop = $('#desktop');
  const tabsBox = $('#task-tabs');

  /* ================================================================
     2. Window manager
     ================================================================ */
  /* Placement as fractions of the free desktop area, so the composition
     holds at any screen size. w/h in px; h null = fit content. */
  const LAYOUT = {
    terminal: { w: 640, h: 372,  fx: 0.04,  fy: 0.06 },
    about:    { w: 520, h: null, fx: 0.913, fy: 0.054 },
    apps:     { w: 780, h: 440,  fx: 0.32,  fy: 0.91 },
    contact:  { w: 316, h: null, fx: 0.992, fy: 0.94 },
    skills:   { w: 540, h: null, fx: 0.5,   fy: 0.3 },
  };
  const ICON_COL = 124;
  const wins = new Map();
  let zTop = 10;
  let activeId = null;

  function place(id) {
    const w = wins.get(id), L = LAYOUT[id];
    const W = desktop.clientWidth, H = desktop.clientHeight;
    const width = Math.min(L.w, W - ICON_COL - 16);
    const s = w.el.style;
    s.width = width + 'px';
    s.height = L.h ? Math.min(L.h, H - 16) + 'px' : '';
    s.maxHeight = (H - 16) + 'px';
    const height = w.el.offsetHeight;
    s.left = Math.round(ICON_COL + L.fx * Math.max(0, W - width - ICON_COL - 16)) + 'px';
    s.top = Math.round(8 + L.fy * Math.max(0, H - height - 16)) + 'px';
  }

  function clearPlacement(w) {
    ['width', 'height', 'maxHeight', 'left', 'top', 'zIndex'].forEach((p) => { w.el.style[p] = ''; });
    w.el.classList.remove('is-max', 'is-active', 'is-dragging');
  }

  function keepOnScreen(w) {
    if (w.el.classList.contains('is-max')) return;
    const W = desktop.clientWidth, H = desktop.clientHeight;
    const left = Math.min(Math.max(w.el.offsetLeft, 80 - w.el.offsetWidth), W - 80);
    const top = Math.min(Math.max(w.el.offsetTop, 0), H - 30);
    w.el.style.left = left + 'px';
    w.el.style.top = top + 'px';
    w.el.style.maxHeight = (H - 16) + 'px';
  }

  function syncTabs() {
    wins.forEach((w, id) => {
      w.tab.hidden = w.state === 'closed';
      w.tab.classList.toggle('is-active', id === activeId && w.state === 'open');
      w.tab.classList.toggle('is-min', w.state === 'min');
      w.tab.setAttribute('aria-pressed', String(id === activeId && w.state === 'open'));
    });
  }

  function focusWin(id) {
    const w = wins.get(id);
    if (!w || !isOS()) return;
    activeId = id;
    w.el.style.zIndex = String(++zTop);
    wins.forEach((o, oid) => o.el.classList.toggle('is-active', oid === id));
    syncTabs();
  }

  function focusTopmost() {
    let best = null, bestZ = -1;
    wins.forEach((w, id) => {
      const z = Number(w.el.style.zIndex) || 0;
      if (w.state === 'open' && z > bestZ) { best = id; bestZ = z; }
    });
    activeId = null;
    if (best) focusWin(best);
    else { wins.forEach((w) => w.el.classList.remove('is-active')); syncTabs(); }
  }

  /* Transform that maps the window's box onto its taskbar tab. */
  function toTab(w) {
    const a = w.el.getBoundingClientRect(), b = w.tab.getBoundingClientRect();
    return `translate(${b.left - a.left}px, ${b.top - a.top}px) scale(${b.width / a.width}, ${b.height / a.height})`;
  }

  async function openWin(id, opts) {
    const w = wins.get(id);
    if (!w) return;
    if (!isOS()) {
      w.el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      if (id === 'terminal' && !(opts && opts.keepFocus)) $('#term-in').focus({ preventScroll: true });
      return;
    }
    const was = w.state;
    w.state = 'open';
    w.el.hidden = false;
    if (was === 'closed') place(id);
    focusWin(id);
    if (was === 'min') {
      w.el.style.transformOrigin = '0 0';
      await animate(w.el, [{ transform: toTab(w), opacity: 0.2 }, { transform: 'none', opacity: 1 }],
        { duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' });
    } else if (was === 'closed') {
      w.el.style.transformOrigin = '50% 50%';
      await animate(w.el, [{ transform: 'scale(.94)', opacity: 0 }, { transform: 'none', opacity: 1 }],
        { duration: 160, easing: 'cubic-bezier(.2,.8,.2,1)' });
    }
    if (id === 'terminal' && !(opts && opts.keepFocus)) $('#term-in').focus({ preventScroll: true });
  }

  async function minimizeWin(id) {
    const w = wins.get(id);
    if (!w || w.state !== 'open') return;
    w.state = 'min';
    syncTabs();
    w.el.style.transformOrigin = '0 0';
    await animate(w.el, [{ transform: 'none', opacity: 1 }, { transform: toTab(w), opacity: 0.2 }],
      { duration: 240, easing: 'cubic-bezier(.5,0,.9,.5)' });
    if (w.state !== 'min') return;
    w.el.hidden = true;
    focusTopmost();
  }

  async function closeWin(id) {
    const w = wins.get(id);
    if (!w || w.state === 'closed') return;
    w.state = 'closed';
    w.el.style.transformOrigin = '50% 50%';
    await animate(w.el, [{ transform: 'none', opacity: 1 }, { transform: 'scale(.94)', opacity: 0 }],
      { duration: 120, easing: 'ease-in' });
    if (w.state !== 'closed') return;
    w.el.hidden = true;
    w.el.classList.remove('is-max');
    focusTopmost();
  }

  /* FLIP: measure, change layout, then animate from the old box. */
  function toggleMax(id) {
    const w = wins.get(id);
    const a = w.el.getBoundingClientRect();
    w.el.classList.toggle('is-max');
    const b = w.el.getBoundingClientRect();
    w.el.style.transformOrigin = '0 0';
    animate(w.el, [
      { transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})` },
      { transform: 'none' },
    ], { duration: 200, easing: 'cubic-bezier(.2,.8,.2,1)' });
    focusWin(id);
  }

  function makeDraggable(id, w) {
    const bar = $('.titlebar', w.el);
    let drag = null;
    bar.addEventListener('pointerdown', (e) => {
      if (!isOS() || e.button !== 0 || e.target.closest('button') || w.el.classList.contains('is-max')) return;
      drag = { x: e.clientX - w.el.offsetLeft, y: e.clientY - w.el.offsetTop };
      bar.setPointerCapture(e.pointerId);
      w.el.classList.add('is-dragging');
    });
    bar.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const W = desktop.clientWidth, H = desktop.clientHeight;
      const left = Math.min(Math.max(e.clientX - drag.x, 80 - w.el.offsetWidth), W - 80);
      const top = Math.min(Math.max(e.clientY - drag.y, 0), H - 30);
      w.el.style.left = left + 'px';
      w.el.style.top = top + 'px';
    });
    const end = () => { drag = null; w.el.classList.remove('is-dragging'); };
    bar.addEventListener('pointerup', end);
    bar.addEventListener('pointercancel', end);
    bar.addEventListener('dblclick', (e) => {
      if (isOS() && !e.target.closest('button')) toggleMax(id);
    });
  }

  function initWindows() {
    $$('[data-win]').forEach((node) => {
      const id = node.id;
      const tab = el('button', 'task-tab', node.dataset.tab);
      tab.type = 'button';
      tabsBox.appendChild(tab);
      const w = { el: node, tab, state: 'open' };
      wins.set(id, w);

      const btns = el('span', 'titlebar-btns');
      [['min', '最小化', () => minimizeWin(id)],
       ['max', '最大化', () => toggleMax(id)],
       ['close', '閉じる', () => closeWin(id)]].forEach(([k, label, fn]) => {
        const b = el('button', 'tb-btn tb-' + k);
        b.type = 'button';
        b.setAttribute('aria-label', label);
        b.addEventListener('click', fn);
        btns.appendChild(b);
      });
      $('.titlebar', node).appendChild(btns);

      node.addEventListener('pointerdown', () => { if (w.state === 'open' && activeId !== id) focusWin(id); }, true);
      node.addEventListener('focusin', () => { if (w.state === 'open' && activeId !== id) focusWin(id); });
      tab.addEventListener('click', () => {
        if (w.state !== 'open') openWin(id);
        else if (activeId === id) minimizeWin(id);
        else focusWin(id);
      });
      makeDraggable(id, w);
    });
  }

  function enterOS() {
    wins.forEach((w, id) => {
      /* data-start="closed": not on the desktop until its icon is opened */
      const closed = w.el.dataset.start === 'closed';
      w.state = closed ? 'closed' : 'open';
      w.el.hidden = closed;
      if (!closed) place(id);
    });
    ['about', 'contact', 'apps', 'terminal'].forEach(focusWin);   /* terminal ends on top */
  }
  function leaveOS() {
    wins.forEach((w) => { w.state = 'open'; w.el.hidden = false; clearPlacement(w); });
    activeId = null;
    syncTabs();
  }

  /* ================================================================
     3. Desktop icons and start menu
     ================================================================ */
  function initDesktop() {
    const icons = $$('.desk-icon');
    icons.forEach((b) => {
      b.addEventListener('click', (e) => {
        /* keyboard (detail 0) opens at once; mouse selects first, then opens */
        if (e.detail === 0 || b.classList.contains('is-selected')) {
          b.classList.remove('is-selected');
          openWin(b.dataset.open);
        } else {
          icons.forEach((o) => o.classList.toggle('is-selected', o === b));
        }
      });
    });
    desktop.addEventListener('pointerdown', (e) => {
      if (!e.target.closest('.desk-icon')) icons.forEach((o) => o.classList.remove('is-selected'));
    });

    const menu = $('#startmenu'), start = $('#start-btn');
    const setMenu = (open) => {
      menu.hidden = !open;
      start.setAttribute('aria-expanded', String(open));
      if (open) $('a', menu).focus({ preventScroll: true });
    };
    start.addEventListener('click', () => setMenu(menu.hidden));
    menu.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      if (a.dataset.open) { e.preventDefault(); openWin(a.dataset.open); }
      setMenu(false);
    });
    document.addEventListener('pointerdown', (e) => {
      if (!menu.hidden && !e.target.closest('#startmenu, #start-btn')) setMenu(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.hidden) { setMenu(false); start.focus(); }
    });
  }

  /* ================================================================
     4. Apps explorer
     ================================================================ */
  const apps = [];
  function selectApp(id) {
    apps.forEach((a) => {
      const on = a.id === id;
      a.pane.classList.toggle('is-current', on);
      a.tab.setAttribute('aria-selected', String(on));
      a.tab.tabIndex = on ? 0 : -1;
    });
  }
  function initApps() {
    const list = $('#app-list');
    $$('.app').forEach((pane) => {
      const id = pane.dataset.app;
      const name = $('.app-name', pane).textContent;
      const genre = $('.app-genre', pane).textContent;
      const tab = el('button', 'app-tab');
      tab.type = 'button';
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', pane.id);
      const img = el('img');
      img.src = $('.app-icon', pane).getAttribute('src');
      img.alt = '';
      const label = el('span');
      label.append(el('b', null, name), el('small', null, genre));
      tab.append(img, label);
      tab.addEventListener('click', () => selectApp(id));
      list.appendChild(tab);
      apps.push({
        id, name, genre, pane, tab,
        desc: $('.app-desc', pane).textContent,
        links: $$('.store-links a', pane).map((a) => ({ label: a.dataset.store, href: a.href })),
        soon: $$('.btn-soon', pane).map((s) => s.textContent),
      });
    });
    list.addEventListener('keydown', (e) => {
      const i = apps.findIndex((a) => a.tab === document.activeElement);
      const step = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
      if (i < 0 || !step) return;
      e.preventDefault();
      const next = apps[(i + step + apps.length) % apps.length];
      selectApp(next.id);
      next.tab.focus();
    });
    selectApp(apps[0].id);
  }

  /* ================================================================
     5. Terminal
     ================================================================ */
  const term = $('#term'), out = $('#term-out'), form = $('#term-form'), input = $('#term-in');
  const loadedAt = Date.now();
  const history = [];
  let histAt = 0;

  const scrollEnd = () => { term.scrollTop = term.scrollHeight; };
  function print(text, cls) {
    const line = el('div', 'tl' + (cls ? ' ' + cls : ''), text);
    out.appendChild(line);
    scrollEnd();
    return line;
  }
  function printLink(label, href) {
    const line = print(label.padEnd(8));
    const a = el('a', null, href.replace(/^mailto:/, ''));
    a.href = href;
    if (!href.startsWith('mailto:')) { a.target = '_blank'; a.rel = 'noopener'; }
    line.appendChild(a);
  }

  const FILES = ['about.txt', 'skills.txt', 'profile.txt', 'mail.txt'];
  const printAbout = () => $$('#about .about-text').forEach((p) => print(p.textContent.trim()));
  const printSkills = () => $$('.skills-table tr').forEach((tr) =>
    print(tr.cells[0].textContent + '  ' + tr.cells[1].textContent));
  const THEMES = {
    green: ['#5fff8f', '95, 255, 143', '#4ade80'],
    amber: ['#ffc65c', '255, 198, 92', '#ffb000'],
    blue:  ['#8fc1ff', '143, 193, 255', '#4ea1ff'],
  };
  const email = () => $('.contact-email').textContent.trim();
  const social = () => $$('.links a').map((a) => ({ label: a.closest('dd').previousElementSibling.textContent, href: a.href }));
  const findApp = (q) => apps.find((a) => a.id === q || a.name.toLowerCase() === q || a.id.replace(/-/g, '') === q);

  const COMMANDS = {
    help() {
      print('about          who is behind this site', 'dim');
      print('skills         what I work with', 'dim');
      print('apps           list the apps', 'dim');
      print('open <app>     show one app, e.g. open eyerest', 'dim');
      print('contact        how to reach me', 'dim');
      print('links          X, Qiita, Zenn', 'dim');
      print('theme <name>   green, amber or blue', 'dim');
      print('clear          clear the screen', 'dim');
      print('reboot         play the boot sequence again', 'dim');
      print('cat            meet the cat', 'dim');
      print('Also: ls, cat <file>, whoami, date, neofetch. Tab completes, ↑ recalls.', 'dim');
    },
    whoami() { print('sawalyno'); },
    pwd() { print('/home/sawalyno'); },
    date() { print(new Date().toString()); },
    about() { printAbout(); openWin('about', { keepFocus: true }); },
    skills() { printSkills(); openWin('skills', { keepFocus: true }); },
    apps() {
      apps.forEach((a) => print(a.id.padEnd(14) + a.genre));
      print("Type 'open <app>' to see one.", 'dim');
      openWin('apps', { keepFocus: true });
    },
    open(arg) {
      if (!arg) return print('usage: open <app>', 'err');
      const a = findApp(arg);
      if (a) {
        selectApp(a.id);
        print(a.name + ' — ' + a.genre);
        print(a.desc);
        a.links.forEach((l) => printLink(l.label, l.href));
        a.soon.forEach((s) => print(s, 'dim'));
        if (isOS()) openWin('apps', { keepFocus: true });
      } else if (wins.has(arg)) {
        openWin(arg, { keepFocus: true });
      } else {
        print('open: ' + arg + ": no such app. Try 'apps'.", 'err');
      }
    },
    contact() { printLink('mail', 'mailto:' + email()); openWin('contact', { keepFocus: true }); },
    links() { social().forEach((s) => printLink(s.label, s.href)); },
    ls(arg) {
      if (arg && arg.replace(/\/$/, '') === 'apps') print(apps.map((a) => a.id).join('  '));
      else print(FILES.join('  ') + '  apps/');
    },
    cat(arg) {
      if (!arg) {
        /* no file given: you get the other kind of cat */
        /* the cat says something different each time; every cry is padded
           to 6 characters so the speech bubble keeps its shape */
        const cries = ['meow~!', 'nyaa~!', 'purrr.', 'mew?'];
        const cry = cries[Math.floor(Math.random() * cries.length)].padEnd(6);
        ['    /\\_/\\      .----------.',
         '   ( o.o )  <  |  ' + cry + '  |',
         "    > ^ <      '----------'",
         '   /|   |\\',
         '  (_|___|_)_/'].forEach((l) => print(l, 'art'));
        print('To read a file instead: cat about.txt', 'dim');
        return;
      }
      if (arg === 'about.txt') printAbout();
      else if (arg === 'skills.txt') printSkills();
      else if (arg === 'profile.txt') { print('Solo developer based in Japan.'); print('Operating under SAWADA LLC.'); }
      else if (arg === 'mail.txt') print(email());
      else print('cat: ' + arg + ': No such file', 'err');
    },
    theme(arg) {
      const t = THEMES[arg];
      if (!t) return print('usage: theme green|amber|blue', 'err');
      root.style.setProperty('--term-green', t[0]);
      root.style.setProperty('--glow', t[1]);
      root.style.setProperty('--prompt', t[2]);
      print('theme: ' + arg);
    },
    neofetch() {
      const up = Math.round((Date.now() - loadedAt) / 1000);
      print('sawalyno@sawada');
      print('---------------');
      print('os      sawalyno OS v2.0', 'dim');
      print('host    SAWADA LLC', 'dim');
      print('apps    ' + apps.length, 'dim');
      print('shell   plain JavaScript, no libraries', 'dim');
      print('uptime  ' + up + 's', 'dim');
    },
    echo(arg) { print(arg || ''); },
    sudo() { print('sudo: permission denied. This desktop has one user.', 'err'); },
    clear() { out.textContent = ''; },
    reboot() {
      location.reload();   /* the boot sequence plays on every load */
    },
    exit() { if (isOS()) closeWin('terminal'); else print('exit: nowhere to go on this screen', 'dim'); },
  };

  function run(raw) {
    const text = raw.trim();
    print('$ ' + text, 'cmd');
    if (!text) return;
    history.push(text);
    histAt = history.length;
    const sp = text.indexOf(' ');
    const name = (sp < 0 ? text : text.slice(0, sp)).toLowerCase();
    const arg = sp < 0 ? '' : text.slice(sp + 1).trim();
    const fn = Object.prototype.hasOwnProperty.call(COMMANDS, name) ? COMMANDS[name] : null;
    if (fn) fn(name === 'echo' ? arg : arg.toLowerCase());
    else print(name + ": command not found. Type 'help'.", 'err');
    scrollEnd();
  }

  function complete(value) {
    const parts = value.split(' ');
    let pool;
    if (parts.length === 1) pool = Object.keys(COMMANDS);
    else if (parts[0] === 'open') pool = apps.map((a) => a.id);
    else if (parts[0] === 'cat') pool = FILES;
    else if (parts[0] === 'theme') pool = Object.keys(THEMES);
    else if (parts[0] === 'ls') pool = ['apps'];
    else return value;
    const stem = parts[parts.length - 1].toLowerCase();
    const hits = pool.filter((p) => p.startsWith(stem));
    if (hits.length === 1) { parts[parts.length - 1] = hits[0]; return parts.join(' ') + (parts.length === 1 ? ' ' : ''); }
    if (hits.length > 1) { print('$ ' + value, 'cmd'); print(hits.join('  '), 'dim'); }
    return value;
  }

  /* Intro: the existing three commands are typed out once, then the
     prompt is handed to the visitor. Any key or click finishes it. */
  async function playIntro() {
    const lines = $$('.tl', out).map((n) => ({ text: n.textContent, cmd: n.classList.contains('cmd') }));
    let skip = false;
    const stop = () => { skip = true; };
    term.addEventListener('pointerdown', stop, { once: true });
    document.addEventListener('keydown', stop, { once: true });
    const pause = (ms) => (skip ? Promise.resolve() : wait(ms));

    term.classList.add('is-intro');
    out.textContent = '';
    for (const l of lines) {
      const node = print('', l.cmd ? 'cmd' : '');
      if (l.cmd && !skip) {
        node.classList.add('typing');
        node.textContent = '$ ';
        await pause(260);
        for (let i = 2; i < l.text.length && !skip; i++) {
          node.textContent = l.text.slice(0, i + 1);
          await pause(38 + Math.random() * 50);
        }
        await pause(140);
        node.classList.remove('typing');
      }
      node.textContent = l.text;
      await pause(l.cmd ? 60 : 55);
    }
    term.removeEventListener('pointerdown', stop);
    document.removeEventListener('keydown', stop);
    term.classList.remove('is-intro');
  }

  function initTerminal() {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      run(input.value);
      input.value = '';
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && input.value) {
        e.preventDefault();
        input.value = complete(input.value);
      } else if (e.key === 'ArrowUp' && history.length) {
        e.preventDefault();
        histAt = Math.max(0, histAt - 1);
        input.value = history[histAt];
      } else if (e.key === 'ArrowDown' && history.length) {
        e.preventDefault();
        histAt = Math.min(history.length, histAt + 1);
        input.value = history[histAt] || '';
      } else if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault();
        COMMANDS.clear();
      }
    });
    /* click anywhere in the terminal to type, unless selecting text */
    term.addEventListener('click', (e) => {
      if (e.target.closest('a') || String(window.getSelection())) return;
      input.focus({ preventScroll: true });
    });
  }

  /* ================================================================
     7. Clock
     ================================================================ */
  function initClock() {
    const node = $('#clock');
    const p = (n) => String(n).padStart(2, '0');
    const tick = () => {
      const d = new Date();
      node.textContent = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
    };
    tick();
    let timer = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', () => {
      clearInterval(timer);
      if (!document.hidden) { tick(); timer = setInterval(tick, 1000); }
    });
  }

  /* ================================================================
     8. Boot sequence — every page load (pre.js decides)
     ================================================================ */
  async function boot() {
    const lines = [
      ['CPU: 1 solo developer', true],
      ['Detecting apps ...', false],
      ...apps.map((a) => ['    /dev/' + a.id, true]),
      ['Mounting ~/about ~/apps ~/contact', true],
      ['Starting window manager', false],
    ];
    const scr = el('div');
    scr.id = 'boot';
    scr.setAttribute('aria-hidden', 'true');
    const head = el('div', 'boot-head');
    const title = el('div');
    title.append(el('b', null, 'sawalyno BIOS v2.0'), el('span', null, '(C) 2026 SAWADA LLC'));
    const logo = el('img');
    logo.src = '/assets/img/logo-mark-192.png';
    logo.alt = '';
    head.append(title, logo);
    const log = el('div', 'boot-log');
    const foot = el('div', 'boot-foot');
    const left = el('div');
    const bar = el('div', 'boot-bar');
    for (let i = 0; i < 14; i++) bar.appendChild(el('i'));
    /* Plain words for a first-time visitor: this is the site loading, not an error. */
    left.append(
      el('p', 'boot-msg', 'sawalyno 公式サイトを表示中です'),
      el('p', 'boot-note', '起動画面の演出です。まもなくサイトに切り替わります。'),
      bar
    );
    foot.append(left, el('span', 'boot-skip', 'キーを押すかタップするとスキップ'));
    scr.append(head, log, foot);
    document.body.appendChild(scr);

    /* A key or tap skips — but not in the first moments, and not for keys
       left over from getting here (the Enter of `reboot`, an IME commit,
       a held modifier), which would skip the sequence before it is seen. */
    let skip = false;
    const startedAt = performance.now();
    const stop = (e) => {
      if (performance.now() - startedAt < 500) return;
      if (e.type === 'keydown' && (e.repeat || e.isComposing || e.key === 'Process' ||
          ['Shift', 'Control', 'Alt', 'Meta'].includes(e.key))) return;
      skip = true;
    };
    scr.addEventListener('pointerdown', stop);
    document.addEventListener('keydown', stop);
    const pause = (ms) => (skip ? Promise.resolve() : wait(ms));
    const cells = $$('i', bar);
    let filled = 0;
    const fill = (to) => { while (filled < to) cells[filled++].classList.add('on'); };

    await pause(260);
    for (let i = 0; i < lines.length; i++) {
      const row = el('div', 'boot-line');
      row.append(el('span', null, lines[i][0]), el('span', 'boot-ok', lines[i][1] ? '[ OK ]' : ''));
      log.appendChild(row);
      await pause(lines[i][1] ? 150 : 90);
      row.classList.add('done');
      fill(Math.round(((i + 1) / lines.length) * cells.length));
      await pause(70);
    }
    await pause(360);
    document.removeEventListener('keydown', stop);

    root.classList.remove('booting');
    scr.classList.add('off');
    setTimeout(() => scr.remove(), 460);
  }

  /* Windows arrive one after another, once, after boot. */
  function revealWindows() {
    if (!isOS()) return Promise.resolve();
    const order = ['about', 'contact', 'apps', 'terminal'];
    return Promise.all(order.map((id, i) => {
      const node = wins.get(id).el;
      node.style.transformOrigin = '50% 50%';
      return animate(node, [{ transform: 'scale(.92)', opacity: 0 }, { transform: 'none', opacity: 1 }],
        { duration: 240, delay: 260 + i * 90, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
    }));
  }

  /* ================================================================
     6. Start-up and mode switching
     ================================================================ */
  async function main() {
    initWindows();
    initApps();
    initDesktop();
    initTerminal();
    initClock();
    if (isOS()) enterOS();
    root.classList.add('ready');

    osQuery.addEventListener('change', (e) => {
      root.classList.toggle('os', e.matches);
      if (e.matches) enterOS(); else leaveOS();
    });
    window.addEventListener('resize', () => { if (isOS()) wins.forEach(keepOnScreen); });

    if (root.classList.contains('booting')) {
      await boot();
      await revealWindows();
    }
    if (!reduced) await playIntro();
    print("Type 'help' to see what this terminal can do.", 'dim');
    if (isOS()) input.focus({ preventScroll: true });
  }

  main();
})();
