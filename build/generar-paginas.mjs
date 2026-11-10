/* Genera articulo.html, carrito.html, contacto.html y 404.html reutilizando
   EXACTAMENTE la misma cabecera, barra de categorías, barra lateral, pie y
   scripts de index.html. Así el sitio se mantiene consistente y ligero:
   si cambias el menú, lo cambias en index.html y vuelves a correr:
        node build/generar-paginas.mjs
*/
import fs from "node:fs";
import path from "node:path";

const raiz = path.resolve(import.meta.dirname, "..");
const base = fs.readFileSync(path.join(raiz, "index.html"), "utf8");

const iHead = base.indexOf("</head>");
const iMain = base.indexOf("<main>");
const iMainEnd = base.indexOf("</main>");
if (iHead < 0 || iMain < 0 || iMainEnd < 0) throw new Error("index.html no tiene la estructura esperada");

const head = base.slice(0, iHead + 7);
const chromeTop = base.slice(base.indexOf("<body>") + 6, iMain);
const chromeBottom = base.slice(iMainEnd);

function head_({ titulo, desc, url, noindex }) {
  return head
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${titulo}</title>`)
    .replace(/(<meta name="description" content=")[\s\S]*?(">)/, `$1${desc}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(">)/, `$1${url}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(">)/, `$1${titulo}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(">)/, `$1${desc}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(">)/, `$1${url}$2`)
    .replace(/(<meta name="robots" content=")[^"]*(">)/, `$1${noindex ? "noindex,follow" : "index,follow"}$2`);
}

function pagina(archivo, cfg, main) {
  const html = head_(cfg) + "<body>" + chromeTop + main + chromeBottom;
  fs.writeFileSync(path.join(raiz, archivo), html, "utf8");
  console.log("✓", archivo, (Buffer.byteLength(html) / 1024).toFixed(1) + " KB");
}

/* ------------------------------ ARTÍCULO ------------------------------ */
pagina("articulo.html", {
  titulo: "Artículo · Taller Creativo EK",
  desc: "Ficha completa del artículo: 3 fotos, tamaños, colores, existencias, ventas, calificación y compra directa por WhatsApp.",
  url: "https://tallercreativoek.com/articulo.html"
}, `
  <div id="ek-producto"></div>
`);

/* ------------------------------- CARRITO ------------------------------ */
pagina("carrito.html", {
  titulo: "Carrito y pago · Taller Creativo EK",
  desc: "Revisa tu carrito, aplica tu cupón y envía tu pedido por WhatsApp. Pago con SPEI, Mercado Pago, Clip o efectivo. COMPRA $999.",
  url: "https://tallercreativoek.com/carrito.html"
}, `
  <div class="ek-container">
    <nav class="ek-crumbs" aria-label="Ruta">
      <a href="index.html">Inicio</a> <i class="bi bi-chevron-right"></i> <a href="tienda.html">Tienda</a> <i class="bi bi-chevron-right"></i> <span>Carrito</span>
    </nav>
    <div class="ek-between" style="margin:8px 0 18px">
      <div>
        <span class="ek-sec__kicker">Paso 1 de 2</span>
        <h1 style="font-size:clamp(1.6rem,3.4vw,2.4rem);margin:0">Tu carrito 🛒</h1>
      </div>
      <button class="ek-chip" id="ek-vaciar"><i class="bi bi-trash3"></i> Vaciar carrito</button>
    </div>
    <div class="ek-steps">
      <span class="ek-step is-on"><b>1</b> Revisa tu pedido</span>
      <span class="ek-step is-on"><b>2</b> Envía por WhatsApp</span>
      <span class="ek-step"><b>3</b> Confirma el pago</span>
      <span class="ek-step" style="border:0"><b>4</b> Recibe en casa</span>
    </div>
  </div>

  <div class="ek-cart-layout ek-container">
    <section class="ek-cart" id="ek-carrito" aria-live="polite"></section>
    <aside class="ek-summary" id="ek-resumen"></aside>
  </div>

  <section class="ek-sec ek-container" style="padding-top:0">
    <div class="ek-grid ek-grid--3">
      <div class="ek-buy">
        <i class="bi bi-whatsapp" style="font-size:1.9rem;color:var(--wa)"></i>
        <h3 style="margin-top:10px">Pedido por WhatsApp</h3>
        <p class="ek-muted" style="font-size:.92rem">Al enviar tu carrito se abre WhatsApp con el resumen listo: artículos, tamaños, colores y total. Solo agregas tu dirección y listo.</p>
      </div>
      <div class="ek-buy">
        <i class="bi bi-bank" style="font-size:1.9rem;color:var(--azul)"></i>
        <h3 style="margin-top:10px">Transferencia SPEI</h3>
        <p class="ek-muted" style="font-size:.92rem">Te compartimos los datos bancarios al confirmar. Apartamos tu pedido y producimos al recibir el anticipo.</p>
      </div>
      <div class="ek-buy">
        <i class="bi bi-credit-card-2-front" style="font-size:1.9rem;color:var(--rojo)"></i>
        <h3 style="margin-top:10px">Tarjeta y MSI</h3>
        <p class="ek-muted" style="font-size:.92rem">Pagos con tarjeta por Mercado Pago o Clip mediante liga segura generada para tu pedido. 3, 6 y 9 meses sin intereses.</p>
      </div>
    </div>
    <div id="ek-faq" style="max-width:860px;margin-top:34px"></div>
  </section>
`);

/* ------------------------------ CONTACTO ------------------------------ */
pagina("contacto.html", {
  titulo: "Contacto y cotizaciones · Taller Creativo EK",
  desc: "Escríbenos por WhatsApp al 556 220 8987, por correo o llena el formulario. Cotizamos personalizados, mayoreo para escuelas, empresas, bodas y eventos.",
  url: "https://tallercreativoek.com/contacto.html"
}, `
  <div class="ek-container">
    <nav class="ek-crumbs" aria-label="Ruta">
      <a href="index.html">Inicio</a> <i class="bi bi-chevron-right"></i> <span>Contacto</span>
    </nav>
    <header style="margin:10px 0 26px">
      <span class="ek-sec__kicker">Estamos para ayudarte</span>
      <h1 style="font-size:clamp(1.7rem,3.6vw,2.6rem)">Cotiza tu pedido personalizado 📩</h1>
      <p class="ek-muted" style="max-width:70ch">Cuéntanos qué necesitas: cantidad, fecha del evento y si lleva nombre, foto o logo. Te respondemos con precio y vista previa el mismo día.</p>
    </header>
  </div>

  <div class="ek-contact ek-container">
    <div class="ek-buy" data-aos="fade-right">
      <h2 style="font-size:1.3rem">Formulario rápido</h2>
      <p class="ek-muted" style="font-size:.9rem">Al enviar se abre WhatsApp con tu mensaje ya escrito. También puedes escribirnos directo al correo.</p>
      <form id="ek-form-contacto">
        <div class="ek-grid ek-grid--2" style="gap:0 14px">
          <div class="ek-field"><label for="c-nombre">Nombre *</label><input id="c-nombre" name="nombre" required placeholder="Tu nombre"></div>
          <div class="ek-field"><label for="c-tel">WhatsApp / Teléfono *</label><input id="c-tel" name="tel" required placeholder="55 0000 0000" inputmode="tel"></div>
        </div>
        <div class="ek-grid ek-grid--2" style="gap:0 14px">
          <div class="ek-field"><label for="c-email">Correo</label><input id="c-email" name="email" type="email" placeholder="tucorreo@ejemplo.com"></div>
          <div class="ek-field"><label for="c-tipo">Tipo de pedido</label>
            <select id="c-tipo" name="tipo">
              <option>Regalo personalizado</option>
              <option>Decoración de temporada</option>
              <option>Graduación (grupo escolar)</option>
              <option>Boda o XV años</option>
              <option>Mayoreo / empresa</option>
              <option>Maquila DTF UV</option>
              <option>Otro</option>
            </select>
          </div>
        </div>
        <div class="ek-grid ek-grid--2" style="gap:0 14px">
          <div class="ek-field"><label for="c-cantidad">Cantidad aproximada</label><input id="c-cantidad" name="cantidad" placeholder="Ej. 20 piezas"></div>
          <div class="ek-field"><label for="c-fecha">¿Para qué fecha?</label><input id="c-fecha" name="fecha" type="date"></div>
        </div>
        <div class="ek-field"><label for="c-mensaje">Cuéntanos tu idea *</label><textarea id="c-mensaje" name="mensaje" required placeholder="Ej. Quiero 80 cilindros con las iniciales A &amp; M para una boda el 14 de febrero…"></textarea></div>
        <button class="ek-btn ek-btn--wa ek-btn--lg ek-btn--block" type="submit"><i class="bi bi-whatsapp"></i> Enviar por WhatsApp</button>
        <p class="ek-muted" style="font-size:.78rem;margin-top:10px">No guardamos tus datos en este sitio: el mensaje se envía directo a nuestro WhatsApp Business.</p>
      </form>
    </div>

    <div data-aos="fade-left">
      <div class="ek-info">
        <a class="ek-info__i" href="https://wa.me/525562208987?text=Hola%2C%20quiero%20cotizar" target="_blank" rel="noopener"><i class="bi bi-whatsapp"></i><div><b>WhatsApp Business · +52 556 220 8987</b><span>La vía más rápida. Fotos, diseños y cotizaciones.</span></div></a>
        <a class="ek-info__i" href="mailto:tallercreativoek@gmail.com"><i class="bi bi-envelope-at"></i><div><b>tallercreativoek@gmail.com</b><span>Pedidos, diseños y seguimiento.</span></div></a>
        <a class="ek-info__i" href="mailto:ADZAJU90MX@GMAIL.COM"><i class="bi bi-receipt"></i><div><b>ADZAJU90MX@GMAIL.COM</b><span>Facturación y cuentas de mayoreo.</span></div></a>
        <a class="ek-info__i" href="https://www.instagram.com/tallercreativoek" target="_blank" rel="noopener"><i class="bi bi-instagram"></i><div><b>@tallercreativoek</b><span>Trabajos terminados y promociones.</span></div></a>
        <a class="ek-info__i" href="https://www.facebook.com/Reqr2" target="_blank" rel="noopener"><i class="bi bi-facebook"></i><div><b>Facebook · Reqr2</b><span>Reseñas, galería y mensajes directos.</span></div></a>
      </div>
      <div class="ek-map ek-mt">
        <div>
          <i class="bi bi-geo-alt-fill" style="font-size:2.4rem;color:var(--rojo)"></i>
          <h3 style="margin:10px 0 6px">Taller Creativo EK</h3>
          <p class="ek-muted" style="margin:0">Ciudad de México, México<br>Envíos a todo el país por paquetería<br>Entregas personales en CDMX y área metropolitana</p>
          <p style="margin:14px 0 0"><b>Horario:</b> lunes a sábado · 9:00 a 19:00 h</p>
          <a class="ek-btn ek-btn--rojo ek-mt" href="https://wa.me/525562208987?text=Hola%2C%20quiero%20pasar%20a%20recoger%20un%20pedido" target="_blank" rel="noopener"><i class="bi bi-whatsapp"></i> Agendar cita en el taller</a>
        </div>
      </div>
    </div>
  </div>

  <section class="ek-sec ek-container">
    <div class="ek-sec__head">
      <div class="ek-sec__hd-l">
        <span class="ek-sec__kicker">Antes de escribir</span>
        <h2 class="ek-sec__title">Preguntas frecuentes</h2>
      </div>
    </div>
    <div id="ek-faq" style="max-width:860px"></div>
  </section>
`);

/* --------------------------------- 404 -------------------------------- */
pagina("404.html", {
  titulo: "Página no encontrada · Taller Creativo EK",
  desc: "La página que buscas no existe. Vuelve al catálogo de Taller Creativo EK o escríbenos por WhatsApp.",
  url: "https://tallercreativoek.com/404.html",
  noindex: true
}, `
  <section class="ek-sec ek-container" style="padding-top:60px">
    <div class="ek-empty">
      <i class="bi bi-emoji-frown"></i>
      <h1 style="font-size:clamp(1.8rem,4vw,3rem)">404 · Esta página se nos perdió</h1>
      <p class="ek-muted">Puede que el enlace haya cambiado o que el artículo ya no exista. Pero tenemos 100 artículos esperándote.</p>
      <div class="ek-row" style="justify-content:center;gap:10px">
        <a class="ek-btn ek-btn--rojo" href="index.html"><i class="bi bi-house-door"></i> Ir al inicio</a>
        <a class="ek-btn ek-btn--azul" href="tienda.html"><i class="bi bi-bag"></i> Ver catálogo</a>
        <a class="ek-btn ek-btn--wa" href="https://wa.me/525562208987" target="_blank" rel="noopener"><i class="bi bi-whatsapp"></i> WhatsApp</a>
      </div>
    </div>
    <div class="ek-catgrid ek-mt" id="ek-sugerencias404"></div>
  </section>
`);

console.log("\nListo. Cabecera, menú, barra lateral y pie sincronizados con index.html.");
