// Showcase: four chapters, each with a piece viewer. ?q=rings (from the search box or the
// collection links) selects the matching pieces and scrolls to them.
(function () {
  'use strict';

  var WA = 'https://wa.me/60178113204?text=';
  var GOLD_916 = 'RM 385.00 per gram (916)';

  var CHAPTERS = [
    {
      title: 'The Royal Malay Heritage', img: 'img-hijab', alt: 'Ayu Damit wearing Chempaka gold bracelets and rings',
      desc: 'Hand-carved 916 yellow gold filigree with brilliant natural ruby drops, celebrating centuries of royal Malay craftsmanship.',
      pieces: [
        { tab: 'Royal Choker', category: 'Heritage collection', title: 'Chempaka Royal Choker', tags: 'necklaces necklace choker', gold916: true, price: 'RM 14,800', purity: '916 (22K) gold', weight: '32.4 grams', gem: 'Natural ruby, 2.4 ct', craft: 'Hand filigree', desc: 'Handcrafted by Chempaka senior goldsmiths using traditional Kelantan filigree techniques. Polished 916 solid gold links end in a teardrop ruby pendant.' },
        { tab: 'Ruby Drop Earrings', category: 'Heritage collection', title: 'Mahsuri Ruby Drop Earrings', tags: 'earrings earring', gold916: true, price: 'RM 8,500', purity: '916 (22K) gold', weight: '16.8 grams', gem: 'Pigeon blood ruby, 1.8 ct', craft: 'Granulated bezel', desc: 'Symmetrical ruby drop chandelier earrings in 916 yellow gold filigree, with secure high-security leverback clasps.' }
      ]
    },
    {
      title: 'Celestial Solitaire', img: 'img-diamond', alt: 'Two pear-cut diamond pendants on fine gold chains',
      desc: 'Ethically sourced VVS1 brilliant diamonds, mounted on precision-crafted 18K white gold and yellow gold.',
      pieces: [
        { tab: 'Solitaire Pendant', category: 'Fine diamond collection', title: 'Celestial Solitaire Pendant', tags: 'necklaces necklace pendant diamond', price: 'RM 22,000', purity: '18K white gold', weight: '11.2 grams', gem: 'VVS1 brilliant diamond, 1.5 ct', craft: 'Four-prong solitaire', desc: 'An exceptional 1.5-carat round brilliant diamond, ideal cut and D colour, suspended on a fluid 18K white gold wheat chain.' },
        { tab: 'Astraea Cluster Ring', category: 'Fine diamond collection', title: 'Astraea Cluster Ring', tags: 'rings ring diamond', price: 'RM 11,200', purity: '18K yellow gold', weight: '8.5 grams', gem: 'Pavé diamonds, 0.95 ct', craft: 'Micro-pavé setting', desc: 'A glowing halo ring: central brilliant round diamonds ringed by a double row of micro-pavé diamonds, on a tapered 18K gold band.' }
      ]
    },
    {
      title: 'Pure Gold Minimalist', img: 'img-bracelet', alt: 'Gold bracelets and bangles',
      desc: 'Sculptural 999 solid gold signet rings and hand-hammered bangles, designed for effortless modern elegance.',
      pieces: [
        { tab: 'Signet Ring', category: 'Pure gold minimalist', title: 'Imperial Pure Gold Signet', tags: 'rings ring signet', price: 'RM 6,400', purity: '999 (24K) gold', weight: '14.2 grams', gem: 'Solid, un-alloyed gold', craft: 'Mirror polish', desc: 'Forged from 99.9% pure solid gold, with an unblemished oval face for custom initials or a royal crest engraving.' },
        { tab: 'Hammered Bangle', category: 'Pure gold minimalist', title: 'Aurora Hammered Bangle', tags: 'bracelets bracelet bangle', gold916: true, price: 'RM 18,900', purity: '916 (22K) gold', weight: '41.0 grams', gem: 'Solid gold texture', craft: 'Hammered facets', desc: 'A sculptural solid gold bangle with hand-hammered faceted surfaces that catch and refract the light with every movement.' }
      ]
    },
    {
      title: 'Bespoke Masterworks', img: 'img-custom', alt: 'A bespoke Chempaka gold piece',
      desc: 'Co-create an heirloom with Chempaka master goldsmiths: tailored gem selection, 3D CAD modelling and private lounge fittings.',
      pieces: [
        { tab: 'Royal Crest Pendant', category: 'Custom high jewellery', title: 'Royal Crest Bespoke Pendant', tags: 'bespoke custom necklaces necklace pendant', price: 'RM 35,000', purity: '999 (24K) gold', weight: '28.6 grams', gem: 'Zambian emerald, 3.2 ct', craft: 'Bespoke CAD and forging', desc: 'A custom high jewellery statement piece: a central natural Zambian emerald held in 24K gold geometric wings.' }
      ]
    }
  ];

  var selected = CHAPTERS.map(function () { return 0; });
  var root = document.getElementById('chapters');

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  function detail(ci) {
    var p = CHAPTERS[ci].pieces[selected[ci]];
    var ask = WA + encodeURIComponent('Hi Chempaka, I’m interested in the ' + p.title + '.');
    return '' +
      '<p class="site-subhead" style="margin:0">' + esc(p.category) + '</p>' +
      '<h3 class="cj-heading">' + esc(p.title) + '</h3>' +
      '<p class="site-price">' + esc(p.price) + '</p>' +
      '<dl class="site-specs">' +
        '<div><dt>Gold</dt><dd>' + esc(p.purity) + '</dd></div>' +
        '<div><dt>Weight</dt><dd>' + esc(p.weight) + '</dd></div>' +
        '<div><dt>Gemstone</dt><dd>' + esc(p.gem) + '</dd></div>' +
        '<div><dt>Craftsmanship</dt><dd>' + esc(p.craft) + '</dd></div>' +
      '</dl>' +
      '<p class="cj-muted" style="margin:0">' + esc(p.desc) + '</p>' +
      (p.gold916 ? '<p class="cj-caption" style="margin:0">Gold today: ' + GOLD_916 + '.</p>' : '') +
      '<p class="cj-caption" style="margin:0">Club members receive a full buy-back guarantee and no trade-in deduction.</p>' +
      '<div class="cj-hero__actions"><a href="' + ask + '" class="cj-btn cj-btn--primary"><svg class="cj-icon" aria-hidden="true" focusable="false"><use href="assets/icons.svg#chat"/></svg> WhatsApp us</a><a href="boutiques.html#appointment" class="cj-btn cj-btn--outline">Book an appointment</a></div>';
  }

  function chapterHtml(ci) {
    var c = CHAPTERS[ci];
    var tabs = '';
    if (c.pieces.length > 1) {
      tabs = '<div class="cj-choices" role="group" aria-label="Pieces in this chapter">' +
        c.pieces.map(function (p, pi) {
          return '<button type="button" class="cj-choice" data-chapter="' + ci + '" data-piece="' + pi + '" aria-pressed="' + (pi === selected[ci]) + '">' + esc(p.tab) + '</button>';
        }).join('') + '</div>';
    }
    return '' +
      '<section id="chapter-' + (ci + 1) + '" class="cj-section site-chapter' + (ci % 2 ? ' cj-band' : '') + '" aria-labelledby="chapter-title-' + (ci + 1) + '">' +
        '<div class="cj-container site-split site-split--even' + '">' +
          '<div class="site-showimg ' + c.img + '" role="img" aria-label="' + esc(c.alt) + '"></div>' +
          '<div class="site-stack" style="gap:20px">' +
            '<h2 class="cj-display-l" id="chapter-title-' + (ci + 1) + '">' + esc(c.title) + '</h2>' +
            '<p class="cj-muted" style="margin:0;max-width:520px">' + esc(c.desc) + '</p>' +
            tabs +
            '<div class="site-stack" data-detail="' + ci + '" style="gap:16px;width:100%;border-top:1px solid var(--gold);padding-top:24px" role="region" aria-live="polite" aria-label="Piece details">' + detail(ci) + '</div>' +
          '</div>' +
        '</div>' +
      '</section>';
  }

  function render() {
    root.innerHTML = CHAPTERS.map(function (_, ci) { return chapterHtml(ci); }).join('');
  }

  root.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-piece]');
    if (!btn) return;
    var ci = Number(btn.getAttribute('data-chapter'));
    selected[ci] = Number(btn.getAttribute('data-piece'));
    root.querySelector('[data-detail="' + ci + '"]').innerHTML = detail(ci);
    Array.prototype.forEach.call(root.querySelectorAll('[data-chapter="' + ci + '"][data-piece]'), function (b) {
      b.setAttribute('aria-pressed', String(b === btn));
    });
  });

  // ?q= filter: select the first matching piece in each chapter, scroll to the first chapter that has one
  var q = (new URLSearchParams(location.search).get('q') || '').trim().toLowerCase();
  var firstHit = -1;
  if (q) {
    var words = q.split(/\s+/);
    CHAPTERS.forEach(function (c, ci) {
      var chosen = -1;
      c.pieces.forEach(function (p, pi) {
        var hay = (p.title + ' ' + p.category + ' ' + p.gem + ' ' + p.tags).toLowerCase();
        var hit = words.every(function (w) { return hay.indexOf(w) !== -1; });
        if (hit && chosen === -1) chosen = pi;
      });
      if (chosen !== -1) {
        selected[ci] = chosen;
        if (firstHit === -1) firstHit = ci;
      }
    });
  }

  render();

  if (q) {
    var note = document.getElementById('search-note');
    note.hidden = false;
    if (firstHit === -1) {
      note.innerHTML = '<span>No pieces match “' + esc(q) + '”.</span><a href="showcase.html">Show all</a>';
    } else {
      note.innerHTML = '<span>Showing pieces for “' + esc(q) + '”.</span><a href="showcase.html">Show all</a>';
      var target = document.getElementById('chapter-' + (firstHit + 1));
      if (target) setTimeout(function () { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80);
    }
  }
})();
