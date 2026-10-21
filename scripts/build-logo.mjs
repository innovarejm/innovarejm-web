/**
 * Genera los recursos de marca a partir del logo oficial (public/uploads/LOGO INNOVARE.png, 4500 px, fondo transparente).
 * Uso: node scripts/build-logo.mjs   (solo hace falta volver a correrlo si cambia el logo)
 *
 *   public/brand/logo-mark.png         símbolo (montañas), transparente
 *   public/brand/logo-mark-white.png   símbolo en blanco (marcas de agua)
 *   public/brand/logo-text.png         "INNOVARE JM / INMOBILIER" en sus colores
 *   public/brand/logo-text-light.png   mismo texto en blanco (sobre fondos oscuros)
 *   public/favicon.ico                 16/32/48 px para la pestaña del navegador
 *   public/brand/apple-touch-icon.png  180 px, fondo blanco (iPhone/iPad)
 *   public/brand/icon-192.png, icon-512.png  (Android / manifest)
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'public/uploads/LOGO INNOVARE.png');
const OUT = path.join(ROOT, 'public/brand');
mkdirSync(OUT, { recursive: true });

// Zonas del logo original (medidas sobre el PNG de 4500 px)
const MARK = { left: 1050, top: 1042, width: 2398, height: 1330 };
const TEXT = { left: 1005, top: 2422, width: 2474, height: 744 };

const crop = (box) => sharp(SRC).extract(box);

// Recolorea todo lo visible en blanco conservando la transparencia
async function white(buffer) {
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) { data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; }
  return sharp(data, { raw: info }).png();
}

const png = { compressionLevel: 9, palette: false };

// Símbolo y texto a 3× del tamaño en pantalla (~40 px de alto en el menú)
const markBuf = await crop(MARK).resize({ height: 132 }).png(png).toBuffer();
writeFileSync(path.join(OUT, 'logo-mark.png'), markBuf);
// La silueta blanca se usa grande (marcas de agua de ~520 px), por eso va a más resolución
await (await white(await crop(MARK).resize({ height: 300 }).png().toBuffer())).toFile(path.join(OUT, 'logo-mark-white.png'));

const textBuf = await crop(TEXT).resize({ height: 96 }).png(png).toBuffer();
writeFileSync(path.join(OUT, 'logo-text.png'), textBuf);
await (await white(textBuf)).toFile(path.join(OUT, 'logo-text-light.png'));

// Íconos cuadrados: el símbolo centrado con un pequeño margen
async function squareIcon(size, { pad = 0.06, background = { r: 0, g: 0, b: 0, alpha: 0 } } = {}) {
  const inner = Math.round(size * (1 - pad * 2));
  const mark = await crop(MARK).resize({ width: inner, height: inner, fit: 'inside' }).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: mark, gravity: 'center' }]).png(png).toBuffer();
}

writeFileSync(path.join(OUT, 'icon-192.png'), await squareIcon(192));
writeFileSync(path.join(OUT, 'icon-512.png'), await squareIcon(512));
writeFileSync(path.join(OUT, 'apple-touch-icon.png'), await squareIcon(180, { pad: 0.14, background: { r: 255, g: 255, b: 255, alpha: 1 } }));

// favicon.ico con PNG embebidos (formato admitido por todos los navegadores actuales)
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(s => squareIcon(s, { pad: 0.02 })));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const entries = sizes.map((s, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(s, 0); e.writeUInt8(s, 1); e.writeUInt8(0, 2); e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
  e.writeUInt32LE(images[i].length, 8); e.writeUInt32LE(offset, 12);
  offset += images[i].length;
  return e;
});
writeFileSync(path.join(ROOT, 'public/favicon.ico'), Buffer.concat([header, ...entries, ...images]));

console.log('[logo] recursos generados en public/brand y public/favicon.ico');
