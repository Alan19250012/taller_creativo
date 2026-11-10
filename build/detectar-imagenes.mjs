/* Detecta QUÉ imágenes ya subiste y genera assets/ek-imagenes.js
   Uso:  node build/detectar-imagenes.mjs
   Con esto el sitio usa tus archivos en cuanto existen (cero configuración y
   cero peticiones fallidas al servidor). Vuelve a correrlo cada vez que subas
   fotos nuevas.                                                              */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const raiz = path.resolve(import.meta.dirname, "..");
const leer = (p) => (fs.existsSync(path.join(raiz, p)) ? fs.readFileSync(path.join(raiz, p), "utf8") : "");
const ctx = { window: {}, console };
vm.createContext(ctx);
vm.runInContext(leer("assets/ek-config.js"), ctx);
vm.runInContext(leer("assets/ek-data.js"), ctx);
try { vm.runInContext(leer("assets/ek-blog.js"), ctx); } catch { }

const CFG = ctx.window.EK_CONFIG;
const DAT = ctx.window.EK_DATA;
const BLOG = ctx.window.EK_BLOG || { posts: [] };
const ext = CFG.extImagenes || "webp";
const hay = (rel) => fs.existsSync(path.join(raiz, rel));

/* Artículos: ¿qué fotos (-1, -2, -3) existen de cada slug? */
const productos = {};
for (const p of DAT.productos) {
  const tengo = [1, 2, 3].filter((i) => hay(`img/productos/${p.s}-${i}.${ext}`));
  if (tengo.length) productos[p.s] = tengo;
}

/* Categorías: un archivo por slug */
const categorias = DAT.categorias.filter((c) => hay(`img/categorias/${c.s}.${ext}`)).map((c) => c.s);

/* Banners: banner-01 … banner-10 */
const banner = [];
for (let i = 1; i <= Math.min(10, DAT.banners.length); i++) {
  if (hay(`img/banner/banner-${String(i).padStart(2, "0")}.${ext}`)) banner.push(i);
}

/* Blog: portada e interior */
const blog = {};
for (const p of BLOG.posts) {
  const tengo = [1, 2].filter((i) => hay(`img/blog/${p.s}-${i}.${ext}`));
  if (tengo.length) blog[p.s] = tengo;
}

const total = Object.values(productos).reduce((a, v) => a + v.length, 0) + categorias.length + banner.length + Object.values(blog).reduce((a, v) => a + v.length, 0);
const salida = `/* ============================================================================
   TALLER CREATIVO EK · IMÁGENES LOCALES DETECTADAS  (assets/ek-imagenes.js)
   ----------------------------------------------------------------------------
   GENERADO AUTOMÁTICAMENTE por:  node build/detectar-imagenes.mjs
   NO LO EDITES A MANO. Vuelve a correr el comando cuando subas fotos nuevas.
   Lista qué archivos de /img ya existen para que el sitio los use solos y no
   haga ni una sola petición fallida al servidor.
   Detectadas el ${new Date().toLocaleString("es-MX")} · ${total} archivos
   ========================================================================== */
window.EK_IMG_LOCAL = {
  generado: ${JSON.stringify(new Date().toISOString())},
  ext: ${JSON.stringify(ext)},
  // slug del artículo → números de foto que ya subiste
  productos: ${JSON.stringify(productos)},
  // slugs de categoría con imagen propia
  categorias: ${JSON.stringify(categorias)},
  // números de banner que ya subiste (1 = banner-01)
  banner: ${JSON.stringify(banner)},
  // slug del post → números de imagen que ya subiste
  blog: ${JSON.stringify(blog)}
};
`;
fs.writeFileSync(path.join(raiz, "assets", "ek-imagenes.js"), salida, "utf8");

console.log("=== IMÁGENES LOCALES DETECTADAS ===");
console.log(`Artículos   : ${Object.keys(productos).length} de ${DAT.productos.length}  (${total - categorias.length - banner.length - Object.values(blog).reduce((a, v) => a + v.length, 0)} fotos)`);
console.log(`Categorías  : ${categorias.length} de ${DAT.categorias.length}`);
console.log(`Banners     : ${banner.length} de ${Math.min(10, DAT.banners.length)}  → ${banner.map((i) => String(i).padStart(2, "0")).join(", ") || "ninguno"}`);
console.log(`Blog        : ${Object.keys(blog).length} de ${BLOG.posts.length}`);
console.log(`\n✓ assets/ek-imagenes.js  (${(Buffer.byteLength(salida) / 1024).toFixed(1)} KB, ${total} archivos)`);
