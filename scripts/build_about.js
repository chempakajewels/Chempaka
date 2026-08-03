const fs = require('fs');

const indexHtml = fs.readFileSync('c:/tmp/Chempaka/index.html', 'utf8');

// Extract head (everything up to </head>)
const headMatch = indexHtml.match(/(<!DOCTYPE html>[\s\S]*?<\/head>)/i);
const head = headMatch ? headMatch[1] : '';

// Extract header (from <header id="main-header" to </header>)
const headerMatch = indexHtml.match(/(<header id="main-header"[\s\S]*?<\/header>)/i);
const header = headerMatch ? headerMatch[1] : '';

// Extract mobile drawer (from <div id="mobile-drawer" to <main>)
// The mobile drawer is right after the header usually
const drawerMatch = indexHtml.match(/(<div id="mobile-drawer"[\s\S]*?)(?=<main>)/i);
const drawer = drawerMatch ? drawerMatch[1] : '';

// Extract footer (from <footer to </footer>)
const footerMatch = indexHtml.match(/(<footer[\s\S]*?<\/footer>)/i);
const footer = footerMatch ? footerMatch[1] : '';

// Extract the scripts at the bottom
const scriptsMatch = indexHtml.match(/(<script>[\s\S]*?<\/html>)/i) || indexHtml.match(/(<script[\s\S]*?<\/html>)/i);
const scripts = scriptsMatch ? scriptsMatch[1] : '</body></html>';

const aboutBody = `
<body class="bg-[#Fdfcfaf] text-neutral-900 font-sans antialiased overflow-x-hidden selection:bg-neutral-900 selection:text-white" style="background-color: #faf9f6;">
  <!-- MOBILE DRAWER INJECT -->
  ${drawer}
  
  <!-- HEADER INJECT -->
  ${header}

  <main>
    <!-- HERO SECTION -->
    <section class="relative min-h-[100dvh] bg-[#0A0A0A] text-white flex flex-col md:flex-row">
      <div class="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 py-32 md:py-0 relative z-10">
        <div class="max-w-xl">
          <p class="font-sans text-[11px] font-medium tracking-[0.22em] uppercase text-white/60 mb-6">Our Heritage</p>
          <h1 class="font-serif text-5xl md:text-7xl font-normal leading-[1.05] tracking-tight text-white mb-6" style="font-family: 'Playfair Display', serif;">
            The True Value <br />of Gold
          </h1>
          <p class="font-sans text-white/70 text-base leading-relaxed font-light max-w-sm mb-12">
            Discover the artistry, purity, and global legacy of Chempaka's high-karat gold collections.
          </p>
        </div>
      </div>
      <div class="w-full md:w-1/2 min-h-[50vh] md:min-h-[100dvh] relative">
        <div class="absolute inset-0 bg-black/10 z-10 pointer-events-none"></div>
        <img src="assets/images/hero_gold_craft.png" alt="Gold Craftsmanship" class="absolute inset-0 w-full h-full object-cover" />
      </div>
    </section>

    <!-- JOURNAL INDEX (BENTO GRID) -->
    <section class="py-24 md:py-32 px-6 md:px-12 max-w-[1400px] mx-auto">
      <div class="mb-16">
        <h2 class="font-serif text-4xl md:text-5xl font-normal text-black" style="font-family: 'Playfair Display', serif;">The Gold Journal</h2>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Article 1: Large Card -->
        <a href="#karats" class="group block md:col-span-2 relative min-h-[400px] lg:min-h-[500px] rounded-lg overflow-hidden bg-neutral-100">
          <img src="assets/images/blog_gold_karats.png" alt="Gold Karats" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <div class="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
            <span class="font-sans text-[10px] font-semibold tracking-widest uppercase text-white/70 mb-3">Education</span>
            <h3 class="font-serif text-3xl md:text-4xl text-white mb-4" style="font-family: 'Playfair Display', serif;">Understanding Gold Karats: Why 916 and 999 Dominate</h3>
            <p class="font-sans text-white/80 text-sm max-w-md line-clamp-2">A deep dive into the purity, allure, and cultural significance of high-karat gold in luxury jewelry.</p>
          </div>
        </a>

        <!-- Article 2: Tall Card -->
        <a href="#value" class="group block relative min-h-[400px] lg:min-h-[500px] rounded-lg overflow-hidden bg-[#0A0A0A]">
          <img src="assets/images/blog_gold_value.png" alt="True Value of Gold" class="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-80" />
          <div class="absolute inset-0 p-8 md:p-12 flex flex-col justify-between">
            <span class="font-sans text-[10px] font-semibold tracking-widest uppercase text-white/70">Investment</span>
            <div>
              <h3 class="font-serif text-2xl text-white mb-4" style="font-family: 'Playfair Display', serif;">The True Value of Gold Market Prices</h3>
            </div>
          </div>
        </a>

        <!-- Article 3: Standard Card -->
        <a href="#alloys" class="group block relative min-h-[350px] rounded-lg overflow-hidden bg-white border border-neutral-200 hover:border-black transition-colors duration-300 p-8 md:p-10 flex flex-col justify-between">
          <span class="font-sans text-[10px] font-semibold tracking-widest uppercase text-black/50">Style Guide</span>
          <div>
            <h3 class="font-serif text-2xl text-black mb-4" style="font-family: 'Playfair Display', serif;">Yellow, White, or Rose? Gold Alloys Explained</h3>
            <p class="font-sans text-neutral-600 text-sm">Discover how different metals are mixed with pure gold to create stunning colors and durability.</p>
          </div>
        </a>

        <!-- Article 4: Image Card -->
        <a href="#care" class="group block relative min-h-[350px] rounded-lg overflow-hidden bg-neutral-100">
          <img src="assets/images/blog_gold_care.png" alt="Gold Care" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div class="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500"></div>
          <div class="absolute inset-0 p-8 md:p-10 flex flex-col justify-end">
            <span class="font-sans text-[10px] font-semibold tracking-widest uppercase text-white/80 mb-2">Care & Maintenance</span>
            <h3 class="font-serif text-2xl text-white" style="font-family: 'Playfair Display', serif;">Caring for 22K & 24K Gold</h3>
          </div>
        </a>

        <!-- Article 5: Standard Card -->
        <a href="#heritage" class="group block relative min-h-[350px] rounded-lg overflow-hidden bg-[#2C2F44] text-white p-8 md:p-10 flex flex-col justify-between">
          <span class="font-sans text-[10px] font-semibold tracking-widest uppercase text-white/50">Our Story</span>
          <div>
            <h3 class="font-serif text-2xl text-white mb-4" style="font-family: 'Playfair Display', serif;">From Bullion to Boutique: The Chempaka Heritage</h3>
            <p class="font-sans text-white/70 text-sm">Explore the generations of master craftsmanship behind every piece we forge.</p>
          </div>
        </a>
      </div>
    </section>

    <!-- ARTICLES CONTAINER -->
    <div class="bg-white border-t border-neutral-200">
      
      <!-- ARTICLE 1 -->
      <article id="karats" class="py-24 md:py-32 px-6 max-w-4xl mx-auto border-b border-neutral-200">
        <header class="mb-12 md:mb-16 text-center">
          <span class="font-sans text-[11px] font-semibold tracking-[0.2em] uppercase text-neutral-500 block mb-6">Education</span>
          <h2 class="font-serif text-4xl md:text-5xl font-normal text-black mb-6" style="font-family: 'Playfair Display', serif;">Understanding Gold Karats: Why 916 and 999 Dominate Luxury</h2>
        </header>
        <img src="assets/images/blog_gold_karats.png" alt="Gold Karats" class="w-full h-auto rounded-sm mb-12" />
        <div class="prose prose-lg max-w-[65ch] mx-auto text-neutral-700 font-light leading-relaxed">
          <p>When selecting fine jewelry, the term "karat" (K) is the most critical indicator of quality and value. It measures the ratio of pure gold to other metals in an alloy out of 24 parts. Pure gold is 24K, meaning 24 out of 24 parts are gold. While Western markets often favor 14K or 18K for their durability, the Asian luxury market has long recognized 22K (916) and 24K (999) as the absolute pinnacle of fine jewelry.</p>
          <h3 class="font-serif text-2xl text-black mt-10 mb-4" style="font-family: 'Playfair Display', serif;">The Allure of 916 Gold (22K)</h3>
          <p>916 gold contains 91.6% pure gold, mixed with 8.4% alloys like copper or silver to provide structural strength. This karat weight strikes the perfect balance for intricate jewelry making while retaining the deep, mesmerizing yellow hue that lower karats simply cannot replicate. It is the gold standard for wedding jewelry and heirloom pieces across Asia.</p>
          <h3 class="font-serif text-2xl text-black mt-10 mb-4" style="font-family: 'Playfair Display', serif;">The Absolute Purity of 999 Gold (24K)</h3>
          <p>At 99.9% purity, 24K gold is the closest you can get to pure elemental gold. It is exceptionally soft, which means it requires masterful artisanship to mold into wearable jewelry. The color of 999 gold is unmistakable—a rich, luminous, almost warm orange-yellow that commands attention. Because of its softness, 24K pieces are often reserved for special occasions and are highly prized as liquid assets.</p>
          <blockquote class="border-l-2 border-black pl-6 my-10 italic font-serif text-xl text-black">"To wear 24K gold is to wear the earth's rarest element in its most uncompromised form."</blockquote>
          <p>At Chempaka, we specialize in 916 and 999 gold because we believe jewelry should not only be a triumph of design but a formidable store of wealth. When you purchase high-karat gold, you are making an investment that endures generations.</p>
        </div>
      </article>

      <!-- ARTICLE 2 -->
      <article id="value" class="py-24 md:py-32 px-6 max-w-4xl mx-auto border-b border-neutral-200">
        <header class="mb-12 md:mb-16 text-center">
          <span class="font-sans text-[11px] font-semibold tracking-[0.2em] uppercase text-neutral-500 block mb-6">Investment</span>
          <h2 class="font-serif text-4xl md:text-5xl font-normal text-black mb-6" style="font-family: 'Playfair Display', serif;">The True Value of Gold: Market Prices and Your Investment</h2>
        </header>
        <img src="assets/images/blog_gold_value.png" alt="Gold Value" class="w-full h-auto rounded-sm mb-12" />
        <div class="prose prose-lg max-w-[65ch] mx-auto text-neutral-700 font-light leading-relaxed">
          <p>Unlike fashion jewelry or even diamond pieces, which depreciate the moment they leave the showroom, high-karat gold jewelry operates on a completely different economic principle. The value of your 916 or 999 gold piece is intrinsically linked to the global commodities market.</p>
          <h3 class="font-serif text-2xl text-black mt-10 mb-4" style="font-family: 'Playfair Display', serif;">How Gold Pricing Works</h3>
          <p>The retail price of gold jewelry is calculated using a transparent formula: the live international spot price of gold (per gram), multiplied by the weight of the piece, plus a workmanship fee (often called a premium or 'making charge'). Because the spot price fluctuates daily based on global economic conditions, the value of your jewelry is dynamic.</p>
          <p>During times of economic uncertainty, gold prices typically surge. This means that a 50-gram 916 gold necklace purchased a decade ago has likely doubled in intrinsic value today.</p>
          <h3 class="font-serif text-2xl text-black mt-10 mb-4" style="font-family: 'Playfair Display', serif;">Trade-Ins and Liquidity</h3>
          <p>One of the defining features of purchasing high-karat gold from a reputable jeweler like Chempaka is liquidity. Our members enjoy guaranteed trade-in valuations based on real-time market rates. This allows you to upgrade your jewelry over time without losing the foundational investment you made.</p>
          <p>When you buy 916 or 999 gold, you are not merely purchasing an accessory; you are transferring your wealth into a wearable, untethered, and globally recognized currency.</p>
        </div>
      </article>

      <!-- ARTICLE 3 -->
      <article id="alloys" class="py-24 md:py-32 px-6 max-w-4xl mx-auto border-b border-neutral-200">
        <header class="mb-12 md:mb-16 text-center">
          <span class="font-sans text-[11px] font-semibold tracking-[0.2em] uppercase text-neutral-500 block mb-6">Style Guide</span>
          <h2 class="font-serif text-4xl md:text-5xl font-normal text-black mb-6" style="font-family: 'Playfair Display', serif;">Yellow, White, or Rose? A Guide to Gold Alloys</h2>
        </header>
        <img src="assets/images/blog_gold_alloys.png" alt="Gold Alloys" class="w-full h-auto rounded-sm mb-12" />
        <div class="prose prose-lg max-w-[65ch] mx-auto text-neutral-700 font-light leading-relaxed">
          <p>While pure 24K gold is strictly yellow, the introduction of alloying metals allows goldsmiths to manipulate both the strength and the color of the final piece. The three primary colors of gold—yellow, white, and rose—each offer a distinct aesthetic and pair differently with various skin undertones.</p>
          <h3 class="font-serif text-2xl text-black mt-10 mb-4" style="font-family: 'Playfair Display', serif;">Yellow Gold: The Classic Standard</h3>
          <p>Yellow gold is alloyed with a mix of copper and silver to maintain its natural, warm hue while adding necessary strength. It is the most hypoallergenic of all the colors and pairs exceptionally well with warm or olive skin tones. For traditionalists, nothing compares to the rich glow of 22K yellow gold.</p>
          <h3 class="font-serif text-2xl text-black mt-10 mb-4" style="font-family: 'Playfair Display', serif;">White Gold: Modern Brilliance</h3>
          <p>To achieve a silvery-white finish, pure gold is alloyed with white metals such as nickel, palladium, or zinc. It is then often plated with rhodium to give it a mirror-like, bright white finish. White gold is highly durable and is the preferred choice for diamond settings, as it reflects the stone's brilliance rather than casting a yellow tint. It looks stunning on cooler skin tones.</p>
          <h3 class="font-serif text-2xl text-black mt-10 mb-4" style="font-family: 'Playfair Display', serif;">Rose Gold: The Romantic Alternative</h3>
          <p>Rose gold gains its beautiful pinkish hue through a higher concentration of copper in the alloy mix. The more copper used, the redder the gold appears. Rose gold is renowned for being universally flattering, complementing both warm and cool skin tones beautifully. It also happens to be the most durable of the three colors due to the strength of copper.</p>
        </div>
      </article>

      <!-- ARTICLE 4 -->
      <article id="care" class="py-24 md:py-32 px-6 max-w-4xl mx-auto border-b border-neutral-200">
        <header class="mb-12 md:mb-16 text-center">
          <span class="font-sans text-[11px] font-semibold tracking-[0.2em] uppercase text-neutral-500 block mb-6">Care & Maintenance</span>
          <h2 class="font-serif text-4xl md:text-5xl font-normal text-black mb-6" style="font-family: 'Playfair Display', serif;">Caring for 22K & 24K Gold: Maintaining the Luster</h2>
        </header>
        <img src="assets/images/blog_gold_care.png" alt="Gold Care" class="w-full h-auto rounded-sm mb-12" />
        <div class="prose prose-lg max-w-[65ch] mx-auto text-neutral-700 font-light leading-relaxed">
          <p>High-karat gold (916 and 999) requires a different approach to care than standard 14K or 18K jewelry. Because it contains less alloy, it is softer and more susceptible to bending, scratching, and dulling from everyday wear.</p>
          <h3 class="font-serif text-2xl text-black mt-10 mb-4" style="font-family: 'Playfair Display', serif;">Daily Wear Precautions</h3>
          <p>While 22K gold can be worn daily with mindfulness, 24K gold pieces should be reserved for special occasions. Always remove high-karat rings and bracelets when engaging in heavy lifting, gym workouts, or tasks that involve abrasive surfaces. Pure gold will easily scratch against harder metals like steel.</p>
          <h3 class="font-serif text-2xl text-black mt-10 mb-4" style="font-family: 'Playfair Display', serif;">Cleaning High-Karat Gold</h3>
          <p>Avoid harsh chemical cleaners or ultrasonic machines for your pure gold. The safest and most effective method is a simple bath in warm water mixed with a few drops of mild dish soap. Let the pieces soak for 15 minutes, then gently brush them with a baby-soft toothbrush. Rinse under warm water and pat dry with a lint-free microfiber cloth.</p>
          <p>Chempaka members enjoy lifetime complimentary ultrasonic cleaning and inspection. Bring your pieces into any boutique annually to ensure clasps remain tight and the gold's original luster is professionally restored.</p>
        </div>
      </article>

      <!-- ARTICLE 5 -->
      <article id="heritage" class="py-24 md:py-32 px-6 max-w-4xl mx-auto">
        <header class="mb-12 md:mb-16 text-center">
          <span class="font-sans text-[11px] font-semibold tracking-[0.2em] uppercase text-neutral-500 block mb-6">Our Story</span>
          <h2 class="font-serif text-4xl md:text-5xl font-normal text-black mb-6" style="font-family: 'Playfair Display', serif;">From Bullion to Boutique: The Chempaka Heritage</h2>
        </header>
        <img src="assets/images/blog_gold_heritage.png" alt="Chempaka Heritage" class="w-full h-auto rounded-sm mb-12" />
        <div class="prose prose-lg max-w-[65ch] mx-auto text-neutral-700 font-light leading-relaxed">
          <p>Chempaka was born from a singular vision: to bridge the gap between traditional Asian goldsmithing and modern, minimalist luxury. For decades, high-karat gold jewelry was seen purely as a financial safeguard—heavy, traditional pieces stored in safes and worn only on wedding days.</p>
          <p>We believed that 916 and 999 gold deserved to be celebrated in contemporary design. Our master artisans, many of whom come from a long lineage of traditional goldsmiths, were challenged to apply their ancestral techniques to sleek, modern silhouettes.</p>
          <h3 class="font-serif text-2xl text-black mt-10 mb-4" style="font-family: 'Playfair Display', serif;">The Artisan Process</h3>
          <p>Every piece of Chempaka gold begins as raw bullion. We control the alloying process entirely in-house to ensure our 916 gold maintains a signature, radiant warmth that is unique to our brand. Our pieces are hand-finished, ensuring that the microscopic texture of the gold reflects light with a soft, elegant glow rather than a harsh, machine-made shine.</p>
          <p>Today, Chempaka stands as a testament to the enduring power of gold. We create heirlooms that are uncompromised in their purity, timeless in their design, and formidable in their value. We invite you to experience the inner glow of Chempaka gold at our boutiques.</p>
        </div>
      </article>
      
    </div>
  </main>

  <!-- FOOTER INJECT -->
  ${footer}

  <!-- SCRIPTS INJECT -->
  ${scripts}
`;

const finalHtml = head + '\n' + aboutBody;
fs.writeFileSync('c:/tmp/Chempaka/about.html', finalHtml, 'utf8');
console.log('Successfully built about.html');
