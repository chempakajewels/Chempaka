---
name: Athereal
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f4'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#4f453e'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#81746d'
  outline-variant: '#d3c3bb'
  surface-tint: '#765845'
  primary: '#a48e7e'
  on-primary: '#ffffff'
  primary-container: '#a48e7e'
  on-primary-container: '#fff4ef'
  inverse-primary: '#e6bfa7'
  secondary: '#2b3e56'
  on-secondary: '#ffffff'
  secondary-container: '#fbd9c0'
  on-secondary-container: '#775e4a'
  tertiary: '#5f574e'
  on-tertiary: '#ffffff'
  tertiary-container: '#786f65'
  on-tertiary-container: '#fff4ea'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcc7'
  primary-fixed-dim: '#e6bfa7'
  on-primary-fixed: '#2b1608'
  on-primary-fixed-variant: '#5c412f'
  secondary-fixed: '#fedcc3'
  secondary-fixed-dim: '#e1c0a8'
  on-secondary-fixed: '#291808'
  on-secondary-fixed-variant: '#594230'
  tertiary-fixed: '#ece1d5'
  tertiary-fixed-dim: '#d0c5b9'
  on-tertiary-fixed: '#201b14'
  on-tertiary-fixed-variant: '#4d463d'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '400'
    lineHeight: 72px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '400'
    lineHeight: 48px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '400'
    lineHeight: 48px
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
  section-gap: 120px
---

## Brand & Style
The design system is engineered for the high-end jewelry market, blending the timeless authority of heritage luxury houses with the fresh, accessible elegance of modern direct-to-consumer brands. The visual narrative centers on "The Inner Glow"—a feeling of warmth, refinement, and personal luxury.

The aesthetic follows an **Editorial Minimalism** approach. It utilizes expansive white space, precise grid alignments found in high-fashion magazines, and subtle **Glassmorphism** to create a sense of depth and preciousness. The UI is designed to feel like a boutique gallery where the product is the absolute protagonist. The emotional response is one of quiet confidence, sophistication, and invitation.

## Colors
This design system utilizes a strictly restricted 3-color palette to convey luxury, heritage, and modern sophistication: 

- **Blue (#2B3E56):** A soft, muted slate-navy blue, representing prestige, quiet luxury, and modern elegance.
- **Warm Taupe (#A48E7E):** A soft, dusty warm metallic taupe, representing premium craftsmanship, organic warmth, and heritage gold.
- **Black (#000000):** For structured layouts, text, select primary buttons, and absolute contrast.
- **Neutral Backgrounds:** White (#FFFFFF) is utilized for minimal editorial spaces. Any other colors (e.g. red, green) are strictly forbidden to ensure brand unity.

Functional colors (Success, Error) should be used sparingly and desaturated to maintain the premium palette's harmony.

## Typography
The typography strategy relies on a high-contrast pairing between the expressive, high-stroke-contrast **Playfair Display** and the utilitarian precision of **Inter**.

- **Headlines:** Use Playfair Display for all emotional and structural headers. Ensure "Optical Size" settings are utilized for display sizes to preserve thin serifs.
- **Body Text:** Use Inter for all functional information. Set body text in the Primary color rather than pure black to maintain the warmth of the brand.
- **Labels:** Product categories, price tags, and small navigation items should use Inter in uppercase with generous letter spacing (10%) to mimic luxury watch-face engravings.
- **Wordmark:** The "CHEMPAKA" logotype (header, footer, mobile drawer) uses Cinzel exclusively as a bespoke logo treatment. Cinzel must not be used for headlines, body copy, or any other content — those stay on Playfair Display + Inter.

## Layout & Spacing
The layout uses a **Fixed Grid** approach for desktop to maintain editorial control over whitespace, and a **Fluid Grid** for mobile.

- **Desktop:** 12-column grid with a 1280px max-width. Margins are intentionally wide (64px) to frame the content like a page in a book.
- **Sectioning:** Vertical rhythm is driven by generous section gaps (120px) to allow the "eye to breathe" between product collections.
- **Mobile:** 4-column grid with 20px margins. Content should stack logically, prioritizing large imagery over dense text blocks.

## Elevation & Depth
Depth is created through a mix of **Tonal Layering** and **Glassmorphism**.

- **Surfaces:** The base layer is white or Tertiary (#F5E9DD). Secondary surfaces (cards) use white with a very soft, diffused ambient shadow (15% opacity Primary color, 30px blur).
- **Glass Effects:** Navigation bars and promotional overlays use a 20px backdrop blur with a 60% translucent white fill and a 1px white border at 20% opacity.
- **Interactions:** Hovering over a product card should not raise the shadow dramatically; instead, a subtle "grow" scale (1.02x) and a transition to a slightly more opaque background color are preferred.

## Shapes
The shape language is "Rounded" to reflect the organic curves of jewelry and the human form.

- **Standard Elements:** Buttons and input fields use a 0.5rem (8px) radius.
- **Containers:** Product cards and image containers use 1rem (16px) for a softer, more modern boutique feel.
- **Iconography:** Use light-weight (2pt) icons with rounded caps and joins to match the typography's refinement.

## Components
- **Buttons:** Primary buttons are solid Primary (#8A6A56) with white text. Secondary buttons are Ghost-style with a 1px border of the Secondary color. All buttons should have a minimum horizontal padding of 32px for an airy feel.
- **Input Fields:** Use a floating label pattern. The bottom border is a 1px solid Primary color; no full-box border unless focused. Background is a soft Tertiary tint.
- **Cards:** Product cards are borderless with a subtle Tertiary background and 16px corner radius. Images within cards must have a consistent aspect ratio (usually 4:5 for jewelry).
- **Chips/Filters:** Pills with a 1px Secondary border and Inter label-md text.
- **Navigation:** A centered, glass-morphic top bar. The "Cart" and "Wishlist" icons are high-stroke-weight to stand out as key conversion points.
- **Product Details:** Use an accordion-style for shipping and care instructions to minimize visual clutter on the product page.