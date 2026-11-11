/* pre.js — runs before first paint. Decides the mode so nothing flashes.
   js      : scripting works
   os      : wide screen + mouse → real desktop with draggable windows
   booting : the boot sequence plays first — on every page load, unless
             the visitor asked for reduced motion. It does not depend on
             any stored state, so it cannot get stuck "already seen".     */
(function () {
  var d = document.documentElement;
  var mm = window.matchMedia ? window.matchMedia.bind(window) : function () { return { matches: false }; };
  var reduced = mm('(prefers-reduced-motion: reduce)').matches;
  var os = mm('(min-width: 900px) and (min-height: 480px) and (pointer: fine)').matches;

  d.classList.add('js');
  if (os) d.classList.add('os');
  if (!reduced) d.classList.add('booting');

  /* If main.js never arrives, fall back to the plain stacked page. */
  setTimeout(function () {
    if (!d.classList.contains('ready')) d.classList.remove('os', 'booting');
  }, 6000);
})();
