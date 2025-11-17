const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, 'public', 'flappy-logo.png');
const outDir = path.join(__dirname, 'public', 'icons');

const sizes = [
  72, 96, 128, 144, 152, 192, 384, 512
];

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

(async () => {
  for (const size of sizes) {
    const outPath = path.join(outDir, `icon-${size}x${size}.png`);
    await sharp(source)
      .resize(size, size)
      .toFile(outPath);
    console.log(`Generated ${outPath}`);
  }
})(); 