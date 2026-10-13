// Home page: hero slides (manual, cross-fade, no autoplay). On a touch screen a sideways swipe changes the slide.
(function () {
  'use strict';
  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-dot]'));
    var current = 0;
    var show = function (n) {
      current = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) {
        var on = i === current;
        s.classList.toggle('is-active', on);
        s.setAttribute('aria-hidden', on ? 'false' : 'true');
      });
      dots.forEach(function (dot, i) { dot.setAttribute('aria-current', i === current ? 'true' : 'false'); });
    };
    hero.querySelector('[data-prev]').addEventListener('click', function () { show(current - 1); });
    hero.querySelector('[data-next]').addEventListener('click', function () { show(current + 1); });
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () { show(Number(dot.getAttribute('data-dot'))); });
    });

    // a clearly sideways drag; an up-and-down one is the visitor scrolling the page and is left alone
    var startX = null, startY = 0;
    hero.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) { startX = null; return; }
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    hero.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      startX = null;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) show(current + (dx < 0 ? 1 : -1));
    }, { passive: true });
    hero.addEventListener('touchcancel', function () { startX = null; }, { passive: true });
  }
})();
