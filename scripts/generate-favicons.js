import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [16, 32, 48, 192, 512];
const inputFile = path.join(__dirname, "../public/icons/binary.svg");
const outputDir = path.join(__dirname, "../public/icons");

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate PNG files for each size
async function generateFavicons() {
  for (const size of sizes) {
    await sharp(inputFile)
      .resize(size, size)
      .png()
      .toFile(path.join(outputDir, `favicon-${size}x${size}.png`));
  }

  // Generate favicon.ico (16x16)
  await sharp(inputFile)
    .resize(16, 16)
    .toFile(path.join(outputDir, "favicon.ico"));

  // Generate apple-touch-icon (180x180)
  await sharp(inputFile)
    .resize(180, 180)
    .png()
    .toFile(path.join(outputDir, "apple-touch-icon.png"));

  console.log("Favicons generated successfully!");
}

generateFavicons().catch(console.error);
