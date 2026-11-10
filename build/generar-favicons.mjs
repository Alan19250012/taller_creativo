/* Genera favicon-32x32.png, apple-touch-icon.png e icono-512.png a partir de
   tu logo (img/logo/logo-taller-creativo-ek.png), recortando el monograma EK.
   Uso:  node build/generar-favicons.mjs
   No necesita librerías: lee y escribe PNG a mano (zlib de Node).            */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const raiz = path.resolve(import.meta.dirname, "..");
const origen = path.join(raiz, "img", "logo", "logo-taller-creativo-ek.png");
const destino = path.join(raiz, "img", "favicon");

/* ------------------------------- PNG: leer ------------------------------- */
function leerPNG(buf) {
  let pos = 8, w = 0, h = 0, bd = 0, ct = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos), tipo = buf.toString("ascii", pos + 4, pos + 8);
    const datos = buf.subarray(pos + 8, pos + 8 + len);
    if (tipo === "IHDR") { w = datos.readUInt32BE(0); h = datos.readUInt32BE(4); bd = datos[8]; ct = datos[9]; }
    else if (tipo === "IDAT") idat.push(datos);
    else if (tipo === "IEND") break;
    pos += 12 + len;
  }
  if (bd !== 8 || (ct !== 6 && ct !== 2)) throw new Error("Se esperaba un PNG de 8 bits RGB o RGBA");
  const bpp = ct === 6 ? 4 : 3, stride = w * bpp;
  const crudo = zlib.inflateSync(Buffer.concat(idat));
  const salida = Buffer.alloc(w * h * 4);
  let previa = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const f = crudo[y * (stride + 1)];
    const linea = Buffer.from(crudo.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? linea[x - bpp] : 0, b = previa[x], c = x >= bpp ? previa[x - bpp] : 0;
      let v = linea[x];
      if (f === 1) v += a;
      else if (f === 2) v += b;
      else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      linea[x] = v & 255;
    }
    previa = linea;
    for (let x = 0; x < w; x++) {
      salida[(y * w + x) * 4] = linea[x * bpp];
      salida[(y * w + x) * 4 + 1] = linea[x * bpp + 1];
      salida[(y * w + x) * 4 + 2] = linea[x * bpp + 2];
      salida[(y * w + x) * 4 + 3] = bpp === 4 ? linea[x * bpp + 3] : 255;
    }
  }
  return { w, h, data: salida };
}

/* ------------------------------ PNG: escribir ----------------------------- */
let tablaCRC = null;
function crc32(buf) {
  if (!tablaCRC) {
    tablaCRC = [];
    for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; tablaCRC[n] = c >>> 0; }
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = tablaCRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function trozo(tipo, datos) {
  const len = Buffer.alloc(4); len.writeUInt32BE(datos.length);
  const t = Buffer.from(tipo, "ascii");
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, datos])));
  return Buffer.concat([len, t, datos, crc]);
}
function escribirPNG(w, h, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const fila = w * 4 + 1;
  const crudo = Buffer.alloc(fila * h);
  for (let y = 0; y < h; y++) { crudo[y * fila] = 0; rgba.copy(crudo, y * fila + 1, y * w * 4, (y + 1) * w * 4); }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    trozo("IHDR", ihdr), trozo("IDAT", zlib.deflateSync(crudo, { level: 9 })), trozo("IEND", Buffer.alloc(0))
  ]);
}

/* ------------------------------- Proceso ------------------------------- */
const img = leerPNG(fs.readFileSync(origen));
console.log(`Logo leído: ${img.w}x${img.h}`);

// 1) Buscar el monograma EK: caja de píxeles no blancos en la mitad derecha
let minX = img.w, maxX = 0, minY = img.h, maxY = 0, hayAlfa = false;
const desde = Math.floor(img.w * 0.52);
for (let y = 0; y < img.h; y++) {
  for (let x = desde; x < img.w; x++) {
    const i = (y * img.w + x) * 4;
    const a = img.data[i + 3];
    if (a < 250) hayAlfa = true;
    const esFondo = a < 24 || (img.data[i] > 242 && img.data[i + 1] > 242 && img.data[i + 2] > 242);
    if (!esFondo) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
}
console.log(`Fondo transparente: ${hayAlfa ? "sí" : "no (blanco)"}`);
console.log(`Monograma EK detectado en x:${minX}-${maxX}  y:${minY}-${maxY}`);

// 2) Recorte cuadrado centrado, con 8 % de margen
const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
const lado = Math.round(Math.max(maxX - minX, maxY - minY) * 1.16);
const x0 = Math.round(cx - lado / 2), y0 = Math.round(cy - lado / 2);
console.log(`Recorte cuadrado: ${lado}x${lado} desde (${x0}, ${y0})`);

function pixel(x, y) { // sobre fondo blanco
  if (x < 0 || y < 0 || x >= img.w || y >= img.h) return [255, 255, 255];
  const i = (y * img.w + x) * 4, a = img.data[i + 3] / 255;
  return [Math.round(img.data[i] * a + 255 * (1 - a)), Math.round(img.data[i + 1] * a + 255 * (1 - a)), Math.round(img.data[i + 2] * a + 255 * (1 - a))];
}
function escalar(n) { // reducción por promedio de caja
  const out = Buffer.alloc(n * n * 4), paso = lado / n;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      let r = 0, g = 0, b = 0, c = 0;
      for (let sy = Math.floor(y * paso); sy < Math.floor((y + 1) * paso); sy++) {
        for (let sx = Math.floor(x * paso); sx < Math.floor((x + 1) * paso); sx++) {
          const p = pixel(x0 + sx, y0 + sy); r += p[0]; g += p[1]; b += p[2]; c++;
        }
      }
      const i = (y * n + x) * 4;
      out[i] = Math.round(r / c); out[i + 1] = Math.round(g / c); out[i + 2] = Math.round(b / c); out[i + 3] = 255;
    }
  }
  return out;
}

fs.mkdirSync(destino, { recursive: true });
const salidas = [["favicon-32x32.png", 32], ["apple-touch-icon.png", 180], ["icono-512.png", 512]];
for (const [nombre, n] of salidas) {
  const buf = escribirPNG(n, n, escalar(n));
  fs.writeFileSync(path.join(destino, nombre), buf);
  console.log(`✓ img/favicon/${nombre.padEnd(22)} ${n}x${n}  ${(buf.length / 1024).toFixed(1)} KB`);
}
