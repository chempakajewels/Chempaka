const fs = require('fs');
let html = fs.readFileSync('c:/tmp/Chempaka/index.html', 'utf8');

// 1. Update Hero CSS
const oldHeroCss = `
    #hero-bg-div img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 20%;
      opacity: 0.72;
      transition: opacity 1.2s ease;
    }

    /* Deep gradient scrim: stronger on left for text legibility */
    #hero-scrim {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        105deg,
        rgba(0,0,0,0.72) 0%,
        rgba(0,0,0,0.42) 45%,
        rgba(0,0,0,0.08) 100%
      );
      z-index: 1;
    }

    /* Bottom scrim for footer fade */
    #hero-bottom-scrim {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 220px;
      background: linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 100%);
      z-index: 1;
    }

    #hero-content-box {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      top: 0;
      z-index: 10;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 0 6vw 7vh;
    }

    @media (min-width: 1024px) {
      #hero-content-box {
        justify-content: center;
        padding: 140px 8vw 0 8vw;
        max-width: 68vw;
      }
    }

    .hero-eyebrow {
      font-family: 'Inter', 'Noto Sans', sans-serif;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.65);
      margin-bottom: 20px;
    }

    .hero-headline {
      font-family: 'Cinzel', serif;
      font-size: clamp(2.8rem, 7vw, 6rem);
      font-weight: 400;
      line-height: 1.02;
      letter-spacing: -0.01em;
      color: #ffffff;
      margin: 0;
    }
`;

const newHeroCss = `
    #hero-bg-div img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 20%;
      opacity: 0.85;
      transition: opacity 1.2s ease;
    }

    /* Subtle uniform scrim */
    #hero-scrim {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.15);
      z-index: 1;
    }

    /* Bottom scrim for footer fade */
    #hero-bottom-scrim {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 220px;
      background: linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 100%);
      z-index: 1;
    }

    #hero-content-box {
      position: absolute;
      left: 5vw;
      bottom: 8vh;
      z-index: 10;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 40px;
      max-width: 90vw;
      background: rgba(10, 12, 12, 0.45);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-right-color: rgba(255, 255, 255, 0.05);
      border-bottom-color: rgba(255, 255, 255, 0.05);
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.15);
    }

    @media (min-width: 768px) {
      #hero-content-box {
        left: auto;
        right: 8vw;
        bottom: 12vh;
        max-width: 520px;
        padding: 56px;
      }
    }

    .hero-eyebrow {
      font-family: 'Inter', 'Noto Sans', sans-serif;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.85);
      margin-bottom: 20px;
    }

    .hero-headline {
      font-family: 'Cinzel', serif;
      font-size: clamp(2.4rem, 5vw, 4.5rem);
      font-weight: 400;
      line-height: 1.1;
      letter-spacing: -0.01em;
      color: #ffffff;
      margin: 0;
    }
`;

html = html.replace(oldHeroCss.trim(), newHeroCss.trim());

// 2. Add Bento and Takeover CSS before </style>
const additionalCss = `
    /* Editorial Bento */
    .bento-grid {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 16px;
    }
    @media (min-width: 768px) {
      .bento-grid {
        grid-template-columns: repeat(12, 1fr);
        grid-auto-rows: 240px;
        gap: 24px;
      }
    }
    .bento-item {
      position: relative;
      overflow: hidden;
      background: #f7f7f7;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .bento-item img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .bento-item:hover img {
      transform: scale(1.04);
    }
    .bento-text {
      position: relative;
      z-index: 10;
      padding: 32px;
    }

    /* Immersive Takeover */
    .takeover-section {
      position: relative;
      width: 100%;
      min-height: 90vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: #000;
    }
    .takeover-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.6;
      transition: opacity 0.5s ease;
    }
    .takeover-content {
      position: relative;
      z-index: 10;
      text-align: center;
      color: #fff;
      max-width: 800px;
      padding: 40px;
    }
`;

if(!html.includes('/* Editorial Bento */')) {
    html = html.replace('</style>', additionalCss + '\n  </style>');
}

// 3. Replace <main> entirely
const startMain = html.indexOf('<main>');
const endMain = html.indexOf('<!-- Footer -->');

const newMain = `
  <main>
    <!-- Hero Section Editorial Dark -->
    <section id="hero-banner" data-theme="dark">
      <div id="hero-bg-div">
        <img src="hero_model_jewelry.jpg" alt="Chempaka fine jewellery" />
      </div>
      <div id="hero-scrim"></div>
      <div id="hero-bottom-scrim"></div>

      <div id="hero-content-box">
        <p class="hero-eyebrow fade-in-up delay-1">Masters of Gold - Est. 1995</p>
        <h1 class="hero-headline fade-in-up delay-2">
          Where Gold<br>Makes Memories
        </h1>
        <p class="hero-sub fade-in-up delay-3">
          Discover hand-finished 18K gold jewellery, crafted for life's rarest moments.
        </p>
        <div class="hero-cta-group fade-in-up delay-4">
          <a href="membership.html" class="hero-cta-primary">Join the Club</a>
          <a href="#editorial-bento" class="hero-cta-secondary">
            Explore Collection
            <span class="material-symbols-outlined" style="font-size:14px; font-variation-settings:'wght' 300;">arrow_forward</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Intro Text -->
    <section class="bg-white py-24 lg:py-32 px-8 max-w-4xl mx-auto text-center">
      <h2 class="font-serif text-3xl md:text-5xl text-black font-normal mb-8 leading-tight">Since 1995, Chempaka's mastery of gold craftsmanship has defined our heritage.</h2>
      <p class="font-sans text-neutral-500 font-light text-sm md:text-base leading-relaxed tracking-wide">
        Discover classic categories reimagined with modern light.
      </p>
    </section>

    <!-- The Editorial Bento -->
    <section id="editorial-bento" class="bg-white px-4 md:px-8 pb-24 lg:pb-32 max-w-screen-2xl mx-auto">
      <div class="mb-16">
        <h2 class="font-serif text-4xl md:text-6xl text-black font-normal">The Collection</h2>
      </div>
      
      <div class="bento-grid">
        <!-- Rings -->
        <a href="boutiques.html" class="bento-item md:col-span-8 md:row-span-2 group min-h-[400px] md:min-h-0">
          <img src="product_images/WhatsApp_Image_2026-05-24_at_5.34.43_202606252242.jpeg" alt="Rings" class="object-center" />
          <div class="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
          <div class="bento-text flex flex-col justify-end h-full">
            <span class="text-[10px] font-bold tracking-[0.2em] uppercase text-white mb-2">Signature</span>
            <h3 class="font-serif text-4xl text-white font-normal">Solitaire Rings</h3>
          </div>
        </a>

        <!-- Bracelets -->
        <a href="boutiques.html" class="bento-item md:col-span-4 md:row-span-3 group min-h-[400px] md:min-h-0">
          <img src="product_images/WhatsApp_Image_2026-05-24_at_5.34.47_202606252242.jpeg" alt="Bracelets" />
          <div class="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
          <div class="bento-text flex flex-col justify-between h-full">
            <div class="bg-black text-white self-start px-3 py-1 text-[9px] uppercase tracking-widest font-bold">New In</div>
            <div>
              <span class="text-[10px] font-bold tracking-[0.2em] uppercase text-white mb-2 block">Heritage</span>
              <h3 class="font-serif text-4xl text-white font-normal">Bracelets</h3>
            </div>
          </div>
        </a>

        <!-- Text Block -->
        <div class="bento-item md:col-span-4 md:row-span-1 bg-[#1a1c1c] text-white p-8 flex flex-col justify-center min-h-[240px]">
          <h3 class="font-serif text-2xl font-normal mb-4">Shine On</h3>
          <p class="font-sans text-xs font-light text-white/70 leading-relaxed">
            Multi-colored, vibrant crystals set in rhodium-plated structures.
          </p>
          <a href="boutiques.html" class="mt-6 text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2 hover:text-white/60 transition-colors">
            View Pieces <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
          </a>
        </div>

        <!-- Necklaces -->
        <a href="boutiques.html" class="bento-item md:col-span-4 md:row-span-2 group min-h-[400px] md:min-h-0">
          <img src="product_images/WhatsApp_Image_2026-05-24_at_5.34.46_202606252242_2.jpeg" alt="Necklaces" class="object-left-top" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          <div class="bento-text flex flex-col justify-end h-full">
            <h3 class="font-serif text-3xl text-white font-normal">Pendants & Necklaces</h3>
          </div>
        </a>

        <!-- Earrings -->
        <a href="boutiques.html" class="bento-item md:col-span-4 md:row-span-1 group min-h-[240px] md:min-h-0">
          <img src="product_images/WhatsApp_Image_2026-05-24_at_5.34.45_202606252242_2.jpeg" alt="Earrings" class="object-top" />
          <div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
          <div class="bento-text flex flex-col justify-center items-center h-full text-center">
            <h3 class="font-serif text-3xl text-white font-normal">Earrings</h3>
          </div>
        </a>
      </div>
    </section>

    <!-- The Immersive Takeover: Winnie the Pooh -->
    <section class="takeover-section">
      <img src="winnie_the_pooh_crystal.jpg" alt="Disney Winnie the Pooh" class="takeover-img" />
      <div class="takeover-content">
        <span class="text-[10px] tracking-[0.3em] uppercase font-bold text-white/80 block mb-6">Disney x Chempaka</span>
        <h2 class="font-serif text-5xl md:text-7xl font-normal mb-8 leading-tight">Winnie the Pooh</h2>
        <p class="font-sans text-sm md:text-base font-light text-white/90 leading-relaxed mb-10 max-w-xl mx-auto">
          Celebrating 100 years of wonder. Discover Pooh, Piglet, and Eeyore reimagined in brilliant crystal form.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-6">
          <a href="#" class="border border-white text-white px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors">
            Explore Gifts
          </a>
          <a href="#" class="border border-white text-white px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors">
            Shop Figurines
          </a>
        </div>
      </div>
    </section>

    <!-- The Immersive Takeover: Selah's Edit -->
    <section class="takeover-section">
      <img src="ruby_necklace.jpg" alt="Selah Ruby Campaign" class="takeover-img" />
      <div class="takeover-content">
        <span class="text-[10px] tracking-[0.3em] uppercase font-bold text-white/80 block mb-6">Selah's Edit</span>
        <h2 class="font-serif text-5xl md:text-7xl font-normal mb-8 leading-tight">Shining Brighter<br>with Rubies</h2>
        <p class="font-sans text-sm md:text-base font-light text-white/90 leading-relaxed mb-10 max-w-xl mx-auto">
          Selah's curated selection of vibrant rubies and hand-finished 18K gold. Designed to catch the light from every angle.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-6">
          <a href="boutiques.html" class="bg-white text-black px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-200 transition-colors">
            Book Boutique Consultation
          </a>
        </div>
      </div>
    </section>

    <!-- Section 9: Chempaka Services -->
    <section class="bg-[#fcfcfc] py-24 px-8 border-t border-neutral-100">
      <div class="max-w-screen-xl mx-auto">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          <div class="flex flex-col items-center text-center space-y-5">
            <span class="material-symbols-outlined text-[32px] font-light text-black">chat</span>
            <h3 class="font-serif text-xl text-black font-normal">Live Chat</h3>
            <p class="font-sans text-xs text-neutral-500 font-light leading-relaxed">Connect online with expert styling advisors.</p>
          </div>
          <div class="flex flex-col items-center text-center space-y-5">
            <span class="material-symbols-outlined text-[32px] font-light text-black">calendar_month</span>
            <h3 class="font-serif text-xl text-black font-normal">Appointments</h3>
            <p class="font-sans text-xs text-neutral-500 font-light leading-relaxed">Schedule an in-store private consultation.</p>
          </div>
          <div class="flex flex-col items-center text-center space-y-5">
            <span class="material-symbols-outlined text-[32px] font-light text-black">help</span>
            <h3 class="font-serif text-xl text-black font-normal">FAQ</h3>
            <p class="font-sans text-xs text-neutral-500 font-light leading-relaxed">Find instant answers about shipping and returns.</p>
          </div>
          <div class="flex flex-col items-center text-center space-y-5">
            <span class="material-symbols-outlined text-[32px] font-light text-black">card_giftcard</span>
            <h3 class="font-serif text-xl text-black font-normal">Gift Services</h3>
            <p class="font-sans text-xs text-neutral-500 font-light leading-relaxed">Signature greeting cards and ribbon wrapping.</p>
          </div>
        </div>
      </div>
    </section>

  </main>
`;

html = html.substring(0, startMain) + newMain + html.substring(endMain);

fs.writeFileSync('c:/tmp/Chempaka/index.html', html);
console.log('Successfully updated index.html redesign');
