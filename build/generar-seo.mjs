/* Genera IMAGENES.md y sitemap.xml a partir de assets/ek-data.js (y del blog si existe).
   Uso:  node build/generar-seo.mjs
   Vuelve a correrlo cada vez que agregues artículos: la lista de nombres de
   imagen y el sitemap se actualizan solos.                                     */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const raiz = path.resolve(import.meta.dirname, "..");
const leer = (p) => (fs.existsSync(path.join(raiz, p)) ? fs.readFileSync(path.join(raiz, p), "utf8") : "");
const ctx = { window: {}, console };
vm.createContext(ctx);
vm.runInContext(leer("assets/ek-config.js"), ctx);
vm.runInContext(leer("assets/ek-data.js"), ctx);
try { vm.runInContext(leer("assets/ek-blog.js"), ctx); } catch { /* el blog es opcional */ }

const CFG = ctx.window.EK_CONFIG;
const DAT = ctx.window.EK_DATA;
const BLOG = ctx.window.EK_BLOG || { posts: [] };
const ext = CFG.extImagenes || "webp";

/* ---------------------- CARPETAS DE IMÁGENES ---------------------- */
const carpetas = ["img/productos", "img/banner", "img/categorias", "img/blog", "img/logo", "img/favicon"];
for (const c of carpetas) {
  fs.mkdirSync(path.join(raiz, c), { recursive: true });
  const leeme = path.join(raiz, c, "_LEEME.txt");
  if (!fs.existsSync(leeme)) {
    fs.writeFileSync(leeme,
      `Carpeta: ${c}\r\n` +
      `Coloca aquí las imágenes de esta sección.\r\n` +
      `Nombres y formatos exactos: revisa IMAGENES.md en la raíz del proyecto.\r\n` +
      `Formato recomendado: ${ext.toUpperCase()} · peso máximo 120 KB por imagen.\r\n`, "utf8");
  }
}

/* ---------------------------- IMAGENES.MD ---------------------------- */
let md = `# 📸 IMAGENES.md · Taller Creativo EK

Guía completa de **nombres, formatos y tamaños** de todas las imágenes del sitio.
Solo tienes que respetar el **nombre exacto** y subir el archivo a la carpeta indicada.

> ⚠️ **No tienes que configurar nada.** El sitio detecta solo qué archivos ya
> subiste (\`assets/ek-imagenes.js\`) y usa tus fotos en cuanto existen; lo que
> falte se trae de fuera (hotlinking a loremflickr.com, **0 peso en tu servidor**).
> Si algún archivo local falla, la imagen cae a la foto externa: nunca se ve rota.
>
> Después de subir fotos nuevas, corre este comando para que las detecte:
> \`\`\`bash
> node build/detectar-imagenes.mjs
> \`\`\`

---

## 1. Formato recomendado

| Uso | Carpeta | Tamaño en píxeles | Proporción | Formato | Peso máx. |
|---|---|---|---|---|---|
| Foto de artículo (3 por artículo) | \`img/productos/\` | **1000 × 1000** | 1:1 cuadrada | **.${ext}** | 120 KB |
| Banner de portada (máx. 10) | \`img/banner/\` | **1600 × 1000** | 16:10 | **.${ext}** | 180 KB |
| Foto de categoría | \`img/categorias/\` | **600 × 420** | 10:7 | **.${ext}** | 60 KB |
| Portada de blog | \`img/blog/\` | **1200 × 675** | 16:9 | **.${ext}** | 140 KB |
| Logo | \`img/logo/\` | libre (alto 46 px visible) | vectorial | **.svg** (respaldo .png 512×512) | 40 KB |
| Favicon | \`img/favicon/\` | 32×32 · 180×180 · 48×48 | cuadrada | .ico · .png | 15 KB |
| Imagen para compartir | \`img/banner/\` | **1200 × 630** | 1.91:1 | .jpg | 200 KB |

**Reglas de oro**
1. Nombres **en minúsculas, sin acentos, sin espacios y sin ñ** (usa guiones).
2. La extensión debe ser exactamente la configurada en \`extImagenes\` (ahora: **${ext}**).
3. Comprime antes de subir: <https://squoosh.app> o <https://tinypng.com>.
4. Si usas otro formato (jpg/png), cámbialo en \`assets/ek-config.js\` → \`extImagenes: "jpg"\`.

### Convertir todas tus fotos a ${ext} de una sola vez (Windows + PowerShell)
\`\`\`powershell
# Opción A: con ImageMagick instalado (magick)
Get-ChildItem *.jpg | ForEach-Object { magick "$($_.Name)" -resize 1000x1000^ -gravity center -extent 1000x1000 -quality 78 "$($_.BaseName).${ext}" }

# Opción B: con ffmpeg
Get-ChildItem *.jpg | ForEach-Object { ffmpeg -i "$($_.Name)" -vf "scale=1000:1000:force_original_aspect_ratio=increase,crop=1000:1000" -q:v 78 "$($_.BaseName).${ext}" }
\`\`\`

---

## 2. 🎯 LOGO Y FAVICON (dónde van exactamente)

| Archivo | Carpeta | Medidas | Notas |
|---|---|---|---|
| \`logo-taller-creativo-ek.png\` | \`img/logo/\` | **1484 × 689 px** (2.15:1), fondo transparente | **El único logo del sitio.** Cabecera a 54 px de alto y pie a 62 px sobre tarjeta blanca. **Sin texto al lado**: el logo ya dice "Taller Creativo EK" |
| \`favicon.ico\` | \`img/favicon/\` | 48 × 48 px (multi 16/32/48) | Icono de la pestaña del navegador |
| \`favicon-32x32.png\` | \`img/favicon/\` | 32 × 32 px | ✅ ya generado desde tu logo |
| \`apple-touch-icon.png\` | \`img/favicon/\` | 180 × 180 px | ✅ ya generado (monograma EK en círculo) |
| \`icono-512.png\` | \`img/favicon/\` | 512 × 512 px | ✅ ya generado, para el manifest de la app |
| \`og-taller-creativo-ek.jpg\` | \`img/banner/\` | 1200 × 630 px | Vista previa al compartir en WhatsApp/Facebook |

> Los tres PNG de \`img/favicon/\` se generan solos desde tu logo con
> \`node build/generar-favicons.mjs\` (recorta el monograma EK y lo centra sobre blanco).
> Si cambias el logo, vuelve a correrlo.

**Colores de marca:** rojo \`${CFG.colores.rojo}\` · azul \`${CFG.colores.azul}\`.
El nombre del archivo del logo se configura en \`assets/ek-config.js\` → \`logo\`.

---

## 3. Banners de portada (máximo 10)

| # | Archivo | Tema del banner |
|---|---|---|
`;
DAT.banners.slice(0, 10).forEach((b, i) => {
  md += `| ${i + 1} | \`img/banner/banner-${String(i + 1).padStart(2, "0")}.${ext}\` | ${b.n.replace(/\|/g, "/")} |\n`;
});
md += `
> El sitio admite **hasta 10 banners** rotando automáticamente. Si subes menos, edita la
> lista \`banners\` en \`assets/ek-data.js\` (puedes borrar los que no uses).

---

## 4. Fotos de categoría (${DAT.categorias.length} archivos)

| Categoría | Archivo |
|---|---|
`;
DAT.categorias.forEach((c) => { md += `| ${c.e} ${c.n} | \`img/categorias/${c.s}.${ext}\` |\n`; });

md += `
---

## 5. Fotos de artículos (${DAT.productos.length} artículos × 3 fotos = ${DAT.productos.length * 3} archivos)

Cada artículo necesita **3 fotos**: la 1 es la principal, la 2 y la 3 se ven en la ficha
y como segunda imagen al pasar el mouse.

`;
const grupos = {};
DAT.productos.forEach((p) => { const g = p.c[0]; (grupos[g] = grupos[g] || []).push(p); });
for (const c of DAT.categorias) {
  if (!grupos[c.s]) continue;
  md += `### ${c.e} ${c.n}\n\n`;
  grupos[c.s].forEach((p) => {
    md += `**${p.n}** · ${p.c.length > 1 ? "también en: " + p.c.slice(1).map((x) => (DAT.categorias.find((y) => y.s === x) || {}).n).join(", ") : "—"}\n`;
    md += "```\n" +
      `img/productos/${p.s}-1.${ext}   ← foto principal (producto completo, fondo claro)\n` +
      `img/productos/${p.s}-2.${ext}   ← segundo ángulo o detalle\n` +
      `img/productos/${p.s}-3.${ext}   ← producto en uso / empaque\n` +
      "```\n";
  });
}

if (BLOG.posts.length) {
  md += `\n---\n\n## 6. Imágenes del blog (${BLOG.posts.length} artículos × 2 fotos)\n\n`;
  BLOG.posts.forEach((p) => {
    md += `**${p.t}**\n\`\`\`\nimg/blog/${p.s}-1.${ext}   ← portada (1200×675)\nimg/blog/${p.s}-2.${ext}   ← imagen interior (1000×600)\n\`\`\`\n`;
  });
} else {
  md += `\n---\n\n## 6. Imágenes del blog\n\nPatrón de nombre: \`img/blog/<slug-del-post>-1.${ext}\` (portada 1200×675) e \`img/blog/<slug-del-post>-2.${ext}\` (interior).\n\n`;
}

md += `
---

## 7. Resumen rápido de carpetas

\`\`\`
img/
├── productos/   ${DAT.productos.length * 3} archivos   <slug>-1.${ext} · <slug>-2.${ext} · <slug>-3.${ext}
├── banner/      ${Math.min(10, DAT.banners.length) + 1} archivos   banner-01.${ext} … banner-10.${ext} + og-taller-creativo-ek.jpg
├── categorias/  ${DAT.categorias.length} archivos   <slug-categoria>.${ext}
├── blog/        ${BLOG.posts.length * 2 || "n"} archivos   <slug-post>-1.${ext} · <slug-post>-2.${ext}
├── logo/        1 archivo     logo-taller-creativo-ek.png (1484×689, fondo transparente)
└── favicon/     4 archivos    favicon.ico · favicon-32x32.png · apple-touch-icon.png · icono-512.png
\`\`\`

**Total si subes todo:** ${DAT.productos.length * 3 + Math.min(10, DAT.banners.length) + 1 + DAT.categorias.length + BLOG.posts.length * 2} imágenes.
Generado automáticamente el ${new Date().toLocaleDateString("es-MX")} · vuelve a correr \`node build/generar-seo.mjs\` cuando cambie el catálogo.
`;
fs.writeFileSync(path.join(raiz, "IMAGENES.md"), md, "utf8");
console.log("✓ IMAGENES.md", (Buffer.byteLength(md) / 1024).toFixed(1) + " KB");

/* ------------------------------ SITEMAP ------------------------------ */
const hoy = new Date().toISOString().slice(0, 10);
const U = CFG.url.replace(/\/$/, "");
let sm = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
const add = (loc, pri, freq) => { sm += `  <url><loc>${U}/${loc}</loc><lastmod>${hoy}</lastmod><changefreq>${freq}</changefreq><priority>${pri}</priority></url>\n`; };
add("index.html", "1.0", "daily");
add("tienda.html", "0.9", "daily");
DAT.categorias.forEach((c) => add(`categoria.html?cat=${c.s}`, "0.8", "weekly"));
DAT.productos.forEach((p) => add(`articulo.html?id=${p.s}`, "0.7", "weekly"));
add("blog.html", "0.7", "weekly");
BLOG.posts.forEach((p) => add(`blog-articulo.html?p=${p.s}`, "0.6", "monthly"));
add("carrito.html", "0.3", "monthly");
add("contacto.html", "0.8", "monthly");
sm += `</urlset>\n`;
fs.writeFileSync(path.join(raiz, "sitemap.xml"), sm, "utf8");
console.log(`✓ sitemap.xml  ${(DAT.productos.length + DAT.categorias.length + BLOG.posts.length + 5)} URLs`);
