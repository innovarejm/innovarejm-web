/**
 * Genera versiones WebP (640 y 1200 px de ancho) de todas las fotos que usa el sitio,
 * junto a cada .jpg: 01.jpg → 01-640.webp, 01-1200.webp.
 *
 * Uso: npm run images  (también corre antes de cada build; salta las que ya existen).
 * Al agregar fotos nuevas a una propiedad no hace falta nada más.
 */
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const WIDTHS = [640, 1200];

const { PROPERTIES, DESTINOS } = await import(pathToFileURL(path.join(ROOT, 'src/data/properties.js')).href);

const srcs = new Set([
  ...PROPERTIES.flatMap(p => p.galeria),
  ...Object.values(DESTINOS).map(d => d.img),
]);

async function mtime(file) {
  try { return (await stat(file)).mtimeMs; } catch { return 0; }
}

let made = 0;
for (const src of srcs) {
  const input = path.join(PUBLIC, src);
  const inTime = await mtime(input);
  if (!inTime) { console.warn(`[images] no existe: ${src}`); continue; }
  for (const w of WIDTHS) {
    const output = input.replace(/\.jpe?g$/i, `-${w}.webp`);
    if (await mtime(output) >= inTime) continue;
    await sharp(input).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 72 }).toFile(output);
    made++;
  }
}
// Imagen para compartir (WhatsApp, Facebook…): 1200×630 a partir de la portada de cada alojamiento
const ogs = [
  ...PROPERTIES.map(p => [p.galeria[0], path.posix.join(path.posix.dirname(p.galeria[0]), 'og.jpg')]),
  ['/images/hero-poster.jpg', '/images/og-home.jpg'],
];
for (const [src, out] of ogs) {
  const input = path.join(PUBLIC, src);
  const output = path.join(PUBLIC, out);
  const inTime = await mtime(input);
  if (!inTime || await mtime(output) >= inTime) continue;
  await sharp(input).rotate().resize(1200, 630, { fit: 'cover', position: 'attention' }).jpeg({ quality: 78, mozjpeg: true }).toFile(output);
  made++;
}

console.log(`[images] ${srcs.size} fotos revisadas, ${made} archivos generados`);
