/**
 * Generate placeholder PWA icons (192x192 and 512x512 PNGs)
 * Uses Node.js built-in zlib to create valid PNG files.
 * Run: node scripts/generate-icons.mjs
 */
import { createDeflate } from 'node:zlib';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Buffer } from 'node:buffer';
import { Writable } from 'node:stream';

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([len, typeAndData, crc]);
}

async function collectBuffer(stream) {
  const chunks = [];
  const writable = new Writable({
    write(chunk, _enc, cb) { chunks.push(chunk); cb(); }
  });
  await pipeline(stream, writable);
  return Buffer.concat(chunks);
}

async function generatePNG(size, filePath) {
  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);  // width
  ihdr.writeUInt32BE(size, 4);  // height
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 2;   // color type: RGB
  ihdr[10] = 0;  // compression
  ihdr[11] = 0;  // filter
  ihdr[12] = 0;  // interlace

  // Image data: blue (#3B82F6) with a white "M" shape in center
  const raw = Buffer.alloc(size * (size * 3 + 1)); // +1 per row for filter byte
  const bgR = 0x3B, bgG = 0x82, bgB = 0xF6;
  const fgR = 0xFF, fgG = 0xFF, fgB = 0xFF;

  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 3 + 1);
    raw[rowStart] = 0; // no filter
    for (let x = 0; x < size; x++) {
      const px = rowStart + 1 + x * 3;
      // Draw "M" letter shape
      const nx = x / size, ny = y / size;
      const inBounds = nx > 0.2 && nx < 0.8 && ny > 0.25 && ny < 0.75;
      let isLetter = false;
      if (inBounds) {
        // Left vertical bar
        if (nx >= 0.2 && nx <= 0.3) isLetter = true;
        // Right vertical bar
        if (nx >= 0.7 && nx <= 0.8) isLetter = true;
        // Left diagonal
        const diagLeft = 0.25 + (nx - 0.3) * 0.8;
        if (nx >= 0.3 && nx <= 0.5 && Math.abs(ny - diagLeft) < 0.06) isLetter = true;
        // Right diagonal
        const diagRight = 0.25 + (0.7 - nx) * 0.8;
        if (nx >= 0.5 && nx <= 0.7 && Math.abs(ny - diagRight) < 0.06) isLetter = true;
      }
      if (isLetter) {
        raw[px] = fgR; raw[px + 1] = fgG; raw[px + 2] = fgB;
      } else {
        raw[px] = bgR; raw[px + 1] = bgG; raw[px + 2] = bgB;
      }
    }
  }

  // Compress with deflate
  const deflate = createDeflate({ level: 6 });
  deflate.end(raw);
  const compressed = await collectBuffer(deflate);

  // Build PNG
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  const png = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
  const ws = createWriteStream(filePath);
  ws.end(png);
  await new Promise((resolve, reject) => {
    ws.on('finish', resolve);
    ws.on('error', reject);
  });
  console.log(`Generated ${filePath} (${size}x${size}, ${png.length} bytes)`);
}

const dir = new URL('../public/icons/', import.meta.url).pathname;
await Promise.all([
  generatePNG(192, `${dir}icon-192.png`),
  generatePNG(512, `${dir}icon-512.png`),
]);
console.log('Done!');
