/* Servidor local de vista previa (opcional, solo para probar en tu computadora).
   Uso:   node build/servidor.mjs          → http://localhost:5173
          node build/servidor.mjs 8080     → otro puerto
   Sirve los archivos tal cual, con compresión gzip como lo haría el hosting real. */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const raiz = path.resolve(import.meta.dirname, "..");
const puerto = Number(process.argv[2]) || 5173;
const tipos = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".webp": "image/webp",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8", ".xml": "application/xml; charset=utf-8", ".md": "text/markdown; charset=utf-8"
};
const comprimibles = /^(text|application\/(javascript|json|manifest\+json|xml))/;

http.createServer((req, res) => {
  let ruta = decodeURIComponent(req.url.split("?")[0]);
  if (ruta === "/") ruta = "/index.html";
  const archivo = path.join(raiz, ruta);
  if (!archivo.startsWith(raiz) || !fs.existsSync(archivo) || fs.statSync(archivo).isDirectory()) {
    const e404 = path.join(raiz, "404.html");
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(fs.existsSync(e404) ? fs.readFileSync(e404) : "404");
  }
  const tipo = tipos[path.extname(archivo).toLowerCase()] || "application/octet-stream";
  const cuerpo = fs.readFileSync(archivo);
  const cab = { "Content-Type": tipo, "Cache-Control": "no-cache" };
  if (comprimibles.test(tipo) && /\bgzip\b/.test(req.headers["accept-encoding"] || "")) {
    cab["Content-Encoding"] = "gzip";
    res.writeHead(200, cab);
    return res.end(zlib.gzipSync(cuerpo, { level: 9 }));
  }
  res.writeHead(200, cab);
  res.end(cuerpo);
}).listen(puerto, () => {
  console.log(`\n  Taller Creativo EK · vista previa local`);
  console.log(`  →  http://localhost:${puerto}\n`);
  console.log(`  Páginas:  /  ·  /tienda.html  ·  /categoria.html?cat=navidad  ·  /articulo.html?id=porta-uvas-mdf-personalizado  ·  /carrito.html  ·  /blog.html  ·  /contacto.html\n`);
});
