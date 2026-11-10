/* Verificador de la base de datos de Taller Creativo EK.
   Uso:  node build/verificar.mjs
   Revisa: conteos, slugs duplicados, categorías inexistentes, tallas 3-5,
   campos faltantes, artículos por categoría y peso real de los archivos.      */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const raiz = path.resolve(import.meta.dirname, "..");
const leer = (p) => fs.readFileSync(path.join(raiz, p), "utf8");

const ctx = { window: {}, console };
vm.createContext(ctx);
vm.runInContext(leer("assets/ek-config.js"), ctx);
vm.runInContext(leer("assets/ek-data.js"), ctx);

const CFG = ctx.window.EK_CONFIG;
const DAT = ctx.window.EK_DATA;
const P = DAT.productos, C = DAT.categorias;

const errores = [], avisos = [];
const slugs = new Set(), cats = new Set(C.map((c) => c.s));

if (P.length !== 100) avisos.push(`Se esperaban 100 artículos, hay ${P.length}.`);
if (DAT.banners.length > 10) errores.push("Hay más de 10 banners.");

for (const p of P) {
  const id = p.s || "(sin slug)";
  if (!p.n) errores.push(`${id}: falta nombre`);
  if (!p.s) errores.push(`${id}: falta slug`);
  if (slugs.has(p.s)) errores.push(`Slug duplicado: ${p.s}`);
  slugs.add(p.s);
  if (typeof p.p !== "number" || p.p <= 0) errores.push(`${id}: precio inválido`);
  if (!Array.isArray(p.t) || p.t.length < 3 || p.t.length > 5) errores.push(`${id}: tallas fuera de rango (${(p.t || []).length})`);
  if (!Array.isArray(p.col) || !p.col.length) errores.push(`${id}: sin colores`);
  if (!Array.isArray(p.f) || p.f.length < 3) errores.push(`${id}: menos de 3 características`);
  if (typeof p.st !== "number") errores.push(`${id}: sin stock`);
  if (typeof p.v !== "number") errores.push(`${id}: sin ventas`);
  if (typeof p.r !== "number" || p.r < 0 || p.r > 5) errores.push(`${id}: rating inválido`);
  if (!p.d || p.d.length < 20) avisos.push(`${id}: descripción corta muy breve`);
  if (!p.kw) errores.push(`${id}: sin palabras clave de imagen`);
  for (const c of p.c || []) if (!cats.has(c)) errores.push(`${id}: categoría inexistente "${c}"`);
}

const conteo = {};
for (const p of P) for (const c of p.c) conteo[c] = (conteo[c] || 0) + 1;
for (const c of C) if (!conteo[c.s]) avisos.push(`Categoría sin artículos: ${c.s}`);

const peso = (p) => (fs.statSync(path.join(raiz, p)).size / 1024).toFixed(1) + " KB";
console.log("=== TALLER CREATIVO EK · VERIFICACIÓN ===");
console.log(`Artículos:      ${P.length}`);
console.log(`Categorías:     ${C.length}`);
console.log(`Banners:        ${DAT.banners.length}`);
console.log(`Reseñas:        ${DAT.resenas.length}`);
console.log(`FAQ:            ${DAT.faq.length}`);
console.log(`Slugs únicos:   ${slugs.size}`);
console.log(`Colores únicos: ${new Set(P.flatMap((p) => p.col)).size}`);
console.log(`Ventas totales: ${P.reduce((a, p) => a + p.v, 0).toLocaleString("es-MX")}`);
console.log(`Stock total:    ${P.reduce((a, p) => a + p.st, 0).toLocaleString("es-MX")}`);
console.log(`Precio mín/máx: $${Math.min(...P.map((p) => p.p))} / $${Math.max(...P.map((p) => p.p))}`);
console.log("\nArtículos por categoría:");
for (const c of C) console.log(`  ${String(conteo[c.s] || 0).padStart(3)}  ${c.e} ${c.s.padEnd(16)} ${c.n}`);
console.log("\nPeso de archivos base:");
for (const f of ["assets/ek-config.js", "assets/ek-data.js"]) console.log(`  ${peso(f).padStart(9)}  ${f}`);
console.log(`\nErrores: ${errores.length}`);
errores.forEach((e) => console.log("  ✗ " + e));
console.log(`Avisos: ${avisos.length}`);
avisos.forEach((a) => console.log("  ! " + a));
process.exit(errores.length ? 1 : 0);
