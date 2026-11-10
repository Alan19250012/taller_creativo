/* Prueba automática del sitio con un DOM real (jsdom).
   Uso:  node build/prueba.mjs
   Verifica que cada página cargue sin errores de JavaScript y que los
   artículos, filtros, carrito y buscador realmente se pinten.
   jsdom es solo para la prueba: NO forma parte del sitio publicado.        */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const raiz = path.resolve(import.meta.dirname, "..");
const rutaJsdom = process.env.EK_JSDOM ||
  path.join(process.env.TEMP || "/tmp", "ek-test", "node_modules", "jsdom", "lib", "api.js");
if (!fs.existsSync(rutaJsdom)) {
  console.error("Falta jsdom para la prueba. Instálalo con:\n  cd %TEMP%\\ek-test && npm install jsdom");
  process.exit(2);
}
const { JSDOM, VirtualConsole } = await import(pathToFileURL(rutaJsdom).href);

let fallos = 0, pruebas = 0;
function check(nombre, condicion, detalle) {
  pruebas++;
  if (condicion) console.log("  ✓ " + nombre);
  else { fallos++; console.log("  ✗ " + nombre + (detalle ? "  →  " + detalle : "")); }
}

/* Carga la página y ejecuta sus scripts locales a mano (los CDN se omiten,
   así la prueba funciona sin internet y sin descargar nada externo).        */
async function abrir(ruta, semilla) {
  const errores = [];
  const vc = new VirtualConsole();
  vc.on("jsdomError", (e) => errores.push(e.message + " " + (e.detail ? String(e.detail) : "")));
  vc.on("error", (m) => errores.push(String(m)));

  const html = fs.readFileSync(path.join(raiz, ruta.split("?")[0]), "utf8");
  const locales = [...html.matchAll(/<script src="([^"]+)"[^>]*><\/script>/g)]
    .map((m) => m[1]).filter((s) => !/^https?:/.test(s));
  const limpio = html.replace(/<script src="[^"]*"[^>]*><\/script>/g, "");

  const dom = new JSDOM(limpio, {
    url: "http://localhost/" + ruta,
    runScripts: "dangerously",
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(w) {
      if (!w.matchMedia) w.matchMedia = () => ({ matches: false, addEventListener() { }, removeEventListener() { } });
      if (!w.IntersectionObserver) w.IntersectionObserver = class { observe() { } unobserve() { } disconnect() { } };
    }
  });
  await new Promise((r) => setTimeout(r, 60));
  if (semilla) for (const k of Object.keys(semilla)) dom.window.localStorage.setItem(k, semilla[k]);
  for (const src of locales) {
    try { dom.window.eval(fs.readFileSync(path.join(raiz, src.split("?")[0]), "utf8")); }
    catch (e) { errores.push(src + ": " + e.message); }  }
  await new Promise((r) => setTimeout(r, 420));
  return { dom, w: dom.window, d: dom.window.document, errores };
}

console.log("\n=== PRUEBA DEL SITIO · TALLER CREATIVO EK ===\n");

/* ------------------------------- PORTADA ------------------------------- */
console.log("index.html");
{
  const { w, d, errores } = await abrir("index.html");
  check("sin errores de JavaScript", errores.length === 0, errores[0]);
  check("10 banners rotando", d.querySelectorAll(".ek-hero__slide").length === 10, d.querySelectorAll(".ek-hero__slide").length);
  /* --- Distribución de la portada: barra lateral + píldoras + carruseles --- */
  check("la portada tiene barra lateral visible (.ek-layout)", !!d.querySelector(".ek-layout .ek-sidebar"));
  check("la barra lateral lista las 22 categorías", d.querySelectorAll(".ek-layout .ek-sidebar .ek-catwrap").length === 22, d.querySelectorAll(".ek-layout .ek-sidebar .ek-catwrap").length);
  check("la barra lateral es CORTA (subcategorías plegadas, como la referencia)",
    d.querySelectorAll(".ek-layout .ek-sidebar .ek-catwrap.is-open").length === 0 &&
    d.querySelectorAll(".ek-layout .ek-sidebar .ek-subcats").length >= 20,
    "abiertas=" + d.querySelectorAll(".ek-layout .ek-sidebar .ek-catwrap.is-open").length + " plegadas=" + d.querySelectorAll(".ek-layout .ek-sidebar .ek-subcats").length);
  /* --- Barra lateral robusta: la decide JS y se puede forzar con un botón --- */
  check("la barra lateral queda fijada como columna (.con-lateral)", d.querySelector(".ek-layout").classList.contains("con-lateral"));
  check("hay un botón para fijar u ocultar las categorías", !!d.querySelector("[data-toggle-lateral]"));
  check("la barra lateral tiene encabezado (estilo Top Categories)", !!d.querySelector(".ek-side__tope"));
  check("las píldoras de las secciones de ideas tienen flechas ‹ ›",
    d.querySelectorAll("#ek-ideas .ek-pillstrip__ar").length >= 8, d.querySelectorAll("#ek-ideas .ek-pillstrip__ar").length);
  /* Regresión: la barra NO debe tener scroll interno ni altura máxima,
     porque al desplegar una categoría se cortaba y no se veía completa. */
  {
    const css = fs.readFileSync(path.join(raiz, "assets", "ek.css"), "utf8");
    const bloque = /\.ek-layout\.con-lateral>\.ek-sidebar\{([^}]*)\}/.exec(css);
    const regla = bloque ? bloque[1] : "";
    check("la barra lateral NO tiene scroll interno", !/overflow-y\s*:\s*(auto|scroll)/.test(regla) && /overflow\s*:\s*visible/.test(regla), regla.slice(0, 90));
    check("la barra lateral NO tiene altura máxima", /max-height\s*:\s*none/.test(regla));
    check("solo se pega al scroll si su contenido cabe (.es-corta)", /\.ek-sidebar\.es-corta\{[^}]*position:sticky/.test(css));
  }
  {
    const btn = d.querySelector("[data-toggle-lateral]");
    btn.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
    const oculto = !d.querySelector(".ek-layout").classList.contains("con-lateral");
    btn.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
    const vuelto = d.querySelector(".ek-layout").classList.contains("con-lateral");
    check("el botón oculta y vuelve a mostrar la barra lateral", oculto && vuelto, "oculto=" + oculto + " vuelto=" + vuelto);
  }
  /* --- Bloques de la distribución de la referencia --- */
  check("bloque Oferta del día visible", !d.querySelector("#ek-dotd-sec").classList.contains("ek-hide") && !!d.querySelector("#ek-dotd .ek-dotd"));
  check("la oferta del día tiene cuenta regresiva", !!d.querySelector("#ek-dotd-reloj #ek-dotd-h"));
  check("reseñas en carrusel horizontal con flechas",
    !!d.querySelector("#ek-resenas") && !!d.querySelector("#ek-resenas").closest("[data-carrusel]"));
  check("secciones de ideas con su propia tira de píldoras",
    d.querySelectorAll("#ek-ideas [data-idea]").length >= 4, d.querySelectorAll("#ek-ideas [data-idea]").length);
  check("cada idea trae carrusel horizontal de productos",
    d.querySelectorAll("#ek-ideas .ek-carrusel .ek-scroller .ek-card").length >= 30,
    d.querySelectorAll("#ek-ideas .ek-carrusel .ek-scroller .ek-card").length);
  check("los carruseles traen flechas propias", d.querySelectorAll("#ek-ideas .ek-carrusel__ar--next").length >= 4);
  /* La píldora filtra el carrusel de su sección */
  {
    const sec = d.querySelector("#ek-ideas [data-idea]");
    const antes = sec.querySelectorAll("[data-lista] .ek-card").length;
    const pill = sec.querySelectorAll("[data-pill]")[1];
    if (pill) {
      pill.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
      const despues = sec.querySelectorAll("[data-lista] .ek-card").length;
      check("al tocar una píldora se filtra ese carrusel", despues > 0 && despues !== antes, antes + " → " + despues);
    }
  }
  check("puntos del carrusel", d.querySelectorAll(".ek-hero__dot").length === 10);
  check("cada banner tiene texto + foto protagonista",
    d.querySelectorAll(".ek-hero__slide .ek-hero__body").length === 10 && d.querySelectorAll(".ek-hero__slide .ek-hero__media").length === 10);
  check("el título destaca sus palabras clave", d.querySelectorAll(".ek-hero__t em").length === 10, d.querySelectorAll(".ek-hero__t em").length);
  check("la foto muestra el precio más bajo real", /Desde \$/.test(d.querySelector(".ek-hero__chip").textContent), d.querySelector(".ek-hero__chip").textContent);
  check("los controles van FUERA de la diapositiva (no tapan el texto)",
    !d.querySelector(".ek-hero__slide .ek-hero__ctrl") && !!d.querySelector(".ek-hero .ek-hero__ctrl"));
  check("contador de diapositiva", /1 \/ 10/.test(d.querySelector("#ek-hero-count").textContent), d.querySelector("#ek-hero-count").textContent);
  check("12 artículos en tendencia", d.querySelector("#ek-tendencia").children.length === 12, d.querySelector("#ek-tendencia").children.length);
  check("8 ofertas", d.querySelector("#ek-ofertas").children.length === 8, d.querySelector("#ek-ofertas").children.length);
  check("8 secciones de ideas cubren las categorías de temporada y producto",
    d.querySelectorAll("#ek-ideas [data-idea]").length === 8, d.querySelectorAll("#ek-ideas [data-idea]").length);
  check("10 reseñas", d.querySelector("#ek-resenas").children.length === 10);
  check("6 preguntas frecuentes", d.querySelector("#ek-faq").children.length === 6);
  check("3 artículos del blog en la portada", d.querySelector("#ek-blog-home").children.length === 3, d.querySelector("#ek-blog-home").children.length);
  check("cinta superior duplicada para girar sin saltos", d.querySelectorAll("#ek-cinta .ek-topbar__item").length % 2 === 0);
  check("cada tarjeta trae 3 datos (estrellas, stock, tallas)",
    d.querySelector(".ek-card .ek-stars") && d.querySelector(".ek-card__stock") && d.querySelector(".ek-card__sizes"));
  /* Carrito funcional */
  d.querySelector("[data-add]").dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  check("agregar al carrito actualiza el contador",
    d.querySelector("[data-cart-count]").textContent === "1", d.querySelector("[data-cart-count]").textContent);
  /* Buscador */
  const inp = d.querySelector("[data-buscador] input");
  inp.value = "porta uvas";
  inp.dispatchEvent(new w.Event("input", { bubbles: true }));
  await new Promise((r) => setTimeout(r, 60));
  check("buscador muestra sugerencias", d.querySelectorAll(".ek-sug__i").length > 0, d.querySelectorAll(".ek-sug__i").length + " sugerencias");
}

/* ------------------ BARRA PRINCIPAL, LATERAL Y CARRITO LATERAL ------------------ */
console.log("\nbarra deslizable, subcategorías y carrito lateral (index.html)");
{
  const { w, d, errores } = await abrir("index.html");
  check("sin errores de JavaScript", errores.length === 0, errores[0]);
  check("barra principal deslizable con flechas", !!d.querySelector("#ek-navscroll") && !!d.querySelector("#ek-nav-prev") && !!d.querySelector("#ek-nav-next"));
  check("la barra principal arma categorías + submenús", d.querySelectorAll("#ek-navscroll .ek-nav__item").length >= 12, d.querySelectorAll("#ek-navscroll .ek-nav__item").length);
  check("los submenús traen subcategorías", d.querySelectorAll("#ek-navscroll .ek-subnav__a").length >= 40, d.querySelectorAll("#ek-navscroll .ek-subnav__a").length);
  /* Regresión: el submenú NO debe quedar recortado por el contenedor deslizable */
  {
    const css = fs.readFileSync(path.join(raiz, "assets", "ek.css"), "utf8");
    check("el submenú usa position:fixed (no lo recorta el contenedor con overflow)", /\.ek-subnav\{position:fixed/.test(css));
    const item = d.querySelector("#ek-navscroll .ek-nav__item[data-consubs], #ek-navscroll .ek-nav__item:has(.ek-subnav)");
    const itemConSub = d.querySelectorAll("#ek-navscroll .ek-nav__item .ek-subnav")[0]?.closest(".ek-nav__item");
    if (itemConSub) {
      itemConSub.dispatchEvent(new w.MouseEvent("mouseenter", { bubbles: false }));
      const abierto = itemConSub.classList.contains("is-open");
      const panel = itemConSub.querySelector(".ek-subnav");
      check("al pasar el mouse sobre una categoría se abre su submenú", abierto && panel.style.top !== "", "top=" + panel.style.top + " left=" + panel.style.left);
    }
  }
  check("menú lateral con las 22 categorías", d.querySelectorAll("#ek-sidebar .ek-catwrap").length === 22, d.querySelectorAll("#ek-sidebar .ek-catwrap").length);
  check("subcategorías desplegables en el menú lateral", d.querySelectorAll("#ek-sidebar .ek-subcats").length >= 20, d.querySelectorAll("#ek-sidebar .ek-subcats").length);
  check("carrito lateral creado", !!d.querySelector("#ek-cartdrawer"));
  check("barra inferior del móvil con 5 accesos", d.querySelectorAll("#ek-mobilebar .ek-mobilebar__i").length === 5);
  /* Carrito lateral: se abre, lista el artículo y calcula el total */
  d.querySelector("[data-add]").dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  w.EK_carrito(true);
  await new Promise((r) => setTimeout(r, 40));
  check("el carrito lateral se abre", d.querySelector("#ek-cartdrawer").classList.contains("is-on"));
  check("lista el artículo agregado", d.querySelectorAll("#ek-cartdrawer .ek-ci").length === 1, d.querySelectorAll("#ek-cartdrawer .ek-ci").length);
  check("muestra el total", /Total/.test(d.querySelector("#ek-cdpie").textContent));
  check("botón de pedido por WhatsApp", /wa\.me\/525562208987/.test(d.querySelector("#ek-cd-wa")?.getAttribute("href") || ""));
}

/* --------------------------- TIENDA / CATEGORÍA --------------------------- */
console.log("\ntienda.html");
{
  const { d, errores } = await abrir("tienda.html");
  check("sin errores de JavaScript", errores.length === 0, errores[0]);
  check("pinta la primera tanda de artículos", d.querySelector("#ek-productos").children.length === 24, d.querySelector("#ek-productos").children.length);
  check("barra lateral con los 7 bloques de filtros", d.querySelectorAll("#ek-sidebar .ek-side").length === 7, d.querySelectorAll("#ek-sidebar .ek-side").length);
  check("tira de píldoras de subcategorías", d.querySelectorAll("#ek-pills .ek-pill").length > 0, d.querySelectorAll("#ek-pills .ek-pill").length);
  check("la tira de píldoras se desplaza con flechas", !!d.querySelector("[data-pill-next]"));
  check("cuenta los 100 artículos", /100/.test(d.querySelector("#ek-cuenta").textContent), d.querySelector("#ek-cuenta").textContent);
  check("ordenador con 8 opciones", d.querySelectorAll("#ek-orden option").length === 8);
  check("hay botón cargar más", !d.querySelector("#ek-mas").classList.contains("ek-hide"));
}

console.log("\ncategoria.html?cat=navidad");
{
  const { d, errores } = await abrir("categoria.html?cat=navidad");
  check("sin errores de JavaScript", errores.length === 0, errores[0]);
  check("título de la categoría", /Navidad/.test(d.querySelector("#ek-cat-titulo").textContent));
  check("cuenta 26 artículos de Navidad", /26/.test(d.querySelector("#ek-cuenta").textContent), d.querySelector("#ek-cuenta").textContent);
  check("etiqueta de filtro activo", d.querySelectorAll("#ek-tags .ek-tag").length === 1);
}

console.log("\ncategoria.html?cat=navidad&sub=esferas");
{
  const { d, errores } = await abrir("categoria.html?cat=navidad&sub=esferas");
  check("sin errores de JavaScript", errores.length === 0, errores[0]);
  check("filtra por subcategoría (2 esferas)", /^2$/.test(d.querySelector("#ek-cuenta b").textContent), d.querySelector("#ek-cuenta").textContent);
  check("la subcategoría sale marcada en la tira", d.querySelectorAll("#ek-pills .ek-pill.is-on").length === 1);
  check("la etiqueta de subcategoría aparece", /Esferas/.test(d.querySelector("#ek-tags").textContent), d.querySelector("#ek-tags").textContent.trim());
}

console.log("\ntienda.html?orden=precio-asc&color=Rojo");
{
  const { d, errores } = await abrir("tienda.html?orden=precio-asc&color=Rojo");
  check("sin errores de JavaScript", errores.length === 0, errores[0]);
  const precios = [...d.querySelectorAll("#ek-productos .ek-price")].map((e) => +e.textContent.replace(/[^0-9]/g, ""));
  check("ordenado de menor a mayor", precios.every((v, i) => i === 0 || precios[i - 1] <= v), precios.slice(0, 5).join(", "));
  check("filtro de color aplicado", d.querySelectorAll("#ek-tags .ek-tag").length === 1);
}

/* -------------------------------- ARTÍCULO -------------------------------- */
console.log("\narticulo.html?id=porta-uvas-mdf-personalizado");
{
  const { d, errores } = await abrir("articulo.html?id=porta-uvas-mdf-personalizado");
  check("sin errores de JavaScript", errores.length === 0, errores[0]);
  check("ficha del artículo", !!d.querySelector(".ek-detail .ek-buy__title"));
  check("3 fotos en la galería", d.querySelectorAll(".ek-gallery__thumbs .ek-thumb").length === 3, d.querySelectorAll(".ek-gallery__thumbs .ek-thumb").length);
  check("4 pestañas", d.querySelectorAll(".ek-tab").length === 4);
  check("3 opciones de tamaño", d.querySelectorAll("#ek-tallas .ek-chip").length === 3);
  check("4 opciones de color", d.querySelectorAll("#ek-colores .ek-chip").length === 4);
  check("barra de existencias", !!d.querySelector(".ek-stockbar"));
  check("artículos relacionados", d.querySelectorAll(".ek-grid .ek-card").length > 0);
  check("datos estructurados JSON-LD", /"@type":"Product"/.test(d.querySelector("script[type='application/ld+json']")?.textContent || ""));
  check("barra fija de compra en móvil", !!d.querySelector(".ek-stickybuy"));
  check("el menú lateral se crea solo (22 categorías) en páginas sin barra propia",
    d.querySelectorAll("#ek-sidebar .ek-catwrap").length === 22, d.querySelectorAll("#ek-sidebar .ek-catwrap").length);
}

console.log("\narticulo.html?id=no-existe");
{
  const { d, errores } = await abrir("articulo.html?id=no-existe");
  check("sin errores de JavaScript", errores.length === 0, errores[0]);
  check("muestra estado vacío elegante", !!d.querySelector("#ek-producto .ek-empty"));
}

/* --------------------------------- CARRITO --------------------------------- */
console.log("\ncarrito.html");
{
  const { w, d, errores } = await abrir("carrito.html");
  check("sin errores de JavaScript", errores.length === 0, errores[0]);
  check("estado de carrito vacío", !!d.querySelector("#ek-carrito .ek-empty"));
  const carritoLleno = {
    ek_carrito: JSON.stringify([
      { k: "taza-ceramica-personalizada|11 oz|Blanco", s: "taza-ceramica-personalizada", t: "11 oz", col: "Blanco", c: 3 },
      { k: "pin-personalizado-graduacion|50 pz|Dorado", s: "pin-personalizado-graduacion", t: "50 pz", col: "Dorado", c: 50 }
    ])
  };
  const { d: d2, errores: e2 } = await abrir("carrito.html", carritoLleno);
  check("sin errores con carrito lleno", e2.length === 0, e2[0]);
  check("pinta 2 líneas de pedido", d2.querySelectorAll(".ek-cart__row").length === 2, d2.querySelectorAll(".ek-cart__row").length);
  check("calcula total (3×180 + 50×35 = 2290)", /2,290/.test(d2.querySelector("#ek-resumen").textContent), d2.querySelector(".ek-summary__tot .ek-price")?.textContent);
  check("envío gratis por superar $999", /GRATIS/.test(d2.querySelector("#ek-resumen").textContent));
  check("liga de WhatsApp con el pedido", /wa\.me\/525562208987/.test(d2.querySelector("#ek-checkout")?.href || ""));
  check("cupones y formas de pago visibles", d2.querySelectorAll(".ek-paylist span").length >= 4);
}

/* -------------------------------- CONTACTO -------------------------------- */
console.log("\ncontacto.html");
{
  const { d, errores } = await abrir("contacto.html");
  check("sin errores de JavaScript", errores.length === 0, errores[0]);
  check("formulario de contacto", !!d.querySelector("#ek-form-contacto"));
  check("6 campos + mensaje", d.querySelectorAll("#ek-form-contacto input,#ek-form-contacto select,#ek-form-contacto textarea").length === 7);
  check("preguntas frecuentes", d.querySelector("#ek-faq").children.length === 6);
  check("enlaces de redes sociales", !!d.querySelector("a[href*='instagram.com/tallercreativoek']"));
}

/* ---------------------------------- 404 ---------------------------------- */
console.log("\n404.html");
{
  const { d, errores } = await abrir("404.html");
  check("sin errores de JavaScript", errores.length === 0, errores[0]);
  check("mensaje 404 y sugerencias", !!d.querySelector(".ek-empty") && d.querySelector("#ek-sugerencias404").children.length > 0);
}

/* ---------------------------------- BLOG ---------------------------------- */
console.log("\nblog.html");
{
  const { w, d, errores } = await abrir("blog.html");
  check("sin errores de JavaScript", errores.length === 0, errores[0]);
  const posts = (w.EK_BLOG && w.EK_BLOG.posts) || [];
  check("hay 8 artículos de blog", posts.length === 8, posts.length);
  check("los pinta en la rejilla", d.querySelectorAll("#ek-blog-lista .ek-blogcard").length === posts.length, d.querySelectorAll("#ek-blog-lista .ek-blogcard").length);
  check("cada post trae contenido HTML largo", posts.every((p) => p.h && p.h.length > 2000), "mínimo " + Math.min(...posts.map((p) => (p.h || "").length)));
  check("todos con slug, fecha, categoría y foto", posts.every((p) => p.s && p.f && p.c && p.kw));
  check("el buscador del blog existe", !!d.querySelector("#ek-blog-buscador"));
  if (posts.length) {
    const { d: dp, errores: ep } = await abrir("blog-articulo.html?p=" + posts[0].s);
    check("artículo del blog sin errores de JavaScript", ep.length === 0, ep[0]);
    check("pinta el cuerpo del artículo", !!dp.querySelector("#ek-blog-post .ek-article"));
    check("título de la pestaña actualizado", dp.title.includes(posts[0].t.slice(0, 12)), dp.title);
    check("botones para compartir", dp.querySelectorAll(".ek-share a").length >= 3);
    check("posts relacionados", dp.querySelectorAll("#ek-blog-relacionados .ek-blogcard").length === 3, dp.querySelectorAll("#ek-blog-relacionados .ek-blogcard").length);
    const { d: dn } = await abrir("blog-articulo.html?p=no-existe-xyz");
    check("slug inexistente muestra aviso", !!dn.querySelector("#ek-blog-post .ek-empty"));
  }
}

/* ------------------- LOGO, FAVICONS Y BANNERS LOCALES ------------------- */
console.log("\nrecursos locales (logo, favicons, banners)");
{
  const { d, errores } = await abrir("index.html");
  check("sin errores de JavaScript", errores.length === 0, errores[0]);
  check("la cabecera ya NO lleva texto al lado del logo", !d.querySelector(".ek-logo__txt"));
  const logo = d.querySelector(".ek-logo img");
  check("logo rectangular PNG en la cabecera", /img\/logo\/logo-taller-creativo-ek\.png$/.test(logo.getAttribute("src")), logo.getAttribute("src"));
  check("el archivo del logo existe en disco", fs.existsSync(path.join(raiz, logo.getAttribute("src"))));
  check("logo también en el pie, sin nombre en texto", !!d.querySelector(".ek-footer__logo img") && !d.querySelector(".ek-footer__logo b"));
  const banners = [...d.querySelectorAll(".ek-hero__slide .ek-hero__media img")];
  check("los 10 banners usan TUS archivos locales", banners.length === 10 && banners.every((b) => /^img\/banner\/banner-\d\d\.webp$/.test(b.getAttribute("src"))), banners[0] && banners[0].getAttribute("src"));
  check("los 10 archivos de banner existen en disco", banners.every((b) => fs.existsSync(path.join(raiz, b.getAttribute("src")))));
  check("cada banner tiene respaldo externo", banners.every((b) => b.getAttribute("data-hotlink")));
  for (const f of ["img/favicon/favicon.ico", "img/favicon/favicon-32x32.png", "img/favicon/apple-touch-icon.png", "img/favicon/icono-512.png"])
    check("existe " + f, fs.existsSync(path.join(raiz, f)));
  check("no queda ninguna referencia al viejo .svg", !fs.readFileSync(path.join(raiz, "index.html"), "utf8").includes("logo-taller-creativo-ek.svg"));
  const faltan = [...d.querySelectorAll("img[src^='img/']")].map((i) => i.getAttribute("src")).filter((s) => !fs.existsSync(path.join(raiz, s)));
  check("todas las imágenes locales del HTML existen", faltan.length === 0, faltan.join(", "));
}

/* ------------------- SEO BÁSICO: UN SOLO <h1> POR PÁGINA ------------------- */
console.log("\nencabezados y SEO por página");
{
  const paginas = [
    "index.html", "tienda.html", "categoria.html?cat=navidad",
    "articulo.html?id=porta-uvas-mdf-personalizado", "carrito.html",
    "blog.html", "blog-articulo.html?p=que-es-el-dtf-uv-y-por-que-dura-mas", "contacto.html"
  ];
  for (const pg of paginas) {
    const { d } = await abrir(pg);
    const h1 = d.querySelectorAll("h1").length;
    const titulo = d.title.length > 8;
    check(pg.split("?")[0] + ": exactamente 1 <h1> (" + h1 + ") y <title> propio", h1 === 1 && titulo, "h1=" + h1);
  }
}

console.log(`\n=== RESULTADO: ${pruebas - fallos}/${pruebas} pruebas correctas ===`);
if (fallos) console.log(`    ${fallos} fallo(s) por revisar\n`);
process.exit(fallos ? 1 : 0);
