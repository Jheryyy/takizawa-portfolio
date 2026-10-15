const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. CARD FRONT SVG (1024 x 1440)
const cardFrontSvg = `
<svg width="1024" height="1440" viewBox="0 0 1024 1440" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0F0F14" />
      <stop offset="50%" stop-color="#0A0A0D" />
      <stop offset="100%" stop-color="#050508" />
    </linearGradient>

    <radialGradient id="orangeGlow" cx="80%" cy="10%" r="60%">
      <stop offset="0%" stop-color="#FF5A1F" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#FF5A1F" stop-opacity="0" />
    </radialGradient>

    <radialGradient id="bottomGlow" cx="20%" cy="90%" r="50%">
      <stop offset="0%" stop-color="#FF5A1F" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#FF5A1F" stop-opacity="0" />
    </radialGradient>

    <linearGradient id="chipGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FCE588" />
      <stop offset="30%" stop-color="#D4AF37" />
      <stop offset="70%" stop-color="#AA820A" />
      <stop offset="100%" stop-color="#F5D77F" />
    </linearGradient>

    <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#FF5A1F" />
      <stop offset="100%" stop-color="#FF8C42" />
    </linearGradient>

    <pattern id="dotGrid" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.5" fill="#FFFFFF" fill-opacity="0.04" />
    </pattern>
  </defs>

  <!-- Background Base -->
  <rect width="1024" height="1440" rx="44" fill="url(#bgGrad)" />
  <rect width="1024" height="1440" rx="44" fill="url(#dotGrid)" />
  <rect width="1024" height="1440" rx="44" fill="url(#orangeGlow)" />
  <rect width="1024" height="1440" rx="44" fill="url(#bottomGlow)" />

  <!-- Outer Card Bevel & Border -->
  <rect x="24" y="24" width="976" height="1392" rx="36" fill="none" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="2" />
  <rect x="36" y="36" width="952" height="1368" rx="28" fill="none" stroke="#FF5A1F" stroke-opacity="0.2" stroke-width="1" />

  <!-- Corner Tech Brackets -->
  <path d="M 48 80 L 48 48 L 80 48" fill="none" stroke="#FF5A1F" stroke-width="4" stroke-linecap="round" />
  <path d="M 976 80 L 976 48 L 944 48" fill="none" stroke="#FF5A1F" stroke-width="4" stroke-linecap="round" />
  <path d="M 48 1360 L 48 1392 L 80 1392" fill="none" stroke="#FF5A1F" stroke-width="4" stroke-linecap="round" />
  <path d="M 976 1360 L 976 1392 L 944 1392" fill="none" stroke="#FF5A1F" stroke-width="4" stroke-linecap="round" />

  <!-- Slot Punch Area Indicator at top center -->
  <rect x="442" y="50" width="140" height="24" rx="12" fill="#000000" fill-opacity="0.5" stroke="#FFFFFF" stroke-opacity="0.15" stroke-width="1.5" />

  <!-- Header Section -->
  <g transform="translate(68, 120)">
    <!-- School Monogram Box -->
    <rect x="0" y="0" width="76" height="76" rx="20" fill="url(#accentGrad)" />
    <text x="38" y="49" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="28" fill="#FFFFFF" text-anchor="middle">SMK</text>

    <!-- School Titles -->
    <text x="96" y="32" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="24" fill="#FFFFFF" letter-spacing="1">SMK NEGERI 1 DEPOK</text>
    <text x="96" y="60" font-family="'Courier New', monospace" font-weight="700" font-size="16" fill="#FF5A1F" letter-spacing="2">SOFTWARE ENGINEERING &bull; PPLG</text>

    <!-- Active Badge Pill -->
    <rect x="680" y="16" width="200" height="44" rx="22" fill="#10B981" fill-opacity="0.15" stroke="#10B981" stroke-opacity="0.4" stroke-width="1.5" />
    <circle cx="704" cy="38" r="6" fill="#10B981" />
    <text x="722" y="44" font-family="'Courier New', monospace" font-weight="700" font-size="15" fill="#10B981" letter-spacing="1.5">DEV &bull; ACTIVE</text>

    <!-- Header Divider Line -->
    <line x1="0" y1="104" x2="888" y2="104" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1.5" />
  </g>

  <!-- Smart EMV Chip -->
  <g transform="translate(100, 270)">
    <rect x="0" y="0" width="116" height="88" rx="16" fill="url(#chipGrad)" stroke="#684A00" stroke-width="2" />
    <line x1="0" y1="44" x2="116" y2="44" stroke="#503800" stroke-width="2" />
    <line x1="42" y1="0" x2="42" y2="88" stroke="#503800" stroke-width="2" />
    <line x1="74" y1="0" x2="74" y2="88" stroke="#503800" stroke-width="2" />
    <rect x="34" y="24" width="48" height="40" rx="8" fill="none" stroke="#503800" stroke-width="2" />
  </g>

  <!-- NFC Contactless Symbol -->
  <g transform="translate(860, 290)">
    <path d="M 0 40 A 20 20 0 0 1 0 0" fill="none" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="3" stroke-linecap="round" />
    <path d="M 12 48 A 30 30 0 0 1 12 -8" fill="none" stroke="#FFFFFF" stroke-opacity="0.5" stroke-width="3.5" stroke-linecap="round" />
    <path d="M 24 56 A 40 40 0 0 1 24 -16" fill="none" stroke="#FFFFFF" stroke-opacity="0.7" stroke-width="4" stroke-linecap="round" />
  </g>

  <!-- Center Identity / Avatar -->
  <g transform="translate(512, 530)">
    <!-- Outer Glow Ring -->
    <circle cx="0" cy="0" r="148" fill="none" stroke="#FF5A1F" stroke-opacity="0.4" stroke-width="3" stroke-dasharray="12 8" />
    <circle cx="0" cy="0" r="132" fill="#14141A" stroke="#FF5A1F" stroke-width="6" />

    <!-- Monogram Initials -->
    <text x="0" y="38" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="108" fill="#FFFFFF" text-anchor="middle" letter-spacing="-3">JT</text>

    <!-- Verified Badge Ribbon below avatar -->
    <rect x="-100" y="96" width="200" height="36" rx="18" fill="#FF5A1F" />
    <text x="0" y="120" font-family="'Courier New', monospace" font-weight="800" font-size="14" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">&bull; VERIFIED DEV &bull;</text>
  </g>

  <!-- Name & Title Block -->
  <g transform="translate(512, 780)">
    <text x="0" y="0" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="52" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">JHERYCO TAKIZAWA</text>
    <text x="0" y="44" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="700" font-size="28" fill="#FF5A1F" text-anchor="middle" letter-spacing="3">NATAL KRISTIAWAN</text>

    <!-- Role Pill -->
    <rect x="-260" y="80" width="520" height="56" rx="28" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.15" stroke-width="1.5" />
    <text x="0" y="116" font-family="'Courier New', monospace" font-weight="700" font-size="19" fill="#E2E8F0" text-anchor="middle" letter-spacing="2">FRONTEND DEVELOPER &bull; UI/UX</text>
  </g>

  <!-- Key Attributes Grid -->
  <g transform="translate(100, 1010)">
    <rect x="0" y="0" width="824" height="150" rx="24" fill="#121217" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />

    <g transform="translate(40, 48)">
      <text x="0" y="0" font-family="'Courier New', monospace" font-size="14" fill="#888899" letter-spacing="1.5">CREDENTIAL ID</text>
      <text x="0" y="32" font-family="'Courier New', monospace" font-weight="700" font-size="20" fill="#FFFFFF">#TKZW-2026-DEV</text>
    </g>

    <line x1="320" y1="24" x2="320" y2="126" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1" />

    <g transform="translate(360, 48)">
      <text x="0" y="0" font-family="'Courier New', monospace" font-size="14" fill="#888899" letter-spacing="1.5">ROLE FOCUS</text>
      <text x="0" y="32" font-family="'Courier New', monospace" font-weight="700" font-size="20" fill="#FF5A1F">REACT &bull; NEXT.JS &bull; TS</text>
    </g>

    <line x1="620" y1="24" x2="620" y2="126" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1" />

    <g transform="translate(660, 48)">
      <text x="0" y="0" font-family="'Courier New', monospace" font-size="14" fill="#888899" letter-spacing="1.5">CLEARANCE</text>
      <text x="0" y="32" font-family="'Courier New', monospace" font-weight="700" font-size="20" fill="#10B981">LVL 04 &bull; AUTH</text>
    </g>
  </g>

  <!-- Bottom Barcode & Footer -->
  <g transform="translate(100, 1220)">
    <line x1="0" y1="0" x2="824" y2="0" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1.5" />

    <g transform="translate(0, 40)">
      <text x="0" y="0" font-family="'Courier New', monospace" font-size="13" fill="#666677" letter-spacing="1.5">AUTHENTIC PASS // SMK NEGERI 1 DEPOK</text>
      <text x="0" y="24" font-family="'Courier New', monospace" font-weight="700" font-size="16" fill="#FFFFFF" letter-spacing="2">JAKARTA TIMEZONE &bull; UTC+7</text>
    </g>

    <!-- Barcode Container -->
    <g transform="translate(584, 18)">
      <rect x="0" y="0" width="240" height="70" rx="8" fill="#FFFFFF" />
      <!-- Barcode Stripes -->
      <g transform="translate(16, 10)">
        <rect x="0" y="0" width="4" height="50" fill="#000000" />
        <rect x="7" y="0" width="2" height="50" fill="#000000" />
        <rect x="12" y="0" width="6" height="50" fill="#000000" />
        <rect x="22" y="0" width="3" height="50" fill="#000000" />
        <rect x="28" y="0" width="1" height="50" fill="#000000" />
        <rect x="32" y="0" width="5" height="50" fill="#000000" />
        <rect x="40" y="0" width="2" height="50" fill="#000000" />
        <rect x="46" y="0" width="7" height="50" fill="#000000" />
        <rect x="56" y="0" width="2" height="50" fill="#000000" />
        <rect x="62" y="0" width="4" height="50" fill="#000000" />
        <rect x="70" y="0" width="6" height="50" fill="#000000" />
        <rect x="80" y="0" width="2" height="50" fill="#000000" />
        <rect x="86" y="0" width="3" height="50" fill="#000000" />
        <rect x="92" y="0" width="5" height="50" fill="#000000" />
        <rect x="100" y="0" width="2" height="50" fill="#000000" />
        <rect x="106" y="0" width="6" height="50" fill="#000000" />
        <rect x="116" y="0" width="3" height="50" fill="#000000" />
        <rect x="122" y="0" width="5" height="50" fill="#000000" />
        <rect x="130" y="0" width="2" height="50" fill="#000000" />
        <rect x="136" y="0" width="7" height="50" fill="#000000" />
        <rect x="146" y="0" width="3" height="50" fill="#000000" />
        <rect x="152" y="0" width="4" height="50" fill="#000000" />
        <rect x="160" y="0" width="6" height="50" fill="#000000" />
        <rect x="170" y="0" width="2" height="50" fill="#000000" />
        <rect x="176" y="0" width="5" height="50" fill="#000000" />
        <rect x="184" y="0" width="4" height="50" fill="#000000" />
        <rect x="192" y="0" width="6" height="50" fill="#000000" />
        <rect x="202" y="0" width="3" height="50" fill="#000000" />
      </g>
    </g>
  </g>
</svg>
`;

// 2. CARD BACK SVG (1024 x 1440)
const cardBackSvg = `
<svg width="1024" height="1440" viewBox="0 0 1024 1440" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="backBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0A0A0E" />
      <stop offset="100%" stop-color="#050507" />
    </linearGradient>

    <linearGradient id="magStripe" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#000000" />
      <stop offset="50%" stop-color="#141417" />
      <stop offset="100%" stop-color="#000000" />
    </linearGradient>

    <radialGradient id="holoGradient" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#FFD700" />
      <stop offset="35%" stop-color="#FF5A1F" />
      <stop offset="70%" stop-color="#8A2BE2" />
      <stop offset="100%" stop-color="#00FFFF" />
    </radialGradient>
  </defs>

  <!-- Background Base -->
  <rect width="1024" height="1440" rx="44" fill="url(#backBg)" />
  <rect x="24" y="24" width="976" height="1392" rx="36" fill="none" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="2" />

  <!-- Magnetic Stripe -->
  <rect x="0" y="100" width="1024" height="180" fill="url(#magStripe)" />
  <line x1="0" y1="190" x2="1024" y2="190" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="2" />

  <!-- Slot Punch Area Indicator -->
  <rect x="442" y="44" width="140" height="24" rx="12" fill="#000000" fill-opacity="0.5" stroke="#FFFFFF" stroke-opacity="0.15" stroke-width="1.5" />

  <!-- Signature Panel -->
  <g transform="translate(80, 340)">
    <text x="0" y="0" font-family="'Courier New', monospace" font-size="14" fill="#94A3B8" letter-spacing="2">AUTHORIZED SIGNATURE &bull; NOT TRANSFERABLE</text>

    <rect x="0" y="18" width="864" height="90" rx="12" fill="#F1F5F9" />
    <!-- Signature text stylized -->
    <text x="40" y="76" font-family="'Brush Script MT', 'Segoe Script', cursive, sans-serif" font-size="44" fill="#0F172A" font-style="italic">Jheryco Takizawa</text>
    <!-- Security digits -->
    <text x="760" y="74" font-family="'Courier New', monospace" font-weight="900" font-size="28" fill="#475569" letter-spacing="4">0821</text>
  </g>

  <!-- Specification Box -->
  <g transform="translate(80, 500)">
    <rect x="0" y="0" width="864" height="340" rx="24" fill="#141419" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />

    <g transform="translate(40, 54)">
      <text x="0" y="0" font-family="'Courier New', monospace" font-size="14" fill="#888899" letter-spacing="1.5">FULL NAME</text>
      <text x="300" y="0" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="700" font-size="18" fill="#FFFFFF">Jheryco Takizawa Natal Kristiawan</text>

      <line x1="0" y1="26" x2="784" y2="26" stroke="#FFFFFF" stroke-opacity="0.06" stroke-width="1" />

      <text x="0" y="60" font-family="'Courier New', monospace" font-size="14" fill="#888899" letter-spacing="1.5">VOCATIONAL MAJOR</text>
      <text x="300" y="60" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="700" font-size="18" fill="#FF5A1F">Software Engineering (PPLG)</text>

      <line x1="0" y1="86" x2="784" y2="86" stroke="#FFFFFF" stroke-opacity="0.06" stroke-width="1" />

      <text x="0" y="120" font-family="'Courier New', monospace" font-size="14" fill="#888899" letter-spacing="1.5">INSTITUTION</text>
      <text x="300" y="120" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="700" font-size="18" fill="#FFFFFF">SMK Negeri 1 Depok, Jawa Barat</text>

      <line x1="0" y1="146" x2="784" y2="146" stroke="#FFFFFF" stroke-opacity="0.06" stroke-width="1" />

      <text x="0" y="180" font-family="'Courier New', monospace" font-size="14" fill="#888899" letter-spacing="1.5">PRIMARY EMAIL</text>
      <text x="300" y="180" font-family="'Courier New', monospace" font-weight="700" font-size="18" fill="#10B981">jherycotakizawa@gmail.com</text>

      <line x1="0" y1="206" x2="784" y2="206" stroke="#FFFFFF" stroke-opacity="0.06" stroke-width="1" />

      <text x="0" y="240" font-family="'Courier New', monospace" font-size="14" fill="#888899" letter-spacing="1.5">PORTFOLIO DOMAIN</text>
      <text x="300" y="240" font-family="'Courier New', monospace" font-weight="700" font-size="18" fill="#FFFFFF">takizawa.dev &bull; GitHub @jherycotakizawa</text>
    </g>
  </g>

  <!-- Competencies Badges Grid -->
  <g transform="translate(80, 890)">
    <text x="0" y="0" font-family="'Courier New', monospace" font-size="14" fill="#94A3B8" letter-spacing="2">VERIFIED TECH SKILLS &bull; PRODUCTION READY</text>

    <g transform="translate(0, 24)">
      <!-- Skill Pills -->
      <rect x="0" y="0" width="130" height="46" rx="10" fill="#FF5A1F" fill-opacity="0.12" stroke="#FF5A1F" stroke-opacity="0.3" stroke-width="1.5" />
      <text x="65" y="29" font-family="'Courier New', monospace" font-weight="700" font-size="16" fill="#FFFFFF" text-anchor="middle">Next.js 15</text>

      <rect x="146" y="0" width="120" height="46" rx="10" fill="#FF5A1F" fill-opacity="0.12" stroke="#FF5A1F" stroke-opacity="0.3" stroke-width="1.5" />
      <text x="206" y="29" font-family="'Courier New', monospace" font-weight="700" font-size="16" fill="#FFFFFF" text-anchor="middle">React 19</text>

      <rect x="282" y="0" width="140" height="46" rx="10" fill="#FF5A1F" fill-opacity="0.12" stroke="#FF5A1F" stroke-opacity="0.3" stroke-width="1.5" />
      <text x="352" y="29" font-family="'Courier New', monospace" font-weight="700" font-size="16" fill="#FFFFFF" text-anchor="middle">TypeScript</text>

      <rect x="438" y="0" width="150" height="46" rx="10" fill="#FF5A1F" fill-opacity="0.12" stroke="#FF5A1F" stroke-opacity="0.3" stroke-width="1.5" />
      <text x="513" y="29" font-family="'Courier New', monospace" font-weight="700" font-size="16" fill="#FFFFFF" text-anchor="middle">TailwindCSS</text>

      <rect x="604" y="0" width="120" height="46" rx="10" fill="#FF5A1F" fill-opacity="0.12" stroke="#FF5A1F" stroke-opacity="0.3" stroke-width="1.5" />
      <text x="664" y="29" font-family="'Courier New', monospace" font-weight="700" font-size="16" fill="#FFFFFF" text-anchor="middle">Three.js</text>

      <rect x="740" y="0" width="124" height="46" rx="10" fill="#FF5A1F" fill-opacity="0.12" stroke="#FF5A1F" stroke-opacity="0.3" stroke-width="1.5" />
      <text x="802" y="29" font-family="'Courier New', monospace" font-weight="700" font-size="16" fill="#FFFFFF" text-anchor="middle">UI/UX Dev</text>
    </g>
  </g>

  <!-- Legal & Hologram Footer -->
  <g transform="translate(80, 1060)">
    <rect x="0" y="0" width="864" height="270" rx="24" fill="#0E0E13" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />

    <g transform="translate(40, 50)">
      <text x="0" y="0" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="17" fill="#CBD5E1" width="580">
        This pass certifies that the bearer is a recognized developer from
      </text>
      <text x="0" y="32" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="700" font-size="18" fill="#FFFFFF">
        SMK Negeri 1 Depok (PPLG)
      </text>
      <text x="0" y="64" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="15" fill="#94A3B8">
        equipped for frontend engineering, interactive web crafts, &amp; modern interfaces.
      </text>

      <text x="0" y="140" font-family="'Courier New', monospace" font-size="13" fill="#64748B">SERIAL VERIFICATION NUMBER</text>
      <text x="0" y="166" font-family="'Courier New', monospace" font-weight="700" font-size="20" fill="#FF5A1F">#0821-2026-TKZW-SMKN1DPK</text>
    </g>

    <!-- Holographic Foil Seal -->
    <g transform="translate(730, 120)">
      <circle cx="0" cy="0" r="64" fill="url(#holoGradient)" stroke="#FFFFFF" stroke-width="3" />
      <circle cx="0" cy="0" r="54" fill="none" stroke="#FFFFFF" stroke-opacity="0.5" stroke-width="1.5" stroke-dasharray="6 4" />
      <text x="0" y="-8" font-family="'Courier New', monospace" font-weight="900" font-size="14" fill="#000000" text-anchor="middle" letter-spacing="1">GENUINE</text>
      <text x="0" y="14" font-family="'Courier New', monospace" font-weight="900" font-size="15" fill="#000000" text-anchor="middle" letter-spacing="1">DEV PASS</text>
      <text x="0" y="32" font-family="'Courier New', monospace" font-weight="900" font-size="12" fill="#000000" text-anchor="middle">2026</text>
    </g>
  </g>
</svg>
`;

// 3. STRAP SVG (1024 x 192)
const bandSvg = `
<svg width="1024" height="192" viewBox="0 0 1024 192" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bandBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#18181D" />
      <stop offset="50%" stop-color="#0F0F13" />
      <stop offset="100%" stop-color="#18181D" />
    </linearGradient>

    <pattern id="bandWeave" width="16" height="16" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="16" y2="16" stroke="#FFFFFF" stroke-opacity="0.03" stroke-width="2" />
      <line x1="16" y1="0" x2="0" y2="16" stroke="#FFFFFF" stroke-opacity="0.03" stroke-width="2" />
    </pattern>
  </defs>

  <rect width="1024" height="192" fill="url(#bandBg)" />
  <rect width="1024" height="192" fill="url(#bandWeave)" />

  <!-- Stitch lines top and bottom -->
  <line x1="0" y1="16" x2="1024" y2="16" stroke="#FF5A1F" stroke-width="3" stroke-dasharray="12 10" />
  <line x1="0" y1="176" x2="1024" y2="176" stroke="#FF5A1F" stroke-width="3" stroke-dasharray="12 10" />

  <!-- Repeated Brand & Identity along the strap -->
  <g transform="translate(512, 108)">
    <text x="0" y="0" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="34" fill="#FFFFFF" text-anchor="middle" letter-spacing="4">
      &#9733; TAKIZAWA <tspan fill="#FF5A1F">&#8226;</tspan> FRONTEND DEV <tspan fill="#FF5A1F">&#8226;</tspan> SMKN 1 DEPOK &#9733;
    </text>
  </g>
</svg>
`;

async function generate() {
  const sanitize = (svg) => svg.replaceAll('&bull;', '&#8226;').replaceAll('&amp;', '&amp;');

  console.log('Rendering card-front.png with sharp...');
  await sharp(Buffer.from(sanitize(cardFrontSvg)))
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'card-front.png'));

  console.log('Rendering card-back.png with sharp...');
  await sharp(Buffer.from(sanitize(cardBackSvg)))
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'card-back.png'));

  console.log('Rendering band.png with sharp...');
  await sharp(Buffer.from(sanitize(bandSvg)))
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'band.png'));

  console.log('Successfully generated all 3 assets in public/!');
}

generate().catch(err => {
  console.error('Generation failed:', err);
  process.exit(1);
});
