// One-shot asset generator: writes on-brand SVG previews to /public.
// Run with: node scripts/generate-assets.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const publicDir = resolve(root, 'public');

const W = 1600;
const H = 1000;

function svg(inner, bg = '#f4f1ec') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none">
<rect width="${W}" height="${H}" fill="${bg}"/>
${inner}
</svg>`;
}

// A refined "browser window" mock for template previews
function browserWindow(label, accent, contentInner, contentBg = '#ffffff') {
  return `
  <rect x="120" y="180" width="1360" height="720" rx="24" fill="${contentBg}" stroke="#e2dcd1" stroke-width="1.5"/>
  <rect x="120" y="180" width="1360" height="56" rx="24" fill="#f4f1ec"/>
  <rect x="120" y="212" width="1360" height="24" fill="#f4f1ec"/>
  <circle cx="160" cy="208" r="7" fill="#e8825f"/>
  <circle cx="184" cy="208" r="7" fill="#e8c35f"/>
  <circle cx="208" cy="208" r="7" fill="#7fc28f"/>
  <rect x="440" y="200" width="320" height="16" rx="8" fill="#e2dcd1"/>
  <text x="200" y="320" font-family="Georgia, serif" font-size="46" font-weight="600" fill="#1c1917">${label}</text>
  ${contentInner}
  `;
}

// ============ PROJECTS ============
const projects = [
  {
    name: 'lumen-analytics',
    label: 'Lumen Analytics',
    accent: '#e8825f',
    content: `
    <rect x="160" y="380" width="1280" height="200" rx="16" fill="#f4f1ec"/>
    <rect x="190" y="410" width="180" height="14" rx="7" fill="#e2dcd1"/>
    <rect x="190" y="440" width="120" height="28" rx="6" fill="#1c1917"/>
    <rect x="190" y="490" width="400" height="60" rx="8" fill="#e8825f" opacity="0.85"/>
    <rect x="610" y="490" width="260" height="60" rx="8" fill="#e2dcd1"/>
    <rect x="890" y="490" width="200" height="60" rx="8" fill="#e2dcd1"/>
    <polyline points="200,640 360,610 520,630 680,560 840,590 1000,520 1160,540 1320,470" stroke="#1c1917" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="1320" cy="470" r="8" fill="#e8825f"/>
    <rect x="160" y="660" width="300" height="160" rx="16" fill="#f4f1ec"/>
    <rect x="490" y="660" width="300" height="160" rx="16" fill="#f4f1ec"/>
    <rect x="820" y="660" width="300" height="160" rx="16" fill="#f4f1ec"/>
    <rect x="1140" y="660" width="300" height="160" rx="16" fill="#e8825f" opacity="0.12"/>
    `,
  },
  {
    name: 'maison-fleur',
    label: 'Maison Fleur',
    accent: '#c98a7a',
    content: `
    <rect x="160" y="380" width="620" height="500" rx="16" fill="#efe6df"/>
    <circle cx="470" cy="600" r="120" fill="#c98a7a" opacity="0.6"/>
    <circle cx="470" cy="600" r="70" fill="#a8695a"/>
    <rect x="820" y="380" width="620" height="240" rx="16" fill="#1c1917"/>
    <text x="860" y="470" font-family="Georgia, serif" font-size="40" font-weight="600" fill="#f4f1ec">Atelier Fleur</text>
    <rect x="860" y="500" width="300" height="14" rx="7" fill="#f4f1ec" opacity="0.5"/>
    <rect x="860" y="530" width="220" height="14" rx="7" fill="#f4f1ec" opacity="0.4"/>
    <rect x="860" y="570" width="140" height="36" rx="18" fill="#c98a7a"/>
    <rect x="820" y="640" width="300" height="240" rx="16" fill="#efe6df"/>
    <rect x="1140" y="640" width="300" height="240" rx="16" fill="#c98a7a" opacity="0.25"/>
    `,
  },
  {
    name: 'arc-architecture',
    label: 'ARC Architecture',
    accent: '#1c1917',
    content: `
    <rect x="160" y="380" width="1280" height="500" rx="16" fill="#1c1917"/>
    <rect x="200" y="420" width="500" height="420" rx="8" fill="#2a2622"/>
    <rect x="740" y="420" width="660" height="200" rx="8" fill="#3a3531"/>
    <rect x="740" y="640" width="320" height="200" rx="8" fill="#3a3531"/>
    <rect x="1080" y="640" width="320" height="200" rx="8" fill="#e8825f" opacity="0.8"/>
    <text x="200" y="350" font-family="Georgia, serif" font-size="36" font-weight="600" fill="#1c1917">Spatial typography, monolithic form.</text>
    `,
  },
  {
    name: 'harbor-finance',
    label: 'Harbor Finance',
    accent: '#3a7a8c',
    content: `
    <rect x="160" y="380" width="380" height="500" rx="16" fill="#1c1917"/>
    <rect x="200" y="430" width="200" height="16" rx="8" fill="#f4f1ec" opacity="0.6"/>
    <rect x="200" y="470" width="120" height="40" rx="8" fill="#3a7a8c"/>
    <rect x="200" y="540" width="280" height="20" rx="10" fill="#f4f1ec" opacity="0.3"/>
    <rect x="200" y="580" width="240" height="20" rx="10" fill="#f4f1ec" opacity="0.2"/>
    <rect x="200" y="650" width="280" height="180" rx="12" fill="#2a2622"/>
    <polyline points="220,800 280,770 340,790 400,740 460,760" stroke="#3a7a8c" stroke-width="3" fill="none"/>
    <rect x="580" y="380" width="860" height="500" rx="16" fill="#f4f1ec"/>
    <rect x="620" y="420" width="220" height="40" rx="8" fill="#1c1917"/>
    <rect x="620" y="490" width="400" height="16" rx="8" fill="#e2dcd1"/>
    <rect x="620" y="520" width="360" height="16" rx="8" fill="#e2dcd1"/>
    <rect x="620" y="580" width="780" height="120" rx="12" fill="#ffffff" stroke="#e2dcd1"/>
    <rect x="620" y="720" width="380" height="120" rx="12" fill="#3a7a8c" opacity="0.15"/>
    <rect x="1020" y="720" width="380" height="120" rx="12" fill="#ffffff" stroke="#e2dcd1"/>
    `,
  },
  {
    name: 'verdant-studio',
    label: 'Verdant Studio',
    accent: '#7fc28f',
    content: `
    <text x="160" y="360" font-family="Georgia, serif" font-size="120" font-weight="700" fill="#1c1917">verdant</text>
    <rect x="160" y="420" width="1280" height="460" rx="16" fill="#e8efe6"/>
    <circle cx="400" cy="650" r="160" fill="#7fc28f" opacity="0.7"/>
    <circle cx="400" cy="650" r="100" fill="#5fa872"/>
    <rect x="640" y="500" width="780" height="60" rx="30" fill="#1c1917"/>
    <rect x="640" y="600" width="500" height="20" rx="10" fill="#1c1917" opacity="0.7"/>
    <rect x="640" y="640" width="440" height="20" rx="10" fill="#1c1917" opacity="0.5"/>
    <rect x="640" y="720" width="200" height="48" rx="24" fill="#7fc28f"/>
    `,
  },
  {
    name: 'nomad-journal',
    label: 'Nomad Journal',
    accent: '#c9925f',
    content: `
    <rect x="160" y="380" width="620" height="500" rx="16" fill="#1c1917"/>
    <text x="200" y="460" font-family="Georgia, serif" font-size="34" font-style="italic" fill="#f4f1ec">Field Notes</text>
    <rect x="200" y="490" width="280" height="14" rx="7" fill="#f4f1ec" opacity="0.4"/>
    <rect x="200" y="520" width="240" height="14" rx="7" fill="#f4f1ec" opacity="0.3"/>
    <rect x="200" y="550" width="300" height="14" rx="7" fill="#f4f1ec" opacity="0.3"/>
    <rect x="200" y="760" width="120" height="36" rx="18" fill="#c9925f"/>
    <rect x="820" y="380" width="620" height="500" rx="16" fill="#c9925f" opacity="0.3"/>
    <rect x="860" y="420" width="540" height="300" rx="12" fill="#c9925f" opacity="0.5"/>
    <rect x="860" y="760" width="540" height="80" rx="12" fill="#1c1917" opacity="0.1"/>
    `,
  },
];

// ============ TEMPLATES ============
const templates = [
  { name: 'luxury-wedding', label: 'Luxury Wedding', accent: '#c98a7a',
    content: `
    <text x="200" y="340" font-family="Georgia, serif" font-size="64" font-style="italic" fill="#1c1917">Forever,</text>
    <text x="200" y="420" font-family="Georgia, serif" font-size="64" font-style="italic" fill="#c98a7a">Amélie & Léon</text>
    <rect x="200" y="470" width="300" height="14" rx="7" fill="#1c1917" opacity="0.5"/>
    <rect x="820" y="380" width="620" height="500" rx="16" fill="#c98a7a" opacity="0.3"/>
    <circle cx="1130" cy="630" r="140" fill="#c98a7a" opacity="0.6"/>
    <rect x="200" y="760" width="180" height="40" rx="20" fill="#1c1917"/>
    ` },
  { name: 'aurora-restaurant', label: 'Aurora Restaurant', accent: '#b8633f',
    content: `
    <text x="200" y="340" font-family="Georgia, serif" font-size="56" font-weight="600" fill="#1c1917">Aurora</text>
    <text x="200" y="390" font-family="Georgia, serif" font-size="22" font-style="italic" fill="#b8633f">Seasonal · Coastal</text>
    <rect x="200" y="440" width="260" height="200" rx="12" fill="#b8633f" opacity="0.3"/>
    <rect x="500" y="440" width="260" height="200" rx="12" fill="#1c1917"/>
    <rect x="200" y="680" width="560" height="180" rx="12" fill="#efe6df"/>
    <rect x="820" y="380" width="620" height="500" rx="16" fill="#1c1917"/>
    <text x="860" y="450" font-family="Georgia, serif" font-size="24" fill="#f4f1ec">The Menu</text>
    <rect x="860" y="490" width="300" height="14" rx="7" fill="#f4f1ec" opacity="0.5"/>
    <rect x="860" y="520" width="260" height="14" rx="7" fill="#f4f1ec" opacity="0.4"/>
    <rect x="860" y="560" width="300" height="14" rx="7" fill="#f4f1ec" opacity="0.4"/>
    <rect x="860" y="590" width="220" height="14" rx="7" fill="#f4f1ec" opacity="0.3"/>
    <rect x="860" y="760" width="160" height="44" rx="22" fill="#b8633f"/>
    ` },
  { name: 'nimbus-saas', label: 'Nimbus SaaS', accent: '#3a7a8c',
    content: `
    <text x="200" y="340" font-family="Georgia, serif" font-size="64" font-weight="600" fill="#1c1917">Ship faster.</text>
    <rect x="200" y="400" width="440" height="16" rx="8" fill="#1c1917" opacity="0.5"/>
    <rect x="200" y="430" width="380" height="16" rx="8" fill="#1c1917" opacity="0.4"/>
    <rect x="200" y="490" width="200" height="48" rx="24" fill="#3a7a8c"/>
    <rect x="430" y="490" width="180" height="48" rx="24" fill="#f4f1ec" stroke="#e2dcd1"/>
    <rect x="820" y="380" width="620" height="500" rx="16" fill="#1c1917"/>
    <rect x="860" y="420" width="540" height="60" rx="12" fill="#2a2622"/>
    <rect x="860" y="500" width="260" height="160" rx="12" fill="#3a7a8c" opacity="0.3"/>
    <rect x="1140" y="500" width="260" height="160" rx="12" fill="#2a2622"/>
    <rect x="860" y="680" width="540" height="160" rx="12" fill="#2a2622"/>
    <polyline points="890,810 960,780 1030,790 1100,750 1170,770 1240,730 1310,740 1380,700" stroke="#3a7a8c" stroke-width="3" fill="none"/>
    <rect x="200" y="600" width="560" height="260" rx="16" fill="#f4f1ec"/>
    <rect x="240" y="640" width="120" height="14" rx="7" fill="#3a7a8c"/>
    <rect x="240" y="670" width="400" height="12" rx="6" fill="#e2dcd1"/>
    <rect x="240" y="695" width="360" height="12" rx="6" fill="#e2dcd1"/>
    ` },
  { name: 'estate-pro', label: 'Estate Pro', accent: '#5fa872',
    content: `
    <text x="200" y="340" font-family="Georgia, serif" font-size="52" font-weight="600" fill="#1c1917">Find your place.</text>
    <rect x="200" y="400" width="600" height="60" rx="30" fill="#ffffff" stroke="#e2dcd1"/>
    <rect x="230" y="420" width="200" height="20" rx="10" fill="#e2dcd1"/>
    <rect x="700" y="410" width="80" height="40" rx="20" fill="#5fa872"/>
    <rect x="200" y="500" width="290" height="360" rx="16" fill="#5fa872" opacity="0.25"/>
    <rect x="510" y="500" width="290" height="360" rx="16" fill="#5fa872" opacity="0.15"/>
    <rect x="820" y="500" width="620" height="360" rx="16" fill="#1c1917"/>
    <rect x="860" y="540" width="540" height="280" rx="12" fill="#2a2622"/>
    <circle cx="1130" cy="680" r="60" fill="#5fa872" opacity="0.7"/>
    ` },
  { name: 'studio-agency', label: 'Studio Agency', accent: '#e8825f',
    content: `
    <text x="200" y="380" font-family="Georgia, serif" font-size="110" font-weight="700" fill="#1c1917">Studio.</text>
    <text x="200" y="490" font-family="Georgia, serif" font-size="110" font-weight="700" font-style="italic" fill="#e8825f">Bold.</text>
    <rect x="200" y="560" width="500" height="16" rx="8" fill="#1c1917" opacity="0.5"/>
    <rect x="200" y="600" width="420" height="16" rx="8" fill="#1c1917" opacity="0.4"/>
    <rect x="200" y="660" width="220" height="52" rx="26" fill="#e8825f"/>
    <rect x="900" y="380" width="540" height="500" rx="16" fill="#1c1917"/>
    <rect x="940" y="420" width="460" height="240" rx="12" fill="#2a2622"/>
    <rect x="940" y="680" width="220" height="160" rx="12" fill="#e8825f" opacity="0.6"/>
    <rect x="1180" y="680" width="220" height="160" rx="12" fill="#2a2622"/>
    ` },
  { name: 'mono-commerce', label: 'Mono Commerce', accent: '#1c1917',
    content: `
    <text x="200" y="340" font-family="Georgia, serif" font-size="48" font-weight="600" fill="#1c1917">Essentials.</text>
    <rect x="200" y="420" width="300" height="360" rx="12" fill="#1c1917"/>
    <rect x="200" y="420" width="300" height="220" rx="12" fill="#e2dcd1"/>
    <rect x="520" y="420" width="300" height="360" rx="12" fill="#ffffff" stroke="#e2dcd1"/>
    <rect x="520" y="420" width="300" height="220" rx="12" fill="#1c1917" opacity="0.08"/>
    <rect x="840" y="420" width="300" height="360" rx="12" fill="#ffffff" stroke="#e2dcd1"/>
    <rect x="840" y="420" width="300" height="220" rx="12" fill="#1c1917" opacity="0.12"/>
    <rect x="200" y="820" width="940" height="40" rx="20" fill="#1c1917"/>
    <rect x="1180" y="420" width="260" height="440" rx="16" fill="#1c1917"/>
    <text x="1210" y="470" font-family="Georgia, serif" font-size="22" fill="#f4f1ec">Cart</text>
    <rect x="1210" y="500" width="200" height="14" rx="7" fill="#f4f1ec" opacity="0.4"/>
    <rect x="1210" y="780" width="200" height="44" rx="22" fill="#e8825f"/>
    ` },
  { name: 'solo-brand', label: 'Solo Brand', accent: '#9a6dd4',
    content: `
    <circle cx="420" cy="560" r="120" fill="#9a6dd4" opacity="0.5"/>
    <circle cx="420" cy="560" r="80" fill="#1c1917"/>
    <text x="200" y="380" font-family="Georgia, serif" font-size="56" font-weight="600" fill="#1c1917">Maya Rivera</text>
    <text x="200" y="430" font-family="Georgia, serif" font-size="22" font-style="italic" fill="#9a6dd4">Designer · Consultant</text>
    <rect x="200" y="470" width="380" height="16" rx="8" fill="#1c1917" opacity="0.5"/>
    <rect x="200" y="500" width="320" height="16" rx="8" fill="#1c1917" opacity="0.4"/>
    <rect x="200" y="560" width="180" height="48" rx="24" fill="#9a6dd4"/>
    <rect x="700" y="380" width="740" height="500" rx="16" fill="#efe6df"/>
    <rect x="740" y="420" width="660" height="80" rx="12" fill="#ffffff"/>
    <rect x="740" y="520" width="320" height="160" rx="12" fill="#9a6dd4" opacity="0.2"/>
    <rect x="1080" y="520" width="320" height="160" rx="12" fill="#ffffff"/>
    <rect x="740" y="700" width="660" height="140" rx="12" fill="#1c1917" opacity="0.06"/>
    ` },
  { name: 'harbor-bistro', label: 'Harbor Bistro', accent: '#3a8c7a',
    content: `
    <text x="200" y="340" font-family="Georgia, serif" font-size="52" font-weight="600" fill="#1c1917">Harbor Bistro</text>
    <text x="200" y="385" font-family="Georgia, serif" font-size="20" font-style="italic" fill="#3a8c7a">Coastal · Seasonal · Since 2014</text>
    <rect x="200" y="430" width="560" height="440" rx="16" fill="#3a8c7a" opacity="0.2"/>
    <circle cx="480" cy="650" r="120" fill="#3a8c7a" opacity="0.5"/>
    <rect x="820" y="430" width="620" height="210" rx="16" fill="#1c1917"/>
    <text x="860" y="490" font-family="Georgia, serif" font-size="24" fill="#f4f1ec">This week's catch</text>
    <rect x="860" y="520" width="280" height="14" rx="7" fill="#f4f1ec" opacity="0.4"/>
    <rect x="860" y="550" width="240" height="14" rx="7" fill="#f4f1ec" opacity="0.3"/>
    <rect x="820" y="660" width="300" height="210" rx="16" fill="#efe6df"/>
    <rect x="1140" y="660" width="300" height="210" rx="16" fill="#3a8c7a" opacity="0.3"/>
    ` },
];

// ============ OG IMAGE ============
const ogImage = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="none">
<rect width="1200" height="630" fill="#f4f1ec"/>
<rect x="0" y="0" width="1200" height="630" fill="none" stroke="none"/>
<circle cx="100" cy="100" r="6" fill="#e8825f"/>
<text x="80" y="320" font-family="Sora, sans-serif" font-size="92" font-weight="800" fill="#1c1917">Design Blade</text>
<text x="82" y="385" font-family="Sora, sans-serif" font-size="30" font-weight="400" fill="#1c1917" opacity="0.6">Creative Studio &amp; Resource Library</text>
<rect x="82" y="425" width="420" height="14" rx="7" fill="#1c1917" opacity="0.4"/>
<rect x="82" y="490" width="200" height="48" rx="24" fill="#e8825f"/>
<text x="145" y="522" font-family="Sora, sans-serif" font-size="18" font-weight="600" fill="#f4f1ec">View Projects</text>
<text x="1060" y="600" font-family="Sora, sans-serif" font-size="15" fill="#1c1917" opacity="0.5" text-anchor="end">designblade.pro</text>
</svg>`;

function write(path, content) {
  const full = resolve(publicDir, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content.trim() + '\n', 'utf8');
  console.log('wrote', path);
}

// Projects
for (const p of projects) {
  write(`images/projects/${p.name}.svg`, svg(browserWindow(p.label, p.accent, p.content)));
}
// Templates
for (const t of templates) {
  write(`templates/${t.name}.svg`, svg(browserWindow(t.label, t.accent, t.content)));
}
// OG
write('images/og-image.svg', ogImage);

console.log('done');
