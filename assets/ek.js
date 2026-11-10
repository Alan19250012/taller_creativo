/* ============================================================================
   TALLER CREATIVO EK · MOTOR DEL SITIO  (assets/ek.js)
   ----------------------------------------------------------------------------
   Un solo archivo (~30 KB, ~9 KB gzip) para TODAS las páginas:
     · Pinta los artículos, filtros, buscador y ordenamientos
     · Carrito con localStorage (sin base de datos, sin backend)
     · Checkout por WhatsApp + pasarela externa
     · Hotlinking de imágenes con respaldo automático
     · Carga diferida de AOS (animaciones) y tsParticles (partículas)
   No modifica archivos .pkt ni nada del sistema: es 100 % front-end.
   ========================================================================== */
(function () {
  "use strict";
  var C = window.EK_CONFIG || {}, D = window.EK_DATA || { productos: [], categorias: [], banners: [], resenas: [], faq: [] };
  var P = D.productos, CATS = D.categorias;
  // Sesión de distribuidor (precio de mayoreo). Solo ADMIN/DISTRIBUIDOR ven el precio pd.
  var ROL = (function () { try { return localStorage.getItem("ek_rol") || null; } catch (e) { return null; } })();
  function esDistribuidor() { return ROL === "DISTRIBUIDOR" || ROL === "ADMINISTRADOR"; }
  function precioDe(p) { return esDistribuidor() && p.pd ? p.pd : p.p; }
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var RM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MOVIL = 1024;   // mismo punto de quiebre que el CSS (tableta/móvil)

  /* ======================= UTILIDADES ======================= */
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"']/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]; }); }
  function money(n) { return C.simbolo + Math.round(n).toLocaleString("es-MX"); }
  function nf(n) { return Number(n).toLocaleString("es-MX"); }
  function hash(s) { var h = 0, i; for (i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function cat(s) { for (var i = 0; i < CATS.length; i++) if (CATS[i].s === s) return CATS[i]; return null; }
  function prod(s) { for (var i = 0; i < P.length; i++) if (P[i].s === s) return P[i]; return null; }
  function num(v, d) { v = parseFloat(v); return isNaN(v) ? d : v; }
  function param(k) { return new URLSearchParams(location.search).get(k) || ""; }
  function desc(p) { return p.a > p.p ? Math.round((1 - p.p / p.a) * 100) : 0; }
  function tallaTexto(p) { return p.t.length > 1 ? p.t[0] + " a " + p.t[p.t.length - 1] : p.t[0]; }

  /* ======================= IMÁGENES =======================
     assets/ek-imagenes.js (generado con `node build/detectar-imagenes.mjs`)
     dice QUÉ archivos ya subiste. Así el sitio usa tus fotos en cuanto existen
     y sigue con las externas en todo lo que falte: cero peticiones fallidas.
       modoImagenes:"auto"    → tus archivos si existen, si no, foto externa
       modoImagenes:"hotlink" → siempre foto externa
       modoImagenes:"local"   → siempre tus archivos (con respaldo externo)  */
  var L = window.EK_IMG_LOCAL || { productos: {}, categorias: [], banner: [], blog: {} };
  function modo() { return C.modoImagenes || "auto"; }
  function extImg() { return L.ext || C.extImagenes || "webp"; }
  function hotProd(p, i, size) {
    var kw = (p.kw || C.hotlink.kwDefault).replace(/\s+/g, "");
    return C.hotlink.base + "/" + size + "/" + size + "/" + encodeURIComponent(kw) + "?lock=" + ((hash(p.s) + i * 977) % 99999);
  }
  function localProd(p, i) { return "img/productos/" + p.s + "-" + (i + 1) + "." + extImg(); }
  function imgURL(p, i, size) {
    if (p.imagenes && p.imagenes.length) {
      if (p.imagenes[i]) return p.imagenes[i];   // usa la imagen subida (1-5) si existe
    }
    if (p.imagen && i === 0) return p.imagen;   // imagen principal subida desde el panel
    if (modo() === "hotlink") return hotProd(p, i, size);
    var a = L.productos && L.productos[p.s];
    if (a && a.indexOf(i + 1) > -1) return localProd(p, i);
    return modo() === "local" ? localProd(p, i) : hotProd(p, i, size);
  }
  /* Banner: usa tu archivo local si ya lo subiste, con respaldo externo */
  function imgBanner(b, i, size) {
    var hot = C.hotlink.base + "/" + size + "/" + size + "/" + encodeURIComponent(b.kw) + "?lock=" + (1000 + i * 37);
    var local = "img/banner/banner-" + String(i + 1).padStart(2, "0") + "." + extImg();
    var tengo = (L.banner || []).indexOf(i + 1) > -1;
    return { src: modo() === "hotlink" ? hot : (tengo || modo() === "local") ? local : hot, hot: hot };
  }
  function imgFallback(el) {
    el.onerror = null;
    var w = parseInt(el.getAttribute("width"), 10) || 600;
    var h = parseInt(el.getAttribute("height"), 10) || w;
    el.src = C.hotlink.respaldo + "/" + w + "x" + h + "/" + C.hotlink.respaldoColor + "?text=Taller+Creativo+EK";
  }
  /* Si falta tu archivo local → foto externa; si esa también falla → imagen de marca.
     Así NUNCA se ve una imagen rota, sin gastar peticiones de más.            */
  function imgSwap(el) {
    var alt = el.getAttribute("data-hotlink");
    if (alt) { el.setAttribute("data-hotlink", ""); el.onerror = imgFallback; el.src = alt; }
    else imgFallback(el);
  }
  window.EK_imgErr = imgFallback;
  window.EK_imgSwap = imgSwap;
  function imgTag(p, i, size, alt, cls) {
    return '<img src="' + imgURL(p, i, size) + '" data-hotlink="' + hotProd(p, i, size) + '" alt="' + esc(alt || p.n) + '" loading="lazy" decoding="async" ' +
      'width="' + size + '" height="' + size + '" class="' + (cls || "") + '" onerror="EK_imgSwap(this)">';
  }
  function hotCat(c, size) {
    return C.hotlink.base + "/" + size + "/" + size + "/" + encodeURIComponent(c.kw) + "?lock=" + (hash(c.s) % 9999);
  }
  function mediaCat(c, size) {
    var hot = hotCat(c, size), local = "img/categorias/" + c.s + "." + extImg();
    if (modo() === "hotlink") return hot;
    if ((L.categorias || []).indexOf(c.s) > -1) return local;
    return modo() === "local" ? local : hot;
  }

  /* ======================= ALMACENAMIENTO ======================= */
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem("ek_" + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem("ek_" + k, JSON.stringify(v)); } catch (e) { } }
  };
  var CUPONES = window.EK_CUPONES || {
    EK10: { tipo: "pct", val: 10, txt: "10% de descuento" },
    EK200: { tipo: "monto", val: 200, min: 1500, txt: "$200 de descuento en compras +$1,500" },
    ENVIOGRATIS: { tipo: "envio", txt: "Envío gratis" },
    MAYOREO5: { tipo: "pct", val: 5, min: 2500, txt: "5% de mayoreo en compras +$2,500" }
  };
  function carrito() { return LS.get("carrito", []); }
  function guardar(c) { LS.set("carrito", c); pintarContador(true); }
  function favs() { return LS.get("favs", []); }
  function esFav(s) { return favs().indexOf(s) > -1; }
  function toggleFav(s) {
    var f = favs(), i = f.indexOf(s);
    if (i > -1) f.splice(i, 1); else f.push(s);
    LS.set("favs", f); return i === -1;
  }
  function addCart(slug, talla, color, cant) {
    var p = prod(slug); if (!p) return;
    var c = carrito(), k = slug + "|" + (talla || "") + "|" + (color || ""), enc = null, i;
    for (i = 0; i < c.length; i++) if (c[i].k === k) enc = c[i];
    if (enc) enc.c += (cant || 1);
    else c.push({ k: k, s: slug, t: talla || p.t[0], col: color || p.col[0], c: cant || 1 });
    guardar(c);
    pintarDrawerCarrito();
  }
  // Agrega un artículo personalizado (con la imagen compuesta) al carrito.
  // Lo usa assets/ek-personalizador.js al capturar la vista previa.
  window.EK_agregarPersonalizado = function (slug, imagen) {
    var p = prod(slug); if (!p || !imagen) return;
    var c = carrito();
    c.push({ k: slug + "|personalizado|" + Date.now(), s: slug, t: "Personalizado", col: "—", c: 1, img: imagen });
    guardar(c);
    pintarDrawerCarrito();
    toast("Personalización agregada al carrito", "bi-bag-check-fill");
  };

  /* ======================= COMPONENTES ======================= */
  function estrellas(r, rv) {
    var llenas = Math.floor(r), media = r - llenas >= .35, h = "", i;
    for (i = 0; i < 5; i++) h += '<i class="bi bi-star' + (i < llenas ? "-fill" : (i === llenas && media ? "-half" : "")) + '"></i>';
    return '<span class="ek-stars" title="' + r + ' de 5">' + h + "<b>" + r.toFixed(1) + "</b>" +
      (rv ? "<small>(" + nf(rv) + ")</small>" : "") + "</span>";
  }
  function insignias(p) {
    var h = "";
    if (p.st <= 0) h += '<span class="ek-badge ek-badge--agotado">Agotado</span>';
    if (p.b === "nuevo") h += '<span class="ek-badge ek-badge--nuevo">Nuevo</span>';
    if (p.b === "promo") h += '<span class="ek-badge ek-badge--promo">Oferta -' + desc(p) + "%</span>";
    if (p.b === "top") h += '<span class="ek-badge ek-badge--top">★ Más vendido</span>';
    if (p.st > 0 && p.st <= 10) h += '<span class="ek-badge ek-badge--stock">Últimas ' + p.st + " piezas</span>";
    return h;
  }
  function stockHTML(p) {
    if (p.st <= 0) return '<span class="ek-card__stock poco"><i class="bi bi-x-circle"></i> Agotado · aparta por WhatsApp</span>';
    var pct = Math.min(100, Math.round((p.st / 120) * 100));
    return '<span class="ek-card__stock' + (p.st <= 10 ? " poco" : "") + '">' +
      '<i class="bi bi-box-seam"></i> ' + nf(p.st) + ' disponibles <span class="bar"><i style="width:' + Math.max(8, pct) + '%"></i></span></span>';
  }
  function tarjeta(p, i) {
    var c0 = cat(p.c[0]), off = desc(p);
    return '<article class="ek-card ek-reveal" data-id="' + p.s + '">' +
      '<div class="ek-card__media">' +
        '<a href="articulo.html?id=' + p.s + '" aria-label="' + esc(p.n) + '">' +
          imgTag(p, 0, 500, p.n, "ek-card__img") + imgTag(p, 1, 500, p.n + " vista 2", "ek-card__img ek-card__img--b") +
        "</a>" +
        '<div class="ek-card__badges">' + insignias(p) + "</div>" +
        '<button class="ek-card__fav' + (esFav(p.s) ? " is-on" : "") + '" data-fav="' + p.s + '" aria-label="Favorito"><i class="bi bi-heart' + (esFav(p.s) ? "-fill" : "") + '"></i></button>' +
        '<div class="ek-card__quick">' +
          '<button class="ek-btn ek-btn--azul ek-btn--sm ek-btn--block" data-add="' + p.s + '"><i class="bi bi-bag-plus"></i> Agregar</button>' +
          '<a class="ek-btn ek-btn--wa ek-btn--sm" href="' + waLink("Hola, me interesa: " + p.n + " (" + money(p.p) + ")") + '" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="bi bi-whatsapp"></i></a>' +
        "</div>" +
      "</div>" +
      '<div class="ek-card__body">' +
        '<span class="ek-card__cat">' + (c0 ? c0.e + " " + esc(c0.n) : "") + "</span>" +
        '<h3 class="ek-card__title"><a href="articulo.html?id=' + p.s + '">' + esc(p.n) + "</a></h3>" +
        '<div class="ek-card__meta">' + estrellas(p.r, Math.max(3, Math.round(p.v * .12))) + "<span>· " + nf(p.v) + " vendidos</span></div>" +
        '<div class="ek-card__sizes">' + p.t.slice(0, 4).map(function (t) { return '<span class="ek-size">' + esc(t) + "</span>"; }).join("") + "</div>" +
        stockHTML(p) +
        '<div class="ek-card__prices"><span class="ek-price">' + money(p.p) + "</span>" +
          (off ? '<span class="ek-price--old">' + money(p.a) + '</span><span class="ek-price--off">-' + off + "%</span>" : "") +
        "</div>" +
        (esDistribuidor() && p.pd ? '<div style="font-size:.85rem;color:var(--azul);font-weight:700;margin-top:2px">Precio distribuidor: ' + money(p.pd) + "</div>" : "") +
        '<div class="ek-row" style="gap:8px"><a class="ek-btn ek-btn--rojo ek-btn--sm" style="flex:1" href="articulo.html?id=' + p.s + '"><i class="bi bi-eye"></i> Ver ficha</a>' +
        '<button class="ek-btn ek-btn--ghost ek-btn--sm" data-add="' + p.s + '" aria-label="Agregar al carrito"><i class="bi bi-cart-plus"></i></button></div>' +
      "</div></article>";
  }
  function tarjetaCat(c) {
    var n = P.filter(function (p) { return p.c.indexOf(c.s) > -1; }).length;
    return '<a class="ek-catcard' + (c.g === "temporada" ? " ek-catcard--temporada" : "") + ' ek-reveal" href="categoria.html?cat=' + c.s + '">' +
      '<span class="ek-catcard__e">' + c.e + "</span>" +
      '<div class="ek-catcard__img"><img src="' + mediaCat(c, 500) + '" data-hotlink="' + hotCat(c, 500) + '" alt="' + esc(c.n) + '" loading="lazy" decoding="async" width="500" height="344" onerror="EK_imgSwap(this)"></div>' +
      '<div class="ek-catcard__b"><div class="ek-catcard__n">' + esc(c.n) + "</div>" +
      '<div class="ek-catcard__c">' + n + " artículos" + (c.epoca ? " · " + c.epoca : "") + "</div></div>" +
      '<i class="bi bi-arrow-right-circle-fill ek-catcard__x"></i></a>';
  }
  // Expuestos para el constructor visual (assets/ek-page.js)
  window.EK_tarjeta = tarjeta;
  window.EK_tarjetaCat = tarjetaCat;
  function waLink(txt) { return "https://wa.me/" + C.whatsapp + "?text=" + encodeURIComponent(txt); }

  /* ======================= CABECERA / GLOBAL ======================= */
  function pintarContador(bump) {
    var n = carrito().reduce(function (a, x) { return a + x.c; }, 0), i;
    $$("[data-cart-count]").forEach(function (el) {
      el.textContent = n; el.classList.toggle("ek-hide", n === 0);
      if (bump) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
    });
    $$("[data-fav-count]").forEach(function (el) { var f = favs().length; el.textContent = f; el.classList.toggle("ek-hide", f === 0); });
  }
  function initGlobal() {
    pintarContador(false);
    var hd = $(".ek-header"), bar = $("#ek-progressbar"), top = $("#ek-totop");

    /* Mide la cabecera real para que la barra de categorías quede justo debajo.
       Se limita a un rango sensato: si la medida fallara (por ejemplo porque el
       CSS aún no se aplicó), la barra lateral podría quedarse sin altura. */
    function medirCabecera() {
      if (!hd) return;
      var alto = Math.min(160, Math.max(48, hd.offsetHeight || 70));
      document.documentElement.style.setProperty("--ek-h", alto + "px");
    }
    medirCabecera();
    window.addEventListener("resize", medirCabecera);
    window.addEventListener("load", medirCabecera);
    setTimeout(medirCabecera, 400);                       // por si el logo tarda
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(medirCabecera);

    /* ---- Barra lateral: columna o cajón, decidido por JS y forzable por ti ----
       Antes dependía solo de una media query: en ventanas de menos de 1024 px se
       iba fuera de pantalla sin avisar. Ahora hay un botón "Categorías" siempre
       visible y la preferencia se recuerda.                                     */
    var LATERAL_MIN = 900;
    /* La barra se queda pegada al hacer scroll SOLO si todo su contenido cabe en
       pantalla. Si es más alta (categorías desplegadas), se comporta como una
       columna normal y así SIEMPRE se ve completa, igual que en la referencia. */
    function ajustarPegajosa() {
      var cont = $(".ek-layout");
      if (!cont || !cont.classList.contains("con-lateral")) return;
      var sb = $(".ek-sidebar", cont);
      if (!sb) return;
      var altoCab = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--ek-h")) || 70;
      var disponible = (window.innerHeight || 800) - altoCab - 40;
      sb.classList.toggle("es-corta", sb.scrollHeight <= disponible);
    }
    function aplicarLateral() {
      var cont = $(".ek-layout");
      if (!cont) return;
      var pref = LS.get("lateral", null);
      var ancho = window.innerWidth || document.documentElement.clientWidth || 0;
      var comoColumna = pref === null ? ancho >= LATERAL_MIN : !!pref;
      cont.classList.toggle("con-lateral", comoColumna);
      $$("[data-toggle-lateral]").forEach(function (b) {
        b.setAttribute("aria-pressed", comoColumna ? "true" : "false");
        b.classList.toggle("is-on", comoColumna);
        var t = $("[data-lateral-txt]", b);
        if (t) t.textContent = comoColumna ? "Ocultar menú" : "Categorías";
      });
      ajustarPegajosa();
    }
    window.EK_ajustarLateral = aplicarLateral;
    aplicarLateral();
    window.addEventListener("resize", aplicarLateral);
    window.addEventListener("load", function () { setTimeout(ajustarPegajosa, 150); });
    document.addEventListener("click", function (e) {
      if (!e.target.closest("[data-acordeon]")) return;
      setTimeout(ajustarPegajosa, 360);      // al desplegar una categoría, recalcula
    });
    document.addEventListener("click", function (e) {
      var b = e.target.closest("[data-toggle-lateral]");
      if (!b) return;
      e.preventDefault();
      var cont = $(".ek-layout");
      if (!cont) return;
      var nuevo = !cont.classList.contains("con-lateral");
      LS.set("lateral", nuevo);
      aplicarLateral();
      var sb = $(".ek-sidebar"), ov = $("#ek-overlay");
      if (sb && !nuevo) { sb.classList.add("is-on"); if (ov) ov.classList.add("is-on"); }
      else if (sb) { sb.classList.remove("is-on"); if (ov) ov.classList.remove("is-on"); }
      if (typeof toast === "function") toast(nuevo ? "Menú de categorías fijado" : "Menú de categorías oculto", "bi-layout-sidebar-inset");
    });

    window.addEventListener("scroll", function () {
      var y = window.scrollY || 0, h = document.documentElement.scrollHeight - window.innerHeight;
      if (hd) hd.classList.toggle("is-stuck", y > 12);
      if (bar) bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
      if (top) top.classList.toggle("is-on", y > 620);
    }, { passive: true });
    if (top) top.onclick = function () { window.scrollTo({ top: 0, behavior: RM ? "auto" : "smooth" }); };
    var anio = $("#ek-anio"); if (anio) anio.textContent = new Date().getFullYear();

    // Menú lateral (móvil)
    var sb = $("#ek-sidebar");
    if (sb) {
      $$("[data-toggle-sidebar]").forEach(function (b) {
        b.onclick = function () { sb.classList.toggle("is-on"); var ov = $("#ek-overlay"); if (ov) ov.classList.toggle("is-on", sb.classList.contains("is-on")); };
      });
    }
    var ov = $("#ek-overlay"); if (ov) ov.onclick = function () { ov.classList.remove("is-on"); if (sb) sb.classList.remove("is-on"); };

    // Acordeones de la barra lateral
    $$(".ek-side__hd").forEach(function (h) {
      h.onclick = function () { h.parentNode.classList.toggle("is-cerrado"); };
    });

    // Favoritos y agregar al carrito (delegado)
    document.addEventListener("click", function (e) {
      var f = e.target.closest("[data-fav]");
      if (f) {
        e.preventDefault();
        var on = toggleFav(f.getAttribute("data-fav"));
        f.classList.toggle("is-on", on);
        var ic = f.querySelector("i"); if (ic) ic.className = "bi bi-heart" + (on ? "-fill" : "");
        pintarContador(false);
        toast(on ? "Agregado a favoritos" : "Quitado de favoritos", on ? "bi-heart-fill" : "bi-heart");
        return;
      }
      var a = e.target.closest("[data-add]");
      if (a) {
        e.preventDefault();
        var s = a.getAttribute("data-add");
        addCart(s); volar(a, s); toast("Agregado al carrito", "bi-bag-check-fill");
        // Se abre el carrito lateral para que veas tu pedido (como en la referencia)
        setTimeout(function () { abrirDrawerCarrito(true); }, RM ? 0 : 620);
        return;
      }
    });

    // Cerrar overlays con ESC
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      $$(".ek-drawer.is-on,.ek-lightbox.is-on").forEach(function (x) { x.classList.remove("is-on"); });
      if (ov) ov.classList.remove("is-on");
      if (sb) sb.classList.remove("is-on");
    });

    initBuscador();
    revelar();
  }

  function toast(txt, ico) {
    var t = $("#ek-toast");
    if (!t) { t = document.createElement("div"); t.id = "ek-toast"; t.className = "ek-toast"; document.body.appendChild(t); }
    t.innerHTML = '<i class="bi ' + (ico || "bi-check-circle-fill") + '"></i><span>' + esc(txt) + "</span>";
    t.classList.add("is-on");
    clearTimeout(t._t); t._t = setTimeout(function () { t.classList.remove("is-on"); }, 2400);
  }
  window.EK_toast = toast;

  function volar(el, slug) {
    if (RM) return;
    var p = prod(slug), img = el.closest(".ek-card__media") ? $("img", el.closest(".ek-card__media")) : null;
    var dest = $("[data-cart-count]");
    if (!p || !img || !dest) return;
    var a = img.getBoundingClientRect(), b = dest.getBoundingClientRect();
    var f = document.createElement("img");
    f.src = img.currentSrc || img.src; f.className = "ek-fly";
    f.style.left = a.left + "px"; f.style.top = a.top + "px"; f.style.width = a.width + "px"; f.style.height = a.height + "px";
    document.body.appendChild(f);
    requestAnimationFrame(function () {
      f.style.left = (b.left - 12) + "px"; f.style.top = (b.top - 12) + "px";
      f.style.width = "42px"; f.style.height = "42px"; f.style.opacity = "0.25"; f.style.borderRadius = "50%";
    });
    setTimeout(function () { f.remove(); }, 900);
  }

  /* ---- Buscador con sugerencias en vivo ---- */
  function buscar(q, limite) {
    q = q.trim().toLowerCase(); if (!q) return [];
    var pal = q.split(/\s+/);
    return P.map(function (p) {
      var txt = (p.n + " " + p.d + " " + p.c.join(" ") + " " + p.col.join(" ") + " " + p.kw + " " + p.f.join(" ")).toLowerCase(), pts = 1, i;
      for (i = 0; i < pal.length; i++) {
        if (txt.indexOf(pal[i]) === -1) return null;
        if (p.n.toLowerCase().indexOf(pal[i]) > -1) pts += 6;
        if (p.kw.toLowerCase().indexOf(pal[i]) > -1) pts += 3;
        pts += 1;
      }
      pts += p.v / 400 + p.r / 2;
      return { p: p, pts: pts };
    }).filter(Boolean).sort(function (a, b) { return b.pts - a.pts; }).slice(0, limite || 8).map(function (x) { return x.p; });
  }
  function initBuscador() {
    $$("[data-buscador]").forEach(function (form) {
      var inp = $("input", form), box = null;
      function cerrar() { if (box) { box.remove(); box = null; } }
      inp.addEventListener("input", function () {
        cerrar(); var q = inp.value;
        if (q.trim().length < 2) return;
        var r = buscar(q, 6); if (!r.length) return;
        box = document.createElement("div"); box.className = "ek-sug";
        box.innerHTML = r.map(function (p) {
          return '<a class="ek-sug__i" href="articulo.html?id=' + p.s + '">' + imgTag(p, 0, 120, p.n) +
            '<span style="flex:1"><span class="ek-sug__n">' + esc(p.n) + '</span><br><span class="ek-sug__p">' + money(p.p) + "</span></span></a>";
        }).join("") + '<a class="ek-sug__i" href="tienda.html?q=' + encodeURIComponent(q) + '"><i class="bi bi-search"></i><span class="ek-sug__n">Ver todos los resultados para “' + esc(q) + '”</span></a>';
        form.appendChild(box);
      });
      inp.addEventListener("blur", function () { setTimeout(cerrar, 220); });
      form.addEventListener("submit", function (e) { e.preventDefault(); location.href = "tienda.html?q=" + encodeURIComponent(inp.value); });
    });
  }

  /* ---- Animaciones externas (AOS) y partículas, cargadas bajo demanda ---- */
  function loadScript(src, ok, err) {
    var s = document.createElement("script"); s.src = src; s.async = true;
    s.onload = ok; s.onerror = err; document.head.appendChild(s);
  }
  function initAnimaciones() {
    if (!C.aos) return;
    var hay = $$("[data-aos]").length > 0;
    if (!hay) return;
    loadScript("https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.js", function () {
      if (!window.AOS) return;
      window.AOS.init({ duration: 700, easing: "ease-out-cubic", once: true, offset: 60, disable: RM });
    }, function () { document.documentElement.classList.add("aos-off"); });
    setTimeout(function () { if (!window.AOS) document.documentElement.classList.add("aos-off"); }, 2600);
  }
  function initParticulas() {
    var el = $("#ek-particles");
    if (!el || !C.particulas || RM) return;
    loadScript("https://cdn.jsdelivr.net/npm/@tsparticles/slim@3.5.0/tsparticles.slim.bundle.min.js", function () {
      if (!window.tsParticles) return;
      window.tsParticles.load({
        id: "ek-particles",
        options: {
          fullScreen: { enable: false },
          fpsLimit: 45,
          detectRetina: false,
          particles: {
            number: { value: C.particulasMax || 38, density: { enable: true } },
            color: { value: ["#DA1D2A", "#244093", "#F5B325", "#ffffff"] },
            shape: { type: ["circle", "star"] },
            opacity: { value: { min: .18, max: .62 } },
            size: { value: { min: 1.4, max: 4.6 } },
            links: { enable: true, distance: 145, color: "#ffffff", opacity: .16, width: 1 },
            move: { enable: true, speed: .85, outModes: { default: "bounce" } }
          },
          interactivity: {
            events: { onHover: { enable: true, mode: "grab" }, onClick: { enable: true, mode: "push" } },
            modes: { grab: { distance: 168, links: { opacity: .32 } }, push: { quantity: 2 } }
          }
        }
      });
    });
  }
  function revelar() {
    var els = $$(".ek-reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return;
        var t = x.target;
        t.classList.add("is-in");
        io.unobserve(t);
        // Al terminar, se quitan las clases para no frenar los efectos hover
        setTimeout(function () { t.classList.remove("ek-reveal", "is-in"); }, 1100);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .06 });
    els.forEach(function (e) { io.observe(e); });
  }
  function contadores() {
    var els = $$("[data-contador]"); if (!els.length) return;
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return;
        var el = x.target, fin = num(el.getAttribute("data-contador"), 0), ini = 0, t0 = null;
        io.unobserve(el);
        function paso(t) {
          if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 1500), e = 1 - Math.pow(1 - k, 3);
          el.textContent = nf(Math.round(ini + (fin - ini) * e));
          if (k < 1) requestAnimationFrame(paso);
        }
        requestAnimationFrame(paso);
      });
    }, { threshold: .4 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ============ SUBCATEGORÍAS (una subcategoría vive en varias categorías) ============ */
  var SUB = window.EK_SUBCATS || { lista: [], mapa: {}, porCat: {} };
  function subDe(slug) { return SUB.mapa[slug] || []; }
  function subInfo(s) { for (var i = 0; i < SUB.lista.length; i++) if (SUB.lista[i].s === s) return SUB.lista[i]; return null; }
  function subsDeCat(c) { return (SUB.porCat[c] || []).map(subInfo).filter(Boolean); }
  function cuentaSub(cat, sub) {
    var n = 0;
    for (var i = 0; i < P.length; i++) if (P[i].c.indexOf(cat) > -1 && subDe(P[i].s).indexOf(sub) > -1) n++;
    return n;
  }

  /* ============ BARRA PRINCIPAL DESLIZABLE + SUBMENÚS ============
     Como la barra de Personal Creations: se arrastra, se desliza con las flechas
     y cada categoría principal abre su panel de SUBCATEGORÍAS.              */
  function initNav() {
    var cont = $("#ek-navscroll");
    if (!cont) return;
    var activo = param("cat");
    var principales = CATS.filter(function (c) { return c.nav; }).sort(function (a, b) { return a.orden - b.orden; });

    cont.innerHTML = principales.map(function (c) {
      var subs = subsDeCat(c.s), tiene = subs.length > 0;
      return '<div class="ek-nav__item' + (activo === c.s ? " is-open" : "") + '">' +
        '<a class="ek-nav__link' + (activo === c.s ? " is-active" : "") + '" href="categoria.html?cat=' + c.s + '"' +
          (tiene ? ' aria-haspopup="true" data-consubs="' + c.s + '"' : "") + ">" +
          c.e + " " + esc(c.n) + (tiene ? ' <i class="bi bi-chevron-down ek-caret"></i>' : "") + "</a>" +
        (tiene ? '<div class="ek-subnav" role="menu">' +
          '<p class="ek-subnav__t"><i class="bi bi-grid-3x3-gap-fill"></i> ' + esc(c.n) + "</p>" +
          '<div class="ek-subnav__grid">' + subs.map(function (s) {
            return '<a class="ek-subnav__a" role="menuitem" href="categoria.html?cat=' + c.s + "&sub=" + s.s + '"><i class="bi ' + s.i + '"></i> ' +
              esc(s.n) + "<small>" + cuentaSub(c.s, s.s) + "</small></a>";
          }).join("") + "</div>" +
          '<a class="ek-subnav__f" href="categoria.html?cat=' + c.s + '">Ver todo ' + esc(c.n) + ' <i class="bi bi-arrow-right"></i></a>' +
          "</div>" : "") +
        "</div>";
    }).join("") +
      '<div class="ek-nav__item"><a class="ek-nav__link" href="tienda.html?etiqueta=promo">🔥 Ofertas</a></div>' +
      '<div class="ek-nav__item"><a class="ek-nav__link" href="tienda.html">🛍️ Todo</a></div>' +
      '<div class="ek-nav__item"><a class="ek-nav__link" href="blog.html">📝 Blog</a></div>' +
      '<div class="ek-nav__item"><a class="ek-nav__link" href="contacto.html">📞 Contacto</a></div>';

    // Posiciona el panel de la categoría activa (si la hay) para que NO quede
    // en la esquina superior izquierda (bug al navegar a una categoría).
    var itemActivo = $(".ek-nav__item.is-open", cont);
    if (itemActivo) {
      var panelActivo = $(".ek-subnav", itemActivo);
      if (panelActivo) {
        setTimeout(function () { colocarPanel(itemActivo, panelActivo); }, 0);
      }
    }

    var prev = $("#ek-nav-prev"), next = $("#ek-nav-next");
    function paso() { return Math.max(180, cont.clientWidth * 0.7); }
    function revisar() {
      if (!prev || !next) return;
      var max = cont.scrollWidth - cont.clientWidth - 2;
      prev.disabled = cont.scrollLeft <= 2;
      next.disabled = cont.scrollLeft >= max;
      prev.hidden = next.hidden = !(cont.scrollWidth > cont.clientWidth + 4);
    }
    if (prev) prev.onclick = function () { cont.scrollBy({ left: -paso(), behavior: RM ? "auto" : "smooth" }); };
    if (next) next.onclick = function () { cont.scrollBy({ left: paso(), behavior: RM ? "auto" : "smooth" }); };
    cont.addEventListener("scroll", revisar, { passive: true });
    window.addEventListener("resize", revisar);
    setTimeout(revisar, 60);

    /* Rueda del mouse → desplazamiento horizontal */
    cont.addEventListener("wheel", function (e) {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      if (cont.scrollWidth <= cont.clientWidth + 4) return;
      e.preventDefault(); cont.scrollLeft += e.deltaY;
    }, { passive: false });

    /* Arrastrar con el mouse */
    var down = false, x0 = 0, sl = 0, movido = 0;
    cont.addEventListener("mousedown", function (e) {
      if (e.button !== 0) return;
      down = true; movido = 0; x0 = e.pageX; sl = cont.scrollLeft; cont.style.cursor = "grabbing";
    });
    window.addEventListener("mousemove", function (e) {
      if (!down) return;
      movido = e.pageX - x0;
      if (Math.abs(movido) > 6) { e.preventDefault(); cont.scrollLeft = sl - movido; }
    });
    window.addEventListener("mouseup", function () { down = false; cont.style.cursor = ""; });
    cont.addEventListener("click", function (e) {
      if (Math.abs(movido) > 8) { e.preventDefault(); e.stopPropagation(); }
    }, true);

    /* Posiciona el panel como dropdown (escritorio) o hoja inferior (móvil).
       Usa position:fixed para que el contenedor deslizable NO lo recorte. */
    function colocarPanel(item, panel) {
      var r = item.getBoundingClientRect();
      if (window.innerWidth <= MOVIL) {
        panel.style.left = "0";
        panel.style.width = "100%";
        panel.style.top = "auto";
        panel.style.bottom = "0";
        panel.style.borderRadius = "18px 18px 0 0";
        panel.style.maxHeight = "70vh";
      } else {
        var w = Math.min(480, window.innerWidth - 16);
        panel.style.width = w + "px";
        panel.style.left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8)) + "px";
        panel.style.top = (r.bottom + 2) + "px";
        panel.style.bottom = "auto";
        panel.style.borderRadius = "";
        panel.style.maxHeight = Math.min(window.innerHeight - r.bottom - 14, 560) + "px";
      }
    }
    /* Se abre al pasar el mouse (con pequeña demora al salir, para no cerrarse
       al cruzar el hueco) y también con el teclado. */
    $$(".ek-nav__item", cont).forEach(function (item) {
      var panel = $(".ek-subnav", item);
      if (!panel) return;
      var tCerrar = null;
      function abrir() {
        clearTimeout(tCerrar);
        colocarPanel(item, panel);
        $$(".ek-nav__item.is-open", cont).forEach(function (x) { if (x !== item) x.classList.remove("is-open"); });
        item.classList.add("is-open");
      }
      item.addEventListener("mouseenter", abrir);
      item.addEventListener("mouseleave", function (e) {
        if (panel.contains(e.relatedTarget)) return;
        tCerrar = setTimeout(function () { item.classList.remove("is-open"); }, 160);
      });
      panel.addEventListener("mouseenter", function () { clearTimeout(tCerrar); });
      panel.addEventListener("mouseleave", function () { item.classList.remove("is-open"); });
      item.addEventListener("focusin", abrir);
      item.addEventListener("focusout", function (e) { if (!panel.contains(e.relatedTarget)) item.classList.remove("is-open"); });
    });

    /* En móvil, al tocar la categoría se abre la hoja inferior (no navega). */
    cont.addEventListener("click", function (e) {
      var a = e.target.closest("[data-consubs]");
      if (!a) return;
      var item = a.parentNode;
      if (window.innerWidth > MOVIL) return;   // en escritorio el enlace navega
      e.preventDefault();
      var panel = $(".ek-subnav", item);
      if (!item.classList.contains("is-open") && panel) colocarPanel(item, panel);
      var abierto = item.classList.contains("is-open");
      $$(".ek-nav__item.is-open", cont).forEach(function (x) { x.classList.remove("is-open"); });
      item.classList.toggle("is-open", !abierto);
    });

    /* Cerrar al hacer clic fuera o al hacer scroll (el panel es fijo). */
    document.addEventListener("click", function (e) {
      if (e.target.closest(".ek-nav__item")) return;
      $$(".ek-nav__item.is-open").forEach(function (x) { x.classList.remove("is-open"); });
    });
    window.addEventListener("scroll", function () {
      $$(".ek-nav__item.is-open").forEach(function (x) { x.classList.remove("is-open"); });
    }, true);
  }

  /* ============ BARRA LATERAL: CATEGORÍAS Y SUBCATEGORÍAS ============ */
  function acordeonCategorias(modo, lista, abierto) {
    return (lista || CATS).slice().sort(function (a, b) { return a.orden - b.orden; }).map(function (c) {
      var subs = subsDeCat(c.s);
      var n = P.filter(function (p) { return p.c.indexOf(c.s) > -1; }).length;
      if (!n) return "";
      var abrir = modo === "filtro"
        ? '<button class="ek-cat" data-cat="' + c.s + '" type="button">'
        : '<a class="ek-cat" href="categoria.html?cat=' + c.s + '">';
      var cerrar = modo === "filtro" ? "</button>" : "</a>";
      return '<div class="ek-catwrap' + (abierto ? " is-open" : "") + '">' +
        '<div class="ek-catrow">' + abrir +
          '<span class="ek-cat__e">' + c.e + "</span> " + esc(c.n) +
          '<span class="ek-cat__c">' + n + "</span>" + cerrar +
        (subs.length ? '<button class="ek-cat__tog" type="button" data-acordeon aria-label="Ver subcategorías de ' + esc(c.n) + '" aria-expanded="' + (abierto ? "true" : "false") + '"><i class="bi bi-chevron-down"></i></button>' : "") +
        "</div>" +
        (subs.length ? '<div class="ek-subcats">' +
          (modo === "filtro"
            ? '<button class="ek-subcat ek-subcat--todas" type="button" data-sub="" data-padre="' + c.s + '">Ver todo en ' + esc(c.n) + "</button>"
            : '<a class="ek-subcat ek-subcat--todas" href="categoria.html?cat=' + c.s + '">Ver todo en ' + esc(c.n) + "</a>") +
          subs.map(function (s) {
            return modo === "filtro"
              ? '<button class="ek-subcat" type="button" data-sub="' + s.s + '" data-padre="' + c.s + '"><i class="bi ' + s.i + '"></i> ' + esc(s.n) + '<span class="ek-subcat__c">' + cuentaSub(c.s, s.s) + "</span></button>"
              : '<a class="ek-subcat" href="categoria.html?cat=' + c.s + "&sub=" + s.s + '"><i class="bi ' + s.i + '"></i> ' + esc(s.n) + '<span class="ek-subcat__c">' + cuentaSub(c.s, s.s) + "</span></a>";
          }).join("") + "</div>" : "") +
        "</div>";
    }).join("");
  }
  function initAcordeones(raiz) {
    (raiz || document).addEventListener("click", function (e) {
      var t = e.target.closest("[data-acordeon]");
      if (!t) return;
      e.preventDefault();
      var w = t.closest(".ek-catwrap");
      if (!w) return;
      var abierto = w.classList.toggle("is-open");
      t.setAttribute("aria-expanded", abierto ? "true" : "false");
    });
  }

  /* ============ CARRITO LATERAL DESLIZABLE ============ */
  function crearDrawerCarrito() {
    if ($("#ek-cartdrawer")) return;
    var ov = document.createElement("div");
    ov.className = "ek-overlay"; ov.id = "ek-overlay-carrito";
    ov.onclick = function () { abrirDrawerCarrito(false); };
    var d = document.createElement("aside");
    d.className = "ek-cartdrawer"; d.id = "ek-cartdrawer";
    d.setAttribute("role", "dialog"); d.setAttribute("aria-label", "Carrito de compras"); d.setAttribute("aria-hidden", "true");
    d.innerHTML =
      '<div class="ek-cartdrawer__hd"><h2><i class="bi bi-bag-heart-fill"></i> Mi carrito <span id="ek-cd-n"></span></h2>' +
      '<button class="ek-cartdrawer__x" data-cerrar-carrito aria-label="Cerrar carrito"><i class="bi bi-x-lg"></i></button></div>' +
      '<div class="ek-cartdrawer__bd" id="ek-cdlista"></div>' +
      '<div class="ek-cartdrawer__ft" id="ek-cdpie"></div>';
    document.body.appendChild(ov); document.body.appendChild(d);
    d.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var c = carrito(), k, i;
      if (b.hasAttribute("data-cerrar-carrito")) { abrirDrawerCarrito(false); return; }
      if (b.hasAttribute("data-menos") || b.hasAttribute("data-mas")) {
        k = b.getAttribute("data-menos") || b.getAttribute("data-mas");
        for (i = 0; i < c.length; i++) if (c[i].k === k) {
          c[i].c += (b.hasAttribute("data-mas") ? 1 : -1);
          if (c[i].c < 1) c.splice(i, 1);
        }
        guardar(c); pintarDrawerCarrito(); if ($("#ek-carrito")) pintarCarritoPagina();
      }
      if (b.hasAttribute("data-quitar")) {
        k = b.getAttribute("data-quitar");
        guardar(c.filter(function (x) { return x.k !== k; }));
        pintarDrawerCarrito(); toast("Artículo eliminado", "bi-trash3");
        if ($("#ek-carrito")) pintarCarritoPagina();
      }
    });
  }
  function abrirDrawerCarrito(si) {
    crearDrawerCarrito();
    var d = $("#ek-cartdrawer"), ov = $("#ek-overlay-carrito");
    if (!d) return;
    var on = si !== false;
    d.classList.toggle("is-on", on);
    d.setAttribute("aria-hidden", on ? "false" : "true");
    if (ov) ov.classList.toggle("is-on", on);
    document.body.classList.toggle("ek-lock", on && window.innerWidth <= MOVIL);
    if (on) pintarDrawerCarrito();
  }
  window.EK_carrito = abrirDrawerCarrito;
  function pintarDrawerCarrito() {
    var d = $("#ek-cartdrawer"); if (!d) return;
    var t = totales(), lista = $("#ek-cdlista"), pie = $("#ek-cdpie"), n = $("#ek-cd-n");
    if (n) n.textContent = t.piezas ? "(" + t.piezas + ")" : "";
    if (!t.lineas.length) {
      lista.innerHTML = '<div class="ek-empty" style="padding:44px 16px"><i class="bi bi-cart-x"></i>' +
        '<h3 style="font-size:1.05rem">Tu carrito está vacío</h3>' +
        '<p class="ek-muted" style="font-size:.88rem">Explora el catálogo y agrega tus productos favoritos.</p>' +
        '<a class="ek-btn ek-btn--rojo ek-btn--sm" href="tienda.html"><i class="bi bi-bag"></i> Ver catálogo</a></div>';
      pie.innerHTML = "";
      return;
    }
    lista.innerHTML = t.lineas.map(function (l) {
      return '<div class="ek-ci">' +
        '<a href="articulo.html?id=' + l.p.s + '">' + imgTag(l.p, 0, 200, l.p.n) + "</a>" +
        "<div>" +
          '<div class="ek-ci__n">' + esc(l.p.n) + "</div>" +
          '<div class="ek-ci__m">' + esc(l.x.t) + " · " + esc(l.x.col) + " · " + money(l.p.p) + " c/u</div>" +
          '<div class="ek-ci__f">' +
            '<div class="ek-qty ek-qty--mini"><button data-menos="' + esc(l.x.k) + '" aria-label="Quitar uno">−</button>' +
            '<input type="number" value="' + l.x.c + '" min="1" data-cant="' + esc(l.x.k) + '" aria-label="Cantidad">' +
            '<button data-mas="' + esc(l.x.k) + '" aria-label="Agregar uno">+</button></div>' +
            '<span class="ek-ci__p">' + money(l.imp) + "</span>" +
          "</div>" +
        "</div>" +
        '<button class="ek-ci__x" data-quitar="' + esc(l.x.k) + '" aria-label="Eliminar"><i class="bi bi-trash3"></i></button>' +
      "</div>";
    }).join("");
    var falta = Math.max(0, C.envioGratisDesde - (t.sub - t.descu));
    pie.innerHTML =
      '<div class="ek-cdsum">' +
        '<div class="r"><span>Subtotal</span><b>' + money(t.sub) + "</b></div>" +
        (t.descu ? '<div class="r ok"><span>Descuento ' + esc(t.cuponTxt) + "</span><b>−" + money(t.descu) + "</b></div>" : "") +
        '<div class="r"><span>Envío</span><b>' + (t.envio ? money(t.envio) : "GRATIS") + "</b></div>" +
      "</div>" +
      (falta > 0
        ? '<div class="ek-progress"><i style="width:' + Math.min(100, (t.sub - t.descu) / C.envioGratisDesde * 100) + '%"></i></div><small class="ek-muted">Te faltan <b>' + money(falta) + "</b> para el envío gratis 🚚</small>"
        : "<small style='color:var(--wa-osc);font-weight:700'>🎉 ¡Tienes envío gratis!</small>") +
      '<div class="ek-cdtot"><span>Total</span><b>' + money(t.total) + "</b></div>" +
      '<a class="ek-btn ek-btn--wa ek-btn--block" id="ek-cd-wa" target="_blank" rel="noopener" href="' + waLink(mensajePedido(t)) + '"><i class="bi bi-whatsapp"></i> Pedir por WhatsApp</a>' +
      '<div class="ek-cdpay">' +
        '<a class="ek-btn ek-btn--ghost ek-btn--sm" href="carrito.html"><i class="bi bi-bag-check"></i> Ver carrito</a>' +
        '<a class="ek-btn ek-btn--azul ek-btn--sm" href="carrito.html"><i class="bi bi-credit-card"></i> Pagar</a>' +
      "</div>";
  }
  function refrescarCarrito() { pintarDrawerCarrito(); if ($("#ek-carrito") && window.EK_pintarCarrito) window.EK_pintarCarrito(); }

  /* ============ BARRA INFERIOR DEL MÓVIL ============ */
  function initBarraMovil() {
    if ($("#ek-mobilebar")) return;
    var actual = (location.pathname.split("/").pop() || "index.html");
    var b = document.createElement("nav");
    b.className = "ek-mobilebar"; b.id = "ek-mobilebar"; b.setAttribute("aria-label", "Accesos rápidos");
    b.innerHTML =
      '<a class="ek-mobilebar__i' + (actual === "index.html" ? " is-on" : "") + '" href="index.html"><i class="bi bi-house-door-fill"></i><span class="ek-mobilebar__t">Inicio</span></a>' +
      '<button class="ek-mobilebar__i" type="button" data-toggle-sidebar><i class="bi bi-list-ul"></i><span class="ek-mobilebar__t">Categorías</span></button>' +
      '<button class="ek-mobilebar__i" type="button" id="ek-mb-buscar"><i class="bi bi-search"></i><span class="ek-mobilebar__t">Buscar</span></button>' +
      '<a class="ek-mobilebar__i" href="' + waLink("Hola, quiero información sobre sus productos") + '" target="_blank" rel="noopener"><i class="bi bi-whatsapp"></i><span class="ek-mobilebar__t">WhatsApp</span></a>' +
      '<button class="ek-mobilebar__i" type="button" id="ek-mb-carrito"><span class="ek-mobilebar__b ek-hide" data-cart-count>0</span><i class="bi bi-bag-heart"></i><span class="ek-mobilebar__t">Carrito</span></button>';
    document.body.appendChild(b);
    var bc = $("#ek-mb-buscar");
    if (bc) bc.onclick = function () {
      var inp = $(".ek-search input");
      if (inp) { inp.focus(); inp.scrollIntoView({ block: "center", behavior: RM ? "auto" : "smooth" }); }
    };
    var bca = $("#ek-mb-carrito");
    if (bca) bca.onclick = function () { abrirDrawerCarrito(true); };
    document.body.classList.add("has-mobilebar");
  }

  /* ======================= PORTADA ======================= */
  /* Destaca las últimas palabras del título (sin cortar el texto nunca) */
  var VACIAS = ["de", "del", "la", "el", "los", "las", "y", "e", "o", "u", "en", "con", "para", "por", "a", "al", "un", "una", "tu", "tus", "su", "sus", "mas", "más", "que"];
  function tituloHero(t) {
    var w = String(t).split(" ");
    if (w.length < 4) return esc(t);
    var ini = -1, desde = Math.max(2, w.length - 4);
    for (var i = w.length - 2; i >= desde; i--) {
      if (VACIAS.indexOf(w[i].toLowerCase().replace(/[^\wáéíóúñ]/g, "")) === -1) { ini = i; break; }
    }
    if (ini < 0) ini = w.length - 2;
    return esc(w.slice(0, ini).join(" ")) + " <em>" + esc(w.slice(ini).join(" ")) + "</em>";
  }
  /* Datos reales del banner: precio más bajo y mayor descuento de su categoría */
  function datosBanner(b) {
    var m = /cat=([\w-]+)/.exec(b.link || "");
    if (!m) return null;
    var lista = P.filter(function (p) { return p.c.indexOf(m[1]) > -1; });
    if (!lista.length) return null;
    var desde = Math.min.apply(null, lista.map(function (p) { return p.p; }));
    var off = Math.max.apply(null, lista.map(desc));
    return { desde: desde, off: off, n: lista.length };
  }

  function initHome() {
    /* ---- Carrusel de banners (hasta 10) ---- */
    var B = D.banners.slice(0, 10), cont = $("#ek-hero-slides");
    if (cont && B.length) {
      cont.innerHTML = B.map(function (b, i) {
        var im = imgBanner(b, i, 1200), d = datosBanner(b);
        /* Solo el primer banner lleva <h1>: tener 10 encabezados de nivel 1
           (9 de ellos ocultos) perjudica el SEO. El resto van como <p>. */
        var tag = i === 0 ? "h1" : "p";
        return '<article class="ek-hero__slide' + (i === 0 ? " is-on" : "") + '" data-i="' + i + '">' +
          '<div class="ek-hero__body">' +
            '<span class="ek-hero__et">' + esc(b.et) + "</span>" +
            "<" + tag + ' class="ek-hero__t">' + tituloHero(b.n) + "</" + tag + ">" +
            '<p class="ek-hero__p">' + esc(b.sub) + "</p>" +
            '<div class="ek-hero__cta">' +
              '<a class="ek-btn ek-btn--rojo ek-btn--lg" href="' + b.link + '">' + esc(b.cta) + ' <i class="bi bi-arrow-right"></i></a>' +
              '<a class="ek-btn ek-btn--blanco ek-btn--lg" href="' + waLink("Hola, quiero cotizar: " + b.n) + '" target="_blank" rel="noopener"><i class="bi bi-whatsapp"></i> Cotizar</a>' +
            "</div>" +
            '<div class="ek-hero__trust">' +
              "<span><i class=\"bi bi-truck\"></i> Envío gratis desde " + money(C.envioGratisDesde) + "</span>" +
              '<span><i class="bi bi-palette"></i> 100% personalizable</span>' +
              '<span><i class="bi bi-lightning-charge-fill"></i> Respuesta en minutos</span>' +
            "</div>" +
          "</div>" +
          '<div class="ek-hero__media">' +
            '<img src="' + im.src + '" data-hotlink="' + im.hot + '" alt="' + esc(b.n) + '" ' +
              (i === 0 ? 'fetchpriority="high"' : 'loading="lazy"') + ' decoding="async" width="1200" height="900" onerror="EK_imgSwap(this)">' +
            (d ? '<span class="ek-hero__chip"><i class="bi bi-tag-fill"></i> Desde ' + money(d.desde) + "</span>" : '<span class="ek-hero__chip"><i class="bi bi-hand-thumbs-up-fill"></i> Hecho a mano</span>') +
            (d && d.off >= 15 ? '<span class="ek-hero__off">Hasta -' + d.off + "%</span>" : "") +
          "</div>" +
        "</article>";
      }).join("");
      var dots = $("#ek-hero-dots");
      if (dots) dots.innerHTML = B.map(function (b, i) { return '<button class="ek-hero__dot' + (i === 0 ? " is-on" : "") + '" data-go="' + i + '" aria-label="Ver banner ' + (i + 1) + " de " + B.length + '"></button>'; }).join("");
      var cuenta = $("#ek-hero-count");
      var barra = $("#ek-hero-bar span"), idx = 0, timer = null, DUR = 7000;

      function ir(n) {
        idx = (n + B.length) % B.length;
        $$(".ek-hero__slide", cont).forEach(function (s) { s.classList.toggle("is-on", +s.getAttribute("data-i") === idx); });
        $$(".ek-hero__dot", cont.parentNode).forEach(function (d) { d.classList.toggle("is-on", +d.getAttribute("data-go") === idx); });
        if (cuenta) cuenta.textContent = (idx + 1) + " / " + B.length;
        if (barra) { barra.style.transition = "none"; barra.style.width = "0"; void barra.offsetWidth; barra.style.transition = "width " + DUR + "ms linear"; barra.style.width = "100%"; }
      }
      function auto() { clearInterval(timer); if (RM) return; timer = setInterval(function () { ir(idx + 1); }, DUR); }
      function parar() { clearInterval(timer); }
      var prev = $("#ek-hero-prev"), next = $("#ek-hero-next");
      if (prev) prev.onclick = function () { ir(idx - 1); auto(); };
      if (next) next.onclick = function () { ir(idx + 1); auto(); };
      if (dots) dots.onclick = function (e) { var d = e.target.closest("[data-go]"); if (d) { ir(+d.getAttribute("data-go")); auto(); } };
      ir(0); auto();
      /* Se pausa al pasar el mouse o al tocar, para que dé tiempo de leer */
      var hero = $(".ek-hero");
      if (hero) {
        hero.addEventListener("mouseenter", parar);
        hero.addEventListener("mouseleave", auto);
        hero.addEventListener("focusin", parar);
      }
      document.addEventListener("visibilitychange", function () { document.hidden ? parar() : auto(); });
      document.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") { ir(idx - 1); auto(); }
        if (e.key === "ArrowRight") { ir(idx + 1); auto(); }
      });
      /* Deslizar con el dedo */
      var x0 = null, y0 = null;
      cont.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; parar(); }, { passive: true });
      cont.addEventListener("touchend", function (e) {
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
        if (Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy)) ir(idx + (dx < 0 ? 1 : -1));
        x0 = null; auto();
      }, { passive: true });
    }

    /* ---- Tira de píldoras deslizable de la portada: filtra las tendencias ---- */
    var ph = $("#ek-pills-home");
    if (ph) {
      ph.innerHTML = tiraPildoras("", "", null, "home");
      conectarTira(ph);
      ph.addEventListener("click", function (e) {
        var b = e.target.closest("[data-pill]"); if (!b) return;
        var sub = b.getAttribute("data-pill"), c = b.getAttribute("data-pill-cat");
        var lista = P.filter(function (p) {
          return (!c || p.c.indexOf(c) > -1) && (!sub || subDe(p.s).indexOf(sub) > -1);
        }).sort(function (a, x) { return (x.v * x.r) - (a.v * a.r); });
        var grid = $("#ek-tendencia");
        if (grid) {
          grid.innerHTML = lista.length
            ? lista.slice(0, 12).map(tarjeta).join("")
            : '<div class="ek-empty" style="grid-column:1/-1"><i class="bi bi-search"></i><h3>Sin artículos aquí</h3><p class="ek-muted">Prueba con otra subcategoría.</p></div>';
        }
        $$("[data-pill]", ph).forEach(function (x) { x.classList.toggle("is-on", x === b); });
        var t = $("#ek-tendencia-titulo");
        var s = subInfo(sub);
        if (t) t.textContent = s ? "Artículos en tendencia · " + s.n : "Artículos en tendencia 🔥";
        revelar();
      });
    }

    /* ---- Artículos en tendencia ---- */
    var tend = $("#ek-tendencia");
    if (tend) {
      var lista = P.slice().sort(function (a, b) { return (b.v * b.r) - (a.v * a.r); }).slice(0, 12);
      tend.innerHTML = lista.map(tarjeta).join("");
    }
    /* ---- Novedades (ofertas) ---- */
    var ofer = $("#ek-ofertas");
    if (ofer) {
      var ol = P.filter(function (p) { return p.a > p.p; }).sort(function (a, b) { return desc(b) - desc(a); }).slice(0, 8);
      ofer.innerHTML = ol.map(tarjeta).join("");
    }
    /* ---- Oferta del día (el bloque estrella de la referencia) ---- */
    var dotd = $("#ek-dotd");
    if (dotd) {
      var mejor = P.filter(function (p) { return p.a > p.p && p.st > 0; })
        .sort(function (a, b) { return (desc(b) * b.v) - (desc(a) * a.v); })[0];
      if (mejor) {
        var secD = $("#ek-dotd-sec");
        if (secD) secD.classList.remove("ek-hide");
        var cD = cat(mejor.c[0]);
        dotd.innerHTML = '<article class="ek-dotd">' +
          '<div class="ek-dotd__media">' +
            '<span class="ek-dotd__et">-' + desc(mejor) + "% hoy</span>" +
            '<img src="' + imgURL(mejor, 0, 900) + '" data-hotlink="' + hotProd(mejor, 0, 900) + '" alt="' + esc(mejor.n) + '" loading="lazy" decoding="async" width="900" height="900" onerror="EK_imgSwap(this)">' +
          "</div>" +
          '<div class="ek-dotd__b">' +
            '<span class="ek-pill ek-pill--rojo">⏰ Oferta del día</span>' +
            "<h2>" + esc(mejor.n) + "</h2>" +
            '<p class="ek-muted">' + esc(mejor.d) + "</p>" +
            '<div class="ek-dotd__precios"><span class="ek-price">' + money(mejor.p) + "</span>" +
              '<span class="ek-price--old">' + money(mejor.a) + "</span>" +
              '<span class="ek-price--off">Ahorras ' + money(mejor.a - mejor.p) + "</span></div>" +
            '<div class="ek-dotd__reloj" id="ek-dotd-reloj">' +
              '<span><b id="ek-dotd-h">00</b><small>Horas</small></span>' +
              '<span><b id="ek-dotd-m">00</b><small>Min</small></span>' +
              '<span><b id="ek-dotd-s">00</b><small>Seg</small></span>' +
            "</div>" +
            '<div class="ek-dotd__barra"><i style="width:' + Math.max(6, Math.min(100, Math.round(mejor.st / 120 * 100))) + '%"></i></div>' +
            "<small class='ek-muted'>Quedan <b>" + nf(mejor.st) + "</b> piezas · " + nf(mejor.v) + " vendidas" +
              (cD ? ' · en <a href="categoria.html?cat=' + cD.s + '">' + esc(cD.n) + "</a>" : "") + "</small>" +
            '<div class="ek-row" style="gap:10px;margin-top:16px">' +
              '<a class="ek-btn ek-btn--rojo ek-btn--lg" href="articulo.html?id=' + mejor.s + '"><i class="bi bi-lightning-charge-fill"></i> Aprovechar oferta</a>' +
              '<button class="ek-btn ek-btn--azul ek-btn--lg" data-add="' + mejor.s + '"><i class="bi bi-bag-plus"></i> Agregar</button>' +
              '<a class="ek-btn ek-btn--wa ek-btn--lg" target="_blank" rel="noopener" href="' + waLink("Hola, quiero aprovechar la oferta del día: " + mejor.n) + '"><i class="bi bi-whatsapp"></i></a>' +
            "</div>" +
            '<div class="ek-trust" style="margin-top:16px;border-top:1px dashed var(--linea);padding-top:16px">' +
              '<div><i class="bi bi-truck"></i>Envío gratis<br>desde ' + money(C.envioGratisDesde) + "</div>" +
              '<div><i class="bi bi-palette"></i>Personalizable<br>a tu gusto</div>' +
              '<div><i class="bi bi-shield-check"></i>Pago seguro<br>SPEI · tarjeta</div>' +
            "</div>" +
          "</div></article>";
        /* Cuenta regresiva hasta la medianoche */
        (function () {
          var hh = $("#ek-dotd-h"), mm = $("#ek-dotd-m"), ss = $("#ek-dotd-s");
          if (!hh) return;
          function tic() {
            var ahora = new Date();
            var fin = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1, 0, 0, 0);
            var d = Math.max(0, Math.floor((fin - ahora) / 1000));
            var dos = function (n) { return (n < 10 ? "0" : "") + n; };
            hh.textContent = dos(Math.floor(d / 3600));
            mm.textContent = dos(Math.floor(d % 3600 / 60));
            ss.textContent = dos(d % 60);
          }
          tic(); setInterval(tic, 1000);
        })();
      }
    }

    /* ---- Categorías de temporada ---- */
    var temp = $("#ek-temporada");
    if (temp) temp.innerHTML = CATS.filter(function (c) { return c.g === "temporada"; }).sort(function (a, b) { return a.orden - b.orden; }).map(tarjetaCat).join("");
    /* ---- Categorías por producto ---- */
    var cats = $("#ek-categorias");
    if (cats) cats.innerHTML = CATS.filter(function (c) { return c.g === "producto"; }).sort(function (a, b) { return a.orden - b.orden; }).map(tarjetaCat).join("");
    /* ---- Reseñas ---- */
    var res = $("#ek-resenas");
    if (res) {
      res.innerHTML = D.resenas.map(function (r) {
        var p = prod(r.p);
        return '<article class="ek-card ek-reveal" style="box-shadow:var(--sombra)"><div class="ek-card__body">' +
          '<div class="ek-row" style="gap:10px"><span style="width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:var(--degradado-2);color:#fff;font-weight:900">' + esc(r.n.charAt(0)) + "</span>" +
          "<span><b>" + esc(r.n) + "</b><br><small class='ek-muted'>" + esc(r.c) + " · " + esc(r.f) + "</small></span></div>" +
          "<div style='color:var(--oro);font-size:.95rem'>" + "★".repeat(r.e) + "☆".repeat(5 - r.e) + "</div>" +
          "<p style='margin:6px 0 10px;font-size:.92rem'>" + esc(r.t) + "</p>" +
          (p ? '<a class="ek-sec__link" style="font-size:.85rem" href="articulo.html?id=' + p.s + '"><i class="bi bi-box-seam"></i> ' + esc(p.n) + "</a>" : "") +
          "</div></article>";
      }).join("");
      conectarCarrusel($("#ek-resenas").closest("[data-carrusel]"));
    }
    /* ---- Artículos más vistos de cada temporada ---- */
    var cinta = $("#ek-cinta");
    if (cinta) {
      var items = CATS.filter(function (c) { return c.g === "temporada"; }).map(function (c) {
        var n = P.filter(function (p) { return p.c.indexOf(c.s) > -1; }).reduce(function (a, p) { return a + p.v; }, 0);
        return "<span class='ek-topbar__item'>" + c.e + " " + esc(c.n) + " · " + nf(n) + " vendidos</span>";
      }).join("") + "<span class='ek-topbar__item'>🚚 Envío gratis desde " + money(C.envioGratisDesde) + "</span>";
      // Se duplica para que la cinta gire sin saltos
      cinta.innerHTML = items + items;
    }
    contadores();
  }

  /* ---- Preguntas frecuentes (aparecen en cualquier página que tenga #ek-faq) ---- */
  function initFAQ() {
    $$("#ek-faq").forEach(function (faq) {
      if (faq.dataset.listo) return;
      faq.dataset.listo = "1";
      faq.innerHTML = D.faq.map(function (f) {
        return '<div class="ek-side ek-reveal" style="margin-bottom:12px"><div class="ek-side__hd" style="cursor:pointer">' + esc(f.p) + '<i class="bi bi-chevron-down"></i></div>' +
          '<div class="ek-side__bd" style="font-size:.93rem;color:var(--gris)">' + esc(f.r) + "</div></div>";
      }).join("");
    });
    var s404 = $("#ek-sugerencias404");
    if (s404) s404.innerHTML = CATS.filter(function (c) { return c.nav; }).slice(0, 8).map(tarjetaCat).join("");
  }

  /* ======================= TIENDA / CATEGORÍA ======================= */
  var F = {};
  function initTienda() {
    var cont = $("#ek-productos"), aside = $("#ek-filtros") || $("#ek-sidebar");
    if (!cont) return;
    var catURL = param("cat"), qURL = param("q");
    F = {
      cats: catURL ? [catURL] : (param("cats") ? param("cats").split(",") : []),
      sub: param("sub") ? [param("sub")] : [],
      q: qURL, col: param("color") ? param("color").split(",") : [], t: param("talla") ? param("talla").split(",") : [],
      min: num(param("min"), 0), max: num(param("max"), 99999), orden: param("orden") || "relevancia",
      badge: param("etiqueta") || "", disp: param("disp") === "1", est: num(param("est"), 0), fav: param("fav") === "1", pag: 1
    };
    var precioMax = Math.max.apply(null, P.map(function (p) { return p.p; }));
    var colores = [], tallas = [];
    P.forEach(function (p) { p.col.forEach(function (c) { if (colores.indexOf(c) < 0) colores.push(c); }); p.t.forEach(function (t) { if (tallas.indexOf(t) < 0) tallas.push(t); }); });
    colores.sort(); tallas.sort();

    function pintaFiltros() {
      if (!aside) return;
      var html = "";
      /* --- Categorías con sus subcategorías (acordeón) --- */
      var temps = CATS.filter(function (c) { return c.g === "temporada"; });
      var prods = CATS.filter(function (c) { return c.g === "producto"; });
      html += '<div class="ek-side"><div class="ek-side__hd">Temporada <i class="bi bi-chevron-down"></i></div><div class="ek-side__bd">' +
        acordeonCategorias("filtro", temps) + "</div></div>";
      html += '<div class="ek-side"><div class="ek-side__hd">Tipo de producto <i class="bi bi-chevron-down"></i></div><div class="ek-side__bd">' +
        acordeonCategorias("filtro", prods) + "</div></div>";
      html += '<div class="ek-side"><div class="ek-side__hd">Precio <i class="bi bi-chevron-down"></i></div><div class="ek-side__bd">' +
        '<div class="ek-range"><input type="range" id="f-min" min="0" max="' + precioMax + '" step="10" value="' + F.min + '"></div>' +
        '<div class="ek-range"><input type="range" id="f-max" min="0" max="' + precioMax + '" step="10" value="' + (F.max > precioMax ? precioMax : F.max) + '"></div>' +
        '<div class="ek-range__out" id="f-out">' + money(F.min) + " – " + money(F.max > precioMax ? precioMax : F.max) + "</div>" +
        '<div class="ek-chiplist" style="margin-top:8px">' +
        [[0, 200], [200, 500], [500, 1000], [1000, 99999]].map(function (r) {
          return '<button class="ek-chip" data-rango="' + r[0] + "," + r[1] + '">' + money(r[0]) + " – " + (r[1] > 90000 ? "+" : money(r[1])) + "</button>";
        }).join("") + "</div></div></div>";
      html += '<div class="ek-side"><div class="ek-side__hd">Color <i class="bi bi-chevron-down"></i></div><div class="ek-side__bd"><div class="ek-chiplist">' +
        colores.map(function (c) { return '<button class="ek-chip' + (F.col.indexOf(c) > -1 ? " is-on" : "") + '" data-color="' + esc(c) + '">' + esc(c) + "</button>"; }).join("") + "</div></div></div>";
      html += '<div class="ek-side is-cerrado"><div class="ek-side__hd">Talla / Tamaño <i class="bi bi-chevron-down"></i></div><div class="ek-side__bd"><div class="ek-chiplist">' +
        tallas.map(function (t) { return '<button class="ek-chip' + (F.t.indexOf(t) > -1 ? " is-on" : "") + '" data-talla="' + esc(t) + '">' + esc(t) + "</button>"; }).join("") + "</div></div></div>";
      html += '<div class="ek-side"><div class="ek-side__hd">Calificación <i class="bi bi-chevron-down"></i></div><div class="ek-side__bd"><div class="ek-chiplist">' +
        [4.8, 4.5, 4].map(function (r) { return '<button class="ek-chip' + (F.est === r ? " is-on" : "") + '" data-est="' + r + '">★ ' + r + " o más</button>"; }).join("") + "</div></div></div>";
      html += '<div class="ek-side"><div class="ek-side__hd">Otros filtros <i class="bi bi-chevron-down"></i></div><div class="ek-side__bd"><div class="ek-chiplist">' +
        '<button class="ek-chip' + (F.disp ? " is-on" : "") + '" data-disp="1"><i class="bi bi-box-seam"></i> Solo disponibles</button>' +
        '<button class="ek-chip' + (F.badge === "promo" ? " is-on" : "") + '" data-badge="promo">🔥 En oferta</button>' +
        '<button class="ek-chip' + (F.badge === "nuevo" ? " is-on" : "") + '" data-badge="nuevo">✨ Nuevo</button>' +
        '<button class="ek-chip' + (F.badge === "top" ? " is-on" : "") + '" data-badge="top">★ Más vendido</button>' +
        '<button class="ek-chip' + (F.fav ? " is-on" : "") + '" data-favf="1"><i class="bi bi-heart-fill"></i> Mis favoritos (' + favs().length + ")</button>" +
        "</div></div></div>";
      aside.innerHTML = html;
      /* Deja abiertas las categorías activas y sus subcategorías marcadas */
      $$(".ek-catwrap", aside).forEach(function (w) {
        var b = $("[data-cat]", w), s = $("[data-sub]", w);
        var activa = b && F.cats.indexOf(b.getAttribute("data-cat")) > -1;
        if (activa) w.classList.add("is-open");
        if (s) {
          var sub = s.getAttribute("data-sub");
          if (sub && F.sub.indexOf(sub) > -1) { w.classList.add("is-open"); s.classList.add("is-on"); }
        }
      });
    }
    /* Los manejadores se registran UNA sola vez (delegación de eventos) */
    if (aside) aside.addEventListener("input", function (e) {
      if (e.target.id === "f-min") { F.min = +e.target.value; if (F.min > F.max) F.max = F.min; $("#f-out").textContent = money(F.min) + " – " + money(F.max); F.pag = 1; pintar(); }
      if (e.target.id === "f-max") { F.max = +e.target.value; if (F.max < F.min) F.min = F.max; $("#f-out").textContent = money(F.min) + " – " + money(F.max); F.pag = 1; pintar(); }
    });
    if (aside) aside.addEventListener("click", function (e) {
        var b = e.target.closest("button"); if (!b) return;
        var v;
        /* --- Categorías y subcategorías --- */
        if (b.hasAttribute("data-cat")) {
          var cc = b.getAttribute("data-cat");
          F.cats = (F.cats.length === 1 && F.cats[0] === cc) ? [] : [cc];
          F.sub = [];
          F.pag = 1; pintaFiltros(); pintaPills(); pintar(); return;
        }
        if (b.hasAttribute("data-sub")) {
          var ss = b.getAttribute("data-sub"), padre = b.getAttribute("data-padre");
          if (!ss) F.sub = [];
          else { F.cats = [padre]; alt(F.sub, ss); }
          F.pag = 1; pintaFiltros(); pintaPills(); pintar(); return;
        }
        if (b.hasAttribute("data-color")) { v = b.getAttribute("data-color"); alt(F.col, v); }
        else if (b.hasAttribute("data-talla")) { v = b.getAttribute("data-talla"); alt(F.t, v); }
        else if (b.hasAttribute("data-est")) { F.est = F.est === +b.getAttribute("data-est") ? 0 : +b.getAttribute("data-est"); }
        else if (b.hasAttribute("data-disp")) { F.disp = !F.disp; }
        else if (b.hasAttribute("data-favf")) { F.fav = !F.fav; }
        else if (b.hasAttribute("data-badge")) { v = b.getAttribute("data-badge"); F.badge = F.badge === v ? "" : v; }
        else if (b.hasAttribute("data-rango")) { v = b.getAttribute("data-rango").split(","); F.min = +v[0]; F.max = +v[1]; }
      F.pag = 1; pintaFiltros(); pintar();
    });
    function alt(arr, v) { var i = arr.indexOf(v); if (i > -1) arr.splice(i, 1); else arr.push(v); }

    function filtrar() {
      var r = P.filter(function (p) {
        if (F.cats.length && !F.cats.some(function (c) { return p.c.indexOf(c) > -1; })) return false;
        if (F.sub.length && !F.sub.some(function (s) { return subDe(p.s).indexOf(s) > -1; })) return false;
        if (p.p < F.min || p.p > F.max) return false;
        if (F.col.length && !F.col.some(function (c) { return p.col.indexOf(c) > -1; })) return false;
        if (F.t.length && !F.t.some(function (t) { return p.t.indexOf(t) > -1; })) return false;
        if (F.disp && p.st <= 0) return false;
        if (F.est && p.r < F.est) return false;
        if (F.badge && p.b !== F.badge) return false;
        if (F.fav && !esFav(p.s)) return false;
        return true;
      });
      if (F.q) { var ids = buscar(F.q, 999).map(function (p) { return p.s; }); r = r.filter(function (p) { return ids.indexOf(p.s) > -1; }); }
      var o = F.orden;
      r.sort(function (a, b) {
        if (o === "precio-asc") return a.p - b.p;
        if (o === "precio-desc") return b.p - a.p;
        if (o === "vendidos") return b.v - a.v;
        if (o === "estrellas") return b.r - a.r || b.v - a.v;
        if (o === "nuevos") return (b.b === "nuevo" ? 1 : 0) - (a.b === "nuevo" ? 1 : 0) || b.v - a.v;
        if (o === "nombre") return a.n.localeCompare(b.n, "es");
        if (o === "descuento") return desc(b) - desc(a);
        return (b.v * b.r + (b.b ? 900 : 0)) - (a.v * a.r + (a.b ? 900 : 0));
      });
      return r;
    }
    function syncURL() {
      var u = new URLSearchParams();
      if (F.cats.length) u.set("cats", F.cats.join(","));
      if (F.sub.length) u.set("sub", F.sub.join(","));
      if (F.q) u.set("q", F.q);
      if (F.col.length) u.set("color", F.col.join(","));
      if (F.t.length) u.set("talla", F.t.join(","));
      if (F.min > 0) u.set("min", F.min);
      if (F.max < precioMax) u.set("max", F.max);
      if (F.orden !== "relevancia") u.set("orden", F.orden);
      if (F.badge) u.set("etiqueta", F.badge);
      if (F.disp) u.set("disp", "1");
      if (F.est) u.set("est", F.est);
      if (F.fav) u.set("fav", "1");
      var qs = u.toString();
      try { history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "")); } catch (e) { }
    }
    function pintar() {
      syncURL();
      var r = filtrar(), vis = r.slice(0, F.pag * C.porPagina);
      cont.innerHTML = vis.length ? vis.map(tarjeta).join("") :
        '<div class="ek-empty" style="grid-column:1/-1"><i class="bi bi-search"></i><h3>Sin resultados</h3><p class="ek-muted">Prueba con otros filtros o escríbenos por WhatsApp: hacemos pedidos personalizados.</p><a class="ek-btn ek-btn--wa" target="_blank" rel="noopener" href="' + waLink("Hola, busco un artículo personalizado") + '"><i class="bi bi-whatsapp"></i> Pedir personalizado</a></div>';
      var info = $("#ek-cuenta"); if (info) info.innerHTML = "<b>" + r.length + "</b> artículo" + (r.length === 1 ? "" : "s") + (F.q ? ' para “<b>' + esc(F.q) + "</b>”" : "");
      var mas = $("#ek-mas"); if (mas) mas.classList.toggle("ek-hide", vis.length >= r.length);
      var tags = $("#ek-tags");
      if (tags) {
        var tt = [];
        F.cats.forEach(function (c) { var x = cat(c); if (x) tt.push('<span class="ek-tag">' + x.e + " " + esc(x.n) + ' <button data-quita="cat:' + c + '">&times;</button></span>'); });
        F.sub.forEach(function (s) { var x = subInfo(s); if (x) tt.push('<span class="ek-tag">' + esc(x.n) + ' <button data-quita="sub:' + s + '">&times;</button></span>'); });
        F.col.forEach(function (c) { tt.push('<span class="ek-tag">🎨 ' + esc(c) + ' <button data-quita="col:' + esc(c) + '">&times;</button></span>'); });
        F.t.forEach(function (c) { tt.push('<span class="ek-tag">📏 ' + esc(c) + ' <button data-quita="t:' + esc(c) + '">&times;</button></span>'); });
        if (F.q) tt.push('<span class="ek-tag">🔍 ' + esc(F.q) + ' <button data-quita="q">&times;</button></span>');
        tags.innerHTML = tt.length ? tt.join("") + '<button class="ek-chip" data-quita="todo">Limpiar todo</button>' : "";
      }
      revelar();
    }

    /* --------- Tira de píldoras deslizable (subcategorías) --------- */
    function pintaPills() {
      var caja = $("#ek-pills");
      if (!caja) return;
      /* Subcategorías de la categoría activa; si no hay, las más usadas */
      var lista, etiqueta;
      if (F.cats.length === 1) {
        lista = subsDeCat(F.cats[0]).filter(function (s) { return cuentaSub(F.cats[0], s.s) > 0; });
        var c0 = cat(F.cats[0]);
        etiqueta = c0 ? c0.n : "";
      } else {
        lista = SUB.lista.filter(function (s) { return s.c > 0; }).slice().sort(function (a, b) { return b.c - a.c; }).slice(0, 14);
        etiqueta = "Lo más buscado";
      }
      if (!lista.length) { caja.innerHTML = ""; caja.classList.add("ek-hide"); return; }
      caja.classList.remove("ek-hide");
      var total = F.cats.length === 1
        ? P.filter(function (p) { return p.c.indexOf(F.cats[0]) > -1; }).length
        : P.length;
      caja.innerHTML =
        '<button class="ek-pillstrip__ar" type="button" data-pill-prev aria-label="Desplazar a la izquierda"><i class="bi bi-chevron-left"></i></button>' +
        '<div class="ek-pillstrip__box"><ul class="ek-pillstrip__ul" id="ek-pills-ul">' +
          '<li><button class="ek-pill' + (F.sub.length ? "" : " is-on") + '" type="button" data-pill=""><i class="bi bi-grid-fill"></i> Todo ' + esc(etiqueta) + " <small>" + total + "</small></button></li>" +
          lista.map(function (s) {
            return '<li><button class="ek-pill' + (F.sub.indexOf(s.s) > -1 ? " is-on" : "") + '" type="button" data-pill="' + s.s + '">' +
              '<i class="bi ' + s.i + '"></i> ' + esc(s.n) + " <small>" + (F.cats.length === 1 ? cuentaSub(F.cats[0], s.s) : s.c) + "</small></button></li>";
          }).join("") +
        "</ul></div>" +
        '<button class="ek-pillstrip__ar" type="button" data-pill-next aria-label="Desplazar a la derecha"><i class="bi bi-chevron-right"></i></button>';

      var ul = $("#ek-pills-ul"), iz = $("[data-pill-prev]", caja), de = $("[data-pill-next]", caja);
      function rev() {
        var max = ul.scrollWidth - ul.clientWidth - 2;
        iz.disabled = ul.scrollLeft <= 2;
        de.disabled = ul.scrollLeft >= max;
        iz.hidden = de.hidden = !(ul.scrollWidth > ul.clientWidth + 4);
        caja.classList.toggle("has-izq", ul.scrollLeft > 2);
        caja.classList.toggle("has-der", ul.scrollLeft < max);
      }
      iz.onclick = function () { ul.scrollBy({ left: -Math.max(160, ul.clientWidth * .7), behavior: RM ? "auto" : "smooth" }); };
      de.onclick = function () { ul.scrollBy({ left: Math.max(160, ul.clientWidth * .7), behavior: RM ? "auto" : "smooth" }); };
      ul.addEventListener("scroll", rev, { passive: true });
      setTimeout(rev, 50);
      window.addEventListener("resize", rev);
      rev();
    }
    var tags = $("#ek-tags");
    if (tags) tags.addEventListener("click", function (e) {
      var b = e.target.closest("[data-quita]"); if (!b) return;
      var v = b.getAttribute("data-quita");
      if (v === "todo") { F = { cats: [], sub: [], q: "", col: [], t: [], min: 0, max: precioMax, orden: F.orden, badge: "", disp: false, est: 0, fav: false, pag: 1 }; location.href = "tienda.html"; return; }
      if (v.indexOf("cat:") === 0) { alt(F.cats, v.slice(4)); F.sub = []; }
      if (v.indexOf("sub:") === 0) alt(F.sub, v.slice(4));
      if (v.indexOf("col:") === 0) alt(F.col, v.slice(4));
      if (v.indexOf("t:") === 0) alt(F.t, v.slice(2));
      if (v === "q") F.q = "";
      F.pag = 1; pintaFiltros(); pintaPills(); pintar();
    });
    /* --- Píldoras de subcategoría --- */
    var pills = $("#ek-pills");
    if (pills) pills.addEventListener("click", function (e) {
      var b = e.target.closest("[data-pill]"); if (!b) return;
      var s = b.getAttribute("data-pill");
      if (!s) F.sub = [];
      else alt(F.sub, s);
      F.pag = 1; pintaFiltros(); pintaPills(); pintar();
      var cont2 = $("#ek-productos");
      if (cont2 && window.innerWidth <= MOVIL) cont2.scrollIntoView({ block: "start", behavior: RM ? "auto" : "smooth" });
    });
    var ord = $("#ek-orden");
    if (ord) { ord.value = F.orden; ord.onchange = function () { F.orden = ord.value; F.pag = 1; pintar(); }; }
    var mas = $("#ek-mas");
    if (mas) mas.onclick = function () { F.pag++; pintar(); };

    /* Cabecera de la categoría */
    var c0 = cat(catURL);
    if (c0) {
      document.title = c0.n + " · " + C.marca;
      var bc = $("#ek-crumb-cat"); if (bc) bc.textContent = c0.n;
      var tt = $("#ek-cat-titulo"); if (tt) tt.innerHTML = c0.e + " " + esc(c0.n);
      var ss = $("#ek-cat-sub"); if (ss) ss.textContent = c0.d + (c0.epoca ? " · Disponible en " + c0.epoca : "");
      if (F.sub.length) { var sx = subInfo(F.sub[0]); if (tt && sx) tt.innerHTML += ' <span class="ek-muted" style="font-size:.6em">› ' + esc(sx.n) + "</span>"; }
    } else if (qURL) {
      var t2 = $("#ek-cat-titulo"); if (t2) t2.innerHTML = "🔍 Resultados de búsqueda";
      var s2 = $("#ek-cat-sub"); if (s2) s2.textContent = "Mostrando artículos que coinciden con “" + qURL + "”.";
      var b2 = $("#ek-crumb-cat"); if (b2) b2.textContent = "Buscar";
    } else {
      var t3 = $("#ek-cat-titulo"); if (t3) t3.innerHTML = "🛍️ Todos los artículos";
      var s3 = $("#ek-cat-sub"); if (s3) s3.textContent = "Filtra por categoría, color, precio, talla o calificación. Todo hecho a mano en Taller Creativo EK.";
    }
    pintaFiltros(); pintaPills(); pintar();
  }

  /* ======================= FICHA DE ARTÍCULO ======================= */
  function initProducto() {
    var cont = $("#ek-producto"); if (!cont) return;
    var p = prod(param("id"));
    if (!p) { cont.innerHTML = '<div class="ek-empty"><i class="bi bi-emoji-frown"></i><h3>No encontramos ese artículo</h3><p class="ek-muted">Puede que ya no esté disponible. Mira el catálogo completo.</p><a class="ek-btn ek-btn--rojo" href="tienda.html">Ver catálogo</a></div>'; return; }
    document.title = p.n + " · " + C.marca;
    var c0 = cat(p.c[0]), off = desc(p), rv = Math.max(3, Math.round(p.v * .12));

    /* JSON-LD para Google */
    var ld = document.createElement("script"); ld.type = "application/ld+json";
    ld.textContent = JSON.stringify({
      "@context": "https://schema.org", "@type": "Product", name: p.n, description: p.d, sku: p.s,
      brand: { "@type": "Brand", name: C.marca },
      aggregateRating: { "@type": "AggregateRating", ratingValue: p.r, reviewCount: rv },
      offers: { "@type": "Offer", price: p.p, priceCurrency: C.moneda, availability: p.st > 0 ? "https://schema.org/InStock" : "https://schema.org/PreOrder", url: C.url + "/articulo.html?id=" + p.s }
    });
    document.head.appendChild(ld);

    var enc = [];
    enc.push('<div class="ek-crumbs ek-container" style="padding-top:16px"><a href="index.html">Inicio</a> <i class="bi bi-chevron-right"></i> ' +
      (c0 ? '<a href="categoria.html?cat=' + c0.s + '">' + esc(c0.n) + "</a> <i class=\"bi bi-chevron-right\"></i> " : "") +
      "<span>" + esc(p.n) + "</span></div>");
    enc.push('<div class="ek-detail ek-container">');
    enc.push('<div class="ek-gallery"><div class="ek-gallery__main" id="ek-zoom">' +
      '<div class="ek-gallery__badges">' + insignias(p) + "</div>" +
      '<img id="ek-main-img" src="' + imgURL(p, 0, 900) + '" alt="' + esc(p.n) + '" width="900" height="900" onerror="EK_imgErr(this)">' +
      "</div><div class=\"ek-gallery__thumbs\">" +
      (function () {
        var nFotos = (p.imagenes && p.imagenes.length) ? Math.min(5, p.imagenes.length) : 3;
        var h = "";
        for (var i = 0; i < nFotos; i++) {
          h += '<button class="ek-thumb' + (i === 0 ? " is-on" : "") + '" data-img="' + i + '">' + imgTag(p, i, 300, p.n + " foto " + (i + 1)) +
            '<span class="ek-thumb__n">Foto ' + (i + 1) + "</span></button>";
        }
        return h;
      })() + "</div>" +
      '<div class="ek-row" style="gap:8px;margin-top:4px"><i class="bi bi-info-circle ek-muted"></i><small class="ek-muted">Toca la foto para ampliarla.</small></div></div>');

    enc.push('<div class="ek-buy"><span class="ek-pill ek-pill--rojo">' + (c0 ? c0.e + " " + esc(c0.n) : "Taller Creativo EK") + "</span>" +
      '<h1 class="ek-buy__title">' + esc(p.n) + "</h1>" +
      '<div class="ek-row" style="gap:14px" id="ek-live-meta">' + estrellas(p.r, rv) + "<span class='ek-muted'>·</span><span class='ek-muted'><i class=\"bi bi-fire\"></i> " + nf(p.v) + " vendidos</span>" +
      "<span class='ek-muted'>·</span><span class='ek-muted'><i class=\"bi bi-box-seam\"></i> " + nf(p.st) + " en stock</span></div>" +
      '<div class="ek-buy__price"><span class="ek-price" id="ek-live-precio">' + money(p.p) + "</span>" +
      (off ? '<span class="ek-price--old">' + money(p.a) + '</span><span class="ek-price--off">Ahorras ' + money(p.a - p.p) + " (-" + off + "%)</span>" : "") + "</div>" +
      (esDistribuidor() && p.pd ? '<div style="color:var(--azul);font-weight:700;margin-bottom:6px">Precio distribuidor: ' + money(p.pd) + "</div>" : "") +
      '<div class="ek-buy__msi"><i class="bi bi-credit-card-2-front"></i> ' + esc(C.mesesSinIntereses) + "</div>" +
      '<div class="ek-stockbar' + (p.st <= 10 ? " poco" : "") + '" id="ek-live-stockbar"><i style="width:' + Math.max(6, Math.min(100, Math.round(p.st / 120 * 100))) + '%"></i></div>' +
      "<small class='ek-muted' id='ek-live-stocktext'>" + (p.st > 0 ? "Quedan <b>" + nf(p.st) + "</b> piezas · " + nf(p.v) + " ya vendidas" : "Agotado por ahora: te avisamos cuando llegue") + "</small>" +
      '<div class="ek-opt"><div class="ek-opt__l"><span>Tamaño / Talla</span><span class="ek-muted" id="ek-talla-sel">' + esc(p.t[0]) + "</span></div>" +
      '<div class="ek-chiplist" id="ek-tallas">' + p.t.map(function (t, i) { return '<button class="ek-chip' + (i === 0 ? " is-on" : "") + '" data-t="' + esc(t) + '">' + esc(t) + "</button>"; }).join("") + "</div></div>" +
      '<div class="ek-opt"><div class="ek-opt__l"><span>Color</span><span class="ek-muted" id="ek-color-sel">' + esc(p.col[0]) + "</span></div>" +
      '<div class="ek-chiplist" id="ek-colores">' + p.col.map(function (c, i) { return '<button class="ek-chip' + (i === 0 ? " is-on" : "") + '" data-c="' + esc(c) + '">' + esc(c) + "</button>"; }).join("") + "</div></div>" +
      '<div class="ek-opt"><div class="ek-opt__l"><span>Cantidad</span><span class="ek-muted" id="ek-live-max">Máx. ' + nf(p.st) + "</span></div>" +
      '<div class="ek-qty"><button data-q="-1" aria-label="Menos">−</button><input id="ek-cant" type="number" value="1" min="1" max="' + Math.max(1, p.st) + '"><button data-q="1" aria-label="Más">+</button></div></div>' +
      '<div class="ek-buy__cta">' +
      '<button class="ek-btn ek-btn--rojo ek-btn--lg" id="ek-add"><i class="bi bi-bag-plus"></i> Agregar al carrito</button>' +
      '<a class="ek-btn ek-btn--ghost ek-btn--lg" href="carrito.html"><i class="bi bi-cart3"></i> Ver carrito</a>' +
      '<a class="ek-btn ek-btn--wa ek-btn--lg" id="ek-wa" target="_blank" rel="noopener" href="' + waLink("Hola, quiero: " + p.n + " (" + money(p.p) + ")") + '"><i class="bi bi-whatsapp"></i> Comprar por WhatsApp</a>' +
      "</div>" +
      '<div class="ek-trust"><div><i class="bi bi-truck"></i>Envío gratis<br>desde ' + money(C.envioGratisDesde) + "</div>" +
      '<div><i class="bi bi-palette"></i>Personalizado<br>a tu gusto</div>' +
      '<div><i class="bi bi-shield-check"></i>Pago seguro<br>SPEI · tarjeta</div></div></div>');
    enc.push("</div>");

    /* Pestañas */
    var rel = P.filter(function (x) { return x.s !== p.s && x.c.some(function (c) { return p.c.indexOf(c) > -1; }); })
      .sort(function (a, b) { return b.v - a.v; }).slice(0, 4);
    enc.push('<div class="ek-container"><div class="ek-tabs">' +
      '<button class="ek-tab is-on" data-tab="0">Descripción</button>' +
      '<button class="ek-tab" data-tab="1">Características</button>' +
      '<button class="ek-tab" data-tab="2">Envío y pago</button>' +
      '<button class="ek-tab" data-tab="3">Reseñas (' + rv + ")</button></div>" +
      '<div class="ek-panel is-on" data-panel="0"><p>' + esc(p.d) + "</p><p>En <b>" + esc(C.marca) + "</b> cada pieza se corta, pinta y personaliza a mano en nuestro taller. " +
      "Trabajamos MDF, impresión DTF UV y acabados de alta duración, así que tu artículo se ve increíble y resiste el uso diario. " +
      "Puedes pedirlo tal cual o mandarnos tu foto, logo o idea por WhatsApp y te enviamos una vista previa antes de producir.</p>" +
      "<ul>" + p.f.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul></div>" +
      '<div class="ek-panel" data-panel="1"><div class="ek-specs">' +
      p.f.map(function (f) { return '<div class="ek-spec"><i class="bi bi-check-circle-fill"></i><span><b>' + esc(f) + "</b><small>Incluido en este artículo</small></span></div>"; }).join("") +
      '<div class="ek-spec"><i class="bi bi-check-circle-fill"></i><span><b>Tallas / tamaños: ' + p.t.length + "</b><small>" + esc(p.t.join(" · ")) + "</small></span></div>" +
      '<div class="ek-spec"><i class="bi bi-check-circle-fill"></i><span><b>Colores: ' + p.col.length + "</b><small>" + esc(p.col.join(" · ")) + "</small></span></div>" +
      '<div class="ek-spec"><i class="bi bi-check-circle-fill"></i><span><b>SKU</b><small>EK-' + p.s.slice(0, 14).toUpperCase() + "</small></span></div>" +
      "</div></div>" +
      '<div class="ek-panel" data-panel="2"><div class="ek-specs">' +
      '<div class="ek-spec"><i class="bi bi-truck"></i><span><b>Envíos a todo México</b><small>Paquetería 2 a 5 días hábiles. Gratis desde ' + money(C.envioGratisDesde) + ".</small></span></div>" +
      '<div class="ek-spec"><i class="bi bi-shop"></i><span><b>Entrega local</b><small>' + esc(C.direccion) + "</small></span></div>" +
      '<div class="ek-spec"><i class="bi bi-cash-coin"></i><span><b>Transferencia SPEI</b><small>' + esc(C.pagos.spei.banco) + " · " + esc(C.pagos.spei.titular) + "</small></span></div>" +
      '<div class="ek-spec"><i class="bi bi-credit-card"></i><span><b>Tarjeta</b><small>Mercado Pago y Clip. ' + esc(C.mesesSinIntereses) + "</small></span></div>" +
      '<div class="ek-spec"><i class="bi bi-clock-history"></i><span><b>Tiempos</b><small>Existencias 24-48 h. Personalizados 3 a 7 días hábiles.</small></span></div>' +
      '<div class="ek-spec"><i class="bi bi-arrow-repeat"></i><span><b>Cambios</b><small>Aceptamos cambios por defecto de fabricación.</small></span></div>' +
      "</div></div>" +
      '<div class="ek-panel" data-panel="3">' + D.resenas.slice(0, 5).map(function (r) {
        return '<div class="ek-row" style="align-items:flex-start;gap:12px;padding:14px 0;border-bottom:1px solid var(--linea)">' +
          '<span style="width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:var(--degradado-2);color:#fff;font-weight:900;flex-shrink:0">' + esc(r.n.charAt(0)) + "</span>" +
          "<div><b>" + esc(r.n) + '</b> <small class="ek-muted">· ' + esc(r.f) + '</small><div style="color:var(--oro)">' + "★".repeat(r.e) + "☆".repeat(5 - r.e) + "</div>" +
          '<p style="margin:6px 0 0;font-size:.93rem">' + esc(r.t) + "</p></div></div>";
      }).join("") + "</div></div>");

    if (rel.length) {
      enc.push('<section class="ek-sec"><div class="ek-sec__head"><div class="ek-sec__hd-l"><span class="ek-sec__kicker">También te puede gustar</span><h2 class="ek-sec__title">Artículos relacionados</h2></div>' +
        '<a class="ek-sec__link" href="tienda.html">Ver todo el catálogo <i class="bi bi-arrow-right"></i></a></div>' +
        '<div class="ek-grid ek-grid--4">' + rel.map(tarjeta).join("") + "</div></section>");
    }
    enc.push("</div>");
    cont.innerHTML = enc.join("");

    /* Interacciones */
    var talla = p.t[0], color = p.col[0];
    // Variante seleccionada (stock y precio por talla/color, si están definidos)
    function varianteSeleccionada() {
      var vs = p.variantes || [];
      for (var i = 0; i < vs.length; i++) {
        if ((vs[i].talla == null || vs[i].talla === talla) && (vs[i].color == null || vs[i].color === color)) return vs[i];
      }
      return null;
    }
    function actualizarStockUI() {
      var v = varianteSeleccionada();
      if (!v) return;
      var max = document.getElementById("ek-live-max");
      if (max) max.textContent = "Máx. " + nf(v.stock);
      var cant = document.getElementById("ek-cant");
      if (cant) { cant.max = Math.max(1, v.stock); if (+cant.value > v.stock) cant.value = Math.max(1, v.stock); }
      var txt = document.getElementById("ek-live-stocktext");
      if (txt) txt.innerHTML = v.stock > 0 ? "Quedan <b>" + nf(v.stock) + "</b> piezas de esta variante" : "Variante agotada";
      var bar = document.getElementById("ek-live-stockbar");
      if (bar) { bar.className = "ek-stockbar" + (v.stock <= 10 ? " poco" : ""); bar.innerHTML = '<i style="width:' + Math.max(6, Math.min(100, Math.round(v.stock / 120 * 100))) + '%"></i>'; }
      var precioEl = document.getElementById("ek-live-precio");
      if (precioEl) precioEl.textContent = money(v.precio || p.p);
    }
    $$("#ek-tallas .ek-chip").forEach(function (b) {
      b.onclick = function () { $$("#ek-tallas .ek-chip").forEach(function (x) { x.classList.remove("is-on"); }); b.classList.add("is-on"); talla = b.getAttribute("data-t"); $("#ek-talla-sel").textContent = talla; actualizarStockUI(); };
    });
    $$("#ek-colores .ek-chip").forEach(function (b) {
      b.onclick = function () { $$("#ek-colores .ek-chip").forEach(function (x) { x.classList.remove("is-on"); }); b.classList.add("is-on"); color = b.getAttribute("data-c"); $("#ek-color-sel").textContent = color; actualizarStockUI(); };
    });
    $$("[data-q]").forEach(function (b) {
      b.onclick = function () { var i = $("#ek-cant"), v = Math.max(1, Math.min(p.st || 1, (+i.value || 1) + (+b.getAttribute("data-q")))); i.value = v; };
    });
    $$(".ek-thumb").forEach(function (b) {
      b.onclick = function () {
        var i = +b.getAttribute("data-img");
        $$(".ek-thumb").forEach(function (x) { x.classList.remove("is-on"); }); b.classList.add("is-on");
        var m = $("#ek-main-img"); m.style.opacity = 0;
        setTimeout(function () { m.src = imgURL(p, i, 900); m.style.opacity = 1; }, 140);
      };
    });
    $("#ek-add").onclick = function () { var n = +$("#ek-cant").value || 1; addCart(p.s, talla, color, n); volar(this, p.s); toast(n + " × " + p.n + " agregado", "bi-bag-check-fill"); };
    function actWA() { $("#ek-wa").href = waLink("Hola, quiero " + (+$("#ek-cant").value || 1) + " × " + p.n + "\nTamaño: " + talla + "\nColor: " + color + "\nPrecio: " + money(p.p * (+$("#ek-cant").value || 1))); }
    $$("#ek-tallas .ek-chip,#ek-colores .ek-chip").forEach(function (b) { b.addEventListener("click", actWA); });
    $("#ek-cant").addEventListener("input", actWA);
    $$(".ek-tab").forEach(function (t) {
      t.onclick = function () {
        var i = t.getAttribute("data-tab");
        $$(".ek-tab").forEach(function (x) { x.classList.remove("is-on"); }); t.classList.add("is-on");
        $$(".ek-panel").forEach(function (x) { x.classList.toggle("is-on", x.getAttribute("data-panel") === i); });
      };
    });
    var zoom = $("#ek-zoom");
    zoom.onclick = function () {
      var lb = $("#ek-lightbox");
      if (!lb) { lb = document.createElement("div"); lb.id = "ek-lightbox"; lb.className = "ek-lightbox"; lb.innerHTML = '<button class="ek-lightbox__x" aria-label="Cerrar">&times;</button><img alt="">'; document.body.appendChild(lb); }
      $("img", lb).src = $("#ek-main-img").src; lb.classList.add("is-on");
      lb.onclick = function () { lb.classList.remove("is-on"); };
    };

    /* Barra fija de compra (móvil) */
    document.body.classList.add("has-stickybuy");
    var sb = document.createElement("div"); sb.className = "ek-stickybuy";
    sb.innerHTML = "<span><b>" + money(p.p) + "</b><br><small class='ek-muted'>" + esc(tallaTexto(p)) + "</small></span>" +
      '<button class="ek-btn ek-btn--rojo" id="ek-add2"><i class="bi bi-bag-plus"></i> Agregar</button>' +
      '<a class="ek-btn ek-btn--wa" target="_blank" rel="noopener" href="' + waLink("Hola, quiero: " + p.n) + '"><i class="bi bi-whatsapp"></i></a>';
    document.body.appendChild(sb);
    $("#ek-add2").onclick = function () { addCart(p.s, talla, color, +$("#ek-cant").value || 1); toast("Agregado al carrito", "bi-bag-check-fill"); };
    revelar();
    // Personalizador dinámico (si el producto tiene print_area + imagen)
    if (window.EK_personalizador) window.EK_personalizador(p);
  }

  /* ======================= CARRITO Y PAGO ======================= */
  function totales() {
    var c = carrito(), sub = 0, piezas = 0, lineas = [];
    c.forEach(function (x) {
      var p = prod(x.s); if (!p) return;
      var imp = p.p * x.c; sub += imp; piezas += x.c;
      lineas.push({ x: x, p: p, imp: imp });
    });
    var cup = LS.get("cupon", ""), cupon = CUPONES[cup] || null, descu = 0, envioGratis = false;
    if (cupon) {
      if (cupon.min && sub < cupon.min) cupon = null;
      else {
        if (cupon.tipo === "pct") descu = sub * cupon.val / 100;
        if (cupon.tipo === "monto") descu = cupon.val;
        if (cupon.tipo === "envio") envioGratis = true;
      }
    }
    var base = sub - descu;
    var envio = (base >= C.envioGratisDesde || envioGratis || sub === 0) ? 0 : C.envio;
    var iva = C.iva ? base * C.iva : 0;
    return { lineas: lineas, piezas: piezas, sub: sub, descu: descu, cupon: cupon, cuponTxt: cup, envio: envio, iva: iva, total: base + envio + iva };
  }
  /* Mensaje del pedido para WhatsApp (lo usan el carrito lateral y la página) */
  window.EK_mensajePedido = function (t) {
    var m = "🛒 *NUEVO PEDIDO · " + C.marca + "*\n\n";
    t.lineas.forEach(function (l, i) {
      m += (i + 1) + ". " + l.p.n + "\n   • Tamaño: " + l.x.t + "\n   • Color: " + l.x.col +
        "\n   • Cantidad: " + l.x.c + "\n   • Importe: " + money(l.imp) + "\n";
    });
    m += "\nSubtotal: " + money(t.sub);
    if (t.descu) m += "\nDescuento (" + t.cuponTxt + "): −" + money(t.descu);
    m += "\nEnvío: " + (t.envio ? money(t.envio) : "GRATIS");
    m += "\n*TOTAL: " + money(t.total) + "*\n\n";
    m += "Nombre: \nTeléfono: \nDirección de envío: \nForma de pago: SPEI / tarjeta / efectivo\n¿Lleva personalización (nombre, foto, logo)?: ";
    return m;
  };
  function mensajePedido(t) { return window.EK_mensajePedido(t); }

  function initCarrito() {
    var cont = $("#ek-carrito"); if (!cont) return;
    function pintar() {
      var t = totales();
      if (!t.lineas.length) {
        cont.innerHTML = '<div class="ek-empty" style="grid-column:1/-1"><i class="bi bi-cart-x"></i><h3>Tu carrito está vacío</h3>' +
          '<p class="ek-muted">Agrega tus artículos favoritos y envía el pedido por WhatsApp en un clic.</p>' +
          '<a class="ek-btn ek-btn--rojo" href="tienda.html"><i class="bi bi-bag"></i> Ver catálogo</a></div>';
        $("#ek-resumen").innerHTML = '<h3>Resumen</h3><p class="ek-muted">Sin artículos todavía.</p>';
        return;
      }
      cont.innerHTML = t.lineas.map(function (l) {
        var mini = l.x.img ? '<img src="' + l.x.img + '" alt="Personalizado" style="width:88px;height:88px;object-fit:cover;border-radius:8px">' : imgTag(l.p, 0, 300, l.p.n);
        return '<div class="ek-cart__row" data-k="' + esc(l.x.k) + '">' +
          "<a href=\"articulo.html?id=" + l.p.s + '">' + mini + "</a>" +
          "<div><div class=\"ek-cart__n\"><a href=\"articulo.html?id=" + l.p.s + '">' + esc(l.p.n) + "</a></div>" +
          '<div class="ek-cart__d">' + esc(l.x.t) + " · " + esc(l.x.col) + " · " + money(l.p.p) + " c/u</div>" +
          '<div class="ek-row" style="gap:10px"><div class="ek-qty"><button data-menos="' + esc(l.x.k) + '">−</button>' +
          '<input type="number" value="' + l.x.c + '" min="1" data-cant="' + esc(l.x.k) + '"><button data-mas="' + esc(l.x.k) + '">+</button></div>' +
          '<button class="ek-chip" data-quitar="' + esc(l.x.k) + '"><i class="bi bi-trash3"></i> Quitar</button></div></div>' +
          '<div style="text-align:right"><div class="ek-price">' + money(l.imp) + "</div>" +
          "<small class='ek-muted'>" + l.p.st + " en stock</small></div></div>";
      }).join("");

      var falta = Math.max(0, C.envioGratisDesde - (t.sub - t.descu));
      $("#ek-resumen").innerHTML = "<h3>Resumen del pedido</h3>" +
        '<div class="ek-summary__r"><span>Artículos (' + t.piezas + ")</span><b>" + money(t.sub) + "</b></div>" +
        (t.descu ? '<div class="ek-summary__r" style="color:var(--wa-osc)"><span>Descuento ' + esc(t.cuponTxt) + "</span><b>−" + money(t.descu) + "</b></div>" : "") +
        '<div class="ek-summary__r"><span>Envío</span><b>' + (t.envio ? money(t.envio) : "GRATIS") + "</b></div>" +
        (t.iva ? '<div class="ek-summary__r"><span>Impuestos</span><b>' + money(t.iva) + "</b></div>" : "") +
        (falta > 0 ? '<div class="ek-progress"><i style="width:' + Math.min(100, (t.sub - t.descu) / C.envioGratisDesde * 100) + '%"></i></div>' +
          "<small class='ek-muted'>Te faltan <b>" + money(falta) + "</b> para el envío gratis 🚚</small>"
          : "<small style='color:var(--wa-osc);font-weight:700'>🎉 ¡Felicidades! Tienes envío gratis</small>") +
        '<div class="ek-coupon"><input id="ek-cupon" placeholder="Código de descuento" value="' + esc(t.cuponTxt) + '"><button class="ek-btn ek-btn--ghost ek-btn--sm" id="ek-aplica">Aplicar</button></div>' +
        '<div class="ek-summary__tot"><span>Total</span><span class="ek-price">' + money(t.total) + "</span></div>" +
        '<a class="ek-btn ek-btn--wa ek-btn--block ek-btn--lg ek-mt" id="ek-checkout" target="_blank" rel="noopener" href="' + waLink(mensajePedido(t)) + '"><i class="bi bi-whatsapp"></i> Enviar pedido por WhatsApp</a>' +
        '<button class="ek-btn ek-btn--rojo ek-btn--block ek-mt" id="ek-stripe" type="button"><i class="bi bi-credit-card-2-front"></i> Pagar con tarjeta y recibir factura por correo</button>' +
        '<a class="ek-btn ek-btn--azul ek-btn--block ek-mt" href="contacto.html"><i class="bi bi-chat-dots"></i> Dudas antes de comprar</a>' +
        '<div class="ek-paylist"><span>SPEI</span><span>Mercado Pago</span><span>Clip</span><span>Efectivo</span><span>3, 6 y 9 MSI</span></div>' +
        '<p class="ek-muted" style="font-size:.8rem;margin-top:14px">El pago se realiza fuera del sitio (transferencia o liga de pago segura). ' +
        "Tu pedido se aparta al confirmarlo por WhatsApp.</p>";
    }
    function mensajePedido(t) { return window.EK_mensajePedido(t); }
    window.EK_pintarCarrito = pintar;
    cont.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var c = carrito(), k, i;
      if (b.hasAttribute("data-menos") || b.hasAttribute("data-mas")) {
        k = b.getAttribute("data-menos") || b.getAttribute("data-mas");
        for (i = 0; i < c.length; i++) if (c[i].k === k) c[i].c = Math.max(1, c[i].c + (b.hasAttribute("data-mas") ? 1 : -1));
        guardar(c); pintar();
      }
      if (b.hasAttribute("data-quitar")) {
        k = b.getAttribute("data-quitar");
        guardar(c.filter(function (x) { return x.k !== k; })); pintar(); toast("Artículo eliminado", "bi-trash3");
      }
    });
    cont.addEventListener("change", function (e) {
      var inp = e.target.closest("[data-cant]"); if (!inp) return;
      var c = carrito(), k = inp.getAttribute("data-cant"), i;
      for (i = 0; i < c.length; i++) if (c[i].k === k) c[i].c = Math.max(1, +inp.value || 1);
      guardar(c); pintar();
    });
    function pagarConTarjeta() {
      var t = totales();
      if (!t.lineas.length) return;
      var items = t.lineas.map(function (l) {
        return { nombre: l.p.n, precio: l.p.p, cantidad: l.x.c, talla: l.x.t, color: l.x.col };
      });
      var base = location.origin + location.pathname;
      fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items: items, success_url: base + "?pago=ok", cancel_url: base + "?pago=cancelado" }),
      }).then(function (r) { return r.json(); }).then(function (d) {
        if (d.ok && d.url) location.href = d.url;
        else toast(d.error || "No se pudo iniciar el pago", "bi-x-circle");
      }).catch(function () { toast("Error de conexión al iniciar el pago", "bi-x-circle"); });
    }

    document.addEventListener("click", function (e) {
      if (e.target.closest("#ek-stripe")) { pagarConTarjeta(); return; }
      if (e.target.closest("#ek-aplica")) {
        var v = ($("#ek-cupon").value || "").trim().toUpperCase();
        if (!v) { LS.set("cupon", ""); pintar(); return; }
        if (CUPONES[v]) { LS.set("cupon", v); toast("Cupón aplicado: " + CUPONES[v].txt, "bi-ticket-perforated-fill"); }
        else toast("Ese cupón no existe", "bi-x-circle");
        pintar();
      }
      if (e.target.closest("#ek-vaciar")) { guardar([]); LS.set("cupon", ""); pintar(); toast("Carrito vaciado", "bi-trash3"); }
    });
    pintar();
    // Retorno desde Stripe
    var pag = param("pago");
    if (pag === "ok") { guardar([]); LS.set("cupon", ""); pintar(); toast("✅ Pago recibido. Te enviamos tu factura por correo.", "bi-check-circle-fill"); }
    else if (pag === "cancelado") { toast("Pago cancelado. Tu carrito sigue guardado.", "bi-x-circle"); }
  }

  /* ======================= CONTACTO ======================= */
  function initContacto() {
    var f = $("#ek-form-contacto"); if (!f) return;
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = new FormData(f), g = function (k) { return String(d.get(k) || "").trim(); };
      var m = "📩 *MENSAJE DESDE LA WEB*\n\n" +
        "Nombre: " + g("nombre") + "\nTeléfono: " + g("tel") + "\nCorreo: " + g("email") +
        "\nTipo de pedido: " + g("tipo") + "\nCantidad aproximada: " + g("cantidad") +
        "\nFecha en que lo necesita: " + g("fecha") + "\n\n*Mensaje:*\n" + g("mensaje");
      window.open(waLink(m), "_blank");
      toast("Abriendo WhatsApp…", "bi-whatsapp");
    });
  }

  /* ======================= ARRANQUE ======================= */
  function initIconoCarrito() {
    /* El icono del carrito de la cabecera abre el carrito lateral */
    $$("a[href='carrito.html']").forEach(function (a) {
      if (a.closest(".ek-mobilebar") || a.closest(".ek-cartdrawer")) return;
      a.addEventListener("click", function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        abrirDrawerCarrito(true);
      });
    });
  }
  /* En las páginas que no son la tienda, la barra lateral es el menú de categorías.
     Se crea sola si la página no la trae, así no hay que repetirla en cada HTML. */
  function initMenuLateral() {
    var sb = $("#ek-sidebar");
    if ($("#ek-productos")) return;               // la tienda usa su barra con filtros
    if (!sb) {
      sb = document.createElement("aside");
      sb.className = "ek-sidebar ek-sidebar--drawer";
      sb.id = "ek-sidebar";
      sb.setAttribute("aria-label", "Categorías y subcategorías");
      document.body.appendChild(sb);
    }
    if (!$("#ek-overlay")) {
      var ov = document.createElement("div");
      ov.className = "ek-overlay"; ov.id = "ek-overlay";
      ov.onclick = function () { ov.classList.remove("is-on"); sb.classList.remove("is-on"); };
      document.body.appendChild(ov);
    }
    function bloque(lista, titulo) {
      return '<div class="ek-side"><div class="ek-side__hd">' + titulo +
        ' <i class="bi bi-chevron-down"></i></div><div class="ek-side__bd">' +
        acordeonCategorias("enlace", lista, false) + "</div></div>";
    }
    sb.innerHTML =
      '<div class="ek-drawer__hd"><b style="font-family:var(--display);font-size:1.05rem">Categorías</b>' +
      '<button class="ek-action" data-toggle-sidebar aria-label="Cerrar"><i class="bi bi-x-lg"></i></button></div>' +
      '<div class="ek-side__tope"><i class="bi bi-grid-3x3-gap-fill"></i> Todas las categorías' +
        '<span class="ek-cat__c">' + P.length + "</span></div>" +
      bloque(CATS.filter(function (c) { return c.g === "temporada"; }), "Por temporada") +
      bloque(CATS.filter(function (c) { return c.g === "producto"; }), "Por tipo de producto") +
      '<div class="ek-side"><div class="ek-side__hd">Ayuda <i class="bi bi-chevron-down"></i></div><div class="ek-side__bd">' +
        '<a class="ek-cat" href="tienda.html"><span class="ek-cat__e">🛍️</span> Todo el catálogo</a>' +
        '<a class="ek-cat" href="tienda.html?etiqueta=promo"><span class="ek-cat__e">🔥</span> Ofertas</a>' +
        '<a class="ek-cat" href="blog.html"><span class="ek-cat__e">📝</span> Blog</a>' +
        '<a class="ek-cat" href="contacto.html"><span class="ek-cat__e">📞</span> Contacto</a>' +
      "</div></div>";
  }

  /* ============ TIRA DE PÍLDORAS DESLIZABLE (reutilizable) ============
     `alTocar` recibe (subcategoría o ""). Con flechas ‹ › que solo aparecen
     si no cabe todo, arrastre, rueda del mouse y desplazamiento táctil.    */
  function tiraPildoras(catSlug, subActiva, alTocar, idUnico) {
    var lista, total, etiqueta;
    if (catSlug) {
      lista = subsDeCat(catSlug).filter(function (s) { return cuentaSub(catSlug, s.s) > 0; });
      total = P.filter(function (p) { return p.c.indexOf(catSlug) > -1; }).length;
      var c0 = cat(catSlug);
      etiqueta = c0 ? c0.n : "";
    } else {
      lista = SUB.lista.filter(function (s) { return s.c > 0; }).slice().sort(function (a, b) { return b.c - a.c; }).slice(0, 16);
      total = P.length;
      etiqueta = "Todo el taller";
    }
    if (!lista.length && !catSlug) return "";
    var uid = idUnico || catSlug || "todas";
    return '<button class="ek-pillstrip__ar" type="button" data-pill-prev="' + uid + '" aria-label="Desplazar a la izquierda"><i class="bi bi-chevron-left"></i></button>' +
      '<div class="ek-pillstrip__box"><ul class="ek-pillstrip__ul" data-pill-ul="' + uid + '">' +
        '<li><button class="ek-pill' + (subActiva ? "" : " is-on") + '" type="button" data-pill="" data-pill-cat="' + (catSlug || "") + '">' +
          '<i class="bi bi-grid-fill"></i> ' + (catSlug ? "Todo " + esc(etiqueta) : "Todo el taller") + " <small>" + total + "</small></button></li>" +
        lista.map(function (s) {
          var href = catSlug ? null : s.cats[0];
          return '<li><button class="ek-pill' + (subActiva === s.s ? " is-on" : "") + '" type="button" data-pill="' + s.s + '" data-pill-cat="' + (catSlug || href || "") + '">' +
            '<i class="bi ' + s.i + '"></i> ' + esc(s.n) + " <small>" + (catSlug ? cuentaSub(catSlug, s.s) : s.c) + "</small></button></li>";
        }).join("") +
      "</ul></div>" +
      '<button class="ek-pillstrip__ar" type="button" data-pill-next="' + uid + '" aria-label="Desplazar a la derecha"><i class="bi bi-chevron-right"></i></button>';
  }
  /* Conecta las flechas y los degradados de una tira ya pintada */
  function conectarTira(caja) {
    if (!caja || caja.dataset.lista) return;
    caja.dataset.lista = "1";
    caja.addEventListener("click", function (e) {
      var b = e.target.closest("[data-pill-prev],[data-pill-next]");
      if (!b) return;
      var ul = $("[data-pill-ul]", caja);
      if (!ul) return;
      var paso = Math.max(170, ul.clientWidth * .7) * (b.hasAttribute("data-pill-next") ? 1 : -1);
      ul.scrollBy({ left: paso, behavior: RM ? "auto" : "smooth" });
    });
    function rev() {
      var ul = $("[data-pill-ul]", caja); if (!ul) return;
      var iz = $("[data-pill-prev]", caja), de = $("[data-pill-next]", caja);
      var max = ul.scrollWidth - ul.clientWidth - 2;
      if (iz) { iz.disabled = ul.scrollLeft <= 2; iz.hidden = !(ul.scrollWidth > ul.clientWidth + 4); }
      if (de) { de.disabled = ul.scrollLeft >= max; de.hidden = !(ul.scrollWidth > ul.clientWidth + 4); }
      caja.classList.toggle("has-izq", ul.scrollLeft > 2);
      caja.classList.toggle("has-der", ul.scrollLeft < max);
    }
    var ul = $("[data-pill-ul]", caja);
    if (ul) {
      ul.addEventListener("scroll", rev, { passive: true });
      /* Arrastrar con el mouse */
      var down = false, x0 = 0, sl = 0, mov = 0;
      ul.addEventListener("mousedown", function (e) { down = true; mov = 0; x0 = e.pageX; sl = ul.scrollLeft; ul.style.cursor = "grabbing"; });
      window.addEventListener("mousemove", function (e) { if (!down) return; mov = e.pageX - x0; if (Math.abs(mov) > 6) { e.preventDefault(); ul.scrollLeft = sl - mov; } });
      window.addEventListener("mouseup", function () { down = false; ul.style.cursor = ""; });
      ul.addEventListener("click", function (e) { if (Math.abs(mov) > 8) { e.preventDefault(); e.stopPropagation(); } }, true);
      /* Rueda del mouse horizontal */
      ul.addEventListener("wheel", function (e) {
        if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
        if (ul.scrollWidth <= ul.clientWidth + 4) return;
        e.preventDefault(); ul.scrollLeft += e.deltaY;
      }, { passive: false });
    }
    window.addEventListener("resize", rev);
    setTimeout(rev, 60);
    rev();
  }

  /* ============ CARRUSELES HORIZONTALES CON FLECHAS ============ */
  function conectarCarrusel(caja) {
    if (!caja || caja.dataset.listo) return;
    caja.dataset.listo = "1";
    var ul = $("[data-lista]", caja), iz = $(".ek-carrusel__ar--prev", caja), de = $(".ek-carrusel__ar--next", caja);
    if (!ul) return;
    function rev() {
      var max = ul.scrollWidth - ul.clientWidth - 2;
      if (iz) { iz.disabled = ul.scrollLeft <= 2; iz.hidden = !(ul.scrollWidth > ul.clientWidth + 4); }
      if (de) { de.disabled = ul.scrollLeft >= max; de.hidden = !(ul.scrollWidth > ul.clientWidth + 4); }
    }
    if (iz) iz.onclick = function () { ul.scrollBy({ left: -Math.max(240, ul.clientWidth * .8), behavior: RM ? "auto" : "smooth" }); };
    if (de) de.onclick = function () { ul.scrollBy({ left: Math.max(240, ul.clientWidth * .8), behavior: RM ? "auto" : "smooth" }); };
    ul.addEventListener("scroll", rev, { passive: true });
    window.addEventListener("resize", rev);
    setTimeout(rev, 60);
    rev();
  }

  /* ============ SECCIONES DE IDEAS: PÍLDORAS + CARRUSEL ============ */
  function initIdeas() {
    var cont = $("#ek-ideas"); if (!cont) return;
    var elegidas = ["navidad", "ano-nuevo", "graduacion", "personalizados", "amor-amistad", "bodas-eventos", "tazas-termos", "lamparas"]
      .map(cat).filter(Boolean);
    cont.innerHTML = elegidas.map(function (c, k) {
      var lista = P.filter(function (p) { return p.c.indexOf(c.s) > -1; }).sort(function (a, b) { return b.v - a.v; });
      if (!lista.length) return "";
      var subs = subsDeCat(c.s).filter(function (s) { return cuentaSub(c.s, s.s) > 0; });
      return '<section class="ek-sec' + (k % 2 ? " ek-sec--tinte" : "") + '" data-idea="' + c.s + '">' +
        '<div class="ek-container">' +
          '<div class="ek-sec__head">' +
            '<div class="ek-sec__hd-l" data-aos="fade-up">' +
              '<span class="ek-sec__kicker">Idea de temporada</span>' +
              '<h2 class="ek-sec__title">' + c.e + " " + esc(c.n) + "</h2>" +
              '<p class="ek-sec__sub">' + esc(c.d) + "</p>" +
            "</div>" +
            '<a class="ek-sec__link" href="categoria.html?cat=' + c.s + '">Ver los ' + lista.length + " artículos <i class=\"bi bi-arrow-right\"></i></a>" +
          "</div>" +
          (subs.length ? '<div class="ek-pillstrip" data-tira="' + c.s + '">' + tiraPildoras(c.s, "", null, c.s) + "</div>" : "") +
          '<div class="ek-carrusel" data-carrusel>' +
            '<button class="ek-carrusel__ar ek-carrusel__ar--prev" type="button" aria-label="Ver anteriores"><i class="bi bi-chevron-left"></i></button>' +
            '<div class="ek-scroller" data-lista>' + lista.slice(0, 12).map(tarjeta).join("") + "</div>" +
            '<button class="ek-carrusel__ar ek-carrusel__ar--next" type="button" aria-label="Ver siguientes"><i class="bi bi-chevron-right"></i></button>' +
          "</div>" +
        "</div></section>";
    }).join("");

    $$("[data-tira]", cont).forEach(conectarTira);
    $$("[data-carrusel]", cont).forEach(conectarCarrusel);

    /* Al tocar una píldora se filtra SOLO el carrusel de esa sección */
    cont.addEventListener("click", function (e) {
      var p = e.target.closest("[data-pill]"); if (!p) return;
      var sec = p.closest("[data-idea]"); if (!sec) return;
      var slug = sec.getAttribute("data-idea"), sub = p.getAttribute("data-pill");
      var lista = P.filter(function (x) {
        return x.c.indexOf(slug) > -1 && (!sub || subDe(x.s).indexOf(sub) > -1);
      }).sort(function (a, b) { return b.v - a.v; });
      var ul = $("[data-lista]", sec);
      if (ul) ul.innerHTML = lista.length ? lista.slice(0, 12).map(tarjeta).join("")
        : '<div class="ek-empty" style="padding:34px"><i class="bi bi-search"></i><h3>Sin artículos aquí</h3><p class="ek-muted">Prueba otra subcategoría.</p></div>';
      var tira = p.closest("[data-tira]") || p.closest(".ek-pillstrip");
      if (tira) $$("[data-pill]", tira).forEach(function (x) { x.classList.toggle("is-on", x === p); });
      if (ul) ul.scrollTo({ left: 0, behavior: RM ? "auto" : "smooth" });
      revelar();
    });
  }

  /* ---- Acceso de distribuidores (precios de mayoreo) ---- */
  function initDistribuidor() {
    var acciones = $(".ek-actions");
    if (!acciones) return;
    var boton = document.createElement("button");
    boton.type = "button";
    boton.className = "ek-action";
    boton.setAttribute("aria-label", esDistribuidor() ? "Cerrar sesión" : "Acceso distribuidores");
    boton.title = esDistribuidor() ? "Cerrar sesión de distribuidor" : "Acceso distribuidores";
    boton.innerHTML = '<i class="bi bi-' + (esDistribuidor() ? "box-arrow-right" : "briefcase") + '"></i>';
    boton.onclick = function () { if (esDistribuidor()) logoutDistribuidor(); else abrirLoginDistribuidor(); };
    acciones.insertBefore(boton, acciones.firstChild);
  }
  function abrirLoginDistribuidor() {
    var m = document.createElement("div");
    m.style.cssText = "position:fixed;inset:0;background:rgba(16,24,40,.65);z-index:99999;display:grid;place-items:center;padding:20px";
    m.innerHTML = '<div style="background:#fff;border-radius:16px;padding:26px;width:100%;max-width:360px;box-shadow:0 24px 60px rgba(0,0,0,.35)">' +
      '<h3 style="margin:0 0 4px">Acceso distribuidores</h3>' +
      '<p style="color:#6b7280;font-size:.9rem;margin:0 0 16px">Entra para ver los precios de mayoreo.</p>' +
      '<input id="dk-email" type="email" placeholder="Correo" autocomplete="username" style="width:100%;padding:11px;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:10px;font:inherit">' +
      '<input id="dk-pass" type="password" placeholder="Contraseña" autocomplete="current-password" style="width:100%;padding:11px;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:14px;font:inherit">' +
      '<div id="dk-err" style="color:#DA1D2A;font-size:.85rem;margin-bottom:10px"></div>' +
      '<button id="dk-enter" style="width:100%;background:#DA1D2A;color:#fff;border:0;padding:12px;border-radius:8px;font-weight:700;cursor:pointer;font:inherit">Entrar</button>' +
      '<button id="dk-close" style="width:100%;background:none;border:0;padding:8px;color:#6b7280;margin-top:4px;cursor:pointer;font:inherit">Cancelar</button>' +
      "</div>";
    document.body.appendChild(m);
    m.onclick = function (e) { if (e.target === m) m.remove(); };
    m.querySelector("#dk-close").onclick = function () { m.remove(); };
    m.querySelector("#dk-enter").onclick = function () { entrarDistribuidor(m); };
    m.querySelector("#dk-pass").addEventListener("keydown", function (e) { if (e.key === "Enter") entrarDistribuidor(m); });
  }
  async function entrarDistribuidor(m) {
    var email = (m.querySelector("#dk-email").value || "").trim();
    var pass = m.querySelector("#dk-pass").value || "";
    var err = m.querySelector("#dk-err");
    err.textContent = "";
    if (!email || !pass) { err.textContent = "Escribe correo y contraseña"; return; }
    try {
      var res = await fetch("/api/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: email, password: pass }) });
      var d = await res.json();
      if (!d.ok) { err.textContent = d.error || "No autorizado"; return; }
      if (d.usuario && (d.usuario.rol === "DISTRIBUIDOR" || d.usuario.rol === "ADMINISTRADOR")) {
        localStorage.setItem("ek_rol", d.usuario.rol);
        location.reload();
      } else {
        err.textContent = "Esta cuenta no es de distribuidor";
      }
    } catch (e) { err.textContent = "Error de conexión"; }
  }
  function logoutDistribuidor() {
    localStorage.removeItem("ek_rol");
    location.reload();
  }

  function arrancar() {
    initGlobal();
    initDistribuidor();
    initFAQ();
    initNav();
    initAcordeones(document);
    crearDrawerCarrito();
    initBarraMovil();
    initMenuLateral();
    initIconoCarrito();
    initIdeas();
    if ($("#ek-hero-slides")) { initHome(); initParticulas(); }
    if ($("#ek-productos")) initTienda();
    if ($("#ek-producto")) initProducto();
    if ($("#ek-carrito")) initCarrito();
    initContacto();
    if (window.EK_BLOG_INIT) window.EK_BLOG_INIT();
    initAnimaciones();
    revelar();
    if (window.EK_LIVE_APPLY) window.EK_LIVE_APPLY();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", arrancar);
  else arrancar();
})();
