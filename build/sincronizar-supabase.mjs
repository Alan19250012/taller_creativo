// ============================================================================
//  TALLER CREATIVO EK · Sincroniza Supabase → archivos estáticos (build SSG)
// ----------------------------------------------------------------------------
//  Lee la base de datos (Supabase/PostgREST con service role key) y regenera:
//    · assets/ek-data.js          (categorías, banners, productos, reseñas, FAQ)
//    · assets/ek-config.js        (configuración de la interfaz)
//    · assets/ek-subcategorias.js (56 subcategorías + relaciones)
//    · assets/ek-blog-data.js     (artículos del blog)
//
//  Uso:
//    · Local:        node build/sincronizar-supabase.mjs   (lee ../.env o .env)
//    · Cloudflare Pages: se ejecuta como "build command" (lee process.env)
//
//  A prueba de fallos: si Supabase no tiene datos (seed no ejecutado), NO
//  sobrescribe los archivos y termina con un aviso.
// ============================================================================
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(__dirname, "..");

// ---------------------------------------------------------------------------
// 1. Carga de variables de entorno
// ---------------------------------------------------------------------------
function cargarEnv() {
  const candidatos = [join(RAIZ, ".env"), join(RAIZ, "..", ".env")];
  for (const archivo of candidatos) {
    if (!existsSync(archivo)) continue;
    const lineas = readFileSync(archivo, "utf8").split(/\r?\n/);
    for (const linea of lineas) {
      const l = linea.trim();
      if (!l || l.startsWith("#") || !l.includes("=")) continue;
      const i = l.indexOf("=");
      const k = l.slice(0, i).trim();
      const v = l.slice(i + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[k]) process.env[k] = v;
    }
  }
}
cargarEnv();

function pedir(k) {
  const v = process.env[k];
  if (!v) {
    console.error(`\n❌ Falta la variable de entorno ${k}`);
    console.error("   En local: créala en un archivo .env (ver DEPLOY.md)");
    console.error("   En Cloudflare Pages: Settings → Environment variables → Production\n");
    process.exit(1);
  }
  return v;
}

const URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || pedir("SUPABASE_URL");
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || pedir("SUPABASE_SERVICE_ROLE_KEY");

// ---------------------------------------------------------------------------
// 2. Cliente PostgREST mínimo
// ---------------------------------------------------------------------------
async function pg(tabla, query = "") {
  const url = `${URL}/rest/v1/${tabla}${query ? "?" + query : ""}`;
  const res = await fetch(url, {
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Supabase ${tabla}: HTTP ${res.status} ${await res.text()}`);
  }
  return res.json();
}

function mapPorId(filas, campoSlug = "slug") {
  const m = {};
  filas.forEach((f) => (m[f.id] = f[campoSlug]));
  return m;
}

// ---------------------------------------------------------------------------
// 3. Reconstrucción
// ---------------------------------------------------------------------------
function badge(p) {
  if (p.nuevo) return "nuevo";
  if (p.liquidacion) return "promo";
  if (p.destacado) return "top";
  return "";
}

// Tipos de las claves de configuración (para reconstruir EK_CONFIG)
const CFG_JSON = new Set(["pagos", "hotlink", "colores", "talleres"]);
const CFG_NUM = new Set(["iva", "envio", "envioGratisDesde", "porPagina", "particulasMax"]);
const CFG_BOOL = new Set(["particulas", "aos", "animaciones"]);
function tipificar(clave, valor) {
  if (CFG_JSON.has(clave)) { try { return JSON.parse(valor); } catch { return valor; } }
  if (CFG_NUM.has(clave)) return Number(valor);
  if (CFG_BOOL.has(clave)) return valor === "true";
  return valor;
}

function emitir(ruta, cabecera, cuerpo) {
  const txt = cabecera + "\n" + cuerpo + "\n";
  writeFileSync(ruta, txt, "utf8");
  console.log("  ✔ " + ruta.replace(RAIZ + "\\", "").replace(RAIZ + "/", ""));
}

// ---------------------------------------------------------------------------
// 4. Ejecución
// ---------------------------------------------------------------------------
async function main() {
  console.log("🔄 Sincronizando Supabase → archivos estáticos...\n");

  const [categorias, subcategorias, productos, banners, articulos, resenas, config, cupones, variantes, relPC, relPS, relCS] =
    await Promise.all([
      pg("Categoria", "select=*&order=orden.asc"),
      pg("Subcategoria", "select=*&order=orden.asc"),
      pg("Producto", "select=*&order=nombre.asc"),
      pg("Banner", "select=*&order=orden.asc"),
      pg("Articulo", "select=*&order=creadoEn.asc"),
      pg("Resena", "select=*&aprobada=eq.true&order=creadoEn.desc"),
      pg("Configuracion", "select=clave,valor"),
      pg("Cupon", "select=*"),
      pg("Variante", "select=productoId,talla,color,stock,precio"),
      pg("_CategoriaToProducto", "select=A,B"),
      pg("_ProductoToSubcategoria", "select=A,B"),
      pg("_CategoriaToSubcategoria", "select=A,B"),
    ]);

  // A prueba de fallos: sin datos = seed no ejecutado → no tocar nada.
  if ((!categorias || categorias.length === 0) && (!productos || productos.length === 0)) {
    console.error("⚠️  Supabase respondió sin categorías ni productos.");
    console.error("    ¿Ya ejecutaste schema.sql y luego seed.sql en el SQL Editor?\n");
    console.error("    No se sobrescribió ningún archivo.\n");
    process.exit(0);
  }

  const catSlug = mapPorId(categorias);
  const subSlug = mapPorId(subcategorias);
  const prodSlug = mapPorId(productos);

  // Relaciones slug → lista
  const prodCats = {};   // producto → [categorías]
  const prodSubs = {};   // producto → [subcategorías]
  const catSubs = {};    // categoría → [subcategorías]
  productos.forEach((p) => { prodCats[p.slug] = []; prodSubs[p.slug] = []; });
  categorias.forEach((c) => { catSubs[c.slug] = []; });

  (relPC || []).forEach((r) => {
    const c = catSlug[r.A], p = prodSlug[r.B];
    if (c && p && prodCats[p]) prodCats[p].push(c);
  });
  (relPS || []).forEach((r) => {
    const p = prodSlug[r.A], s = subSlug[r.B];
    if (p && s && prodSubs[p]) prodSubs[p].push(s);
  });
  (relCS || []).forEach((r) => {
    const c = catSlug[r.A], s = subSlug[r.B];
    if (c && s && catSubs[c]) catSubs[c].push(s);
  });

  // ---- ek-data.js ----
  const categoriasJS = categorias.map((c) => ({
    s: c.slug, n: c.nombre, g: c.grupo || "producto", e: c.emoji || "🎁",
    orden: c.orden, nav: c.enNav !== false, kw: c.keywords || "", d: c.descripcion || "",
    epoca: c.epoca || undefined,
  }));

  const bannersJS = banners.map((b) => ({
    n: b.titulo, sub: b.subtitulo || "", cta: b.boton || "Ver más", link: b.enlace || "#",
    kw: b.keywords || "", et: b.etiqueta || "", tema: b.tema || "rojo",
  }));

  // Variantes por producto: slug → [{talla,color,stock}]
  const prodVariantes = {};
  productos.forEach((p) => { prodVariantes[p.slug] = []; });
  (variantes || []).forEach((v) => {
    const s = prodSlug[v.productoId];
    if (s && prodVariantes[s]) prodVariantes[s].push({ talla: v.talla || null, color: v.color || null, stock: v.stock || 0, precio: v.precio || null });
  });

  const productosJS = productos.map((p) => ({
    n: p.nombre, s: p.slug, p: p.precioMinorista, a: p.precioAnterior || 0,
    pd: p.precioDistribuidor || null,  // precio de distribuidor (solo lo ven los distribuidores)
    imagen: p.imagen || null,
    imagenes: p.imagenes || [],       // 1-5 imágenes
    imagen_personalizacion: p.imagen_personalizacion || null,
    personalizable: !!p.personalizable,
    print_area: p.print_area || null,  // área de personalización {x,y,width,height} en %
    c: prodCats[p.slug] || [], col: p.colores || [], t: p.tallas || [],
    st: p.stock, v: p.vendidos, r: p.calificacion, b: badge(p),
    d: p.descripcion || "", f: p.caracteristicas || [], kw: p.keywords || "",
    variantes: prodVariantes[p.slug] || [],
  }));

  const resenasJS = resenas.map((r) => ({
    n: r.autor, c: r.ciudad || "", e: r.estrellas, f: r.fecha || "",
    p: prodSlug[r.productoId] || "", t: r.comentario,
  }));

  // Cupones activos → { CODIGO: {tipo,val,min,txt} } (lo que espera el checkout)
  const cuponesJS = {};
  (cupones || []).forEach((c) => {
    if (c.activo !== false) cuponesJS[c.codigo] = { tipo: c.tipo, val: c.valor, min: c.minimo, txt: c.texto || "" };
  });

  const confMap = {};
  config.forEach((c) => (confMap[c.clave] = c.valor));
  let faq = [];
  try { faq = JSON.parse(confMap.faq || "[]"); } catch { faq = []; }

  emitir(join(RAIZ, "assets", "ek-data.js"),
    "/* GENERADO por build/sincronizar-supabase.mjs — NO editar a mano */\nwindow.EK_DATA = ",
    JSON.stringify({ categorias: categoriasJS, banners: bannersJS, productos: productosJS, resenas: resenasJS, faq }, null, 1) + ";\n\nwindow.EK_CUPONES = " + JSON.stringify(cuponesJS, null, 1) + ";");

  // ---- ek-config.js ----
  const EK_CONFIG = {};
  Object.keys(confMap).forEach((k) => {
    if (k === "faq") return; // la FAQ va en ek-data.js
    EK_CONFIG[k] = tipificar(k, confMap[k]);
  });
  emitir(join(RAIZ, "assets", "ek-config.js"),
    "/* GENERADO por build/sincronizar-supabase.mjs — NO editar a mano */\nwindow.EK_CONFIG = ",
    JSON.stringify(EK_CONFIG, null, 2) + ";");

  // ---- ek-subcategorias.js ----
  const conteo = {}; // subcategoría → nº productos
  Object.keys(prodSubs).forEach((p) => (prodSubs[p] || []).forEach((s) => (conteo[s] = (conteo[s] || 0) + 1)));
  const listaSub = subcategorias.map((s) => ({
    s: s.slug, n: s.nombre, i: s.icono || "bi-tag", cats: catSubs2List(s.slug), c: conteo[s.slug] || 0,
  }));
  function catSubs2List(subSlug) {
    const out = [];
    Object.keys(catSubs).forEach((c) => { if ((catSubs[c] || []).includes(subSlug)) out.push(c); });
    return out;
  }
  emitir(join(RAIZ, "assets", "ek-subcategorias.js"),
    "/* GENERADO por build/sincronizar-supabase.mjs — NO editar a mano */\nwindow.EK_SUBCATS = ",
    JSON.stringify({ lista: listaSub, mapa: prodSubs, porCat: catSubs }, null, 1) + ";");

  // ---- ek-blog-data.js ----
  const posts = articulos
    .filter((a) => a.publicado)
    .map((a) => ({
      s: a.slug, t: a.titulo, r: a.resumen || "", f: a.fecha || "", a: a.autor || "",
      c: a.categoria || "", kw: a.keywords || "", min: a.minutos || 4, h: a.contenido || "",
    }));
  emitir(join(RAIZ, "assets", "ek-blog-data.js"),
    "/* GENERADO por build/sincronizar-supabase.mjs — NO editar a mano */\nwindow.EK_BLOG_POSTS = ",
    JSON.stringify(posts, null, 1) + ";");

  console.log(`\n✅ Listo: ${productos.length} productos · ${categorias.length} categorías · ${subcategorias.length} subcategorías · ${banners.length} banners · ${resenas.length} reseñas · ${posts.length} artículos de blog.`);
}

main().catch((e) => {
  console.error("\n❌ Error de sincronización:", e.message);
  process.exit(1);
});
