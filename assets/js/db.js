// One Supabase client for the whole site (members, card lookup, site settings, admin).
//
// Requests go to this site's own /supabase path first (vercel.json rewrites it to the Supabase project, and
// scripts/dev-server.js does the same locally). A visitor whose network cannot resolve or reach *.supabase.co,
// which happens on some mobile connections, can still reach the site's own domain, so the card lookup works.
// If that route fails with a network error, or the site answers with a web page instead of data, the same
// request is sent directly to Supabase.
(function () {
  'use strict';

  function configured() {
    return typeof supabase !== 'undefined' && typeof SUPABASE_URL !== 'undefined' &&
      typeof SUPABASE_ANON_KEY !== 'undefined' && SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE';
  }

  function viaSite(input, init) {
    // only plain string URLs aimed at the project are re-routed; anything else goes through untouched
    if (typeof input !== 'string' || input.indexOf(SUPABASE_URL) !== 0) return fetch(input, init);
    var local = location.origin + '/supabase' + input.slice(SUPABASE_URL.length);
    return fetch(local, init).then(function (res) {
      var type = res.headers.get('content-type') || '';
      if (!res.ok && type.indexOf('text/html') === 0) return fetch(input, init);
      return res;
    }, function () {
      return fetch(input, init);
    });
  }

  var shared = null;
  window.ChempakaDB = {
    // returns null when the database is not configured
    client: function () {
      if (!configured()) return null;
      if (!shared) shared = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { fetch: viaSite } });
      return shared;
    },
  };
})();
