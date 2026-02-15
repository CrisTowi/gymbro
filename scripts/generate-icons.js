/**
 * Icon generation script for PWA.
 * Run: node scripts/generate-icons.js
 *
 * For production, replace with actual designed icons.
 * This generates simple placeholder SVGs converted to basic format.
 */

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

function generateSVG(size) {
  const fontSize = Math.round(size * 0.4);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.15)}" fill="#6C5CE7"/>
  <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="${fontSize}" fill="white">GT</text>
</svg>`;
}

sizes.forEach((size) => {
  const svg = generateSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svg);
  console.log(`Generated ${filename}`);
});

// Also create PNG-named SVGs (browsers accept SVG in most cases)
// For true PNG generation, use a tool like sharp
sizes.forEach((size) => {
  const svg = generateSVG(size);
  const filename = `icon-${size}x${size}.png`;
  // Write SVG with .png extension - works for most PWA purposes
  // For production, use proper PNG generation
  fs.writeFileSync(path.join(iconsDir, filename), svg);
});

console.log('Icons generated in public/icons/');
