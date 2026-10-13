// The gold price as a picture, to post on Instagram or TikTok (admin > Gold price post).
//
//   ChempakaGoldCard.FORMATS                  the sizes offered: Instagram 4:5, Instagram square, TikTok 9:16
//   ChempakaGoldCard.render(canvas, key, data)  draws the picture into a canvas; data = { price: 566, label: '13 Oct 2026' }
//   ChempakaGoldCard.toBlob(canvas)           the PNG, as a Blob
//
// Everything is drawn in the browser from the site's own photo, emblem and fonts, so nothing is uploaded and the
// picture always matches the price on the site. TikTok and Stories cover the top and bottom of the screen with their
// own buttons and captions, so the 9:16 size keeps its text inside a safe area.
(function () {
  'use strict';

  var BG = 'assets/images/gold-card-bg.jpg';
  var EMBLEM = 'assets/images/brand/logo-mark-white.png';
  var SITE = 'chempakajewel.com';
  var WHATSAPP = '+60 13-661 2379';
  var SHOP = 'Eco Twin Step Sdn Bhd';

  // w, h: pixels. focusY: which part of the photo the crop is centred on (0 top, 1 bottom).
  // top, bottom: space kept clear for the apps' own buttons. scale: type size relative to the width.
  var FORMATS = {
    instagram: { label: 'Instagram post', ratio: '4:5', w: 1080, h: 1350, focusY: 0.5, top: 84, bottom: 84, scale: 1, note: 'Instagram feed post' },
    square: { label: 'Instagram square', ratio: '1:1', w: 1080, h: 1080, focusY: 0.56, top: 64, bottom: 64, scale: 0.86, note: 'Instagram feed post, square' },
    tiktok: { label: 'TikTok', ratio: '9:16', w: 1080, h: 1920, focusY: 0.5, top: 250, bottom: 400, scale: 1, note: 'TikTok, Instagram Reels and Stories' }
  };

  var images = {};
  function load(src) {
    if (!images[src]) {
      images[src] = new Promise(function (resolve, reject) {
        var img = new Image();
        img.onload = function () { resolve(img); };
        img.onerror = function () { delete images[src]; reject(new Error('Could not load ' + src)); };
        img.src = src;
      });
    }
    return images[src];
  }

  // the canvas can only use a font once the browser has it
  function fonts() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.all([
      document.fonts.load('400 120px "Bodoni Moda"'),
      document.fonts.load('400 40px Cinzel'),
      document.fonts.load('400 40px Jost'),
      document.fonts.load('500 40px Jost')
    ]).catch(function () {});
  }

  // centred text with letter spacing, which every browser's canvas supports when drawn letter by letter
  function spaced(ctx, text, cx, y, spacing) {
    var chars = String(text).split('');
    var widths = chars.map(function (c) { return ctx.measureText(c).width; });
    var total = widths.reduce(function (a, b) { return a + b; }, 0) + spacing * (chars.length - 1);
    var x = cx - total / 2;
    ctx.textAlign = 'left';
    chars.forEach(function (c, i) { ctx.fillText(c, x, y); x += widths[i] + spacing; });
    return total;
  }

  function number(price) {
    var n = Number(price);
    var whole = Math.abs(n - Math.round(n)) < 0.005;
    return n.toLocaleString('en-MY', { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: whole ? 0 : 2 });
  }

  function draw(ctx, f, bg, emblem, data) {
    var W = f.w, H = f.h, k = f.scale;
    var cx = W / 2;
    var margin = W * 0.09;

    // the photo, cropped to the shape
    var s = Math.max(W / bg.width, H / bg.height);
    var sw = W / s, sh = H / s;
    var sx = (bg.width - sw) / 2;
    var sy = Math.max(0, Math.min(bg.height - sh, f.focusY * bg.height - sh / 2));
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bg, sx, sy, sw, sh, 0, 0, W, H);

    // blue veils so the white type stays readable: overall, top, bottom and a soft pool behind the price
    ctx.fillStyle = 'rgba(6, 22, 66, 0.2)';
    ctx.fillRect(0, 0, W, H);
    var top = ctx.createLinearGradient(0, 0, 0, H * 0.34);
    top.addColorStop(0, 'rgba(6, 24, 72, 0.72)');
    top.addColorStop(1, 'rgba(6, 24, 72, 0)');
    ctx.fillStyle = top;
    ctx.fillRect(0, 0, W, H * 0.34);
    var bottom = ctx.createLinearGradient(0, H * 0.66, 0, H);
    bottom.addColorStop(0, 'rgba(5, 18, 56, 0)');
    bottom.addColorStop(1, 'rgba(5, 18, 56, 0.86)');
    ctx.fillStyle = bottom;
    ctx.fillRect(0, H * 0.66, W, H * 0.34);

    // ---- measurements ----
    var emblemW = W * 0.085 * k, emblemH = emblemW * emblem.height / emblem.width;
    var wordSize = W * 0.04 * k;
    var headerH = emblemH + wordSize * 0.9 + 18 * k;
    var headerY = f.top;                         // top of the emblem

    var eyebrowSize = W * 0.03 * k;
    var priceSize = W * 0.27 * k;
    var subSize = W * 0.038 * k;
    var dateSize = W * 0.03 * k;
    var gap = W * 0.032 * k;
    var blockH = eyebrowSize + gap * 1.5 + priceSize * 0.74 + gap * 1.3 + subSize + gap * 1.2 + 2 + gap + dateSize;

    var footSize = W * 0.03 * k;
    var noteSize = W * 0.024 * k;
    var footH = footSize * 2.6 + noteSize + 20 * k;
    var footTop = H - f.bottom - footH;

    var freeTop = headerY + headerH, freeBottom = footTop;
    var blockTop = freeTop + (freeBottom - freeTop - blockH) * 0.5;

    // a soft dark pool behind the price block, where the necklace would otherwise run through the type
    var poolY = blockTop + blockH * 0.5;
    var pool = ctx.createRadialGradient(cx, poolY, 0, cx, poolY, W * 0.7);
    pool.addColorStop(0, 'rgba(6, 24, 76, 0.5)');
    pool.addColorStop(0.55, 'rgba(6, 24, 76, 0.26)');
    pool.addColorStop(1, 'rgba(6, 24, 76, 0)');
    ctx.fillStyle = pool;
    ctx.fillRect(0, 0, W, H);

    // and one behind the footer, which on the tall size sits above the apps' buttons rather than at the very edge
    var foot = ctx.createLinearGradient(0, footTop - H * 0.07, 0, footTop + footH + 30);
    foot.addColorStop(0, 'rgba(5, 18, 56, 0)');
    foot.addColorStop(1, 'rgba(5, 18, 56, 0.6)');
    ctx.fillStyle = foot;
    ctx.fillRect(0, footTop - H * 0.07, W, H);

    // ---- header: emblem and wordmark ----
    ctx.shadowColor = 'rgba(2, 12, 46, 0.35)';
    ctx.shadowBlur = 16;
    ctx.drawImage(emblem, cx - emblemW / 2, headerY, emblemW, emblemH);
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'alphabetic';
    ctx.font = '400 ' + wordSize + 'px Cinzel, "Bodoni Moda", serif';
    spaced(ctx, 'CHEMPAKA', cx, headerY + emblemH + 18 * k + wordSize * 0.72, wordSize * 0.28);

    // ---- the price ----
    var y = blockTop + eyebrowSize;
    ctx.font = '500 ' + eyebrowSize + 'px Jost, Futura, sans-serif';
    ctx.fillStyle = '#c9d9ff';
    spaced(ctx, 'TODAY’S GOLD RATE', cx, y, eyebrowSize * 0.34);

    var num = number(data.price);
    var maxW = W - margin * 2;
    var size = priceSize;
    var rmFont = function (sz) { return '500 ' + sz * 0.3 + 'px Jost, Futura, sans-serif'; };
    var numFont = function (sz) { return '400 ' + sz + 'px Cinzel, "Bodoni Moda", Georgia, serif'; };
    var measure = function (sz) {
      ctx.font = rmFont(sz); var rmW = ctx.measureText('RM').width;
      ctx.font = numFont(sz); var nW = ctx.measureText(num).width;
      return { rmW: rmW, nW: nW, total: rmW + sz * 0.1 + nW };
    };
    var m = measure(size);
    if (m.total > maxW) { size = size * maxW / m.total; m = measure(size); }
    var baseline = y + gap * 1.5 + size * 0.74;
    var left = cx - m.total / 2;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(2, 12, 46, 0.45)';
    ctx.shadowBlur = 30;
    ctx.textAlign = 'left';
    ctx.font = rmFont(size);
    ctx.fillText('RM', left, baseline - size * 0.5);
    ctx.font = numFont(size);
    ctx.fillText(num, left + m.rmW + size * 0.1, baseline);

    ctx.shadowBlur = 14;
    y = baseline + gap * 1.3 + subSize * 0.8;
    ctx.font = '400 ' + subSize + 'px Jost, Futura, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('per gram  ·  916 gold (22K)', cx, y);

    y += gap * 1.2;
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(201, 217, 255, 0.85)';
    ctx.fillRect(cx - W * 0.06, y, W * 0.12, 2);

    y += gap + dateSize * 0.8;
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffffff';
    ctx.font = '400 ' + dateSize + 'px Jost, Futura, sans-serif';
    spaced(ctx, String(data.label || '').toUpperCase(), cx, y, dateSize * 0.22);

    // ---- footer ----
    ctx.shadowBlur = 12;
    y = footTop + footSize;
    ctx.fillStyle = '#ffffff';
    ctx.font = '500 ' + footSize + 'px Jost, Futura, sans-serif';
    spaced(ctx, SHOP.toUpperCase(), cx, y, footSize * 0.2);
    y += footSize * 1.5;
    ctx.font = '400 ' + footSize + 'px Jost, Futura, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WhatsApp ' + WHATSAPP + '  ·  ' + SITE, cx, y);
    y += noteSize * 2.1;
    ctx.fillStyle = 'rgba(214, 226, 255, 0.82)';
    ctx.font = '300 ' + noteSize + 'px Jost, Futura, sans-serif';
    ctx.fillText('Chempaka Jewels rate. The boutique confirms the final price.', cx, y);
    ctx.shadowBlur = 0;
  }

  function render(canvas, key, data) {
    var f = FORMATS[key];
    if (!f) return Promise.reject(new Error('Unknown size: ' + key));
    return Promise.all([load(BG), load(EMBLEM), fonts()]).then(function (r) {
      canvas.width = f.w;
      canvas.height = f.h;
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, f.w, f.h);
      draw(ctx, f, r[0], r[1], data);
      return canvas;
    });
  }

  function toBlob(canvas) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (b) { if (b) resolve(b); else reject(new Error('Could not make the picture')); }, 'image/png');
    });
  }

  window.ChempakaGoldCard = { FORMATS: FORMATS, render: render, toBlob: toBlob };
})();
