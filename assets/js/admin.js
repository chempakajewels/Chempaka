// Admin portal.
// Same Supabase tables and operations as before the redesign: auth.signInWithPassword / getSession / signOut,
// members select / update / delete, site_settings select / upsert. Added for staff: members insert (a walk-in
// is added as pending and approved straight away, which the existing row-level rules allow), auth.updateUser
// (change your own password), search and filters, member editing, CSV export and summary figures.
(function () {
  'use strict';

  var PAGE_SIZE = 50;
  var PHONE_RE = /^\+?[0-9\s\-]{8,15}$/;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var sb = null;
  if (typeof supabase !== 'undefined' && typeof SUPABASE_URL !== 'undefined' && typeof SUPABASE_ANON_KEY !== 'undefined' && SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE') {
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  var $ = function (id) { return document.getElementById(id); };
  var allMembers = [];
  var limit = { pending: PAGE_SIZE, approved: PAGE_SIZE };
  var flashText = '';
  var editing = null;

  // ---------- small helpers ----------
  function show(el, on) { el.hidden = !on; }
  function digits(s) { return String(s || '').replace(/\D/g, ''); }
  function fmtDate(v) {
    return new Date(v).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  function fmtIc(s) {
    var d = digits(s);
    if (d.length !== 12) return String(s || '');
    return d.slice(0, 6) + '-' + d.slice(6, 8) + '-' + d.slice(8);
  }
  function isAuthError(err) {
    return !!err && (err.status === 401 || /jwt|token.*expired|not authenticated/i.test(err.message || ''));
  }
  function dbMessage(err) {
    if (err && err.code === '23505') {
      if (/email/.test(err.message || '')) return 'This email address is already registered.';
      if (/ic_number/.test(err.message || '')) return 'This IC number is already registered.';
      return 'A member with these details already exists.';
    }
    return 'Something went wrong' + (err && err.message ? ': ' + err.message : '.');
  }
  function openDialog(d) { if (d.showModal) d.showModal(); else d.setAttribute('open', ''); }
  function closeDialog(d) { if (d.close) d.close(); else d.removeAttribute('open'); }

  Array.prototype.forEach.call(document.querySelectorAll('[data-close]'), function (b) {
    b.addEventListener('click', function () { closeDialog(b.closest('dialog')); });
  });

  // ---------- views ----------
  function showLogin(msg) {
    show($('login-container'), true);
    show($('dashboard-container'), false);
    show($('user-info'), false);
    var err = $('login-error');
    err.textContent = msg || '';
    err.hidden = !msg;
  }

  function showDashboard(user) {
    show($('login-container'), false);
    show($('dashboard-container'), true);
    show($('user-info'), true);
    $('user-email').textContent = user.email;
    loadMembers();
    loadSettings();
  }

  function expired() { showLogin('Your session has expired. Please sign in again.'); }

  if (!sb) {
    showLogin('The database is not connected. Check supabase-config.js.');
  } else {
    sb.auth.getSession().then(function (res) {
      var session = res.data && res.data.session;
      if (session) showDashboard(session.user); else showLogin();
    });
  }

  // ---------- login / logout ----------
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
      $('login-password').value = '';
      showDashboard(res.data.user);
    });
  });
  $('logout-btn').addEventListener('click', function () {
    if (sb) sb.auth.signOut().then(function () { showLogin(); }); else showLogin();
  });

  // ---------- tabs ----------
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-tab]'));
  tabs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabs.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      Array.prototype.forEach.call(document.querySelectorAll('[data-panel]'), function (p) {
        p.hidden = p.id !== 'tab-' + btn.getAttribute('data-tab');
      });
    });
  });

  $('refresh-btn').addEventListener('click', function () { flashText = ''; loadMembers(); loadSettings(); });

  // ---------- members: loading ----------
  function messageRow(tbody, cols, text) {
    tbody.innerHTML = '';
    var tr = document.createElement('tr');
    var td = document.createElement('td');
    td.colSpan = cols;
    td.textContent = text;
    tr.appendChild(td);
    tbody.appendChild(tr);
  }

  function loadMembers() {
    show($('members-error'), false);
    messageRow($('pending-body'), 6, 'Loading members...');
    messageRow($('approved-body'), 7, 'Loading members...');
    sb.from('members').select('*').order('joined_at', { ascending: false }).then(function (res) {
      if (res.error) {
        if (isAuthError(res.error)) { expired(); return; }
        membersFailed(res.error.message);
        return;
      }
      allMembers = res.data || [];
      renderMembers();
    }, function () { membersFailed('The connection was interrupted.'); });
  }

  function membersFailed(text) {
    $('pending-body').innerHTML = '';
    $('approved-body').innerHTML = '';
    $('members-error-text').textContent = ' ' + text;
    show($('members-error'), true);
  }
  $('members-retry').addEventListener('click', loadMembers);

  // ---------- members: search, filter, tables ----------
  function query() { return $('member-search').value.trim().toLowerCase(); }

  function matches(m, q) {
    if (!q) return true;
    var hay = [m.full_name, m.member_id, m.email, m.phone, m.ic_number].join(' ').toLowerCase();
    if (hay.indexOf(q) !== -1) return true;
    var qd = digits(q);
    return qd.length >= 3 && (digits(m.phone).indexOf(qd) !== -1 || digits(m.ic_number).indexOf(qd) !== -1);
  }

  function cell(text, label, strong) {
    var td = document.createElement('td');
    td.setAttribute('data-label', label);
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
  function actions() {
    var td = document.createElement('td');
    td.className = 'site-table__act';
    Array.prototype.slice.call(arguments).forEach(function (b) { td.appendChild(b); });
    return td;
  }

  function renderMembers() {
    var q = query();
    var filter = $('member-filter').value;
    var pendingAll = allMembers.filter(function (m) { return m.status === 'pending'; });
    var approvedAll = allMembers.filter(function (m) { return m.status === 'approved'; });

    // summary figures always use every record, whatever is searched
    var now = new Date();
    var thisMonth = allMembers.filter(function (m) {
      var d = new Date(m.joined_at);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
    $('stat-pending').textContent = pendingAll.length;
    $('stat-approved').textContent = approvedAll.length;
    $('stat-month').textContent = thisMonth;
    $('stat-total').textContent = allMembers.length;
    $('stat-pending-box').classList.toggle('is-attn', pendingAll.length > 0);
    var badge = $('tab-pending-badge');
    badge.textContent = pendingAll.length;
    show(badge, pendingAll.length > 0);

    var pending = pendingAll.filter(function (m) { return matches(m, q); });
    var approved = approvedAll.filter(function (m) { return matches(m, q); });
    show($('pending-section'), filter !== 'approved');
    show($('approved-section'), filter !== 'pending');
    $('pending-count').textContent = (q ? pending.length + ' of ' + pendingAll.length : pendingAll.length) + ' pending';
    $('approved-count').textContent = (q ? approved.length + ' of ' + approvedAll.length : approvedAll.length) + ' members';

    var pb = $('pending-body');
    pb.innerHTML = '';
    pending.slice(0, limit.pending).forEach(function (m) {
      var tr = document.createElement('tr');
      tr.appendChild(cell(m.full_name, 'Full name', true));
      tr.appendChild(cell(fmtIc(m.ic_number), 'IC number'));
      tr.appendChild(cell(m.phone, 'Phone'));
      tr.appendChild(cell(m.email, 'Email'));
      tr.appendChild(cell(fmtDate(m.joined_at), 'Applied'));
      tr.appendChild(actions(action('Approve', function () { approve(m); }), action('Edit', function () { openMemberDialog(m); }), action('Reject', function () { remove(m, 'Reject'); })));
      pb.appendChild(tr);
    });
    show($('no-pending'), pending.length === 0);
    show($('pending-more'), pending.length > limit.pending);
    $('pending-more').textContent = 'Show more (' + (pending.length - limit.pending) + ' left)';

    var ab = $('approved-body');
    ab.innerHTML = '';
    approved.slice(0, limit.approved).forEach(function (m) {
      var tr = document.createElement('tr');
      tr.appendChild(cell(m.member_id, 'Member ID', true));
      tr.appendChild(cell(m.full_name, 'Full name'));
      tr.appendChild(cell(fmtIc(m.ic_number), 'IC number'));
      tr.appendChild(cell(m.phone, 'Phone'));
      tr.appendChild(cell(m.email, 'Email'));
      tr.appendChild(cell(fmtDate(m.joined_at), 'Joined'));
      tr.appendChild(actions(action('Edit', function () { openMemberDialog(m); }), action('Revoke', function () { remove(m, 'Revoke'); })));
      ab.appendChild(tr);
    });
    show($('no-approved'), approved.length === 0);
    show($('approved-more'), approved.length > limit.approved);
    $('approved-more').textContent = 'Show more (' + (approved.length - limit.approved) + ' left)';

    var summary = flashText;
    if (!summary && (q || filter !== 'all')) {
      var n = (filter === 'pending' ? pending.length : filter === 'approved' ? approved.length : pending.length + approved.length);
      summary = n + (n === 1 ? ' record matches' : ' records match') + (q ? ' "' + $('member-search').value.trim() + '"' : '') + '.';
    }
    $('member-summary').textContent = summary;
  }

  function resetPaging() { limit.pending = PAGE_SIZE; limit.approved = PAGE_SIZE; flashText = ''; renderMembers(); }
  $('member-search').addEventListener('input', resetPaging);
  $('member-filter').addEventListener('change', resetPaging);
  $('pending-more').addEventListener('click', function () { limit.pending += PAGE_SIZE; renderMembers(); });
  $('approved-more').addEventListener('click', function () { limit.approved += PAGE_SIZE; renderMembers(); });

  function flash(text) { flashText = text; }

  // ---------- members: confirm dialog ----------
  function askConfirm(title, text, label) {
    return new Promise(function (resolve) {
      var d = $('confirm-dialog');
      $('confirm-title').textContent = title;
      $('confirm-text').textContent = text;
      $('confirm-yes').textContent = label || 'Confirm';
      var done = false;
      function finish(value) {
        if (done) return;
        done = true;
        $('confirm-yes').onclick = null;
        $('confirm-no').onclick = null;
        d.removeEventListener('close', onClose);
        closeDialog(d);
        resolve(value);
      }
      function onClose() { finish(false); }
      $('confirm-yes').onclick = function () { finish(true); };
      $('confirm-no').onclick = function () { finish(false); };
      d.addEventListener('close', onClose);
      openDialog(d);
    });
  }

  // ---------- members: approve, reject, revoke ----------
  function nextMemberId() {
    var taken = {};
    allMembers.forEach(function (m) { if (m.member_id) taken[m.member_id] = true; });
    var id;
    do { id = 'CC-' + Math.floor(100000 + Math.random() * 900000); } while (taken[id]);
    return id;
  }

  // a random 6-digit number avoids collisions if members are deleted; retried if the database reports a clash
  function approveRow(id, attempt, cb) {
    var memberId = nextMemberId();
    sb.from('members').update({ status: 'approved', member_id: memberId }).eq('id', id).then(function (res) {
      if (res.error && res.error.code === '23505' && attempt < 3) { approveRow(id, attempt + 1, cb); return; }
      cb(res.error, memberId);
    });
  }

  function approve(m) {
    askConfirm('Approve membership?', 'Approve Chempaka Club membership for "' + m.full_name + '"? They get a member ID and can retrieve their card straight away.', 'Approve').then(function (ok) {
      if (!ok) return;
      approveRow(m.id, 0, function (err, memberId) {
        if (err) { if (isAuthError(err)) { expired(); return; } alert('Failed to approve membership: ' + err.message); return; }
        flash('Approved ' + m.full_name + ' as ' + memberId + '.');
        loadMembers();
      });
    });
  }

  function remove(m, label) {
    var title = label === 'Reject' ? 'Reject this application?' : 'Revoke this membership?';
    var text = label === 'Reject'
      ? 'The application from "' + m.full_name + '" will be deleted.'
      : 'Membership privileges for "' + m.full_name + '" are revoked. This deletes their registration.';
    askConfirm(title, text, label).then(function (ok) {
      if (!ok) return;
      sb.from('members').delete().eq('id', m.id).then(function (res) {
        if (res.error) { if (isAuthError(res.error)) { expired(); return; } alert('Failed to process the request: ' + res.error.message); return; }
        flash((label === 'Reject' ? 'Rejected ' : 'Revoked ') + m.full_name + '.');
        loadMembers();
      });
    });
  }

  // ---------- members: add and edit ----------
  var mform = $('member-form');

  function setFieldError(name, bad) {
    var field = mform.querySelector('[data-field="' + name + '"]');
    if (!field) return;
    field.classList.toggle('cj-field--error', bad);
    var msg = field.querySelector('.cj-field__msg');
    if (msg) msg.hidden = !bad;
    var input = field.querySelector('input');
    if (input) input.setAttribute('aria-invalid', bad ? 'true' : 'false');
  }

  function openMemberDialog(m) {
    editing = m || null;
    $('member-dialog-title').textContent = m ? 'Edit member' : 'Add member';
    $('member-dialog-note').textContent = m
      ? (m.member_id ? 'Member ' + m.member_id + '. Correct the details exactly as the member registered them.' : 'Pending application. Correct the details, then approve from the list.')
      : 'Adds the member and approves them straight away, so they can retrieve their card right away.';
    $('member-dialog-save').textContent = m ? 'Save changes' : 'Add and approve';
    $('md-name').value = m ? m.full_name : '';
    $('md-phone').value = m ? m.phone : '+60';
    $('md-email').value = m ? m.email : '';
    $('md-ic').value = m ? fmtIc(m.ic_number) : '';
    ['name', 'phone', 'email', 'ic'].forEach(function (n) { setFieldError(n, false); });
    $('member-dialog-error').hidden = true;
    $('member-dialog-save').disabled = false;
    openDialog($('member-dialog'));
    $('md-name').focus();
  }
  $('add-member-btn').addEventListener('click', function () { openMemberDialog(null); });

  $('md-ic').addEventListener('input', function () {
    var d = digits(this.value).slice(0, 12);
    var out = d.slice(0, 6);
    if (d.length > 6) out += '-' + d.slice(6, 8);
    if (d.length > 8) out += '-' + d.slice(8, 12);
    this.value = out;
    setFieldError('ic', false);
  });
  ['name', 'phone', 'email'].forEach(function (n) {
    mform.elements[n].addEventListener('input', function () { setFieldError(n, false); });
  });

  mform.addEventListener('submit', function (e) {
    e.preventDefault();
    var errEl = $('member-dialog-error');
    errEl.hidden = true;
    var name = mform.elements.name.value.trim();
    var phone = mform.elements.phone.value.trim();
    var email = mform.elements.email.value.trim();
    var ic = digits(mform.elements.ic.value);
    var bad = { name: name.length < 2, phone: !PHONE_RE.test(phone), email: !EMAIL_RE.test(email), ic: ic.length !== 12 };
    Object.keys(bad).forEach(function (k) { setFieldError(k, bad[k]); });
    if (Object.keys(bad).some(function (k) { return bad[k]; })) {
      var first = mform.querySelector('.cj-field--error input');
      if (first) first.focus();
      return;
    }

    var save = $('member-dialog-save');
    var label = save.textContent;
    save.disabled = true;
    save.textContent = 'Saving...';
    function fail(text) { errEl.textContent = text; errEl.hidden = false; save.disabled = false; save.textContent = label; }
    function done(text) { closeDialog($('member-dialog')); flash(text); loadMembers(); }

    if (editing) {
      sb.from('members').update({ full_name: name, phone: phone, email: email, ic_number: ic }).eq('id', editing.id).then(function (res) {
        if (res.error) { if (isAuthError(res.error)) { closeDialog($('member-dialog')); expired(); return; } fail(dbMessage(res.error)); return; }
        done('Saved the details for ' + name + '.');
      });
      return;
    }

    // a walk-in: inserted as pending (all the public insert rule allows), then approved by this signed-in admin
    sb.from('members').insert([{ full_name: name, ic_number: ic, phone: phone, email: email, status: 'pending' }]).select().then(function (res) {
      if (res.error) { if (isAuthError(res.error)) { closeDialog($('member-dialog')); expired(); return; } fail(dbMessage(res.error)); return; }
      var row = res.data && res.data[0];
      if (!row) { done(name + ' was added as pending. Approve them from the list.'); return; }
      approveRow(row.id, 0, function (err, memberId) {
        if (err) { done(name + ' was added as pending, but approval failed: ' + err.message + '. Approve them from the list.'); return; }
        done('Added ' + name + ' as ' + memberId + '.');
      });
    });
  });

  // ---------- members: export ----------
  function csvCell(v) {
    var s = String(v == null ? '' : v);
    // spreadsheets run text that starts with = + - @ as a formula; plain phone numbers are the one exception
    if (/^[=+\-@\t\r]/.test(s) && !/^\+[0-9][0-9 \-]{7,}$/.test(s)) s = "'" + s;
    if (/[",\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  $('export-btn').addEventListener('click', function () {
    var q = query();
    var filter = $('member-filter').value;
    var list = allMembers.filter(function (m) { return (filter === 'all' || m.status === filter) && matches(m, q); });
    var rows = [['Member ID', 'Full name', 'IC number', 'Phone', 'Email', 'Status', 'Joined']].concat(list.map(function (m) {
      return [m.member_id || '', m.full_name, fmtIc(m.ic_number), m.phone, m.email, m.status, new Date(m.joined_at).toISOString().slice(0, 10)];
    }));
    var csv = '﻿' + rows.map(function (r) { return r.map(csvCell).join(','); }).join('\r\n');
    var url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    var a = document.createElement('a');
    a.href = url;
    a.download = 'chempaka-members-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    flash('Exported ' + list.length + (list.length === 1 ? ' record.' : ' records.'));
    renderMembers();
  });

  // ---------- counter check ----------
  // searches the member list already loaded: member ID, the last 9 digits of the phone number, or part of the name
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

    function notice(icon, title, text, extra) {
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
      if (extra) { d.appendChild(document.createElement('br')); d.appendChild(extra); }
      box.appendChild(i);
      box.appendChild(d);
      out.appendChild(box);
    }

    if (!allMembers.length) { notice('info', 'Member list not loaded', 'Press Refresh, then check again.'); return; }
    if (!hits.length) { notice('info', 'No member found', 'Check the spelling, or look in Member monitor.'); return; }
    hits.forEach(function (m) {
      if (m.status === 'approved') {
        notice('check_circle', 'Active member: ' + m.full_name, m.member_id + ' · Joined ' + fmtDate(m.joined_at) + '. Member prices apply.');
      } else {
        var btn = action('Approve now', function () { approve(m); });
        btn.className = 'site-linkbtn';
        notice('info', 'Pending: ' + m.full_name, 'Application received ' + fmtDate(m.joined_at) + ', not yet approved. Member prices do not apply.', btn);
      }
    });
  });

  // ---------- site settings ----------
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

  $('settings-reset').addEventListener('click', function () {
    $('settings-ok').hidden = true;
    $('settings-error').hidden = true;
    loadSettings();
  });

  $('settings-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = $('settings-ok');
    var errEl = $('settings-error');
    var btn = $('settings-save');
    ok.hidden = true;
    errEl.hidden = true;
    btn.disabled = true;
    btn.textContent = 'Publishing...';
    // the hero image setting is not touched: the new home page chooses its photographs in code
    var payload = [
      { key: 'promo_banner_text', value: JSON.stringify($('set-promo').value) },
      { key: 'hero_title', value: JSON.stringify($('set-title').value) },
      { key: 'hero_subtitle', value: JSON.stringify($('set-sub').value) },
      { key: 'store_announcements', value: JSON.stringify([$('set-ann').value]) }
    ];
    sb.from('site_settings').upsert(payload).then(function (res) {
      btn.disabled = false;
      btn.textContent = 'Publish changes live';
      if (res.error) {
        if (isAuthError(res.error)) { expired(); return; }
        errEl.textContent = 'Failed to update settings: ' + res.error.message;
        errEl.hidden = false;
        return;
      }
      try { sessionStorage.removeItem('chempaka-settings'); } catch (e2) {}
      ok.hidden = false;
    });
  });

  // ---------- change password ----------
  $('password-btn').addEventListener('click', function () {
    $('pw-new').value = '';
    $('pw-confirm').value = '';
    $('password-error').hidden = true;
    $('password-ok').hidden = true;
    $('password-save').disabled = false;
    openDialog($('password-dialog'));
    $('pw-new').focus();
  });

  $('password-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var errEl = $('password-error');
    errEl.hidden = true;
    $('password-ok').hidden = true;
    var a = $('pw-new').value;
    var b = $('pw-confirm').value;
    if (a.length < 8) { errEl.textContent = 'Use at least 8 characters.'; errEl.hidden = false; $('pw-new').focus(); return; }
    if (a !== b) { errEl.textContent = 'The two passwords do not match.'; errEl.hidden = false; $('pw-confirm').focus(); return; }
    var save = $('password-save');
    save.disabled = true;
    sb.auth.updateUser({ password: a }).then(function (res) {
      save.disabled = false;
      if (res.error) {
        if (isAuthError(res.error)) { closeDialog($('password-dialog')); expired(); return; }
        errEl.textContent = 'Could not update the password: ' + res.error.message;
        errEl.hidden = false;
        return;
      }
      $('pw-new').value = '';
      $('pw-confirm').value = '';
      $('password-ok').hidden = false;
    });
  });
})();
