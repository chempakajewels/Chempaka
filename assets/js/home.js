// Home page: hero slides (manual, cross-fade, no autoplay).
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
  }
})();
