// Admin portal. Same Supabase operations as before the redesign:
// auth.signInWithPassword / getSession / signOut, members select / update / delete,
// site_settings select / upsert. The counter check searches the member list already loaded.
(function () {
  'use strict';

  var sb = null;
  if (typeof supabase !== 'undefined' && typeof SUPABASE_URL !== 'undefined' && typeof SUPABASE_ANON_KEY !== 'undefined' && SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE') {
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  var $ = function (id) { return document.getElementById(id); };
  var allMembers = [];

  function show(el, on) { el.hidden = !on; }

  function showLogin() {
    show($('login-container'), true);
    show($('dashboard-container'), false);
    show($('user-info'), false);
  }

  function showDashboard(user) {
    show($('login-container'), false);
    show($('dashboard-container'), true);
    show($('user-info'), true);
    $('user-email').textContent = user.email;
    loadMembers();
    loadSettings();
  }

  if (!sb) {
    showLogin();
    var err = $('login-error');
    err.textContent = 'The database is not connected. Check supabase-config.js.';
    err.hidden = false;
  } else {
    sb.auth.getSession().then(function (res) {
      var session = res.data && res.data.session;
      if (session) showDashboard(session.user); else showLogin();
    });
  }

  // ---- login / logout ----
  $('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var errEl = $('login-error');
    errEl.hidden = true;
    if (!sb) { errEl.textContent = 'The database is not connected.'; errEl.hidden = false; return; }
    sb.auth.signInWithPassword({ email: $('login-email').value.trim(), password: $('login-password').value }).then(function (res) {
      if (res.error) {
        errEl.textContent = 'Authentication failed: ' + res.error.message;
        errEl.hidden = false;
        return;
      }
      showDashboard(res.data.user);
    });
  });
  $('logout-btn').addEventListener('click', function () {
    if (sb) sb.auth.signOut().then(showLogin); else showLogin();
  });

  // ---- tabs ----
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-tab]'));
  tabs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabs.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      Array.prototype.forEach.call(document.querySelectorAll('[data-panel]'), function (p) {
        p.hidden = p.id !== 'tab-' + btn.getAttribute('data-tab');
      });
    });
  });

  // ---- members ----
  function cell(text, strong) {
    var td = document.createElement('td');
    if (strong) { var b = document.createElement('b'); b.textContent = text; td.appendChild(b); } else { td.textContent = text; }
    return td;
  }
  function action(label, onClick) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.addEventListener('click', onClick);
    return b;
  }
  function fmtDate(v) {
    return new Date(v).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function loadMembers() {
    sb.from('members').select('*').order('joined_at', { ascending: false }).then(function (res) {
      if (res.error) {
        $('pending-body').innerHTML = '';
        var tr = document.createElement('tr');
        var td = cell('Could not load members: ' + res.error.message);
        td.colSpan = 6;
        tr.appendChild(td);
        $('pending-body').appendChild(tr);
        return;
      }
      allMembers = res.data || [];
      renderMembers();
    });
  }

  function renderMembers() {
    var pending = allMembers.filter(function (m) { return m.status === 'pending'; });
    var approved = allMembers.filter(function (m) { return m.status === 'approved'; });
    $('pending-count').textContent = pending.length + ' pending';
    $('approved-count').textContent = approved.length + ' members';
    show($('no-pending'), pending.length === 0);
    show($('no-approved'), approved.length === 0);

    var pb = $('pending-body');
    pb.innerHTML = '';
    pending.forEach(function (m) {
      var tr = document.createElement('tr');
      tr.appendChild(cell(m.full_name, true));
      tr.appendChild(cell(m.ic_number));
      tr.appendChild(cell(m.phone));
      tr.appendChild(cell(m.email));
      tr.appendChild(cell(fmtDate(m.joined_at)));
      var td = document.createElement('td');
      td.className = 'site-table__act';
      td.appendChild(action('Approve', function () { approve(m); }));
      td.appendChild(action('Reject', function () { remove(m, 'Reject'); }));
      tr.appendChild(td);
      pb.appendChild(tr);
    });

    var ab = $('approved-body');
    ab.innerHTML = '';
    approved.forEach(function (m) {
      var tr = document.createElement('tr');
      tr.appendChild(cell(m.member_id, true));
      tr.appendChild(cell(m.full_name));
      tr.appendChild(cell(m.ic_number));
      tr.appendChild(cell(m.phone));
      tr.appendChild(cell(m.email));
      tr.appendChild(cell(fmtDate(m.joined_at)));
      var td = document.createElement('td');
      td.className = 'site-table__act';
      td.appendChild(action('Revoke', function () { remove(m, 'Revoke'); }));
      tr.appendChild(td);
      ab.appendChild(tr);
    });
  }

  function approve(m) {
    if (!confirm('Approve Chempaka Club membership for "' + m.full_name + '"?')) return;
    // a random 6-digit number avoids collisions if members are deleted
    var memberId = 'CC-' + Math.floor(100000 + Math.random() * 900000);
    sb.from('members').update({ status: 'approved', member_id: memberId }).eq('id', m.id).then(function (res) {
      if (res.error) { alert('Failed to approve membership: ' + res.error.message); return; }
      loadMembers();
    });
  }

  function remove(m, label) {
    var msg = label === 'Reject'
      ? 'Reject the membership application for "' + m.full_name + '"?'
      : 'Revoke membership privileges for "' + m.full_name + '"? This deletes their registration.';
    if (!confirm(msg)) return;
    sb.from('members').delete().eq('id', m.id).then(function (res) {
      if (res.error) { alert('Failed to process the request: ' + res.error.message); return; }
      loadMembers();
    });
  }

  // ---- counter check ----
  function digits(s) { return String(s || '').replace(/\D/g, ''); }
  $('counter-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var q = $('counter-q').value.trim().toLowerCase();
    var out = $('counter-result');
    out.innerHTML = '';
    if (!q) return;
    var qd = digits(q);
    var hits = allMembers.filter(function (m) {
      return (m.member_id && m.member_id.toLowerCase() === q) ||
        (qd.length >= 7 && digits(m.phone).slice(-9) === qd.slice(-9)) ||
        m.full_name.toLowerCase().indexOf(q) !== -1;
    }).slice(0, 5);

    function notice(icon, title, text) {
      var box = document.createElement('div');
      box.className = 'cj-notice';
      box.setAttribute('role', 'status');
      var NS = 'http://www.w3.org/2000/svg';
      var i = document.createElementNS(NS, 'svg');
      i.setAttribute('class', 'cj-icon');
      i.setAttribute('aria-hidden', 'true');
      var use = document.createElementNS(NS, 'use');
      use.setAttribute('href', 'assets/icons.svg#' + icon);
      i.appendChild(use);
      var d = document.createElement('div');
      var b = document.createElement('b');
      b.textContent = title;
      d.appendChild(b);
      d.appendChild(document.createTextNode(text));
      box.appendChild(i);
      box.appendChild(d);
      out.appendChild(box);
    }

    if (!hits.length) { notice('info', 'No member found', 'Check the spelling, or look in Member monitor.'); return; }
    hits.forEach(function (m) {
      if (m.status === 'approved') {
        notice('check_circle', 'Active member: ' + m.full_name, m.member_id + ' · Joined ' + fmtDate(m.joined_at) + '. Member prices apply.');
      } else {
        notice('info', 'Pending: ' + m.full_name, 'Application received ' + fmtDate(m.joined_at) + ', not yet approved. Member prices do not apply.');
      }
    });
  });

  // ---- site settings ----
  function parse(v) {
    if (typeof v !== 'string') return v;
    try { return JSON.parse(v); } catch (e) { return v; }
  }

  function loadSettings() {
    sb.from('site_settings').select('*').then(function (res) {
      if (res.error || !res.data) return;
      res.data.forEach(function (row) {
        var v = parse(row.value);
        if (row.key === 'promo_banner_text') $('set-promo').value = v || '';
        else if (row.key === 'hero_title') $('set-title').value = v || '';
        else if (row.key === 'hero_subtitle') $('set-sub').value = v || '';
        else if (row.key === 'store_announcements') $('set-ann').value = (Array.isArray(v) && v[0]) || '';
      });
    });
  }

  $('settings-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = $('settings-ok');
    var errEl = $('settings-error');
    ok.hidden = true;
    errEl.hidden = true;
    // the hero image setting is not touched: the new home page chooses its photographs in code
    var payload = [
      { key: 'promo_banner_text', value: JSON.stringify($('set-promo').value) },
      { key: 'hero_title', value: JSON.stringify($('set-title').value) },
      { key: 'hero_subtitle', value: JSON.stringify($('set-sub').value) },
      { key: 'store_announcements', value: JSON.stringify([$('set-ann').value]) }
    ];
    sb.from('site_settings').upsert(payload).then(function (res) {
      if (res.error) {
        errEl.textContent = 'Failed to update settings: ' + res.error.message;
        errEl.hidden = false;
        return;
      }
      try { sessionStorage.removeItem('chempaka-settings'); } catch (e2) {}
      ok.hidden = false;
    });
  });
})();
