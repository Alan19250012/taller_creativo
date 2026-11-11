/* ============================================================================
   TALLER CREATIVO EK · Panel administrativo (vanilla JS)
   ----------------------------------------------------------------------------
   Habla con las Pages Functions (/api/login, /api/admin, /api/publish).
   Sin dependencias npm. Guarda el token en localStorage.
   ========================================================================== */
(function () {
  "use strict";

  /* ============================== UTILIDADES ============================== */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"']/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]; }); }
  function slugify(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function money(n) { return "$" + Number(n || 0).toLocaleString("es-MX"); }
  function nf(n) { return Number(n || 0).toLocaleString("es-MX"); }
  function fecha(iso) {
    if (!iso) return "";
    try { return new Date(iso).toLocaleString("es-MX", { day: "2-digit", month: "short", year: "numeric" }); }
    catch (e) { return iso; }
  }
  function toast(msg, ok) {
    var t = $("#toast");
    t.textContent = msg;
    t.className = "toast is-on " + (ok === false ? "err" : "ok");
    clearTimeout(t._t);
    t._t = setTimeout(function () { t.classList.remove("is-on"); }, 3200);
  }
  function modal(titulo, body) {
    var box = $("#modal-box");
    box.innerHTML = '<div class="modal__hd"><h2>' + esc(titulo) + '</h2><button class="close" data-cerrar>&times;</button></div>' + body;
    $("#modal").classList.add("is-on");
    var c = $("[data-cerrar]", box);
    if (c) c.onclick = cerrarModal;
  }
  function cerrarModal() { $("#modal").classList.remove("is-on"); }
  $("#modal").addEventListener("click", function (e) { if (e.target.id === "modal") cerrarModal(); });

  /* ============================== API ============================== */
  var token = localStorage.getItem("ek_admin_token") || "";
  var usuario = null;

  function authHeaders(extra) {
    var h = { "content-type": "application/json" };
    if (token) h.authorization = "Bearer " + token;
    return Object.assign(h, extra || {});
  }
  async function apiLogin(email, pass) {
    var res = await fetch("/api/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: email, password: pass }) });
    return res.json();
  }
  // Proxy hacia Supabase (PostgREST / RPC)
  async function supa(method, url, body) {
    var res = await fetch("/api/admin", { method: "POST", headers: authHeaders(), body: JSON.stringify({ method: method, url: url, body: body }) });
    var data = await res.json();
    if (!data.ok) throw new Error(data.error || "Error del servidor");
    return data.data;
  }
  async function publicar() {
    var res = await fetch("/api/publish", { method: "POST", headers: authHeaders() });
    return res.json();
  }

  /* ============================== AUTENTICACIÓN ============================== */
  function mostrarLogin() {
    $("#vista-login").hidden = false;
    $("#vista-app").hidden = true;
  }
  function mostrarApp() {
    $("#vista-login").hidden = true;
    $("#vista-app").hidden = false;
    $("#usuario-nombre").textContent = usuario ? (usuario.nombre + " · " + usuario.rol) : "";
  }
  async function validarSesion() {
    if (!token) { mostrarLogin(); return false; }
    try {
      var res = await fetch("/api/me", { headers: authHeaders() });
      var data = await res.json();
      if (!data.ok) throw new Error();
      usuario = data.usuario;
      mostrarApp();
      return true;
    } catch (e) {
      token = ""; localStorage.removeItem("ek_admin_token");
      mostrarLogin();
      return false;
    }
  }
  $("#form-login").addEventListener("submit", async function (e) {
    e.preventDefault();
    $("#btn-login").disabled = true;
    $("#login-error").textContent = "";
    try {
      var r = await apiLogin($("#login-email").value.trim(), $("#login-pass").value);
      if (!r.ok) throw new Error(r.error || "No autorizado");
      token = r.token; usuario = r.usuario;
      localStorage.setItem("ek_admin_token", token);
      mostrarApp();
      route();
    } catch (err) {
      $("#login-error").textContent = err.message;
    } finally {
      $("#btn-login").disabled = false;
    }
  });
  $("#btn-salir").addEventListener("click", function () {
    token = ""; usuario = null; localStorage.removeItem("ek_admin_token");
    mostrarLogin();
  });
  $("#btn-publicar").addEventListener("click", async function () {
    var b = $("#btn-publicar");
    b.disabled = true;
    try {
      var r = await publicar();
      toast(r.ok ? "Despliegue iniciado. La tienda se actualizará en 1-3 min." : (r.error || "Error"), r.ok !== false);
    } catch (e) { toast(e.message, false); }
    finally { b.disabled = false; }
  });

  /* ============================== ROUTER ============================== */
  var SECCIONES = {
    dashboard: { titulo: "Resumen", render: renderDashboard },
    productos: { titulo: "Productos", render: renderProductos },
    categorias: { titulo: "Categorías", render: renderCategorias },
    subcategorias: { titulo: "Subcategorías", render: renderSubcategorias },
    banners: { titulo: "Banners", render: renderBanners },
    blog: { titulo: "Blog", render: renderBlog },
    resenas: { titulo: "Reseñas", render: renderResenas },
    pedidos: { titulo: "Pedidos", render: renderPedidos },
    clientes: { titulo: "Clientes", render: renderClientes },
    cupones: { titulo: "Cupones", render: renderCupones },
    constructor: { titulo: "Constructor visual", render: renderConstructor },
    politicas: { titulo: "Políticas", render: renderPoliticas },
    configuracion: { titulo: "Configuración", render: renderConfiguracion },
  };

  function route() {
    var h = (location.hash || "#/dashboard").replace("#/", "");
    var sec = SECCIONES[h] ? h : "dashboard";
    $("#titulo-seccion").textContent = SECCIONES[sec].titulo;
    $$("#nav a").forEach(function (a) { a.classList.toggle("is-on", a.getAttribute("data-sec") === sec); });
    SECCIONES[sec].render();
  }
  window.addEventListener("hashchange", route);

  /* ============================== HELPERS DE LISTAS/FORMULARIOS ============================== */
  function fld(label, inner, hint) {
    return '<div class="field"><label>' + esc(label) + (hint ? ' <span class="hint">' + esc(hint) + "</span>" : "") + "</label>" + inner + "</div>";
  }
  function input(name, val, tipo, ph) {
    return '<input name="' + name + '" type="' + (tipo || "text") + '" value="' + esc(val) + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : "") + ">";
  }
  function area(name, val, rows) {
    return '<textarea name="' + name + '" rows="' + (rows || 4) + '">' + esc(val) + "</textarea>";
  }
  function check(name, val, label) {
    return '<label class="check"><input type="checkbox" name="' + name + '"' + (val ? " checked" : "") + "> " + esc(label) + "</label>";
  }
  function select(name, opciones, val) {
    return '<select name="' + name + '">' + opciones.map(function (o) {
      return '<option value="' + esc(o.v) + '"' + (String(o.v) === String(val) ? " selected" : "") + ">" + esc(o.l) + "</option>";
    }).join("") + "</select>";
  }
  // Entrada de etiquetas (chips): un input + botón "Agregar" en vez de escribir comas.
  function tagInput(name, valores, placeholder) {
    var id = "tag-" + name;
    return '<div class="taginput" data-tag="' + name + '">' +
      '<input type="hidden" name="' + name + '" id="' + id + '" value="' + esc((valores || []).join(", ")) + '">' +
      '<div class="taginput__chips" id="' + id + '-chips"></div>' +
      '<div class="taginput__row"><input type="text" id="' + id + '-inp" placeholder="' + esc(placeholder || "Escribe y presiona Enter") + '">' +
      '<button type="button" class="btn btn--sm btn--ghost" id="' + id + '-add"><i class="bi bi-plus-lg"></i> Agregar</button></div></div>';
  }
  function initTagInput(name) {
    var id = "tag-" + name;
    var hidden = $("#" + id), chips = $("#" + id + "-chips"), inp = $("#" + id + "-inp"), add = $("#" + id + "-add");
    if (!hidden || !chips || !inp) return;
    var lista = (hidden.value || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
    function pintar() {
      chips.innerHTML = lista.map(function (v) {
        return '<span class="tag"><i class="bi bi-tag"></i> ' + esc(v) + ' <button type="button" data-quitar="' + esc(v) + '" aria-label="Quitar">&times;</button></span>';
      }).join("");
      hidden.value = lista.join(", ");
    }
    function agregar() {
      var v = inp.value.trim();
      if (v && lista.indexOf(v) === -1) { lista.push(v); inp.value = ""; pintar(); inp.focus(); }
    }
    add.onclick = agregar;
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); agregar(); } });
    chips.addEventListener("click", function (e) {
      var b = e.target.closest("[data-quitar]");
      if (b) { lista = lista.filter(function (x) { return x !== b.getAttribute("data-quitar"); }); pintar(); }
    });
    pintar();
  }
  // Galería de imágenes (1-5) con subida a Supabase Storage.
  function initGaleria(urlsIniciales) {
    var cont = $("#galeria");
    if (!cont) return { getUrls: function () { return []; } };
    var lista = (urlsIniciales || []).slice(0, 5);
    function pintar() {
      cont.innerHTML = lista.map(function (u, i) {
        if (!u) return '<div class="gal-item gal-item--vacio" data-subir="' + i + '" title="Subir imagen" style="cursor:pointer"><i class="bi bi-cloud-arrow-up"></i><small>Subir</small></div>' +
          '<input type="file" accept="image/*" data-file="' + i + '" style="display:none">';
        return '<div class="gal-item" data-i="' + i + '"><img src="' + esc(u) + '" alt="Imagen ' + (i + 1) + '" onerror="this.style.opacity=.2">' +
          '<div class="gal-item__ops">' +
            '<button type="button" class="btn btn--sm" data-subir="' + i + '" title="Reemplazar"><i class="bi bi-upload"></i></button>' +
            '<button type="button" class="btn btn--sm" data-quitar="' + i + '" title="Quitar" style="color:var(--rojo)"><i class="bi bi-x-lg"></i></button>' +
          "</div></div>" +
          '<input type="file" accept="image/*" data-file="' + i + '" style="display:none">';
      }).join("") +
      (lista.length < 5 ? '<button type="button" class="btn btn--sm btn--ghost" data-agregar style="grid-column:1/-1"><i class="bi bi-plus-lg"></i> Añadir imagen (' + lista.length + "/5)</button>" : "");
    }
    function subir(fileInput, idx) {
      var file = fileInput.files[0];
      if (!file) return;
      var lector = new FileReader();
      lector.onload = async function () {
        try {
          var res = await fetch("/api/upload", { method: "POST", headers: authHeaders(), body: JSON.stringify({ base64: lector.result, nombre: file.name, tipo: "productos" }) });
          var d = await res.json();
          if (d.ok && d.url) { lista[idx] = d.url; pintar(); }
          else toast(d.error || "Error al subir", false);
        } catch (e) { toast("Error de conexión", false); }
      };
      lector.readAsDataURL(file);
    }
    cont.addEventListener("click", function (e) {
      var subir = e.target.closest("[data-subir]");
      if (subir) { cont.querySelector('[data-file="' + subir.getAttribute("data-subir") + '"]').click(); return; }
      var b = e.target.closest("button");
      if (!b) return;
      if (b.hasAttribute("data-agregar")) { lista.push(""); pintar(); }
      else if (b.hasAttribute("data-quitar")) { lista.splice(+b.getAttribute("data-quitar"), 1); pintar(); }
    });
    cont.addEventListener("change", function (e) {
      var f = e.target.closest("[data-file]");
      if (f) subir(f, +f.getAttribute("data-file"));
    });
    pintar();
    return { getUrls: function () { return lista.filter(Boolean); } };
  }
  // Editor de variantes (talla | color | stock | precio) en filas, sin escribir comas ni pipes.
  function initVariantes(variantesIniciales) {
    var cont = $("#variantes");
    if (!cont) return { getValor: function () { return []; } };
    var lista = (variantesIniciales || []).map(function (v) {
      return { talla: v.talla || "", color: v.color || "", stock: v.stock || 0, precio: v.precio || "" };
    });
    function pintar() {
      cont.innerHTML = lista.map(function (v, i) {
        return '<div class="var-row" data-i="' + i + '">' +
          '<input class="var-talla" placeholder="Talla" value="' + esc(v.talla) + '">' +
          '<input class="var-color" placeholder="Color" value="' + esc(v.color) + '">' +
          '<input class="var-stock" type="number" placeholder="Stock" value="' + esc(v.stock) + '">' +
          '<input class="var-precio" type="number" placeholder="Precio" value="' + esc(v.precio) + '">' +
          '<button type="button" class="btn btn--sm btn--ghost" data-quitar="' + i + '" style="color:var(--rojo)" title="Quitar"><i class="bi bi-x-lg"></i></button>' +
          "</div>";
      }).join("") +
        '<button type="button" class="btn btn--sm btn--ghost" data-agregar><i class="bi bi-plus-lg"></i> Agregar variante</button>';
    }
    cont.addEventListener("input", function (e) {
      var fila = e.target.closest(".var-row");
      if (!fila) return;
      var v = lista[+fila.getAttribute("data-i")];
      if (e.target.classList.contains("var-talla")) v.talla = e.target.value;
      else if (e.target.classList.contains("var-color")) v.color = e.target.value;
      else if (e.target.classList.contains("var-stock")) v.stock = Number(e.target.value) || 0;
      else if (e.target.classList.contains("var-precio")) v.precio = e.target.value ? Number(e.target.value) : "";
    });
    cont.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      if (b.hasAttribute("data-agregar")) { lista.push({ talla: "", color: "", stock: 0, precio: "" }); pintar(); }
      else if (b.hasAttribute("data-quitar")) { lista.splice(+b.getAttribute("data-quitar"), 1); pintar(); }
    });
    pintar();
    return {
      getValor: function () {
        return lista.filter(function (v) { return v.talla || v.color; }).map(function (v) {
          return { talla: v.talla || null, color: v.color || null, stock: v.stock || 0, precio: v.precio || null };
        });
      },
    };
  }
  // Constructor por bloques para el blog (texto e imágenes)
  function initBlogBloques(inicial) {
    var cont = $("#blog-bloques");
    if (!cont) return { getHTML: function () { return ""; }, getBloques: function () { return []; } };
    var lista = (inicial || []).map(function (b) { return { tipo: b.tipo || "texto", texto: b.texto || "", url: b.url || "", alt: b.alt || "" }; });
    function pintar() {
      cont.innerHTML = lista.map(function (b, i) {
        var cuerpo = b.tipo === "imagen"
          ? '<div class="row"><div class="field"><label>URL de la imagen</label><input class="blq-url" value="' + esc(b.url) + '"></div>' +
            '<div class="field"><label>Texto alternativo</label><input class="blq-alt" value="' + esc(b.alt) + '"></div></div>' +
            '<div style="display:flex;align-items:center;gap:8px"><input type="file" class="blq-file" accept="image/*" style="display:none" data-i="' + i + '">' +
            '<button type="button" class="btn btn--sm btn--ghost" data-subir="' + i + '"><i class="bi bi-upload"></i> Subir imagen</button></div>' +
            (b.url ? '<img src="' + esc(b.url) + '" style="max-width:160px;max-height:140px;display:block;margin-top:8px;border-radius:8px">' : "")
          : '<textarea class="blq-texto" rows="4" placeholder="Escribe un párrafo…">' + esc(b.texto) + "</textarea>";
        return '<div class="blq" data-i="' + i + '">' +
          '<div class="blq-head"><b>' + (b.tipo === "imagen" ? "🖼 Imagen" : "📝 Texto") + "</b>" +
            '<button type="button" class="btn btn--ghost btn--sm" data-mover="' + i + '" data-dir="-1"><i class="bi bi-arrow-up"></i></button>' +
            '<button type="button" class="btn btn--ghost btn--sm" data-mover="' + i + '" data-dir="1"><i class="bi bi-arrow-down"></i></button>' +
            '<button type="button" class="btn btn--ghost btn--sm" data-del="' + i + '" style="color:var(--rojo)"><i class="bi bi-trash3"></i></button></div>' + cuerpo + "</div>";
      }).join("") +
        '<div style="display:flex;gap:8px;margin-top:10px">' +
          '<button type="button" class="btn btn--sm btn--ghost" data-add="texto"><i class="bi bi-plus-lg"></i> Texto</button>' +
          '<button type="button" class="btn btn--sm btn--ghost" data-add="imagen"><i class="bi bi-plus-lg"></i> Imagen</button>' +
        "</div>";
    }
    function idx(el) { return +el.closest(".blq").getAttribute("data-i"); }
    cont.addEventListener("input", function (e) {
      if (e.target.classList.contains("blq-texto")) lista[idx(e.target)].texto = e.target.value;
      else if (e.target.classList.contains("blq-url")) lista[idx(e.target)].url = e.target.value;
      else if (e.target.classList.contains("blq-alt")) lista[idx(e.target)].alt = e.target.value;
    });
    cont.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      if (b.hasAttribute("data-add")) { lista.push({ tipo: b.getAttribute("data-add"), texto: "", url: "", alt: "" }); pintar(); }
      else if (b.hasAttribute("data-del")) { lista.splice(+b.getAttribute("data-del"), 1); pintar(); }
      else if (b.hasAttribute("data-mover")) {
        var i = +b.getAttribute("data-mover"), j = i + (+b.getAttribute("data-dir"));
        if (j >= 0 && j < lista.length) { var t = lista[i]; lista[i] = lista[j]; lista[j] = t; pintar(); }
      }
      else if (b.hasAttribute("data-subir")) { cont.querySelector('.blq-file[data-i="' + b.getAttribute("data-subir") + '"]').click(); }
    });
    cont.addEventListener("change", function (e) {
      var f = e.target.closest(".blq-file");
      if (!f || !f.files[0]) return;
      var i = +f.getAttribute("data-i");
      var lector = new FileReader();
      lector.onload = async function () {
        try {
          var res = await fetch("/api/upload", { method: "POST", headers: authHeaders(), body: JSON.stringify({ base64: lector.result, nombre: f.files[0].name, tipo: "blog" }) });
          var d = await res.json();
          if (d.ok && d.url) { lista[i].url = d.url; pintar(); }
          else toast(d.error || "Error al subir", false);
        } catch (e) { toast("Error de conexión", false); }
      };
      lector.readAsDataURL(f.files[0]);
    });
    pintar();
    return {
      getBloques: function () { return lista; },
      getHTML: function () {
        return lista.map(function (b) {
          if (b.tipo === "imagen") return b.url ? '<p><img src="' + esc(b.url) + '" alt="' + esc(b.alt || "") + '" style="max-width:100%"></p>' : "";
          return String(b.texto || "").split(/\n+/).filter(function (p) { return p.trim(); }).map(function (p) { return "<p>" + p + "</p>"; }).join("");
        }).join("");
      },
    };
  }
  function arrSplit(v) { return (v || []).join(", "); }
  function arrJoin(txt) {
    return String(txt || "").split(",").map(function (x) { return x.trim(); }).filter(Boolean);
  }
  function listSplit(txt) {
    return String(txt || "").split(/\r?\n/).map(function (x) { return x.trim(); }).filter(Boolean);
  }

  /* ============================== DASHBOARD ============================== */
  async function renderDashboard() {
    var cont = $("#contenido");
    cont.innerHTML = '<div class="card"><p class="muted">Cargando…</p></div>';
    try {
      var [prods, peds, res, users, cats, arts] = await Promise.all([
        supa("GET", "/rest/v1/Producto?select=id,nombre,vendidos,precioMinorista&order=vendidos.desc"),
        supa("GET", "/rest/v1/Pedido?select=id,estado,total"),
        supa("GET", "/rest/v1/Resena?select=id,aprobada"),
        supa("GET", "/rest/v1/Usuario?select=id"),
        supa("GET", "/rest/v1/Categoria?select=id"),
        supa("GET", "/rest/v1/Articulo?select=id,publicado"),
      ]);
      var pend = peds.filter(function (p) { return p.estado === "PENDIENTE"; }).length;
      var resPend = res.filter(function (r) { return !r.aprobada; }).length;
      var ventas = peds.filter(function (p) { return p.estado !== "CANCELADO"; }).reduce(function (a, p) { return a + (p.total || 0); }, 0);
      var top = prods.slice(0, 5);
      cont.innerHTML =
        '<div class="grid grid--stats">' +
          stat(ventas, "Ventas totales", "bi-cash-stack", "pedidos", true) +
          stat(peds.length, "Pedidos", "bi-receipt", "pedidos") +
          stat(pend, "Pendientes", "bi-hourglass-split", "pedidos") +
          stat(users.length, "Clientes", "bi-people", "clientes") +
          stat(prods.length, "Productos", "bi-box-seam", "productos") +
          stat(resPend, "Reseñas por aprobar", "bi-star", "resenas") +
        "</div>" +
        '<div class="card"><h2>Productos más vendidos</h2><p class="muted">Por piezas vendidas (se actualiza en tiempo real).</p>' +
          '<table><thead><tr><th>Producto</th><th>Vendidos</th><th>Precio</th></tr></thead><tbody>' +
          top.map(function (p) { return "<tr><td>" + esc(p.nombre) + "</td><td>" + nf(p.vendidos) + "</td><td>" + money(p.precioMinorista) + "</td></tr>"; }).join("") +
          (top.length ? "" : '<tr><td colspan="3" class="empty">Sin datos</td></tr>') +
          "</tbody></table></div>" +
        '<div class="card">' +
          "<h2>Cómo funciona</h2>" +
          '<p class="muted">Los cambios se escriben en Supabase. <b>Publicar cambios</b> regenera el catálogo/interfaz y redeploya (1-3 min). Stock, reseñas, calificación, ventas y pedidos se actualizan <b>en tiempo real</b>. El tráfico se mide con <b>Cloudflare Web Analytics</b> (Analytics & Logs en tu proyecto Pages), no con Supabase.</p>' +
          '<button class="btn btn--rojo" id="btn-publicar-2"><i class="bi bi-cloud-arrow-up"></i> Publicar cambios ahora</button>' +
        "</div>";
      $("#btn-publicar-2").onclick = function () { $("#btn-publicar").click(); };
    } catch (e) {
      cont.innerHTML = '<div class="card"><div class="empty">Error: ' + esc(e.message) + "</div></div>";
    }
  }
  function stat(n, label, ico, sec, esDinero) {
    var val = esDinero ? money(n) : nf(n);
    var inner = "<b>" + val + "</b><span><i class='bi " + ico + "'></i> " + esc(label) + "</span>";
    return sec
      ? '<a class="stat stat--link" href="#/' + sec + '">' + inner + "</a>"
      : '<div class="stat">' + inner + "</div>";
  }

  /* ============================== PRODUCTOS ============================== */
  var productosCache = [];
  var productosCategorias = [];
  var productosCats = {};   // productoId → [slug de categorías]
  async function renderProductos() {
    var cont = $("#contenido");
    cont.innerHTML = '<div class="card"><p class="muted">Cargando…</p></div>';
    try {
      var [prods, cats, rel] = await Promise.all([
        supa("GET", "/rest/v1/Producto?select=*&order=nombre.asc"),
        supa("GET", "/rest/v1/Categoria?select=id,slug,nombre&order=nombre.asc"),
        supa("GET", "/rest/v1/_CategoriaToProducto?select=A,B"),
      ]);
      productosCache = prods;
      productosCategorias = cats;
      var catIdSlug = {};
      cats.forEach(function (c) { catIdSlug[c.id] = c.slug; });
      productosCats = {};
      prods.forEach(function (p) { productosCats[p.id] = []; });
      rel.forEach(function (r) { var s = catIdSlug[r.A]; if (s && productosCats[r.B]) productosCats[r.B].push(s); });
      pintarProductos("", "TODAS", "TODOS");
    } catch (e) { cont.innerHTML = errCard(e); }
  }
  function pintarProductos(q, cat, estado) {
    var cont = $("#contenido");
    var lista = productosCache.filter(function (p) {
      if (q && (p.nombre + " " + (p.slug || "") + " " + (p.keywords || "")).toLowerCase().indexOf(q.toLowerCase()) === -1) return false;
      if (cat && cat !== "TODAS" && (productosCats[p.id] || []).indexOf(cat) === -1) return false;
      if (estado === "ACTIVOS" && !p.activo) return false;
      if (estado === "OCULTOS" && p.activo) return false;
      return true;
    });
    cont.innerHTML =
      '<div class="card">' +
        '<div class="toolbar">' +
          '<input type="search" id="q-prod" placeholder="Buscar producto…" value="' + esc(q) + '">' +
          '<select id="filtro-cat" style="width:auto"><option value="TODAS">Todas las categorías</option>' +
            productosCategorias.map(function (c) { return '<option value="' + esc(c.slug) + '">' + esc(c.nombre) + "</option>"; }).join("") +
          "</select>" +
          '<select id="filtro-estado" style="width:auto"><option value="TODOS">Todos</option><option value="ACTIVOS">Activos</option><option value="OCULTOS">Ocultos</option></select>' +
          '<button class="btn" id="btn-nuevo-prod"><i class="bi bi-plus-lg"></i> Nuevo producto</button>' +
        "</div>" +
        '<table><thead><tr><th>Producto</th><th>Precio</th><th>Stock</th><th>Estado</th><th></th></tr></thead><tbody>' +
        lista.map(function (p) {
          return "<tr><td><b>" + esc(p.nombre) + '</b><br><small class="muted">' + esc(p.slug) + "</small></td>" +
            "<td>" + money(p.precioMinorista) + (p.precioAnterior ? "<br><s>" + money(p.precioAnterior) + "</s>" : "") + "</td>" +
            "<td>" + nf(p.stock) + "</td>" +
            "<td>" + (p.activo ? '<span class="badge badge--on">Activo</span>' : '<span class="badge badge--off">Oculto</span>') +
              (p.destacado ? " <span class='badge badge--env'>Top</span>" : "") +
              (p.nuevo ? " <span class='badge badge--env'>Nuevo</span>" : "") +
              (p.liquidacion ? " <span class='badge badge--pend'>Oferta</span>" : "") + "</td>" +
            '<td class="actions"><button class="btn btn--ghost btn--sm" data-edit="' + p.id + '"><i class="bi bi-pencil"></i></button>' +
            '<button class="btn btn--ghost btn--sm" data-del="' + p.id + '" style="color:var(--rojo)"><i class="bi bi-trash3"></i></button></td></tr>';
        }).join("") +
        (lista.length ? "" : '<tr><td colspan="5" class="empty">Sin resultados</td></tr>') +
        "</tbody></table></div>";

    var buscador = $("#q-prod"), catSel = $("#filtro-cat"), estSel = $("#filtro-estado");
    function refrescar() { pintarProductos(buscador.value, catSel.value, estSel.value); }
    if (buscador) buscador.addEventListener("input", refrescar);
    if (catSel) { catSel.value = cat; catSel.onchange = refrescar; }
    if (estSel) { estSel.value = estado; estSel.onchange = refrescar; }
    var btnN = $("#btn-nuevo-prod"); if (btnN) btnN.onclick = function () { formProducto(null); };
    $$("[data-edit]", cont).forEach(function (b) { b.onclick = function () { formProducto(b.getAttribute("data-edit")); }; });
    $$("[data-del]", cont).forEach(function (b) {
      b.onclick = async function () {
        if (!confirm("¿Eliminar este producto?")) return;
        try { await supa("DELETE", "/rest/v1/Producto?id=eq." + b.getAttribute("data-del")); toast("Producto eliminado"); renderProductos(); }
        catch (e) { toast(e.message, false); }
      };
    });
  }

  async function formProducto(id) {
    var cats = await supa("GET", "/rest/v1/Categoria?select=id,nombre&order=nombre.asc").catch(function () { return []; });
    var p = id ? productosCache.find(function (x) { return x.id === id; }) : null;
    var actuales = [];
    var variantes = [];
    if (p) {
      actuales = (await supa("GET", "/rest/v1/_CategoriaToProducto?select=B&A=eq." + p.id).catch(function () { return []; }))
        .map(function (r) { return r.B; });
      variantes = await supa("GET", "/rest/v1/Variante?select=talla,color,stock,precio&productoId=eq." + p.id).catch(function () { return []; });
    }
    var variantesTxt = variantes.map(function (v) { return [v.talla || "", v.color || "", v.stock, v.precio || ""].join(" | "); }).join("\n");
    var body =
      '<form id="f-prod">' +
      '<div class="row"><div class="field"><label>Nombre *</label>' + input("nombre", p ? p.nombre : "") + "</div>" +
      '<div class="field"><label>Slug <span class="hint">(se genera solo si lo dejas vacío)</span></label>' + input("slug", p ? p.slug : "") + "</div></div>" +
      fld("Descripción", area("descripcion", p ? p.descripcion : "", 3)) +
      '<div class="row">' +
        fld("Precio minorista (MXN) *", input("precioMinorista", p ? p.precioMinorista : "", "number")) +
        fld("Precio distribuidor (MXN) <span class=hint>(solo lo ven distribuidores)</span>", input("precioDistribuidor", p ? (p.precioDistribuidor || "") : "", "number")) +
      "</div>" +
      fld("Precio anterior (oferta)", input("precioAnterior", p ? (p.precioAnterior || "") : "", "number")) +
      '<div class="row row--3">' +
        fld("Stock", input("stock", p ? p.stock : 0, "number")) +
        fld("Vendidos", input("vendidos", p ? p.vendidos : 0, "number")) +
        fld("Calificación (0-5)", input("calificacion", p ? p.calificacion : 0, "number")) +
      "</div>" +
      '<div class="row">' +
        fld("Colores", tagInput("colores", p ? p.colores : [], "Ej. Rojo")) +
        fld("Tallas / tamaños", tagInput("tallas", p ? p.tallas : [], "Ej. 30 cm")) +
      "</div>" +
      fld("Características <span class=hint>(una por línea)</span>", area("caracteristicas", p ? (p.caracteristicas || []).join("\n") : "", 4)) +
      fld("Stock y precio por variante <span class=hint>(opcional: agrega filas con talla, color, stock y precio)</span>", '<div id="variantes"></div>') +
      fld("Palabras clave (imágenes)", input("keywords", p ? p.keywords : "")) +
      fld("Imágenes del producto (1-5) <span class=hint>(la primera es la principal; súbelas desde aquí)</span>",
        '<div id="galeria"></div>') +
      '<div class="row"><div class="field"><label></label>' + check("personalizable", p ? p.personalizable : false, "Producto personalizable (mostrar editor de texto al cliente)") + "</div></div>" +
      fld("Imagen base para personalizar <span class=hint>(sobre esta trabaja el cliente; NO aparece en la galería)</span>",
        '<input type="file" id="up-personalizacion" accept="image/*">' +
        '<input type="hidden" name="imagen_personalizacion" id="imagen_personalizacion" value="' + esc(p ? (p.imagen_personalizacion || "") : "") + '">' +
        '<img id="personalizacion-preview" style="max-width:160px;max-height:160px;margin-top:8px;border-radius:8px;' + (p && p.imagen_personalizacion ? "" : "display:none") + '" src="' + esc(p ? (p.imagen_personalizacion || "") : "") + '">') +
      fld("Área de impresión / personalización <span class=hint>(define dónde irá el texto del cliente; solo aplica si es personalizable)</span>",
        '<div id="print-area-container"><p class="hint" style="margin:0">Sube primero una imagen para dibujar el área.</p></div>') +
      fld("Categorías", '<div class="chips">' + cats.map(function (c) {
        return '<label><input type="checkbox" name="cat" value="' + c.id + '"' + (actuales.indexOf(c.id) > -1 ? " checked" : "") + "> " + esc(c.nombre) + "</label>";
      }).join("") + "</div>") +
      '<div class="row row--3">' +
        check("destacado", p ? p.destacado : false, "Destacado (Top)") +
        check("nuevo", p ? p.nuevo : false, "Nuevo") +
        check("liquidacion", p ? p.liquidacion : false, "En oferta") +
      "</div>" +
      '<div class="row"><div class="field"><label></label>' + check("activo", p ? p.activo !== false : true, "Activo (visible en la tienda)") + "</div></div>" +
      '<div class="modal__ft"><button type="button" class="btn btn--ghost" data-cerrar>Cancelar</button><button class="btn btn--rojo" type="submit">Guardar</button></div>' +
      "</form>";
    modal(p ? "Editar producto" : "Nuevo producto", body);
    // Entradas de etiquetas (colores y tallas con chips)
    initTagInput("colores");
    initTagInput("tallas");
    // Editor de variantes (filas)
    var variantesEditor = initVariantes(p ? (p.variantes || []) : []);
    // Galería de imágenes (1-5)
    var imagenesIniciales = p && p.imagenes && p.imagenes.length ? p.imagenes : (p && p.imagen ? [p.imagen] : []);
    var galeria = initGaleria(imagenesIniciales);

    // Imagen base de personalización (subida separada, NO visible en la galería)
    function subirPersonalizacion(file) {
      var lector = new FileReader();
      lector.onload = async function () {
        try {
          var res = await fetch("/api/upload", { method: "POST", headers: authHeaders(), body: JSON.stringify({ base64: lector.result, nombre: file.name, tipo: "personalizacion" }) });
          var d = await res.json();
          if (d.ok && d.url) {
            $("#imagen_personalizacion").value = d.url;
            var pv = $("#personalizacion-preview");
            if (pv) { pv.src = d.url; pv.style.display = ""; }
            if (editorPA) editorPA.setImagen(d.url);   // el editor de área usa esta imagen
          } else toast(d.error || "Error al subir", false);
        } catch (e) { toast("Error de conexión", false); }
      };
      lector.readAsDataURL(file);
    }
    $("#up-personalizacion").addEventListener("change", function () {
      if (this.files[0]) subirPersonalizacion(this.files[0]);
    });

    // Configurador de área de impresión: usa la imagen de personalización si existe, si no la primera de la galería
    var editorPA = null;
    var imgBasePA = (p && p.imagen_personalizacion) || imagenesIniciales[0] || "";
    if (window.PrintAreaEditor) {
      editorPA = window.PrintAreaEditor({
        container: $("#print-area-container"),
        imagen: imgBasePA,
        valor: p ? (p.print_area || null) : null,
      });
    }
    // Al subir la primera imagen de la galería (si no hay imagen de personalización), se actualiza el editor
    $("#galeria").addEventListener("click", function () {
      setTimeout(function () {
        if ($("#imagen_personalizacion").value) return;
        var urls = galeria.getUrls();
        if (editorPA && urls[0]) editorPA.setImagen(urls[0]);
      }, 1500);
    });

    // Mostrar/ocultar la imagen de personalización según el checkbox
    var cbPersonalizable = $('input[name="personalizable"]');
    function togglePersonalizable() {
      var on = cbPersonalizable.checked;
      $("#up-personalizacion").closest(".field").style.display = on ? "" : "none";
    }
    if (cbPersonalizable) { cbPersonalizable.addEventListener("change", togglePersonalizable); togglePersonalizable(); }

    $("#f-prod").addEventListener("submit", async function (e) {
      e.preventDefault();
      var f = new FormData(e.target);
      var datos = {
        nombre: f.get("nombre"), slug: f.get("slug") || slugify(f.get("nombre")),
        descripcion: f.get("descripcion") || "",
        precioMinorista: Number(f.get("precioMinorista")) || 0,
        precioDistribuidor: f.get("precioDistribuidor") ? Number(f.get("precioDistribuidor")) : null,
        precioAnterior: f.get("precioAnterior") ? Number(f.get("precioAnterior")) : null,
        stock: Number(f.get("stock")) || 0, vendidos: Number(f.get("vendidos")) || 0,
        calificacion: Number(f.get("calificacion")) || 0,
        colores: arrJoin(f.get("colores")), tallas: arrJoin(f.get("tallas")),
        caracteristicas: listSplit(f.get("caracteristicas")), keywords: f.get("keywords") || null,
        imagenes: galeria ? galeria.getUrls() : [],
        imagen: (galeria && galeria.getUrls()[0]) || null,
        imagen_personalizacion: f.get("imagen_personalizacion") || null,
        personalizable: !!f.get("personalizable"),
        print_area: editorPA ? editorPA.getValor() : null,
        destacado: !!f.get("destacado"), nuevo: !!f.get("nuevo"), liquidacion: !!f.get("liquidacion"),
        activo: !!f.get("activo"),
      };
      if (!datos.nombre) { toast("El nombre es obligatorio", false); return; }
      try {
        var pid;
        if (p) { await supa("PATCH", "/rest/v1/Producto?id=eq." + p.id, datos); pid = p.id; }
        else { var creado = await supa("POST", "/rest/v1/Producto", datos); pid = creado[0].id; }
        // categorías
        await supa("DELETE", "/rest/v1/_CategoriaToProducto?B=eq." + pid).catch(function () {});
        var catsSel = $$('input[name="cat"]:checked').map(function (c) { return c.value; });
        for (var i = 0; i < catsSel.length; i++) {
          await supa("POST", "/rest/v1/_CategoriaToProducto", { A: catsSel[i], B: pid });
        }
        // variantes (desde el editor de filas)
        await supa("DELETE", "/rest/v1/Variante?productoId=eq." + pid).catch(function () {});
        var varRows = variantesEditor ? variantesEditor.getValor() : [];
        for (var j = 0; j < varRows.length; j++) {
          await supa("POST", "/rest/v1/Variante", { productoId: pid, talla: varRows[j].talla, color: varRows[j].color, stock: varRows[j].stock, precio: varRows[j].precio });
        }
        cerrarModal(); toast("Producto guardado. Pulsa 'Publicar cambios' para actualizar la tienda.");
        renderProductos();
      } catch (err) { toast(err.message, false); }
    });
  }

  /* ============================== CATEGORÍAS ============================== */
  var categoriasCache = [];
  async function renderCategorias() {
    var cont = $("#contenido");
    try {
      categoriasCache = await supa("GET", "/rest/v1/Categoria?select=*&order=orden.asc");
      cont.innerHTML =
        '<div class="card"><div class="toolbar"><button class="btn" id="btn-nueva-cat"><i class="bi bi-plus-lg"></i> Nueva categoría</button>' +
        '<span class="muted">Usa ↑↓ para ordenar; activa "Menú" o "Lateral" para mostrar la categoría en cada barra.</span></div>' +
        '<table><thead><tr><th>Nombre</th><th>Grupo</th><th>Menú</th><th>Lateral</th><th>Orden</th><th></th></tr></thead><tbody>' +
        categoriasCache.map(function (c) {
          return "<tr><td><b>" + esc(c.nombre) + "</b> " + esc(c.emoji || "") + '<br><small class="muted">' + esc(c.slug) + "</small></td>" +
            "<td>" + (c.grupo === "temporada" ? "🎄 Temporada" : "🛍 Producto") + "</td>" +
            '<td><button class="btn btn--sm ' + (c.enNav ? "btn--ok" : "btn--ghost") + '" data-toggle="enNav" data-id="' + c.id + '">' + (c.enNav ? "Sí" : "No") + "</button></td>" +
            '<td><button class="btn btn--sm ' + (c.enSidebar !== false ? "btn--ok" : "btn--ghost") + '" data-toggle="enSidebar" data-id="' + c.id + '">' + (c.enSidebar !== false ? "Sí" : "No") + "</button></td>" +
            '<td><button class="btn btn--ghost btn--sm" data-mover="' + c.id + '" data-dir="-1"><i class="bi bi-arrow-up"></i></button>' +
            '<button class="btn btn--ghost btn--sm" data-mover="' + c.id + '" data-dir="1"><i class="bi bi-arrow-down"></i></button></td>' +
            '<td class="actions"><button class="btn btn--ghost btn--sm" data-edit="' + c.id + '"><i class="bi bi-pencil"></i></button>' +
            '<button class="btn btn--ghost btn--sm" data-del="' + c.id + '" style="color:var(--rojo)"><i class="bi bi-trash3"></i></button></td></tr>';
        }).join("") + "</tbody></table></div>";
      $("#btn-nueva-cat").onclick = function () { formCategoria(null); };
      $$("[data-edit]", cont).forEach(function (b) { b.onclick = function () { formCategoria(b.getAttribute("data-edit")); }; });
      $$("[data-toggle]", cont).forEach(function (b) {
        b.onclick = async function () {
          var id = b.getAttribute("data-id"), campo = b.getAttribute("data-toggle");
          var c = categoriasCache.find(function (x) { return x.id === id; });
          if (!c) return;
          var nuevo = !(c[campo] !== false);
          try {
            var d = {}; d[campo] = nuevo;
            await supa("PATCH", "/rest/v1/Categoria?id=eq." + id, d);
            toast("Categoría actualizada"); renderCategorias();
          } catch (e) { toast(e.message, false); }
        };
      });
      $$("[data-mover]", cont).forEach(function (b) {
        b.onclick = async function () {
          var id = b.getAttribute("data-mover"), dir = +b.getAttribute("data-dir");
          var idx = categoriasCache.findIndex(function (x) { return x.id === id; });
          var j = idx + dir;
          if (j < 0 || j >= categoriasCache.length) return;
          var tmp = categoriasCache[idx].orden; categoriasCache[idx].orden = categoriasCache[j].orden; categoriasCache[j].orden = tmp;
          try {
            await supa("PATCH", "/rest/v1/Categoria?id=eq." + categoriasCache[idx].id, { orden: categoriasCache[idx].orden });
            await supa("PATCH", "/rest/v1/Categoria?id=eq." + categoriasCache[j].id, { orden: categoriasCache[j].orden });
            renderCategorias();
          } catch (e) { toast(e.message, false); }
        };
      });
      $$("[data-del]", cont).forEach(function (b) {
        b.onclick = async function () {
          if (!confirm("¿Eliminar esta categoría?")) return;
          try { await supa("DELETE", "/rest/v1/Categoria?id=eq." + b.getAttribute("data-del")); toast("Categoría eliminada"); renderCategorias(); }
          catch (e) { toast(e.message, false); }
        };
      });
    } catch (e) { cont.innerHTML = errCard(e); }
  }
  function formCategoria(id) {
    var c = id ? categoriasCache.find(function (x) { return x.id === id; }) : null;
    var body =
      '<form id="f-cat">' +
      '<div class="row"><div class="field"><label>Nombre *</label>' + input("nombre", c ? c.nombre : "") + "</div>" +
      '<div class="field"><label>Slug</label>' + input("slug", c ? c.slug : "") + "</div></div>" +
      '<div class="row">' +
        '<div class="field"><label>Grupo</label>' + select("grupo", [{ v: "temporada", l: "Temporada" }, { v: "producto", l: "Producto" }], c ? c.grupo : "producto") + "</div>" +
        '<div class="field"><label>Emoji</label>' + input("emoji", c ? c.emoji : "🎁") + "</div>" +
      "</div>" +
      '<div class="row">' +
        fld("Época <span class=hint>(ej. Nov · Dic)</span>", input("epoca", c ? c.epoca : "")) +
        fld("Orden", input("orden", c ? c.orden : 0, "number")) +
      "</div>" +
      fld("Descripción", area("descripcion", c ? c.descripcion : "", 2)) +
      fld("Palabras clave (imágenes)", input("keywords", c ? c.keywords : "")) +
      check("enNav", c ? c.enNav !== false : true, "Mostrar en la barra de navegación") +
      check("enSidebar", c ? c.enSidebar !== false : true, "Mostrar en la barra lateral") +
      check("activo", c ? c.activo !== false : true, "Activa") +
      '<div class="modal__ft"><button type="button" class="btn btn--ghost" data-cerrar>Cancelar</button><button class="btn btn--rojo" type="submit">Guardar</button></div>' +
      "</form>";
    modal(c ? "Editar categoría" : "Nueva categoría", body);
    $("#f-cat").addEventListener("submit", async function (e) {
      e.preventDefault();
      var f = new FormData(e.target);
      var datos = {
        nombre: f.get("nombre"), slug: f.get("slug") || slugify(f.get("nombre")),
        descripcion: f.get("descripcion") || null, grupo: f.get("grupo"), emoji: f.get("emoji") || "🎁",
        epoca: f.get("epoca") || null, orden: Number(f.get("orden")) || 0,
        keywords: f.get("keywords") || null, enNav: !!f.get("enNav"), enSidebar: !!f.get("enSidebar"), activo: !!f.get("activo"),
      };
      if (!datos.nombre) { toast("El nombre es obligatorio", false); return; }
      try {
        if (c) await supa("PATCH", "/rest/v1/Categoria?id=eq." + c.id, datos);
        else await supa("POST", "/rest/v1/Categoria", datos);
        cerrarModal(); toast("Categoría guardada"); renderCategorias();
      } catch (err) { toast(err.message, false); }
    });
  }

  /* ============================== SUBCATEGORÍAS ============================== */
  var subcategoriasCache = [];
  async function renderSubcategorias() {
    var cont = $("#contenido");
    try {
      subcategoriasCache = await supa("GET", "/rest/v1/Subcategoria?select=*&order=orden.asc");
      cont.innerHTML =
        '<div class="card"><div class="toolbar"><button class="btn" id="btn-nueva-sub"><i class="bi bi-plus-lg"></i> Nueva subcategoría</button></div>' +
        '<table><thead><tr><th>Nombre</th><th>Slug</th><th>Orden</th><th></th></tr></thead><tbody>' +
        subcategoriasCache.map(function (s) {
          return "<tr><td><b>" + esc(s.nombre) + "</b></td><td>" + esc(s.slug) + "</td><td>" + s.orden + "</td>" +
            '<td class="actions"><button class="btn btn--ghost btn--sm" data-edit="' + s.id + '"><i class="bi bi-pencil"></i></button>' +
            '<button class="btn btn--ghost btn--sm" data-del="' + s.id + '" style="color:var(--rojo)"><i class="bi bi-trash3"></i></button></td></tr>';
        }).join("") + "</tbody></table></div>";
      $("#btn-nueva-sub").onclick = function () { formSubcategoria(null); };
      $$("[data-edit]", cont).forEach(function (b) { b.onclick = function () { formSubcategoria(b.getAttribute("data-edit")); }; });
      $$("[data-del]", cont).forEach(function (b) {
        b.onclick = async function () {
          if (!confirm("¿Eliminar esta subcategoría?")) return;
          try { await supa("DELETE", "/rest/v1/Subcategoria?id=eq." + b.getAttribute("data-del")); toast("Subcategoría eliminada"); renderSubcategorias(); }
          catch (e) { toast(e.message, false); }
        };
      });
    } catch (e) { cont.innerHTML = errCard(e); }
  }
  async function formSubcategoria(id) {
    var cats = await supa("GET", "/rest/v1/Categoria?select=id,nombre&order=nombre.asc").catch(function () { return []; });
    var s = id ? subcategoriasCache.find(function (x) { return x.id === id; }) : null;
    var actuales = [];
    if (s) {
      actuales = (await supa("GET", "/rest/v1/_CategoriaToSubcategoria?select=A&B=eq." + s.id).catch(function () { return []; }))
        .map(function (r) { return r.A; });
    }
    var body =
      '<form id="f-sub">' +
      '<div class="row"><div class="field"><label>Nombre *</label>' + input("nombre", s ? s.nombre : "") + "</div>" +
      '<div class="field"><label>Slug</label>' + input("slug", s ? s.slug : "") + "</div></div>" +
      '<div class="row">' +
        fld("Icono Bootstrap <span class=hint>(ej. bi-star)</span>", input("icono", s ? s.icono : "bi-tag")) +
        fld("Orden", input("orden", s ? s.orden : 0, "number")) +
      "</div>" +
      fld("Categorías donde aparece", '<div class="chips">' + cats.map(function (c) {
        return '<label><input type="checkbox" name="cat" value="' + c.id + '"' + (actuales.indexOf(c.id) > -1 ? " checked" : "") + "> " + esc(c.nombre) + "</label>";
      }).join("") + "</div>") +
      check("activo", s ? s.activo !== false : true, "Activa") +
      '<div class="modal__ft"><button type="button" class="btn btn--ghost" data-cerrar>Cancelar</button><button class="btn btn--rojo" type="submit">Guardar</button></div>' +
      "</form>";
    modal(s ? "Editar subcategoría" : "Nueva subcategoría", body);
    $("#f-sub").addEventListener("submit", async function (e) {
      e.preventDefault();
      var f = new FormData(e.target);
      var datos = { nombre: f.get("nombre"), slug: f.get("slug") || slugify(f.get("nombre")), icono: f.get("icono") || "bi-tag", orden: Number(f.get("orden")) || 0, activo: !!f.get("activo") };
      if (!datos.nombre) { toast("El nombre es obligatorio", false); return; }
      try {
        var sid;
        if (s) { await supa("PATCH", "/rest/v1/Subcategoria?id=eq." + s.id, datos); sid = s.id; }
        else { var creado = await supa("POST", "/rest/v1/Subcategoria", datos); sid = creado[0].id; }
        await supa("DELETE", "/rest/v1/_CategoriaToSubcategoria?B=eq." + sid).catch(function () {});
        var catsSel = $$('input[name="cat"]:checked').map(function (c) { return c.value; });
        for (var i = 0; i < catsSel.length; i++) await supa("POST", "/rest/v1/_CategoriaToSubcategoria", { A: catsSel[i], B: sid });
        cerrarModal(); toast("Subcategoría guardada"); renderSubcategorias();
      } catch (err) { toast(err.message, false); }
    });
  }

  /* ============================== BANNERS ============================== */
  var bannersCache = [];
  async function renderBanners() {
    var cont = $("#contenido");
    try {
      bannersCache = await supa("GET", "/rest/v1/Banner?select=*&order=orden.asc");
      cont.innerHTML =
        '<div class="card"><div class="toolbar"><button class="btn" id="btn-nuevo-ban"><i class="bi bi-plus-lg"></i> Nuevo banner</button></div>' +
        '<table><thead><tr><th>Título</th><th>Tema</th><th>Orden</th><th>Estado</th><th></th></tr></thead><tbody>' +
        bannersCache.map(function (b) {
          return "<tr><td><b>" + esc(b.titulo) + '</b><br><small class="muted">' + esc(b.boton || "") + "</small></td>" +
            "<td>" + (b.tema === "azul" ? "🔵 Azul" : "🔴 Rojo") + "</td><td>" + b.orden + "</td>" +
            "<td>" + (b.activo ? '<span class="badge badge--on">Activo</span>' : '<span class="badge badge--off">Oculto</span>') + "</td>" +
            '<td class="actions"><button class="btn btn--ghost btn--sm" data-edit="' + b.id + '"><i class="bi bi-pencil"></i></button>' +
            '<button class="btn btn--ghost btn--sm" data-del="' + b.id + '" style="color:var(--rojo)"><i class="bi bi-trash3"></i></button></td></tr>';
        }).join("") + "</tbody></table></div>";
      $("#btn-nuevo-ban").onclick = function () { formBanner(null); };
      $$("[data-edit]", cont).forEach(function (b) { b.onclick = function () { formBanner(b.getAttribute("data-edit")); }; });
      $$("[data-del]", cont).forEach(function (b) {
        b.onclick = async function () {
          if (!confirm("¿Eliminar este banner?")) return;
          try { await supa("DELETE", "/rest/v1/Banner?id=eq." + b.getAttribute("data-del")); toast("Banner eliminado"); renderBanners(); }
          catch (e) { toast(e.message, false); }
        };
      });
    } catch (e) { cont.innerHTML = errCard(e); }
  }
  function formBanner(id) {
    var b = id ? bannersCache.find(function (x) { return x.id === id; }) : null;
    var body =
      '<form id="f-ban">' +
      fld("Título *", input("titulo", b ? b.titulo : "")) +
      fld("Subtítulo", area("subtitulo", b ? b.subtitulo : "", 2)) +
      '<div class="row">' +
        fld("Texto del botón", input("boton", b ? b.boton : "Ver más")) +
        fld("Enlace <span class=hint>(ej. categoria.html?cat=navidad)</span>", input("enlace", b ? b.enlace : "")) +
      "</div>" +
      '<div class="row">' +
        fld("Etiqueta <span class=hint>(ej. 🎄 Navidad)</span>", input("etiqueta", b ? b.etiqueta : "")) +
        fld("Palabras clave (imagen)", input("keywords", b ? b.keywords : "")) +
      "</div>" +
      '<div class="row">' +
        '<div class="field"><label>Tema</label>' + select("tema", [{ v: "rojo", l: "Rojo" }, { v: "azul", l: "Azul" }], b ? b.tema : "rojo") + "</div>" +
        fld("Orden", input("orden", b ? b.orden : 0, "number")) +
      "</div>" +
      check("activo", b ? b.activo !== false : true, "Activo") +
      '<div class="modal__ft"><button type="button" class="btn btn--ghost" data-cerrar>Cancelar</button><button class="btn btn--rojo" type="submit">Guardar</button></div>' +
      "</form>";
    modal(b ? "Editar banner" : "Nuevo banner", body);
    $("#f-ban").addEventListener("submit", async function (e) {
      e.preventDefault();
      var f = new FormData(e.target);
      var datos = {
        titulo: f.get("titulo"), subtitulo: f.get("subtitulo") || null, boton: f.get("boton") || "Ver más",
        enlace: f.get("enlace") || null, etiqueta: f.get("etiqueta") || null, keywords: f.get("keywords") || null,
        tema: f.get("tema"), orden: Number(f.get("orden")) || 0, activo: !!f.get("activo"),
      };
      if (!datos.titulo) { toast("El título es obligatorio", false); return; }
      try {
        if (b) await supa("PATCH", "/rest/v1/Banner?id=eq." + b.id, datos);
        else await supa("POST", "/rest/v1/Banner", datos);
        cerrarModal(); toast("Banner guardado"); renderBanners();
      } catch (err) { toast(err.message, false); }
    });
  }

  /* ============================== BLOG ============================== */
  var blogCache = [];
  async function renderBlog() {
    var cont = $("#contenido");
    try {
      blogCache = await supa("GET", "/rest/v1/Articulo?select=*&order=creadoEn.desc");
      cont.innerHTML =
        '<div class="card"><div class="toolbar"><button class="btn" id="btn-nuevo-blog"><i class="bi bi-plus-lg"></i> Nuevo artículo</button></div>' +
        '<table><thead><tr><th>Título</th><th>Categoría</th><th>Publicado</th><th></th></tr></thead><tbody>' +
        blogCache.map(function (a) {
          return "<tr><td><b>" + esc(a.titulo) + '</b><br><small class="muted">' + esc(a.slug) + "</small></td>" +
            "<td>" + esc(a.categoria || "—") + "</td>" +
            "<td>" + (a.publicado ? '<span class="badge badge--on">Sí</span>' : '<span class="badge badge--off">Borrador</span>') + "</td>" +
            '<td class="actions"><button class="btn btn--ghost btn--sm" data-edit="' + a.id + '"><i class="bi bi-pencil"></i></button>' +
            '<button class="btn btn--ghost btn--sm" data-del="' + a.id + '" style="color:var(--rojo)"><i class="bi bi-trash3"></i></button></td></tr>';
        }).join("") + "</tbody></table></div>";
      $("#btn-nuevo-blog").onclick = function () { formBlog(null); };
      $$("[data-edit]", cont).forEach(function (b) { b.onclick = function () { formBlog(b.getAttribute("data-edit")); }; });
      $$("[data-del]", cont).forEach(function (b) {
        b.onclick = async function () {
          if (!confirm("¿Eliminar este artículo?")) return;
          try { await supa("DELETE", "/rest/v1/Articulo?id=eq." + b.getAttribute("data-del")); toast("Artículo eliminado"); renderBlog(); }
          catch (e) { toast(e.message, false); }
        };
      });
    } catch (e) { cont.innerHTML = errCard(e); }
  }
  function formBlog(id) {
    var a = id ? blogCache.find(function (x) { return x.id === id; }) : null;
    var body =
      '<form id="f-blog">' +
      '<div class="row"><div class="field"><label>Título *</label>' + input("titulo", a ? a.titulo : "") + "</div>" +
      '<div class="field"><label>Slug</label>' + input("slug", a ? a.slug : "") + "</div></div>" +
      fld("Resumen", area("resumen", a ? a.resumen : "", 2)) +
      fld("Contenido <span class=hint>(agrega bloques de texto e imagen)</span>", '<div id="blog-bloques"></div>') +
      '<div class="row row--3">' +
        fld("Autor", input("autor", a ? a.autor : "Taller Creativo EK")) +
        fld("Categoría", input("categoria", a ? a.categoria : "")) +
        fld("Minutos", input("minutos", a ? a.minutos : 5, "number")) +
      "</div>" +
      '<div class="row">' +
        fld("Fecha <span class=hint>(ej. 22 de noviembre de 2025)</span>", input("fecha", a ? a.fecha : "")) +
        fld("Palabras clave", input("keywords", a ? a.keywords : "")) +
      "</div>" +
      check("publicado", a ? a.publicado : true, "Publicado") +
      '<div class="modal__ft"><button type="button" class="btn btn--ghost" data-cerrar>Cancelar</button><button class="btn btn--rojo" type="submit">Guardar</button></div>' +
      "</form>";
    modal(a ? "Editar artículo" : "Nuevo artículo", body);
    // Constructor por bloques
    var bloquesIniciales = a && a.bloques && a.bloques.length
      ? a.bloques
      : [{ tipo: "texto", texto: a && a.contenido ? a.contenido.replace(/<[^>]+>/g, "").trim() : "" }];
    var editorBlog = initBlogBloques(bloquesIniciales);
    $("#f-blog").addEventListener("submit", async function (e) {
      e.preventDefault();
      var f = new FormData(e.target);
      var datos = {
        titulo: f.get("titulo"), slug: f.get("slug") || slugify(f.get("titulo")), resumen: f.get("resumen") || null,
        contenido: editorBlog ? editorBlog.getHTML() : "", bloques: editorBlog ? editorBlog.getBloques() : [],
        autor: f.get("autor") || null, categoria: f.get("categoria") || null,
        minutos: Number(f.get("minutos")) || 5, fecha: f.get("fecha") || null, keywords: f.get("keywords") || null,
        publicado: !!f.get("publicado"), actualizadoEn: new Date().toISOString(),
      };
      if (!datos.titulo) { toast("El título es obligatorio", false); return; }
      try {
        if (a) await supa("PATCH", "/rest/v1/Articulo?id=eq." + a.id, datos);
        else await supa("POST", "/rest/v1/Articulo", datos);
        cerrarModal(); toast("Artículo guardado"); renderBlog();
      } catch (err) { toast(err.message, false); }
    });
  }

  /* ============================== RESEÑAS ============================== */
  var resenasCache = [];
  async function renderResenas() {
    var cont = $("#contenido");
    try {
      resenasCache = await supa("GET", "/rest/v1/Resena?select=*,Producto(nombre)&order=creadoEn.desc");
      pintarResenas({ aprobada: "TODAS", estrellas: "TODAS", producto: "TODOS", q: "", desde: "", hasta: "" });
    } catch (e) { cont.innerHTML = errCard(e); }
  }
  function pintarResenas(f) {
    var cont = $("#contenido");
    var productos = [];
    resenasCache.forEach(function (r) {
      var nombre = (r.Producto && r.Producto.nombre) || "—";
      if (productos.indexOf(nombre) === -1) productos.push(nombre);
    });
    var ql = (f.q || "").toLowerCase();
    var lista = resenasCache.filter(function (r) {
      if (f.aprobada === "APROBADAS" && !r.aprobada) return false;
      if (f.aprobada === "PENDIENTES" && r.aprobada) return false;
      if (f.estrellas !== "TODAS" && String(r.estrellas) !== f.estrellas) return false;
      if (f.producto !== "TODOS" && ((r.Producto && r.Producto.nombre) || "—") !== f.producto) return false;
      if (ql && (r.autor + " " + (r.ciudad || "") + " " + (r.comentario || "")).toLowerCase().indexOf(ql) === -1) return false;
      var t = r.creadoEn ? new Date(r.creadoEn).getTime() : 0;
      if (f.desde && t < new Date(f.desde).getTime()) return false;
      if (f.hasta && t > new Date(f.hasta + "T23:59:59").getTime()) return false;
      return true;
    });
    cont.innerHTML =
      '<div class="card"><div class="toolbar">' +
        '<input type="search" id="q-resenas" placeholder="Buscar autor, ciudad o texto…" value="' + esc(f.q) + '">' +
        '<select id="f-prod-resenas" style="width:auto"><option value="TODOS">Todos los productos</option>' +
          productos.map(function (p) { return '<option value="' + esc(p) + '">' + esc(p) + "</option>"; }).join("") +
        "</select>" +
        '<select id="f-estrellas" style="width:auto"><option value="TODAS">Todas las estrellas</option>' +
          [5, 4, 3, 2, 1].map(function (n) { return '<option value="' + n + '">' + "★".repeat(n) + "☆".repeat(5 - n) + "</option>"; }).join("") +
        "</select>" +
        '<select id="f-aprobadas" style="width:auto"><option value="TODAS">Todas</option><option value="APROBADAS">Aprobadas</option><option value="PENDIENTES">Pendientes</option></select>' +
        '<label class="muted" style="margin:0"><i class="bi bi-calendar3"></i> Desde</label><input type="date" id="f-desde-resenas" value="' + esc(f.desde) + '" style="width:auto">' +
        '<label class="muted" style="margin:0">Hasta</label><input type="date" id="f-hasta-resenas" value="' + esc(f.hasta) + '" style="width:auto">' +
      "</div>" +
      '<table><thead><tr><th>Autor</th><th>Producto</th><th>★</th><th>Fecha</th><th>Estado</th><th></th></tr></thead><tbody>' +
      lista.map(function (r) {
        return "<tr><td><b>" + esc(r.autor) + "</b><br><small class='muted'>" + esc(r.ciudad || "") + "</small></td>" +
          "<td>" + esc((r.Producto && r.Producto.nombre) || "—") + "</td>" +
          "<td>" + "★".repeat(r.estrellas) + "☆".repeat(5 - r.estrellas) + "</td>" +
          "<td>" + fecha(r.creadoEn) + "</td>" +
          "<td>" + (r.aprobada ? '<span class="badge badge--on">Aprobada</span>' : '<span class="badge badge--pend">Pendiente</span>') + "</td>" +
          '<td class="actions"><button class="btn btn--ghost btn--sm" data-aprobar="' + r.id + '" data-val="' + (r.aprobada ? "0" : "1") + '">' + (r.aprobada ? "Ocultar" : "Aprobar") + "</button>" +
          '<button class="btn btn--ghost btn--sm" data-del="' + r.id + '" style="color:var(--rojo)"><i class="bi bi-trash3"></i></button></td></tr>';
      }).join("") + (lista.length ? "" : '<tr><td colspan="6" class="empty">Sin reseñas en este filtro</td></tr>') + "</tbody></table></div>";
    var qEl = $("#q-resenas"), prodEl = $("#f-prod-resenas"), estEl = $("#f-estrellas"), aprEl = $("#f-aprobadas"),
        dEl = $("#f-desde-resenas"), hEl = $("#f-hasta-resenas");
    function refrescar() {
      pintarResenas({
        aprobada: aprEl.value, estrellas: estEl.value, producto: prodEl.value,
        q: qEl.value, desde: dEl.value, hasta: hEl.value,
      });
    }
    if (qEl) qEl.addEventListener("input", refrescar);
    if (prodEl) { prodEl.value = f.producto; prodEl.onchange = refrescar; }
    if (estEl) { estEl.value = f.estrellas; estEl.onchange = refrescar; }
    if (aprEl) { aprEl.value = f.aprobada; aprEl.onchange = refrescar; }
    if (dEl) { dEl.value = f.desde; dEl.onchange = refrescar; }
    if (hEl) { hEl.value = f.hasta; hEl.onchange = refrescar; }
    $$("[data-aprobar]", cont).forEach(function (b) {
      b.onclick = async function () {
        try {
          await supa("PATCH", "/rest/v1/Resena?id=eq." + b.getAttribute("data-aprobar"), { aprobada: b.getAttribute("data-val") === "1" });
          toast("Reseña actualizada"); renderResenas();
        } catch (e) { toast(e.message, false); }
      };
    });
    $$("[data-del]", cont).forEach(function (b) {
      b.onclick = async function () {
        if (!confirm("¿Eliminar esta reseña?")) return;
        try { await supa("DELETE", "/rest/v1/Resena?id=eq." + b.getAttribute("data-del")); toast("Reseña eliminada"); renderResenas(); }
        catch (e) { toast(e.message, false); }
      };
    });
  }

  /* ============================== PEDIDOS ============================== */
  var pedidosCache = [];
  var pedidosDetalles = [];
  var pedidosProductos = {};   // productoId → { nombre, personalizable }
  var pedidosUsuarios = {};    // usuarioId → { nombre, telefono }
  var ESTADOS = ["PENDIENTE", "PAGADO", "ENVIADO", "ENTREGADO", "CANCELADO"];

  async function renderPedidos() {
    var cont = $("#contenido");
    cont.innerHTML = '<div class="card"><p class="muted">Cargando…</p></div>';
    try {
      var [peds, dets, prods, users] = await Promise.all([
        supa("GET", "/rest/v1/Pedido?select=*&order=creadoEn.desc"),
        supa("GET", "/rest/v1/DetallePedido?select=pedidoId,productoId,nombreProducto,cantidad,talla"),
        supa("GET", "/rest/v1/Producto?select=id,nombre,personalizable"),
        supa("GET", "/rest/v1/Usuario?select=id,nombre,telefono"),
      ]);
      pedidosCache = peds;
      pedidosDetalles = dets;
      pedidosProductos = {};
      prods.forEach(function (p) { pedidosProductos[p.id] = p; });
      pedidosUsuarios = {};
      users.forEach(function (u) { pedidosUsuarios[u.id] = u; });
      pintarPedidos({ estado: "TODOS", q: "", desde: "", hasta: "", personalizado: "TODOS" });
    } catch (e) { cont.innerHTML = errCard(e); }
  }
  function datosPedido(p) {
    var dets = pedidosDetalles.filter(function (d) { return d.pedidoId === p.id; });
    var personalizado = dets.some(function (d) {
      var pr = pedidosProductos[d.productoId];
      return pr && pr.personalizable;
    });
    var nombres = dets.map(function (d) {
      return d.nombreProducto || (pedidosProductos[d.productoId] && pedidosProductos[d.productoId].nombre) || "Artículo";
    });
    var u = pedidosUsuarios[p.usuarioId];
    return { dets: dets, personalizado: personalizado, productosTxt: nombres.join(", "), telefono: (u && u.telefono) || "" };
  }
  function pintarPedidos(f) {
    var cont = $("#contenido");
    var ql = (f.q || "").toLowerCase();
    var lista = pedidosCache.filter(function (p) {
      if (f.estado !== "TODOS" && p.estado !== f.estado) return false;
      var d = datosPedido(p);
      if (ql && (p.cliente + " " + d.telefono + " " + d.productosTxt).toLowerCase().indexOf(ql) === -1) return false;
      if (f.desde) { if (new Date(p.creadoEn).getTime() < new Date(f.desde).getTime()) return false; }
      if (f.hasta) { if (new Date(p.creadoEn).getTime() > new Date(f.hasta + "T23:59:59").getTime()) return false; }
      if (f.personalizado === "SI" && !d.personalizado) return false;
      if (f.personalizado === "NO" && d.personalizado) return false;
      return true;
    });
    cont.innerHTML =
      '<div class="card"><div class="toolbar">' +
        '<input type="search" id="q-pedidos" placeholder="Buscar cliente, teléfono o producto…" value="' + esc(f.q) + '">' +
        '<select id="filtro-pedidos" style="width:auto"><option value="TODOS">Todos los estados</option>' +
          ESTADOS.map(function (e) { return '<option value="' + e + '">' + e + "</option>"; }).join("") +
        "</select>" +
        '<label class="muted" style="margin:0"><i class="bi bi-calendar3"></i> Desde</label><input type="date" id="f-desde-pedidos" value="' + esc(f.desde) + '" style="width:auto">' +
        '<label class="muted" style="margin:0">Hasta</label><input type="date" id="f-hasta-pedidos" value="' + esc(f.hasta) + '" style="width:auto">' +
        '<select id="f-perso-pedidos" style="width:auto"><option value="TODOS">Todos</option><option value="SI">Con personalizado</option><option value="NO">Sin personalizado</option></select>' +
      "</div>" +
      '<table><thead><tr><th>Pedido</th><th>Cliente</th><th>Teléfono</th><th>Productos</th><th>Total</th><th>Estado</th><th></th></tr></thead><tbody>' +
      lista.map(function (p) {
        var d = datosPedido(p);
        var prodTxt = d.productosTxt || "—";
        if (prodTxt.length > 70) prodTxt = prodTxt.slice(0, 70) + "…";
        var cls = p.estado === "ENTREGADO" ? "on" : (p.estado === "CANCELADO" ? "off" : (p.estado === "ENVIADO" ? "env" : "pend"));
        return "<tr><td><small class='muted'>#" + esc(String(p.id).slice(0, 8)) + "</small><br><b>" + fecha(p.creadoEn) + "</b></td>" +
          "<td>" + esc(p.cliente || "—") + "</td>" +
          "<td>" + esc(d.telefono || "—") + "</td>" +
          "<td><small>" + esc(prodTxt) + "</small>" + (d.personalizado ? " <span class='tag'>✨ Personalizado</span>" : "") + "</td>" +
          "<td>" + money(p.total) + "</td>" +
          '<td><span class="badge badge--' + cls + '">' + esc(p.estado) + "</span></td>" +
          '<td class="actions"><button class="btn btn--ghost btn--sm" data-ver="' + p.id + '"><i class="bi bi-eye"></i></button></td></tr>';
      }).join("") + (lista.length ? "" : '<tr><td colspan="7" class="empty">Sin pedidos en este filtro</td></tr>') + "</tbody></table></div>";
    var sel = $("#filtro-pedidos"), busq = $("#q-pedidos"), dEl = $("#f-desde-pedidos"), hEl = $("#f-hasta-pedidos"), pEl = $("#f-perso-pedidos");
    function refrescar() {
      pintarPedidos({ estado: sel.value, q: busq.value, desde: dEl.value, hasta: hEl.value, personalizado: pEl.value });
    }
    if (sel) { sel.value = f.estado; sel.onchange = refrescar; }
    if (busq) busq.addEventListener("input", refrescar);
    if (dEl) { dEl.value = f.desde; dEl.onchange = refrescar; }
    if (hEl) { hEl.value = f.hasta; hEl.onchange = refrescar; }
    if (pEl) { pEl.value = f.personalizado; pEl.onchange = refrescar; }
    $$("[data-ver]", cont).forEach(function (b) { b.onclick = function () { verPedido(b.getAttribute("data-ver")); }; });
  }
  async function verPedido(id) {
    var p = pedidosCache.find(function (x) { return x.id === id; });
    var items = await supa("GET", "/rest/v1/DetallePedido?select=*&pedidoId=eq." + id).catch(function () { return []; });
    var d = datosPedido(p);
    var body =
      '<p class="muted"><b>Pedido #' + esc(String(id).slice(0, 8)) + "</b> · " + fecha(p.creadoEn) + "</p>" +
      '<div class="row">' +
        fld("Cliente", input("cliente", p.cliente || "")) +
        '<div class="field"><label>Estado</label>' + select("estado", ESTADOS.map(function (e) { return { v: e, l: e }; }), p.estado) + "</div>" +
      "</div>" +
      '<div class="row">' +
        fld("Teléfono <span class=hint>(de la cuenta del cliente)</span>", '<input value="' + esc(d.telefono || "") + '" disabled>') +
        fld("Método de pago", input("metodo", p.metodoPago || "")) +
      "</div>" +
      fld("Dirección de envío", area("direccion", p.direccionEnvio || "", 2)) +
      (d.personalizado ? '<p style="margin:0 0 10px"><span class="tag">✨ Incluye producto personalizado</span></p>' : "") +
      "<h3>Artículos</h3>" +
      (items.length
        ? '<table><thead><tr><th>Artículo</th><th>Cant.</th><th>Precio</th></tr></thead><tbody>' +
          items.map(function (i) { return "<tr><td>" + esc(i.nombreProducto || "—") + (i.talla ? " <span class='tag'>" + esc(i.talla) + "</span>" : "") + "</td><td>" + i.cantidad + "</td><td>" + money(i.precioUnitario) + "</td></tr>"; }).join("") +
          "</tbody></table>"
        : '<div class="empty">Sin artículos registrados</div>') +
      "<p style='margin-top:14px'><b>Subtotal:</b> " + money(p.subtotal) + " · <b>Envío:</b> " + money(p.envio) + " · <b>Total:</b> <span style='color:var(--rojo)'>" + money(p.total) + "</span></p>" +
      '<div class="modal__ft"><button type="button" class="btn btn--ghost" data-cerrar>Cerrar</button><button class="btn btn--rojo" id="btn-guardar-pedido">Guardar</button></div>';
    modal("Detalle del pedido", body);
    $("#btn-guardar-pedido").onclick = async function () {
      try {
        await supa("PATCH", "/rest/v1/Pedido?id=eq." + id, {
          cliente: $("#modal input[name=cliente]").value || null,
          estado: $("#modal select[name=estado]").value,
          direccionEnvio: $("#modal textarea[name=direccion]").value || null,
          metodoPago: $("#modal input[name=metodo]").value || null,
        });
        cerrarModal(); toast("Pedido actualizado"); renderPedidos();
      } catch (e) { toast(e.message, false); }
    };
  }

  /* ============================== CLIENTES (USUARIOS) ============================== */
  var clientesCache = [];
  var clientesPedidos = [];
  var ROLES_CLIENTES = ["DISTRIBUIDOR", "CLIENTE"];
  async function renderClientes() {
    var cont = $("#contenido");
    cont.innerHTML = '<div class="card"><p class="muted">Cargando…</p></div>';
    try {
      var [usuarios, pedidos] = await Promise.all([
        supa("GET", "/rest/v1/Usuario?select=id,nombre,email,rol,telefono,activo&order=creadoEn.desc"),
        supa("GET", "/rest/v1/Pedido?select=id,usuarioId,estado,total,creadoEn&order=creadoEn.desc"),
      ]);
      // Las cuentas de administrador se gestionan en Configuración, no aquí.
      clientesCache = usuarios.filter(function (u) { return u.rol !== "ADMINISTRADOR"; });
      clientesPedidos = pedidos;
      pintarClientes({ rol: "TODOS", q: "", pedidos: "TODOS" });
    } catch (e) { cont.innerHTML = errCard(e); }
  }
  function resumenPedidosCliente(uid) {
    var pedidos = clientesPedidos.filter(function (p) { return p.usuarioId === uid; });
    return { pedidos: pedidos, total: pedidos.reduce(function (a, p) { return a + (p.total || 0); }, 0) };
  }
  function pintarClientes(f) {
    var cont = $("#contenido");
    var ql = (f.q || "").toLowerCase();
    var lista = clientesCache.filter(function (u) {
      if (f.rol !== "TODOS" && u.rol !== f.rol) return false;
      if (ql && (u.nombre + " " + u.email + " " + (u.telefono || "")).toLowerCase().indexOf(ql) === -1) return false;
      var n = resumenPedidosCliente(u.id).pedidos.length;
      if (f.pedidos === "CON" && n === 0) return false;
      if (f.pedidos === "SIN" && n > 0) return false;
      return true;
    });
    cont.innerHTML =
      '<div class="card"><div class="toolbar">' +
        '<button class="btn" id="btn-nuevo-cli"><i class="bi bi-plus-lg"></i> Nuevo cliente</button>' +
        '<input type="search" id="q-clientes" placeholder="Buscar nombre, correo o teléfono…" value="' + esc(f.q) + '">' +
        '<select id="filtro-clientes" style="width:auto"><option value="TODOS">Todos los roles</option>' +
          '<option value="DISTRIBUIDOR">Distribuidores</option><option value="CLIENTE">Clientes</option>' +
        "</select>" +
        '<select id="filtro-pedidos-cli" style="width:auto"><option value="TODOS">Con o sin pedidos</option><option value="CON">Con pedidos</option><option value="SIN">Sin pedidos</option></select>' +
      "</div>" +
      '<table><thead><tr><th>Nombre</th><th>Teléfono</th><th>Rol</th><th>Pedidos</th><th>Total gastado</th><th>Estado</th><th></th></tr></thead><tbody>' +
      lista.map(function (u) {
        var res = resumenPedidosCliente(u.id);
        return "<tr><td><b>" + esc(u.nombre) + "</b><br><small class='muted'>" + esc(u.email) + "</small></td>" +
          "<td>" + esc(u.telefono || "—") + "</td>" +
          "<td><span class='tag'>" + esc(u.rol) + "</span></td>" +
          '<td><button class="btn btn--ghost btn--sm" data-historial="' + u.id + '" title="Ver historial de pedidos">' + res.pedidos.length + " pedidos</button></td>" +
          "<td>" + money(res.total) + "</td>" +
          "<td>" + (u.activo ? '<span class="badge badge--on">Activo</span>' : '<span class="badge badge--off">Inactivo</span>') + "</td>" +
          '<td class="actions"><button class="btn btn--ghost btn--sm" data-edit="' + u.id + '"><i class="bi bi-pencil"></i></button>' +
          '<button class="btn btn--ghost btn--sm" data-del="' + u.id + '" style="color:var(--rojo)"><i class="bi bi-trash3"></i></button></td></tr>';
      }).join("") + (lista.length ? "" : '<tr><td colspan="7" class="empty">Sin resultados</td></tr>') + "</tbody></table></div>";
    $("#btn-nuevo-cli").onclick = function () { formCliente(null); };
    var sel = $("#filtro-clientes"), busq = $("#q-clientes"), pSel = $("#filtro-pedidos-cli");
    function refrescar() { pintarClientes({ rol: sel.value, q: busq.value, pedidos: pSel.value }); }
    if (sel) { sel.value = f.rol; sel.onchange = refrescar; }
    if (busq) busq.addEventListener("input", refrescar);
    if (pSel) { pSel.value = f.pedidos; pSel.onchange = refrescar; }
    $$("[data-historial]", cont).forEach(function (b) { b.onclick = function () { verHistorialCliente(b.getAttribute("data-historial")); }; });
    $$("[data-edit]", cont).forEach(function (b) { b.onclick = function () { formCliente(b.getAttribute("data-edit")); }; });
    $$("[data-del]", cont).forEach(function (b) {
      b.onclick = async function () {
        if (!confirm("¿Eliminar este usuario?")) return;
        try { await supa("DELETE", "/rest/v1/Usuario?id=eq." + b.getAttribute("data-del")); toast("Usuario eliminado"); renderClientes(); }
        catch (e) { toast(e.message, false); }
      };
    });
  }
  function verHistorialCliente(uid) {
    var u = clientesCache.find(function (x) { return x.id === uid; });
    var res = resumenPedidosCliente(uid);
    var body =
      '<p class="muted">Historial de pedidos de <b>' + esc(u ? u.nombre : "") + "</b> (" + esc(u ? u.email : "") + ")</p>" +
      (res.pedidos.length
        ? '<table><thead><tr><th>Pedido</th><th>Fecha</th><th>Estado</th><th>Total</th><th></th></tr></thead><tbody>' +
          res.pedidos.map(function (p) {
            var cls = p.estado === "ENTREGADO" ? "on" : (p.estado === "CANCELADO" ? "off" : (p.estado === "ENVIADO" ? "env" : "pend"));
            return "<tr><td><small class='muted'>#" + esc(String(p.id).slice(0, 8)) + "</small></td><td>" + fecha(p.creadoEn) + "</td>" +
              '<td><span class="badge badge--' + cls + '">' + esc(p.estado) + "</span></td><td>" + money(p.total) + "</td>" +
              '<td><button class="btn btn--ghost btn--sm" data-ver-pedido="' + p.id + '"><i class="bi bi-eye"></i></button></td></tr>';
          }).join("") + "</tbody></table>"
        : '<div class="empty">Este cliente aún no tiene pedidos registrados.</div>') +
      '<div class="modal__ft"><button type="button" class="btn btn--ghost" data-cerrar>Cerrar</button></div>';
    modal("Historial de pedidos", body);
    $$("#modal [data-ver-pedido]").forEach(function (b) {
      b.onclick = function () { cerrarModal(); verPedido(b.getAttribute("data-ver-pedido")); };
    });
  }
  function formCliente(id) {
    var u = id ? clientesCache.find(function (x) { return x.id === id; }) : null;
    var body =
      '<form id="f-cli">' +
      fld("Nombre *", input("nombre", u ? u.nombre : "")) +
      '<div class="row"><div class="field"><label>Correo *</label>' + input("email", u ? u.email : "", "email") + "</div>" +
      '<div class="field"><label>Rol</label>' + select("rol", ROLES_CLIENTES.map(function (r) { return { v: r, l: r }; }), u ? u.rol : "CLIENTE") + "</div></div>" +
      fld("Teléfono", input("telefono", u ? u.telefono : "")) +
      fld("Contraseña <span class=hint>" + (u ? "Déjala vacía para no cambiarla" : "Requerida al crear") + "</span>", input("password", "", "password")) +
      check("activo", u ? u.activo !== false : true, "Activo") +
      '<div class="modal__ft"><button type="button" class="btn btn--ghost" data-cerrar>Cancelar</button><button class="btn btn--rojo" type="submit">Guardar</button></div>' +
      "</form>";
    modal(u ? "Editar cliente" : "Nuevo cliente", body);
    $("#f-cli").addEventListener("submit", async function (e) {
      e.preventDefault();
      var f = new FormData(e.target);
      try {
        await supa("POST", "/rpc/ek_upsert_usuario", {
          p_id: u ? u.id : null, p_nombre: f.get("nombre"), p_email: f.get("email"),
          p_password: f.get("password") || "", p_rol: f.get("rol"), p_telefono: f.get("telefono") || null,
          p_activo: !!f.get("activo"),
        });
        cerrarModal(); toast("Cliente guardado"); renderClientes();
      } catch (err) { toast(err.message, false); }
    });
  }

  /* ============================== CUPONES ============================== */
  var cuponesCache = [];
  async function renderCupones() {
    var cont = $("#contenido");
    try {
      cuponesCache = await supa("GET", "/rest/v1/Cupon?select=*&order=codigo.asc");
      cont.innerHTML =
        '<div class="card"><div class="toolbar"><button class="btn" id="btn-nuevo-cupon"><i class="bi bi-plus-lg"></i> Nuevo cupón</button></div>' +
        '<table><thead><tr><th>Código</th><th>Tipo</th><th>Valor</th><th>Mínimo</th><th>Estado</th><th></th></tr></thead><tbody>' +
        cuponesCache.map(function (c) {
          var tipoTxt = c.tipo === "pct" ? "Porcentaje" : (c.tipo === "monto" ? "Monto fijo" : "Envío gratis");
          return "<tr><td><b>" + esc(c.codigo) + "</b><br><small class='muted'>" + esc(c.texto || "") + "</small></td>" +
            "<td>" + tipoTxt + "</td>" +
            "<td>" + (c.tipo === "envio" ? "—" : (c.tipo === "pct" ? c.valor + "%" : money(c.valor))) + "</td>" +
            "<td>" + (c.minimo ? money(c.minimo) : "—") + "</td>" +
            "<td>" + (c.activo ? '<span class="badge badge--on">Activo</span>' : '<span class="badge badge--off">Inactivo</span>') + "</td>" +
            '<td class="actions"><button class="btn btn--ghost btn--sm" data-edit="' + c.id + '"><i class="bi bi-pencil"></i></button>' +
            '<button class="btn btn--ghost btn--sm" data-del="' + c.id + '" style="color:var(--rojo)"><i class="bi bi-trash3"></i></button></td></tr>';
        }).join("") + (cuponesCache.length ? "" : '<tr><td colspan="6" class="empty">Sin cupones</td></tr>') + "</tbody></table></div>";
      $("#btn-nuevo-cupon").onclick = function () { formCupon(null); };
      $$("[data-edit]", cont).forEach(function (b) { b.onclick = function () { formCupon(b.getAttribute("data-edit")); }; });
      $$("[data-del]", cont).forEach(function (b) {
        b.onclick = async function () {
          if (!confirm("¿Eliminar este cupón?")) return;
          try { await supa("DELETE", "/rest/v1/Cupon?id=eq." + b.getAttribute("data-del")); toast("Cupón eliminado"); renderCupones(); }
          catch (e) { toast(e.message, false); }
        };
      });
    } catch (e) { cont.innerHTML = errCard(e); }
  }
  function formCupon(id) {
    var c = id ? cuponesCache.find(function (x) { return x.id === id; }) : null;
    var body =
      '<form id="f-cupon">' +
      '<div class="row"><div class="field"><label>Código * <span class=hint>(sin espacios)</span></label>' + input("codigo", c ? c.codigo : "") + "</div>" +
      '<div class="field"><label>Tipo</label>' + select("tipo", [{ v: "pct", l: "Porcentaje (%)" }, { v: "monto", l: "Monto fijo ($)" }, { v: "envio", l: "Envío gratis" }], c ? c.tipo : "pct") + "</div></div>" +
      '<div class="row">' +
        fld("Valor <span class=hint>(% o $ según el tipo)</span>", input("valor", c ? c.valor : 0, "number")) +
        fld("Compra mínima <span class=hint>(0 = sin mínimo)</span>", input("minimo", c ? c.minimo : 0, "number")) +
      "</div>" +
      fld("Texto visible", input("texto", c ? c.texto : "")) +
      check("activo", c ? c.activo !== false : true, "Activo") +
      '<div class="modal__ft"><button type="button" class="btn btn--ghost" data-cerrar>Cancelar</button><button class="btn btn--rojo" type="submit">Guardar</button></div>' +
      "</form>";
    modal(c ? "Editar cupón" : "Nuevo cupón", body);
    $("#f-cupon").addEventListener("submit", async function (e) {
      e.preventDefault();
      var f = new FormData(e.target);
      var datos = {
        codigo: (f.get("codigo") || "").trim().toUpperCase(), tipo: f.get("tipo"),
        valor: Number(f.get("valor")) || 0, minimo: Number(f.get("minimo")) || 0,
        texto: f.get("texto") || null, activo: !!f.get("activo"),
      };
      if (!datos.codigo) { toast("El código es obligatorio", false); return; }
      try {
        if (c) await supa("PATCH", "/rest/v1/Cupon?id=eq." + c.id, datos);
        else await supa("POST", "/rest/v1/Cupon", datos);
        cerrarModal(); toast("Cupón guardado. Pulsa 'Publicar cambios' para activarlo en la tienda."); renderCupones();
      } catch (err) { toast(err.message, false); }
    });
  }

  /* ============================== CONSTRUCTOR VISUAL ============================== */
  var BLOQUES_TIPOS = [
    { v: "hero", l: "Banner principal (hero)", i: "bi-image" },
    { v: "productos", l: "Carrusel / grilla de productos", i: "bi-grid" },
    { v: "categorias", l: "Cuadrícula de categorías", i: "bi-tags" },
    { v: "texto", l: "Texto enriquecido", i: "bi-text-paragraph" },
    { v: "promo", l: "Banner promocional", i: "bi-megaphone" },
  ];
  function tipoL(v) { for (var i = 0; i < BLOQUES_TIPOS.length; i++) if (BLOQUES_TIPOS[i].v === v) return BLOQUES_TIPOS[i].l; return v; }
  function resumenBloque(b) {
    var c = b.config || {};
    var t = c.titulo || c.subtitulo || c.boton || "";
    return t ? esc(t).slice(0, 60) : "—";
  }
  // Vista previa en miniatura de cada bloque (para verlo antes de editar)
  function previewBloque(b) {
    var c = b.config || {};
    var tema = c.tema || "oscuro";
    function grad() {
      return tema === "azul" ? "#244093,#162a66" : tema === "rojo" ? "#DA1D2A,#a31420" : "#1c2333,#0f1420";
    }
    if (b.tipo === "hero" || b.tipo === "promo") {
      return '<div style="border-radius:10px;padding:16px;color:#fff;background:linear-gradient(120deg,' + grad() + ')">' +
        (c.etiqueta ? '<small style="opacity:.85">' + esc(c.etiqueta) + "</small><br>" : "") +
        '<b style="font-size:1.1rem">' + esc(c.titulo || "Título") + "</b>" +
        (c.subtitulo ? '<div style="font-size:.85rem;opacity:.92;margin-top:2px">' + esc(c.subtitulo) + "</div>" : "") +
        (c.boton ? '<span style="display:inline-block;background:#fff;color:#1c2333;padding:4px 10px;border-radius:6px;font-size:.8rem;margin-top:8px">' + esc(c.boton) + "</span>" : "") +
        "</div>";
    }
    if (b.tipo === "productos") {
      return '<div style="border:1px solid var(--linea);border-radius:10px;padding:12px;background:#fafbfc">' +
        '<b>' + esc(c.titulo || "Destacados") + "</b><br>" +
        '<small class="muted">Muestra ' + (c.limite || 8) + " productos" +
          (c.categoria ? " de <b>" + esc(c.categoria) + "</b>" : "") + (c.subcategoria ? " (" + esc(c.subcategoria) + ")" : "") + "</small></div>";
    }
    if (b.tipo === "categorias") {
      return '<div style="border:1px solid var(--linea);border-radius:10px;padding:12px;background:#fafbfc">' +
        '<b>' + esc(c.titulo || "Categorías") + "</b><br>" +
        '<small class="muted">Grupo <b>' + esc(c.grupo || "todas") + "</b> · " + (c.limite || 10) + " categorías</small></div>";
    }
    return '<div style="border:1px solid var(--linea);border-radius:10px;padding:12px;background:#fafbfc">' +
      (c.titulo ? "<b>" + esc(c.titulo) + "</b><br>" : "") +
      '<small class="muted">' + esc(String(c.contenido || "").replace(/<[^>]+>/g, "").slice(0, 90)) + "</small></div>";
  }

  var paginaCache = null;
  async function renderConstructor() {
    var cont = $("#contenido");
    cont.innerHTML = '<div class="card"><p class="muted">Cargando…</p></div>';
    try {
      var rows = await supa("GET", "/rest/v1/Pagina?slug=eq.inicio&select=*");
      var pagina = rows && rows[0];
      if (!pagina) {
        var creado = await supa("POST", "/rest/v1/Pagina", { slug: "inicio", nombre: "Página de inicio", bloques: [] });
        pagina = creado[0];
      }
      paginaCache = pagina;
      pintarConstructor();
    } catch (e) { cont.innerHTML = errCard(e); }
  }
  function pintarConstructor() {
    var cont = $("#contenido");
    var bloques = (paginaCache && paginaCache.bloques) || [];
    cont.innerHTML =
      '<div class="card"><div class="toolbar">' +
        '<button class="btn" id="btn-add-bloque"><i class="bi bi-plus-lg"></i> Añadir bloque</button>' +
        '<span class="muted" style="margin-left:auto">Los cambios se ven en la tienda en tiempo real (sin publicar).</span>' +
      "</div>" +
      (bloques.length
        ? bloques.map(function (b, i) {
            return '<div class="ctor-item">' +
              '<div class="ctor-preview">' + previewBloque(b) + "</div>" +
              '<div class="ctor-bar">' +
                '<i class="bi ' + (tipoIcono(b.tipo) || "bi-bounding-box") + '" style="color:var(--azul)"></i>' +
                '<div style="flex:1"><b>' + esc(tipoL(b.tipo)) + '</b> <small class="muted">· ' + resumenBloque(b) + "</small></div>" +
                '<button class="btn btn--ghost btn--sm" data-subir="' + i + '"' + (i === 0 ? " disabled" : "") + ' title="Subir"><i class="bi bi-arrow-up"></i></button>' +
                '<button class="btn btn--ghost btn--sm" data-bajar="' + i + '"' + (i === bloques.length - 1 ? " disabled" : "") + ' title="Bajar"><i class="bi bi-arrow-down"></i></button>' +
                '<button class="btn btn--ghost btn--sm" data-editar="' + i + '" title="Editar"><i class="bi bi-pencil"></i></button>' +
                '<button class="btn btn--ghost btn--sm" data-del-bloque="' + i + '" style="color:var(--rojo)" title="Eliminar"><i class="bi bi-trash3"></i></button>' +
              "</div>" +
            "</div>";
          }).join("")
        : '<div class="empty">Sin bloques todavía. Añade uno para empezar a personalizar la home.</div>') +
      "</div>";

    $("#btn-add-bloque").onclick = function () { elegirTipoBloque(); };
    $$("[data-subir]", cont).forEach(function (b) { b.onclick = function () { moverBloque(+b.getAttribute("data-subir"), -1); }; });
    $$("[data-bajar]", cont).forEach(function (b) { b.onclick = function () { moverBloque(+b.getAttribute("data-bajar"), 1); }; });
    $$("[data-editar]", cont).forEach(function (b) { b.onclick = function () { formBloque(+b.getAttribute("data-editar")); }; });
    $$("[data-del-bloque]", cont).forEach(function (b) {
      b.onclick = function () {
        if (!confirm("¿Eliminar este bloque?")) return;
        paginaCache.bloques.splice(+b.getAttribute("data-del-bloque"), 1);
        guardarPagina();
      };
    });
  }
  function tipoIcono(v) { for (var i = 0; i < BLOQUES_TIPOS.length; i++) if (BLOQUES_TIPOS[i].v === v) return BLOQUES_TIPOS[i].i; return "bi-bounding-box"; }
  function moverBloque(i, dir) {
    var j = i + dir;
    var arr = paginaCache.bloques;
    if (j < 0 || j >= arr.length) return;
    var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    guardarPagina();
  }
  async function guardarPagina() {
    try {
      await supa("PATCH", "/rest/v1/Pagina?id=eq." + paginaCache.id, { bloques: paginaCache.bloques, actualizadoEn: new Date().toISOString() });
      toast("Página guardada. Se verá en la tienda en unos segundos.");
      pintarConstructor();
    } catch (e) { toast(e.message, false); }
  }
  function elegirTipoBloque() {
    var body = '<p class="muted">Elige el tipo de bloque a añadir:</p>' +
      BLOQUES_TIPOS.map(function (t) {
        return '<button class="btn btn--ghost" style="display:block;width:100%;margin-bottom:8px;text-align:left" data-tipo="' + t.v + '"><i class="bi ' + t.i + '"></i> ' + esc(t.l) + "</button>";
      }).join("");
    modal("Añadir bloque", body);
    $$("#modal [data-tipo]").forEach(function (b) {
      b.onclick = function () { cerrarModal(); formBloque(null, b.getAttribute("data-tipo")); };
    });
  }
  async function formBloque(index, tipo) {
    var editando = index !== null && index !== undefined;
    var b = editando ? paginaCache.bloques[index] : { tipo: tipo, config: {} };
    var c = b.config || {};
    var cats = await supa("GET", "/rest/v1/Categoria?select=id,nombre,slug&order=nombre.asc").catch(function () { return []; });
    var subs = await supa("GET", "/rest/v1/Subcategoria?select=id,slug,nombre&order=nombre.asc").catch(function () { return []; });
    var cuerpo = "";
    if (b.tipo === "hero") {
      cuerpo = fld("Etiqueta", input("etiqueta", c.etiqueta || "")) +
        fld("Título *", input("titulo", c.titulo || "")) +
        fld("Subtítulo", area("subtitulo", c.subtitulo || "", 2)) +
        '<div class="row">' + fld("Texto del botón", input("boton", c.boton || "")) + fld("Enlace", input("enlace", c.enlace || "")) + "</div>" +
        '<div class="row">' + '<div class="field"><label>Tema</label>' + select("tema", [{ v: "oscuro", l: "Oscuro" }, { v: "rojo", l: "Rojo" }, { v: "azul", l: "Azul" }], c.tema || "oscuro") + "</div>" +
        fld("Imagen de fondo (URL)", input("imagen", c.imagen || "")) + "</div>";
    } else if (b.tipo === "productos") {
      cuerpo = fld("Título", input("titulo", c.titulo || "Destacados")) +
        '<div class="row">' +
        '<div class="field"><label>Categoría</label><select name="categoria"><option value="">— Todas —</option>' + cats.map(function (x) { return '<option value="' + esc(x.slug) + '"' + (c.categoria === x.slug ? " selected" : "") + ">" + esc(x.nombre) + "</option>"; }).join("") + "</select></div>" +
        '<div class="field"><label>Subcategoría</label><select name="subcategoria"><option value="">— Ninguna —</option>' + subs.map(function (x) { return '<option value="' + esc(x.slug) + '"' + (c.subcategoria === x.slug ? " selected" : "") + ">" + esc(x.nombre) + "</option>"; }).join("") + "</select></div>" +
        "</div>" + fld("Cantidad de productos", input("limite", c.limite || 8, "number"));
    } else if (b.tipo === "categorias") {
      cuerpo = fld("Título", input("titulo", c.titulo || "Categorías")) +
        '<div class="row">' +
        '<div class="field"><label>Grupo</label>' + select("grupo", [{ v: "temporada", l: "Temporada" }, { v: "producto", l: "Producto" }, { v: "todas", l: "Todas" }], c.grupo || "todas") + "</div>" +
        fld("Cantidad", input("limite", c.limite || 10, "number")) + "</div>";
    } else if (b.tipo === "texto") {
      cuerpo = fld("Título", input("titulo", c.titulo || "")) +
        fld("Contenido <span class=hint>(acepta HTML)</span>", area("contenido", c.contenido || "", 6));
    } else if (b.tipo === "promo") {
      cuerpo = fld("Título *", input("titulo", c.titulo || "")) +
        fld("Subtítulo", area("subtitulo", c.subtitulo || "", 2)) +
        '<div class="row">' + fld("Texto del botón", input("boton", c.boton || "")) + fld("Enlace", input("enlace", c.enlace || "")) + "</div>" +
        '<div class="field"><label>Tema</label>' + select("tema", [{ v: "rojo", l: "Rojo" }, { v: "azul", l: "Azul" }, { v: "oscuro", l: "Oscuro" }], c.tema || "rojo") + "</div>";
    }
    var body = '<form id="f-bloque">' + cuerpo +
      '<div class="field"><label>Ancho del bloque · <b id="bloque-ancho-val">' + (c.ancho || 100) + '%</b></label>' +
      '<input type="range" name="ancho" id="bloque-ancho" min="40" max="100" step="5" value="' + (c.ancho || 100) + '">' +
      '<span class="hint">Mínimo 40% · Máximo 100% (para que no se rompa la página).</span></div>' +
      '<div class="modal__ft"><button type="button" class="btn btn--ghost" data-cerrar>Cancelar</button><button class="btn btn--rojo" type="submit">Guardar bloque</button></div></form>';
    modal((editando ? "Editar bloque · " : "Nuevo bloque · ") + tipoL(b.tipo), body);
    var anchoEl = $("#bloque-ancho");
    if (anchoEl) anchoEl.addEventListener("input", function () { $("#bloque-ancho-val").textContent = anchoEl.value + "%"; });
    $("#f-bloque").addEventListener("submit", function (e) {
      e.preventDefault();
      var f = new FormData(e.target);
      var conf = {};
      if (b.tipo === "hero") conf = { etiqueta: f.get("etiqueta") || null, titulo: f.get("titulo"), subtitulo: f.get("subtitulo") || null, boton: f.get("boton") || null, enlace: f.get("enlace") || null, tema: f.get("tema"), imagen: f.get("imagen") || null };
      if (b.tipo === "productos") conf = { titulo: f.get("titulo") || "Destacados", categoria: f.get("categoria") || null, subcategoria: f.get("subcategoria") || null, limite: Number(f.get("limite")) || 8 };
      if (b.tipo === "categorias") conf = { titulo: f.get("titulo") || "Categorías", grupo: f.get("grupo"), limite: Number(f.get("limite")) || 10 };
      if (b.tipo === "texto") conf = { titulo: f.get("titulo") || null, contenido: f.get("contenido") || "" };
      if (b.tipo === "promo") conf = { titulo: f.get("titulo"), subtitulo: f.get("subtitulo") || null, boton: f.get("boton") || null, enlace: f.get("enlace") || null, tema: f.get("tema") };
      conf.ancho = Math.min(100, Math.max(40, Number(f.get("ancho")) || 100));
      if (!conf.titulo && (b.tipo === "hero" || b.tipo === "promo")) { toast("El título es obligatorio", false); return; }
      if (editando) paginaCache.bloques[index] = { tipo: b.tipo, config: conf };
      else paginaCache.bloques.push({ tipo: b.tipo, config: conf });
      cerrarModal();
      guardarPagina();
    });
  }

  /* ============================== POLÍTICAS ============================== */
  var POLITICAS = [
    { clave: "politica_privacidad", label: "Política de privacidad" },
    { clave: "politica_envios", label: "Política de envíos" },
    { clave: "politica_devoluciones", label: "Política de devoluciones" },
    { clave: "politica_terminos", label: "Términos y condiciones" },
  ];
  async function renderPoliticas() {
    var cont = $("#contenido");
    cont.innerHTML = '<div class="card"><p class="muted">Cargando…</p></div>';
    try {
      var config = await supa("GET", "/rest/v1/Configuracion?select=id,clave,valor");
      var mapa = {};
      config.forEach(function (c) { mapa[c.clave] = c.valor; });
      var campos = POLITICAS.map(function (p) {
        return fld(p.label + " <span class=hint>(acepta HTML)</span>", '<textarea name="' + p.clave + '" rows="9">' + esc(mapa[p.clave] || "") + "</textarea>");
      }).join("");
      cont.innerHTML = '<form id="f-politicas"><div class="card"><h2>Políticas de la tienda</h2>' +
        '<p class="muted">Estos textos se guardan en Supabase. Puedes mostrarlos en tu sitio (pie de página o página de políticas).</p>' + campos +
        '<div class="modal__ft" style="margin-top:18px"><button class="btn btn--rojo" type="submit"><i class="bi bi-check-lg"></i> Guardar políticas</button></div></div></form>';
      $("#f-politicas").addEventListener("submit", async function (e) {
        e.preventDefault();
        var f = new FormData(e.target);
        try {
          for (var i = 0; i < POLITICAS.length; i++) {
            var p = POLITICAS[i];
            var existe = config.find(function (c) { return c.clave === p.clave; });
            if (existe) await supa("PATCH", "/rest/v1/Configuracion?id=eq." + existe.id, { valor: f.get(p.clave) || "" });
            else await supa("POST", "/rest/v1/Configuracion", { clave: p.clave, valor: f.get(p.clave) || "" });
          }
          toast("Políticas guardadas");
        } catch (err) { toast(err.message, false); }
      });
    } catch (e) { cont.innerHTML = errCard(e); }
  }

  /* ============================== CONFIGURACIÓN ============================== */
  var CFG_META = [
    { clave: "marca", label: "Marca", tipo: "text" },
    { clave: "lema", label: "Lema", tipo: "text" },
    { clave: "descripcion", label: "Descripción (SEO)", tipo: "area" },
    { clave: "logo", label: "Ruta del logo", tipo: "text" },
    { clave: "favicon", label: "Favicon", tipo: "text" },
    { clave: "whatsapp", label: "WhatsApp (52 + 10 dígitos)", tipo: "text" },
    { clave: "whatsappBonito", label: "WhatsApp (formato bonito)", tipo: "text" },
    { clave: "email", label: "Correo principal", tipo: "text" },
    { clave: "emailAlt", label: "Correo facturación", tipo: "text" },
    { clave: "facebook", label: "Facebook (URL)", tipo: "text" },
    { clave: "instagram", label: "Instagram (URL)", tipo: "text" },
    { clave: "direccion", label: "Dirección", tipo: "text" },
    { clave: "horario", label: "Horario", tipo: "text" },
    { clave: "moneda", label: "Moneda", tipo: "text" },
    { clave: "simbolo", label: "Símbolo de moneda", tipo: "text" },
    { clave: "iva", label: "IVA (0 = incluido)", tipo: "number" },
    { clave: "envio", label: "Costo de envío", tipo: "number" },
    { clave: "envioGratisDesde", label: "Envío gratis desde", tipo: "number" },
    { clave: "porPagina", label: "Artículos por página", tipo: "number" },
    { clave: "mesesSinIntereses", label: "Mensaje de MSI", tipo: "text" },
    { clave: "modoImagenes", label: "Modo de imágenes (auto|hotlink|local)", tipo: "text" },
    { clave: "extImagenes", label: "Extensión de imágenes", tipo: "text" },
    { clave: "particulasMax", label: "Partículas (máx)", tipo: "number" },
    { clave: "particulas", label: "Partículas activas", tipo: "bool" },
    { clave: "aos", label: "Animaciones AOS", tipo: "bool" },
    { clave: "animaciones", label: "Animaciones", tipo: "bool" },
    { clave: "url", label: "URL del sitio", tipo: "text" },
    { clave: "titulo", label: "Título SEO", tipo: "text" },
    { clave: "cache", label: "Versión de caché", tipo: "text" },
    { clave: "talleres", label: "Talleres (JSON)", tipo: "json" },
    { clave: "pagos", label: "Pagos (JSON)", tipo: "json" },
    { clave: "hotlink", label: "Hotlink (JSON)", tipo: "json" },
    { clave: "colores", label: "Colores de marca (JSON)", tipo: "json" },
    { clave: "faq", label: "Preguntas frecuentes (JSON)", tipo: "json" },
  ];
  var configCache = [];
  var adminsCache = [];

  function pintarAdmins() {
    var cont = $("#admins-card");
    if (!cont) return;
    var miId = usuario ? (usuario.sub || usuario.id) : null;
    cont.innerHTML =
      '<div class="toolbar"><button class="btn btn--sm" id="btn-nuevo-admin"><i class="bi bi-person-plus"></i> Nuevo administrador</button>' +
      '<span class="muted">Estas cuentas pueden entrar al panel y gestionar la tienda.</span></div>' +
      '<table><thead><tr><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Estado</th><th></th></tr></thead><tbody>' +
      adminsCache.map(function (u) {
        return "<tr><td><b>" + esc(u.nombre) + "</b></td><td>" + esc(u.email) + "</td><td>" + esc(u.telefono || "—") + "</td>" +
          "<td>" + (u.activo ? '<span class="badge badge--on">Activo</span>' : '<span class="badge badge--off">Inactivo</span>') + "</td>" +
          '<td class="actions"><button class="btn btn--ghost btn--sm" data-edit="' + u.id + '"><i class="bi bi-pencil"></i></button>' +
          (u.id === miId ? "" : '<button class="btn btn--ghost btn--sm" data-del="' + u.id + '" style="color:var(--rojo)"><i class="bi bi-trash3"></i></button>') + "</td></tr>";
      }).join("") + (adminsCache.length ? "" : '<tr><td colspan="5" class="empty">Sin cuentas de administrador</td></tr>') + "</tbody></table>";
    $("#btn-nuevo-admin").onclick = function () { formAdmin(null); };
    $$("[data-edit]", cont).forEach(function (b) { b.onclick = function () { formAdmin(b.getAttribute("data-edit")); }; });
    $$("[data-del]", cont).forEach(function (b) {
      b.onclick = async function () {
        if (!confirm("¿Eliminar esta cuenta de administrador?")) return;
        try { await supa("DELETE", "/rest/v1/Usuario?id=eq." + b.getAttribute("data-del")); toast("Administrador eliminado"); renderConfiguracion(); }
        catch (e) { toast(e.message, false); }
      };
    });
  }
  function formAdmin(id) {
    var u = id ? adminsCache.find(function (x) { return x.id === id; }) : null;
    var body =
      '<form id="f-admin">' +
      fld("Nombre *", input("nombre", u ? u.nombre : "")) +
      '<div class="row"><div class="field"><label>Correo *</label>' + input("email", u ? u.email : "", "email") + "</div>" +
      '<div class="field"><label>Teléfono</label>' + input("telefono", u ? u.telefono : "") + "</div></div>" +
      fld("Contraseña <span class=hint>" + (u ? "Déjala vacía para no cambiarla" : "Requerida al crear") + "</span>", input("password", "", "password")) +
      check("activo", u ? u.activo !== false : true, "Activo") +
      '<div class="modal__ft"><button type="button" class="btn btn--ghost" data-cerrar>Cancelar</button><button class="btn btn--rojo" type="submit">Guardar</button></div>' +
      "</form>";
    modal(u ? "Editar administrador" : "Nuevo administrador", body);
    $("#f-admin").addEventListener("submit", async function (e) {
      e.preventDefault();
      var f = new FormData(e.target);
      try {
        await supa("POST", "/rpc/ek_upsert_usuario", {
          p_id: u ? u.id : null, p_nombre: f.get("nombre"), p_email: f.get("email"),
          p_password: f.get("password") || "", p_rol: "ADMINISTRADOR", p_telefono: f.get("telefono") || null,
          p_activo: !!f.get("activo"),
        });
        cerrarModal(); toast("Administrador guardado"); renderConfiguracion();
      } catch (err) { toast(err.message, false); }
    });
  }

  async function renderConfiguracion() {
    var cont = $("#contenido");
    cont.innerHTML = '<div class="card"><p class="muted">Cargando…</p></div>';
    try {
      var [config, admins] = await Promise.all([
        supa("GET", "/rest/v1/Configuracion?select=id,clave,valor"),
        supa("GET", "/rest/v1/Usuario?select=id,nombre,email,telefono,activo&rol=eq.ADMINISTRADOR&order=creadoEn.asc"),
      ]);
      configCache = config;
      adminsCache = admins;
      var mapa = {};
      configCache.forEach(function (c) { mapa[c.clave] = c.valor; });
      var campos = CFG_META.map(function (m) {
        var v = mapa[m.clave] !== undefined ? mapa[m.clave] : "";
        if (m.tipo === "area") return fld(m.label, '<textarea name="' + m.clave + '" rows="3">' + esc(v) + "</textarea>");
        if (m.tipo === "json") return fld(m.label + " <span class=hint>(JSON válido)</span>", '<textarea name="' + m.clave + '" rows="5">' + esc(v) + "</textarea>");
        if (m.tipo === "bool") return '<div class="field"><label>' + esc(m.label) + "</label>" + check(m.clave, v === "true", "Activado") + "</div>";
        return fld(m.label, '<input name="' + m.clave + '" type="' + (m.tipo === "number" ? "number" : "text") + '" value="' + esc(v) + '">');
      }).join("");
      cont.innerHTML =
        '<div class="card"><h2>👑 Cuentas de administrador</h2><p class="muted">Las cuentas que pueden entrar a este panel se gestionan aquí (no aparecen en Clientes).</p><div id="admins-card"></div></div>' +
        '<form id="f-conf">' +
        '<div class="card"><h2>Logo y favicon</h2><p class="muted">Súbelos desde aquí; se aplican en la tienda al publicar.</p>' +
          '<div class="row">' +
            '<div class="field"><label>Logo</label><input type="file" id="up-logo" accept="image/*"><small class="hint" id="logo-estado"></small></div>' +
            '<div class="field"><label>Favicon (ícono de la pestaña)</label><input type="file" id="up-favicon" accept="image/*"><small class="hint" id="favicon-estado"></small></div>' +
          '</div></div>' +
        '<div class="card"><h2>Datos de la tienda</h2><p class="muted">Estos valores se aplican a la interfaz al publicar.</p>' + campos +
        '<div class="modal__ft" style="margin-top:18px"><button class="btn btn--rojo" type="submit"><i class="bi bi-check-lg"></i> Guardar configuración</button></div></div></form>';
      pintarAdmins();
      $("#f-conf").addEventListener("submit", async function (e) {
        e.preventDefault();
        var f = new FormData(e.target);
        try {
          for (var i = 0; i < CFG_META.length; i++) {
            var m = CFG_META[i];
            var val = f.get(m.clave) || "";
            if (m.tipo === "json") { try { val = JSON.stringify(JSON.parse(val)); } catch (err) { toast("JSON inválido en: " + m.clave, false); return; } }
            if (m.tipo === "number") val = String(Number(val) || 0);
            if (m.tipo === "bool") val = f.get(m.clave) ? "true" : "false";
            var existe = configCache.find(function (c) { return c.clave === m.clave; });
            if (existe) await supa("PATCH", "/rest/v1/Configuracion?id=eq." + existe.id, { valor: val });
            else await supa("POST", "/rest/v1/Configuracion", { clave: m.clave, valor: val });
          }
          toast("Configuración guardada. Pulsa 'Publicar cambios' para aplicarla a la tienda.");
        } catch (err) { toast(err.message, false); }
      });
      // Subida de logo y favicon
      function subirLogoFavicon(input, estadoId, camposDestino) {
        var file = input.files[0];
        if (!file) return;
        var estado = $("#" + estadoId);
        if (estado) estado.textContent = "Subiendo…";
        var lector = new FileReader();
        lector.onload = async function () {
          try {
            var res = await fetch("/api/upload", { method: "POST", headers: authHeaders(), body: JSON.stringify({ base64: lector.result, nombre: file.name, tipo: "logo" }) });
            var d = await res.json();
            if (d.ok && d.url) {
              camposDestino.forEach(function (n) {
                var inp = document.querySelector('#f-conf [name="' + n + '"]');
                if (inp) inp.value = d.url;
              });
              if (estado) estado.textContent = "✔ Subido";
            } else if (estado) estado.textContent = "Error: " + (d.error || "desconocido");
          } catch (e) { if (estado) estado.textContent = "Error de conexión"; }
        };
        lector.readAsDataURL(file);
      }
      var upLogo = $("#up-logo"), upFav = $("#up-favicon");
      if (upLogo) upLogo.addEventListener("change", function () { subirLogoFavicon(upLogo, "logo-estado", ["logo"]); });
      if (upFav) upFav.addEventListener("change", function () { subirLogoFavicon(upFav, "favicon-estado", ["favicon", "favicon32", "appleIcon"]); });
    } catch (e) { cont.innerHTML = errCard(e); }
  }

  function errCard(e) { return '<div class="card"><div class="empty">Error: ' + esc(e.message) + "</div></div>"; }

  /* ============================== ARRANQUE ============================== */
  validarSesion().then(function (ok) { if (ok) route(); });
})();
