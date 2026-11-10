/* Sella la versión de los assets en todas las páginas.
   Uso:  node build/sellar-version.mjs   (se ejecuta solo tras generar-paginas)

   PROBLEMA QUE RESUELVE: el .htaccess guarda el CSS y el JS en la caché del
   navegador. Sin un número de versión en la URL, tu navegador seguiría
   mostrando el diseño viejo aunque los archivos ya sean nuevos.
   Aquí se calcula una huella (hash) del contenido y se pega como ?v=…
   Si cambia una sola letra del CSS o del JS, cambia la URL y el navegador
   se ve obligado a descargarlo de nuevo.                                      */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const raiz = path.resolve(import.meta.dirname, "..");
const assets = [
  "assets/ek.css", "assets/ek.js", "assets/ek-config.js", "assets/ek-data.js",
  "assets/ek-subcategorias.js", "assets/ek-imagenes.js", "assets/ek-blog.js"
];

const h = crypto.createHash("sha1");
let bytes = 0;
for (const a of assets) {
  const p = path.join(raiz, a);
  if (!fs.existsSync(p)) continue;
  const b = fs.readFileSync(p);
  bytes += b.length;
  h.update(a).update(b);
}
const version = h.digest("hex").slice(0, 10);
const sello = version + "-" + new Date().toISOString().slice(0, 10);

let n = 0;
for (const f of fs.readdirSync(raiz).filter((x) => x.endsWith(".html"))) {
  const r = path.join(raiz, f);
  let html = fs.readFileSync(r, "utf8");
  const antes = html;

  // ?v=… en todas las referencias a assets/ek*.css|js (sin duplicar)
  html = html.replace(/(assets\/ek[\w-]*\.(?:css|js))(\?v=[\w.\-]+)?/g, "$1?v=" + version);

  // Sello visible en el código fuente, para comprobar qué versión estás viendo
  const meta = '<meta name="ek-version" content="' + sello + '">';
  if (/<meta name="ek-version"/.test(html)) html = html.replace(/<meta name="ek-version"[^>]*>/, meta);
  else html = html.replace(/(<meta name="theme-color"[^>]*>)/, "$1\n" + meta);

  if (html !== antes) { fs.writeFileSync(r, html, "utf8"); n++; }
  console.log("✓ " + f.padEnd(22) + "v=" + version);
}
console.log(`\nVersión ${version} (${(bytes / 1024).toFixed(1)} KB de assets) aplicada a ${n} páginas.`);
console.log(`Sello: ${sello}`);
