import sharp from "sharp";
import { writeFile } from "node:fs/promises";

// Keep browser and home-screen icons in sync with the approved logo adaptation.
const source = "assets/action-audio-icon.png";
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(size => sharp(source).resize(size, size).png().toBuffer()));
await Promise.all(images.map((image, i) => writeFile(`assets/favicon-${sizes[i]}.png`, image)));
await sharp(source).resize(180, 180).png().toFile("assets/apple-touch-icon.png");

// ICO directory containing PNG images for modern and legacy browser discovery.
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
images.forEach((image, i) => {
  const entry = 6 + i * 16;
  header[entry] = sizes[i];
  header[entry + 1] = sizes[i];
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(image.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += image.length;
});
await writeFile("favicon.ico", Buffer.concat([header, ...images]));
