// Membership: apply (inserts a pending member) and retrieve the card (member_login RPC).
// Same Supabase calls as before the redesign: members.insert and rpc('member_login').
(function () {
  'use strict';

  var PHONE_RE = /^\+?[0-9\s\-]{8,15}$/;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function client() {
    if (typeof supabase !== 'undefined' && typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE') {
      return supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return null;
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
            var msg = 'Something went wrong. Please try again.';
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
        }, function () {
          showFormError(applyError, 'Something went wrong. Please try again.');
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
        if (res.error) { showFormError(loginError, 'Something went wrong. Please try again.'); return; }
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
        document.getElementById('member-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, function () { restore(); showFormError(loginError, 'Something went wrong. Please try again.'); });
    });
  }
})();
