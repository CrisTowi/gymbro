/**
 * Icon generation script for GymBro PWA.
 * Run: node scripts/generate-icons.js
 *
 * Writes the lightning bolt SVG to all icon sizes and converts to proper PNGs via sharp.
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Full-bleed background (no rounded corners) so the icon works as maskable.
// The OS/browser applies its own shape mask.
const masterSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#9080f8"/>
      <stop offset="100%" stop-color="#4C3BC4"/>
    </linearGradient>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="10" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <polygon
    points="298,58 124,284 252,284 214,454 388,228 258,228"
    fill="white"
    filter="url(#glow)"
  />
</svg>`;

(async () => {
  const svgBuffer = Buffer.from(masterSVG);

  for (const size of sizes) {
    // Write SVG file
    const svgOut = path.join(iconsDir, `icon-${size}x${size}.svg`);
    fs.writeFileSync(svgOut, masterSVG);
    console.log(`✓ icon-${size}x${size}.svg`);

    // Write PNG file via sharp
    const pngOut = path.join(iconsDir, `icon-${size}x${size}.png`);
    await sharp(svgBuffer).resize(size, size).png().toFile(pngOut);
    console.log(`✓ icon-${size}x${size}.png`);
  }

  console.log('\nDone. All icons updated in public/icons/');
})();
