/* ============================================================================
   TALLER CREATIVO EK · Constructor visual (assets/ek-page.js)
   ----------------------------------------------------------------------------
   Renderiza los bloques de la página de inicio desde Supabase (tabla Pagina,
   campo "bloques" en JSON). Los cambios que haga el admin en el constructor
   aparecen aquí en tiempo real (sin redeploy), porque se leen al abrir la página.
   Si Supabase no responde o no hay bloques, no pinta nada (la home queda igual).
   Tipos de bloque: hero · productos · categorias · texto · promo
   ========================================================================== */
(function () {
  "use strict";

  var S = window.EK_SUPABASE;
  var cont = document.getElementById("ek-page");
  if (!cont || !S || !S.activo) return;

  var D = window.EK_DATA || { productos: [], categorias: [], banners: [] };
  var SUB = window.EK_SUBCATS || { mapa: {} };
  var C = window.EK_CONFIG || {};

  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"']/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]; }); }
  function catPorSlug(s) { for (var i = 0; i < D.categorias.length; i++) if (D.categorias[i].s === s) return D.categorias[i]; return null; }

  function inyectarEstilos() {
    if (document.getElementById("ek-page-css")) return;
    var st = document.createElement("style");
    st.id = "ek-page-css";
    st.textContent =
      ".ekp-sec{padding:26px 0}" +
      ".ekp-head{display:flex;align-items:end;justify-content:space-between;gap:12px;margin-bottom:18px;flex-wrap:wrap}" +
      ".ekp-head h2{margin:0;font-size:clamp(1.3rem,2.6vw,1.9rem)}" +
      ".ekp-hero{position:relative;border-radius:16px;overflow:hidden;padding:clamp(26px,5vw,60px);color:#fff;background-size:cover;background-position:center;margin-bottom:26px}" +
      ".ekp-hero::before{content:'';position:absolute;inset:0;background:linear-gradient(120deg,rgba(12,16,32,.82),rgba(12,16,32,.35))}" +
      ".ekp-hero__in{position:relative;max-width:760px}" +
      ".ekp-hero h2{margin:0 0 10px;font-size:clamp(1.6rem,4vw,2.6rem)}" +
      ".ekp-hero p{margin:0 0 18px;font-size:1.02rem;opacity:.94}" +
      ".ekp-promo{border-radius:16px;padding:clamp(24px,4vw,46px);color:#fff;margin-bottom:26px;display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap}" +
      ".ekp-promo h2{margin:0 0 8px;font-size:clamp(1.4rem,3vw,2rem)}" +
      ".ekp-promo p{margin:0;opacity:.94;max-width:60ch}" +
      ".ekp-texto{max-width:860px;margin-bottom:26px}" +
      ".ekp-texto h2{margin:0 0 10px}" +
      ".ekp-texto .ekp-body{color:#374151;line-height:1.75}" +
      ".ekp-btn{display:inline-flex;align-items:center;gap:8px;background:#fff;color:#1c2333;padding:11px 20px;border-radius:10px;font-weight:700;text-decoration:none;font-size:.95rem}" +
      ".ekp-btn:hover{opacity:.94}" +
      ".ekp-tema-rojo{background:linear-gradient(120deg,#DA1D2A,#a31420)}" +
      ".ekp-tema-azul{background:linear-gradient(120deg,#244093,#162a66)}" +
      ".ekp-tema-oscuro{background:linear-gradient(120deg,#1c2333,#0f1420)}";
    document.head.appendChild(st);
  }

  /* ---- render de cada bloque ---- */
  function bHero(b) {
    var c = b.config || {};
    var bg = c.imagen ? "background-image:url('" + esc(c.imagen) + "')" : "";
    return '<section class="ekp-hero ekp-tema-' + esc(c.tema || "oscuro") + '" style="' + bg + '">' +
      '<div class="ekp-hero__in">' +
      (c.etiqueta ? '<span class="ek-hero__et">' + esc(c.etiqueta) + "</span>" : "") +
      "<h2>" + esc(c.titulo || "Título") + "</h2>" +
      (c.subtitulo ? "<p>" + esc(c.subtitulo) + "</p>" : "") +
      (c.boton && c.enlace ? '<a class="ekp-btn" href="' + esc(c.enlace) + '">' + esc(c.boton) + ' <i class="bi bi-arrow-right"></i></a>' : "") +
      "</div></section>";
  }
  function bProductos(b) {
    var c = b.config || {};
    var lista = D.productos.slice();
    if (c.categoria) lista = lista.filter(function (p) { return (p.c || []).indexOf(c.categoria) > -1; });
    if (c.subcategoria) lista = lista.filter(function (p) { return (SUB.mapa[p.s] || []).indexOf(c.subcategoria) > -1; });
    lista = lista.sort(function (a, x) { return (x.v * x.r) - (a.v * a.r); }).slice(0, Number(c.limite) || 8);
    if (!lista.length) return "";
    var tarjeta = window.EK_tarjeta || function () { return ""; };
    return '<section class="ekp-sec ek-container"><div class="ekp-head"><h2>' + esc(c.titulo || "Productos") + "</h2></div>" +
      '<div class="ek-grid ek-grid--4">' + lista.map(tarjeta).join("") + "</div></section>";
  }
  function bCategorias(b) {
    var c = b.config || {};
    var lista = D.categorias.slice();
    if (c.grupo && c.grupo !== "todas") lista = lista.filter(function (x) { return x.g === c.grupo; });
    lista = lista.sort(function (a, x) { return a.orden - x.orden; }).slice(0, Number(c.limite) || 10);
    if (!lista.length) return "";
    var tarjetaCat = window.EK_tarjetaCat || function () { return ""; };
    return '<section class="ekp-sec ek-container"><div class="ekp-head"><h2>' + esc(c.titulo || "Categorías") + "</h2></div>" +
      '<div class="ek-catgrid">' + lista.map(tarjetaCat).join("") + "</div></section>";
  }
  function bTexto(b) {
    var c = b.config || {};
    return '<section class="ekp-texto ek-container"><h2>' + esc(c.titulo || "") + "</h2>" +
      '<div class="ekp-body">' + (c.contenido || "") + "</div></section>";
  }
  function bPromo(b) {
    var c = b.config || {};
    return '<section class="ekp-promo ekp-tema-' + esc(c.tema || "rojo") + '">' +
      '<div><h2>' + esc(c.titulo || "Promoción") + "</h2>" +
      (c.subtitulo ? "<p>" + esc(c.subtitulo) + "</p>" : "") + "</div>" +
      (c.boton && c.enlace ? '<a class="ekp-btn" href="' + esc(c.enlace) + '">' + esc(c.boton) + ' <i class="bi bi-arrow-right"></i></a>' : "") +
      "</section>";
  }

  var RENDER = {
    hero: bHero, productos: bProductos, categorias: bCategorias, texto: bTexto, promo: bPromo,
  };

  function render(bloques) {
    inyectarEstilos();
    cont.innerHTML = (bloques || []).map(function (b) {
      var html = (RENDER[b.tipo] || bTexto)(b);
      var ancho = b.config && b.config.ancho ? Math.min(100, Math.max(40, Number(b.config.ancho))) : 100;
      return '<div style="max-width:' + ancho + '%;margin:0 auto">' + html + "</div>";
    }).join("");
    // Las tarjetas reutilizan .ek-reveal (ocultas hasta .is-in); como se pintan
    // después del arranque, las forzamos visibles.
    cont.querySelectorAll(".ek-reveal").forEach(function (el) { el.classList.add("is-in"); });
    if (window.EK_LIVE_APPLY) window.EK_LIVE_APPLY();
  }

  fetch(S.url + "/rest/v1/Pagina?slug=eq.inicio&select=bloques", {
    headers: { apikey: S.anonKey, Authorization: "Bearer " + S.anonKey },
  })
    .then(function (r) { return r.json(); })
    .then(function (rows) {
      var bloques = rows && rows[0] && rows[0].bloques;
      if (bloques && bloques.length) render(bloques);
    })
    .catch(function () { /* sin conexión: la home queda igual */ });
})();
