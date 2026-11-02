// Genera los iconos PWA de public/icons a partir de los SVG de esta carpeta.
// Uso: npm install --no-save sharp; node scripts/iconos/generar.mjs
import { readdir, readFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const origen = new URL('./', import.meta.url);
const destino = new URL('../../public/icons/', import.meta.url);

const iconos = [
  ['icono.svg', 192, 'icon-192x192.png'],
  ['icono.svg', 512, 'icon-512x512.png'],
  ['icono-completo.svg', 192, 'icon-maskable-192x192.png'],
  ['icono-completo.svg', 512, 'icon-maskable-512x512.png'],
  ['icono-completo.svg', 180, 'apple-touch-icon.png'],
];

for (const archivo of await readdir(destino)) {
  if (archivo.endsWith('.png')) await rm(new URL(archivo, destino));
}

for (const [svg, tamano, salida] of iconos) {
  const entrada = await readFile(new URL(svg, origen));
  await sharp(entrada)
    .resize(tamano, tamano)
    .png()
    .toFile(fileURLToPath(new URL(salida, destino)));
  console.log(`${salida} (${tamano}x${tamano})`);
}