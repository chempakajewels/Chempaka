const fs = require('fs');
let content = fs.readFileSync('c:/tmp/Chempaka/index.html', 'utf8');

// 1. Remove padding from body
content = content.replace(
  /<body class="bg-background text-on-background font-body-md antialiased overflow-x-hidden.*">/,
  '<body class="bg-background text-on-background font-body-md antialiased overflow-x-hidden">'
);

// 2. Change header default classes to transparent
content = content.replace(
  '<header id="main-header"\n    class="fixed top-0 w-full z-50 transition-all duration-500 bg-white text-black border-b border-neutral-200">',
  '<header id="main-header"\n    class="fixed top-0 w-full z-50 transition-all duration-500 bg-transparent text-white border-b border-transparent">'
);

// 3. Change all text-black to text-white in the header block (from <header to </header>)
const navStart = content.indexOf('<header id="main-header"');
const navEnd = content.indexOf('</header>') + 9;
let navHtml = content.substring(navStart, navEnd);

// Replace hardcoded black text with white in the navbar initially
navHtml = navHtml.replace(/text-black/g, 'text-white transition-colors duration-300');
navHtml = navHtml.replace(/border-neutral-200/g, 'border-white/20 transition-colors duration-300');
navHtml = navHtml.replace(/border-neutral-100/g, 'border-white/10 transition-colors duration-300');

// Put the navbar back
content = content.substring(0, navStart) + navHtml + content.substring(navEnd);

// 4. Update the CSS block for the header to add hover/scroll states
// We need to inject styles for .scrolled and :hover to force background white and text black.
const cssToInject = `
    /* --- Header Transparent to Solid State --- */
    header#main-header:hover, header#main-header.scrolled {
      background-color: rgba(255, 255, 255, 0.98) !important;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1) !important;
      backdrop-filter: blur(12px);
    }
    header#main-header:hover *, header#main-header.scrolled * {
      color: #000000 !important;
      border-color: rgba(0,0,0,0.1) !important;
    }
    header#main-header:hover .inline-nav-divider, header#main-header.scrolled .inline-nav-divider {
      background-color: #e5e5e5 !important;
    }
`;

// Insert the new CSS before </style>
content = content.replace('</style>', cssToInject + '\n  </style>');

// 5. Remove the old membership style override if it exists
content = content.replace(/\/\* Force header to be white background with black text on boutiques\/membership pages \*\/[\s\S]*?header \.header-icon:hover \{\s*opacity: 0\.65;\s*\}/, '');

fs.writeFileSync('c:/tmp/Chempaka/index.html', content);
console.log('SUCCESS: Fixed header transparency');
