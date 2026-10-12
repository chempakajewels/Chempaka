// Appointment request. Nothing is stored: the request is checked here and handed to WhatsApp.
(function () {
  'use strict';
  var form = document.getElementById('booking-form');
  if (!form) return;
  var result = document.getElementById('booking-result');
  var dateEl = document.getElementById('booking-date');

  // earliest date is today (local time)
  var now = new Date();
  var iso = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  dateEl.min = iso;

  function setError(name, bad) {
    var field = form.querySelector('[data-field="' + name + '"]');
    if (!field) return;
    field.classList.toggle('cj-field--error', bad);
    var msg = field.querySelector('.cj-field__msg');
    if (msg) msg.hidden = !bad;
    var input = field.querySelector('input');
    if (input && input.type !== 'radio') input.setAttribute('aria-invalid', bad ? 'true' : 'false');
  }

  function value(name) {
    var el = form.elements[name];
    return el ? (el.value || '').trim() : '';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var date = value('date');
    var dateBad = !date || date < iso;
    var nameBad = value('name').length < 2;
    var phoneBad = !/^\+?[0-9\s\-]{8,15}$/.test(value('phone'));
    setError('date', dateBad);
    setError('name', nameBad);
    setError('phone', phoneBad);
    if (dateBad || nameBad || phoneBad) {
      var firstBad = form.querySelector('.cj-field--error input');
      if (firstBad) firstBad.focus();
      return;
    }

    var parts = date.split('-');
    var pretty = parts[2] + '/' + parts[1] + '/' + parts[0];
    var service = form.querySelector('input[name="service"]:checked').value;
    var time = form.querySelector('input[name="time"]:checked').value;
    var summary = service + ', ' + pretty + ' at ' + time + ', ' + value('boutique') + '.';
    var text = 'Hi Chempaka, I would like to book an appointment.\n' +
      'Service: ' + service + '\nBoutique: ' + value('boutique') + '\nDate: ' + pretty + '\nTime: ' + time +
      '\nName: ' + value('name') + '\nPhone: ' + value('phone') +
      (value('note') ? '\nNote: ' + value('note') : '');

    document.getElementById('booking-summary').textContent = ' ' + summary;
    document.getElementById('booking-wa').href = 'https://wa.me/60178113204?text=' + encodeURIComponent(text);
    form.hidden = true;
    result.hidden = false;
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  ['date', 'name', 'phone'].forEach(function (n) {
    var el = form.elements[n];
    if (el) el.addEventListener('input', function () { setError(n, false); });
  });

  document.getElementById('booking-reset').addEventListener('click', function () {
    result.hidden = true;
    form.hidden = false;
  });
})();
