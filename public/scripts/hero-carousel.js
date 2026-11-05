/* Home hero carousel: shows one photo at a time and advances every
   data-interval ms. The pause/play button stops and restarts it (WCAG
   2.2.2). It starts paused when the visitor prefers reduced motion.
   Without this script only the first photo shows. */
(function () {
  var root = document.querySelector('.kd-carousel');
  if (!root) return;
  var slides = root.querySelectorAll('.kd-carousel__slide');
  var button = root.querySelector('.kd-carousel__toggle');
  if (slides.length < 2 || !button) return;
  var interval = Number(root.getAttribute('data-interval')) || 4000;
  var current = 0;
  var timer = null;

  function show(i) {
    slides[current].hidden = true;
    current = i % slides.length;
    slides[current].hidden = false;
  }
  function setPaused(paused) {
    if (timer) { clearInterval(timer); timer = null; }
    if (!paused) timer = setInterval(function () { show(current + 1); }, interval);
    button.textContent = button.getAttribute(paused ? 'data-label-play' : 'data-label-pause');
  }

  button.hidden = false;
  button.addEventListener('click', function () { setPaused(timer !== null); });
  setPaused(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
})();
