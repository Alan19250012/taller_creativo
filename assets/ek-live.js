/* ============================================================================
   TALLER CREATIVO EK · Datos en tiempo real  (assets/ek-live.js)
   ----------------------------------------------------------------------------
   Lee desde Supabase (anon key) lo que cambia seguido — stock, reseñas,
   calificación y ventas — y lo aplica sobre la página ya renderizada por
   assets/ek.js. El catálogo (nombres, precios, categorías) sigue siendo
   estático y se actualiza con el Deploy Hook desde el panel.
   Si Supabase no responde, la página queda exactamente como estaba (fallback
   estático). No rompe nada.
   ========================================================================== */
(function () {
  "use strict";

  var S = window.EK_SUPABASE;
  if (!S || !S.activo || !S.url || !S.anonKey) return;

  var datos = null;            // { porSlug: {stock,vendidos,calificacion}, resenas: [...] }
  var aplicado = false;

  /* ---- utilidades (réplicas mínimas de ek.js) ---- */
  function nf(n) { return Number(n).toLocaleString("es-MX"); }
  function estrellas(r, rv) {
    r = Number(r) || 0;
    var llenas = Math.floor(r), media = r - llenas >= .35, h = "", i;
    for (i = 0; i < 5; i++) h += '<i class="bi bi-star' + (i < llenas ? "-fill" : (i === llenas && media ? "-half" : "")) + '"></i>';
    return '<span class="ek-stars" title="' + r.toFixed(1) + ' de 5">' + h + "<b>" + r.toFixed(1) + "</b>" +
      (rv ? "<small>(" + nf(rv) + ")</small>" : "") + "</span>";
  }
  function insignias(p) {
    var h = "";
    if (p.st <= 0) h += '<span class="ek-badge ek-badge--agotado">Agotado</span>';
    if (p.b === "nuevo") h += '<span class="ek-badge ek-badge--nuevo">Nuevo</span>';
    if (p.b === "promo") h += '<span class="ek-badge ek-badge--promo">Oferta</span>';
    if (p.b === "top") h += '<span class="ek-badge ek-badge--top">★ Más vendido</span>';
    if (p.st > 0 && p.st <= 10) h += '<span class="ek-badge ek-badge--stock">Últimas ' + p.st + " piezas</span>";
    return h;
  }
  function stockCard(p) {
    if (p.st <= 0) return '<span class="ek-card__stock poco"><i class="bi bi-x-circle"></i> Agotado · aparta por WhatsApp</span>';
    var pct = Math.min(100, Math.round((p.st / 120) * 100));
    return '<span class="ek-card__stock' + (p.st <= 10 ? " poco" : "") + '">' +
      '<i class="bi bi-box-seam"></i> ' + nf(p.st) + ' disponibles <span class="bar"><i style="width:' + Math.max(8, pct) + '%"></i></span></span>';
  }
  function prod(slug) {
    var P = (window.EK_DATA && window.EK_DATA.productos) || [];
    for (var i = 0; i < P.length; i++) if (P[i].s === slug) return P[i];
    return null;
  }

  /* ---- parchea la ficha de producto (articulo.html) ---- */
  function parchearFicha(slug) {
    var el = document.getElementById("ek-live-meta");
    if (el) {
      var p = prod(slug);
      if (p) {
        var rv = Math.max(3, Math.round(p.v * .12));
        el.innerHTML = estrellas(p.r, rv) +
          "<span class='ek-muted'>·</span><span class='ek-muted'><i class=\"bi bi-fire\"></i> " + nf(p.v) + " vendidos</span>" +
          "<span class='ek-muted'>·</span><span class='ek-muted'><i class=\"bi bi-box-seam\"></i> " + nf(p.st) + " en stock</span>";
      }
    }
    var bar = document.getElementById("ek-live-stockbar");
    if (bar) {
      var p = prod(slug);
      if (p) {
        bar.className = "ek-stockbar" + (p.st <= 10 ? " poco" : "");
        bar.innerHTML = '<i style="width:' + Math.max(6, Math.min(100, Math.round(p.st / 120 * 100))) + '%"></i>';
      }
    }
    var txt = document.getElementById("ek-live-stocktext");
    if (txt) {
      var p = prod(slug);
      if (p) txt.innerHTML = p.st > 0
        ? "Quedan <b>" + nf(p.st) + "</b> piezas · " + nf(p.v) + " ya vendidas"
        : "Agotado por ahora: te avisamos cuando llegue";
    }
    var max = document.getElementById("ek-live-max");
    if (max) { var p = prod(slug); if (p) max.textContent = "Máx. " + nf(p.st); }
    var cant = document.getElementById("ek-cant");
    if (cant) { var p = prod(slug); if (p) cant.max = Math.max(1, p.st); }
  }

  /* ---- parchea las tarjetas de producto (rejillas) ---- */
  function parchearTarjetas() {
    var tarjetas = document.querySelectorAll("article.ek-card[data-id]");
    for (var i = 0; i < tarjetas.length; i++) {
      var card = tarjetas[i];
      var p = prod(card.getAttribute("data-id"));
      if (!p) continue;
      var badges = card.querySelector(".ek-card__badges");
      if (badges) badges.innerHTML = insignias(p);
      var meta = card.querySelector(".ek-card__meta");
      if (meta) {
        var rv = Math.max(3, Math.round(p.v * .12));
        meta.innerHTML = estrellas(p.r, rv) + "<span>· " + nf(p.v) + " vendidos</span>";
      }
      var stock = card.querySelector(".ek-card__stock");
      if (stock) stock.outerHTML = stockCard(p);
    }
  }

  /* ---- parchea la sección de reseñas de la portada ---- */
  function parchearResenas() {
    var res = document.getElementById("ek-resenas");
    if (!res || !datos) return;
    res.innerHTML = datos.resenas.map(function (r) {
      var p = prod(r.p);
      return '<article class="ek-card ek-reveal is-in" style="box-shadow:var(--sombra)"><div class="ek-card__body">' +
        '<div class="ek-row" style="gap:10px"><span style="width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:var(--degradado-2);color:#fff;font-weight:900">' + esc(r.n.charAt(0)) + "</span>" +
        "<span><b>" + esc(r.n) + "</b><br><small class='ek-muted'>" + esc(r.c) + " · " + esc(r.f) + "</small></span></div>" +
        "<div style='color:var(--oro);font-size:.95rem'>" + "★".repeat(r.e) + "☆".repeat(5 - r.e) + "</div>" +
        "<p style='margin:6px 0 10px;font-size:.92rem'>" + esc(r.t) + "</p>" +
        (p ? '<a class="ek-sec__link" style="font-size:.85rem" href="articulo.html?id=' + p.s + '"><i class="bi bi-box-seam"></i> ' + esc(p.n) + "</a>" : "") +
        "</div></article>";
    }).join("");
  }
  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }

  /* ---- aplica los datos en vivo a los objetos + DOM ---- */
  window.EK_LIVE_APPLY = function () {
    if (!datos) return;
    var P = (window.EK_DATA && window.EK_DATA.productos) || [];
    for (var i = 0; i < P.length; i++) {
      var vivo = datos.porSlug[P[i].s];
      if (!vivo) continue;
      P[i].st = vivo.stock;
      P[i].v = vivo.vendidos;
      P[i].r = vivo.calificacion;
    }
    if (window.EK_DATA) window.EK_DATA.resenas = datos.resenas.slice();

    parchearTarjetas();
    parchearResenas();
    var ficha = document.getElementById("ek-producto");
    if (ficha) {
      var m = location.search.match(/[?&]id=([^&]+)/);
      if (m) parchearFicha(decodeURIComponent(m[1]));
    }
    aplicado = true;
  };

  /* ---- carga desde Supabase ---- */
  function cargar() {
    var url = S.url + "/rest/v1/Producto?select=id,slug,stock,vendidos,calificacion";
    var urlR = S.url + "/rest/v1/Resena?select=autor,ciudad,estrellas,fecha,comentario,productoId&aprobada=eq.true&order=creadoEn.desc&limit=50";
    return Promise.all([
      fetch(url, { headers: { apikey: S.anonKey, Authorization: "Bearer " + S.anonKey } }).then(function (r) { return r.json(); }),
      fetch(urlR, { headers: { apikey: S.anonKey, Authorization: "Bearer " + S.anonKey } }).then(function (r) { return r.json(); }),
    ]).then(function (res) {
      var productos = Array.isArray(res[0]) ? res[0] : [];
      var resenas = Array.isArray(res[1]) ? res[1] : [];
      var porSlug = {}, idSlug = {};
      productos.forEach(function (p) {
        porSlug[p.slug] = { stock: p.stock, vendidos: p.vendidos, calificacion: p.calificacion };
        idSlug[p.id] = p.slug;
      });
      var resenasMapeadas = resenas.map(function (r) {
        return { n: r.autor, c: r.ciudad || "", e: r.estrellas, f: r.fecha || "", p: idSlug[r.productoId] || "", t: r.comentario };
      });
      return { porSlug: porSlug, resenas: resenasMapeadas };
    });
  }

  cargar().then(function (d) {
    datos = d;
    window.EK_LIVE_APPLY();
  }).catch(function () {
    /* sin conexión o sin datos: se queda el contenido estático */
  });
})();
