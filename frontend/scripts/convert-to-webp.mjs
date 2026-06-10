// Convierte los PNG de src/assets a WebP y genera el favicon pequeno.
// Los archivos grandes usan compresion con perdida q82 (los PNG del cuarto
// son pixelart a resolucion enorme que el navegador siempre muestra reducido,
// asi que los artefactos no se perciben); los iconos pequenos quedan lossless.
// Uso: node scripts/convert-to-webp.mjs
import { readdir, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const carpeta = join(raiz, 'src', 'assets');

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

const archivos = (await readdir(carpeta)).filter((a) => a.toLowerCase().endsWith('.png'));
let totalAntes = 0;
let totalDespues = 0;

for (const archivo of archivos) {
  const origen = join(carpeta, archivo);
  const destino = origen.replace(/\.png$/i, '.webp');
  const antes = (await stat(origen)).size;
  const opciones = antes < 50 * 1024
    ? { lossless: true, effort: 6 }
    : { quality: 82, alphaQuality: 90, smartSubsample: true, effort: 6 };
  await sharp(origen).webp(opciones).toFile(destino);
  const despues = (await stat(destino)).size;
  totalAntes += antes;
  totalDespues += despues;
  console.log(`${archivo}: ${kb(antes)} -> ${kb(despues)} (${Math.round((1 - despues / antes) * 100)}% menos)`);
}

console.log(`\nTOTAL: ${kb(totalAntes)} -> ${kb(totalDespues)} (${Math.round((1 - totalDespues / totalAntes) * 100)}% menos)`);

// Favicon: version pequena de la cara en public/
await sharp(join(carpeta, 'cara1.webp'))
  .resize(64, 64, { kernel: 'nearest' })
  .png()
  .toFile(join(raiz, 'public', 'favicon.png'));
console.log('favicon.png (64x64) generado en public/');
