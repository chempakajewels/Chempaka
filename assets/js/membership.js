// Membership: apply (inserts a pending member) and retrieve the card (member_login RPC).
// Same Supabase calls as before the redesign: members.insert and rpc('member_login').
(function () {
  'use strict';

  var PHONE_RE = /^\+?[0-9\s\-]{8,15}$/;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // the shared client (assets/js/db.js), which goes through this site's own domain first
  function client() {
    return window.ChempakaDB ? ChempakaDB.client() : null;
  }

  function setError(form, name, bad) {
    var field = form.querySelector('[data-field="' + name + '"]');
    if (!field) return;
    field.classList.toggle('cj-field--error', bad);
    var msg = field.querySelector('.cj-field__msg');
    if (msg) msg.hidden = !bad;
    var input = field.querySelector('input:not([type="checkbox"])');
    if (input) input.setAttribute('aria-invalid', bad ? 'true' : 'false');
  }

  function formatIc(input) {
    var digits = input.value.replace(/\D/g, '').slice(0, 12);
    var out = digits.slice(0, 6);
    if (digits.length > 6) out += '-' + digits.slice(6, 8);
    if (digits.length > 8) out += '-' + digits.slice(8, 12);
    input.value = out;
  }

  // a connection problem reads differently from a database error; the detail helps when someone reports it
  function failText(err) {
    var msg = err && err.message ? String(err.message) : '';
    if (!msg || /fetch|network|load failed|failed to load|timeout|abort/i.test(msg)) return 'We could not reach the membership service. Check your connection and try again.';
    return 'Something went wrong. Please try again. (' + msg.slice(0, 90) + ')';
  }

  function showFormError(el, text) {
    el.textContent = text;
    el.hidden = !text;
  }

  // ---- apply ----
  var apply = document.getElementById('apply-form');
  if (apply) {
    var applyError = document.getElementById('apply-error');
    apply.elements.ic.addEventListener('input', function () { formatIc(apply.elements.ic); setError(apply, 'ic', false); });
    ['name', 'phone', 'email'].forEach(function (n) {
      apply.elements[n].addEventListener('input', function () { setError(apply, n, false); });
    });
    apply.elements.consent.addEventListener('change', function () { setError(apply, 'consent', false); });

    apply.addEventListener('submit', function (e) {
      e.preventDefault();
      showFormError(applyError, '');
      var name = apply.elements.name.value.trim();
      var ic = apply.elements.ic.value.replace(/[\s-]/g, '');
      var phone = apply.elements.phone.value.trim();
      var email = apply.elements.email.value.trim();
      var bad = {
        name: name.length < 2,
        ic: !/^\d{12}$/.test(ic),
        phone: !PHONE_RE.test(phone),
        email: !EMAIL_RE.test(email),
        consent: !apply.elements.consent.checked
      };
      Object.keys(bad).forEach(function (k) { setError(apply, k, bad[k]); });
      if (Object.keys(bad).some(function (k) { return bad[k]; })) {
        var first = apply.querySelector('.cj-field--error input');
        if (first) first.focus();
        return;
      }

      var btn = apply.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Sending...';

      var sb = client();
      if (!sb) {
        showFormError(applyError, 'The membership service is not connected. Please try again later or message us on WhatsApp.');
        btn.disabled = false;
        btn.textContent = 'Submit application';
        return;
      }

      sb.from('members')
        .insert([{ member_id: null, full_name: name, ic_number: ic, phone: phone, email: email, status: 'pending' }])
        .then(function (res) {
          if (res.error) {
            var err = res.error;
            var msg = failText(err);
            if (err.code === '23505') {
              if (/email/.test(err.message)) msg = 'This email address is already registered.';
              else if (/ic_number/.test(err.message)) msg = 'This IC number is already registered.';
            }
            showFormError(applyError, msg);
            btn.disabled = false;
            btn.textContent = 'Submit application';
            return;
          }
          apply.hidden = true;
          var done = document.getElementById('apply-done');
          document.getElementById('apply-done-text').textContent =
            ' Thank you, ' + name.toUpperCase() + '. Our boutique team will verify your details. Come back to retrieve your card with your phone and IC number once you are approved.';
          done.hidden = false;
        }, function (e2) {
          showFormError(applyError, failText(e2));
          btn.disabled = false;
          btn.textContent = 'Submit application';
        });
    });
  }

  // ---- retrieve card ----
  var login = document.getElementById('login-form');
  if (login) {
    var loginError = document.getElementById('login-error');
    login.elements.ic.addEventListener('input', function () { formatIc(login.elements.ic); setError(login, 'ic', false); });
    login.elements.phone.addEventListener('input', function () { setError(login, 'phone', false); });

    login.addEventListener('submit', function (e) {
      e.preventDefault();
      showFormError(loginError, '');
      var phone = login.elements.phone.value.trim();
      var ic = login.elements.ic.value.replace(/[\s-]/g, '');
      var phoneBad = phone.length < 8;
      var icBad = ic.length < 12;
      setError(login, 'phone', phoneBad);
      setError(login, 'ic', icBad);
      if (phoneBad || icBad) return;

      var btn = login.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Checking...';
      var restore = function () { btn.disabled = false; btn.textContent = 'Show my card'; };

      var sb = client();
      if (!sb) {
        showFormError(loginError, 'The membership service is not connected. Please try again later.');
        restore();
        return;
      }

      // The members table is not publicly readable; this RPC returns only the card fields for the one matching row.
      sb.rpc('member_login', { p_phone: phone, p_ic: ic }).then(function (res) {
        restore();
        if (res.error) { showFormError(loginError, failText(res.error)); return; }
        var row = res.data && res.data.length ? res.data[0] : null;
        if (!row) {
          showFormError(loginError, 'No record matches that phone number and IC number. Please check and try again.');
          return;
        }
        if (row.status === 'pending') {
          showFormError(loginError, 'Your application is still pending. Please check back once the boutique has approved it.');
          return;
        }
        var joined = new Date(row.joined_at);
        var since = String(joined.getMonth() + 1).padStart(2, '0') + '/' + joined.getFullYear();
        document.getElementById('card-name').textContent = row.full_name.toUpperCase();
        document.getElementById('card-id').textContent = row.member_id;
        document.getElementById('card-id-label').textContent = 'Member no.';
        document.getElementById('member-card').setAttribute('data-state', 'active');
        document.getElementById('member-card').setAttribute('aria-label', 'Chempaka Club member card for ' + row.full_name + ', member ' + row.member_id + ', member since ' + since);
        document.getElementById('card-note').textContent = 'Member since ' + since + '. Show this card at the counter to receive your member discount.';
        var fsBtn = document.getElementById('card-fullscreen');
        if (fsBtn) fsBtn.hidden = false;
        document.getElementById('member-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, function (e2) { restore(); showFormError(loginError, failText(e2)); });
    });
  }

  // ---- full-screen card, to show the staff ----
  // The retrieved card is cloned into a modal dialog and scaled to fit the screen. In portrait the name and
  // member number are repeated in large type under the card; in a short (landscape phone) screen the card
  // takes the whole height. Where the browser allows it the page also goes full screen and the screen stays awake.
  var CARD_W = 360, CARD_H = 227;
  var fsButton = document.getElementById('card-fullscreen');
  if (fsButton) fsButton.addEventListener('click', openCardView);

  function openCardView() {
    var card = document.getElementById('member-card');
    if (!card || card.getAttribute('data-state') !== 'active') return;
    var name = document.getElementById('card-name').textContent;
    var id = document.getElementById('card-id').textContent;

    var dlg = document.createElement('dialog');
    dlg.className = 'site-cardview';
    dlg.setAttribute('aria-label', 'Chempaka Club member card, full screen');

    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'site-cardview__close';
    close.setAttribute('aria-label', 'Close full screen');
    close.innerHTML = '<svg class="cj-icon" aria-hidden="true" focusable="false"><use href="assets/icons.svg#close"/></svg>';

    var stage = document.createElement('div');
    stage.className = 'site-cardview__stage';
    var clone = card.cloneNode(true);
    clone.removeAttribute('id');
    Array.prototype.forEach.call(clone.querySelectorAll('[id]'), function (n) { n.removeAttribute('id'); });
    clone.style.width = CARD_W + 'px';
    clone.style.maxWidth = 'none';
    clone.style.transformOrigin = '0 0';
    stage.appendChild(clone);

    var info = document.createElement('div');
    info.className = 'site-cardview__info';
    info.innerHTML = '<p class="site-cardview__status">Active member</p><p class="site-cardview__name"></p><p class="site-cardview__id"></p><p class="site-cardview__hint">Show this screen to the staff at the counter. Turn your phone sideways for a larger card.</p>';
    info.querySelector('.site-cardview__name').textContent = name;
    info.querySelector('.site-cardview__id').textContent = id;

    dlg.appendChild(close);
    dlg.appendChild(stage);
    dlg.appendChild(info);
    document.body.appendChild(dlg);

    function fit() {
      var short = window.innerHeight < 520;
      info.hidden = short;
      var k = Math.min(window.innerWidth * 0.94 / CARD_W, (short ? window.innerHeight - 112 : window.innerHeight * 0.56) / CARD_H);
      stage.style.width = Math.round(CARD_W * k) + 'px';
      stage.style.height = Math.round(CARD_H * k) + 'px';
      clone.style.transform = 'scale(' + k + ')';
    }

    var lock = null;
    function done() {
      window.removeEventListener('resize', fit);
      document.body.classList.remove('is-locked');
      if (lock && lock.release) { try { lock.release(); } catch (e) {} }
      if (document.fullscreenElement && document.exitFullscreen) { try { document.exitFullscreen(); } catch (e) {} }
      if (dlg.parentNode) dlg.parentNode.removeChild(dlg);
      if (fsButton) fsButton.focus();
    }

    window.addEventListener('resize', fit);
    dlg.addEventListener('close', done);
    close.addEventListener('click', function () { if (dlg.close) dlg.close(); else done(); });
    document.body.classList.add('is-locked');
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    fit();
    close.focus();

    // best effort, and only where the browser supports it
    var root = document.documentElement;
    if (root.requestFullscreen) { try { var p = root.requestFullscreen(); if (p && p.catch) p.catch(function () {}); } catch (e) {} }
    if (navigator.wakeLock && navigator.wakeLock.request) {
      navigator.wakeLock.request('screen').then(function (l) { lock = l; if (!dlg.parentNode) { try { l.release(); } catch (e) {} } }, function () {});
    }
  }
})();
