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
        supa("GET", "/rest/v1/Producto?select=id"),
        supa("GET", "/rest/v1/Pedido?select=id,estado"),
        supa("GET", "/rest/v1/Resena?select=id,aprobada"),
        supa("GET", "/rest/v1/Usuario?select=id"),
        supa("GET", "/rest/v1/Categoria?select=id"),
        supa("GET", "/rest/v1/Articulo?select=id,publicado"),
      ]);
      var pend = peds.filter(function (p) { return p.estado === "PENDIENTE"; }).length;
      var resPend = res.filter(function (r) { return !r.aprobada; }).length;
      cont.innerHTML =
        '<div class="grid grid--stats">' +
          stat(prods.length, "Productos", "bi-box-seam") +
          stat(peds.length, "Pedidos", "bi-receipt") +
          stat(pend, "Pendientes", "bi-hourglass-split") +
          stat(users.length, "Clientes", "bi-people") +
          stat(resPend, "Reseñas por aprobar", "bi-star") +
          stat(arts.filter(function (a) { return a.publicado; }).length, "Artículos de blog", "bi-journal-text") +
        "</div>" +
        '<div class="card">' +
          "<h2>Cómo funciona</h2>" +
          '<p class="muted">Los cambios que guardes aquí se escriben en Supabase. El botón <b>Publicar cambios</b> regenera los archivos estáticos (catálogo, categorías, banners, blog, configuración) y redeploya la tienda en Cloudflare Pages (1-3 min). El stock, las reseñas, la calificación y las ventas se actualizan <b>en tiempo real</b> sin publicar.</p>' +
          '<button class="btn btn--rojo" id="btn-publicar-2"><i class="bi bi-cloud-arrow-up"></i> Publicar cambios ahora</button>' +
        "</div>";
      $("#btn-publicar-2").onclick = function () { $("#btn-publicar").click(); };
    } catch (e) {
      cont.innerHTML = '<div class="card"><div class="empty">Error: ' + esc(e.message) + "</div></div>";
    }
  }
  function stat(n, label, ico) {
    return '<div class="stat"><b>' + nf(n) + "</b><span><i class='bi " + ico + "'></i> " + esc(label) + "</span></div>";
  }

  /* ============================== PRODUCTOS ============================== */
  var productosCache = [];
  async function renderProductos() {
    var cont = $("#contenido");
    cont.innerHTML = '<div class="card"><p class="muted">Cargando…</p></div>';
    try {
      productosCache = await supa("GET", "/rest/v1/Producto?select=*&order=nombre.asc");
      pintarProductos("");
    } catch (e) { cont.innerHTML = errCard(e); }
  }
  function pintarProductos(q) {
    var cont = $("#contenido");
    var lista = productosCache.filter(function (p) {
      return !q || (p.nombre + " " + (p.slug || "") + " " + (p.keywords || "")).toLowerCase().indexOf(q.toLowerCase()) > -1;
    });
    cont.innerHTML =
      '<div class="card">' +
        '<div class="toolbar">' +
          '<input type="search" id="q-prod" placeholder="Buscar producto…" value="' + esc(q) + '">' +
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

    var buscador = $("#q-prod");
    if (buscador) buscador.addEventListener("input", function () { pintarProductos(buscador.value); });
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
    if (p) {
      actuales = (await supa("GET", "/rest/v1/_CategoriaToProducto?select=B&A=eq." + p.id).catch(function () { return []; }))
        .map(function (r) { return r.B; });
    }
    var body =
      '<form id="f-prod">' +
      '<div class="row"><div class="field"><label>Nombre *</label>' + input("nombre", p ? p.nombre : "") + "</div>" +
      '<div class="field"><label>Slug <span class="hint">(se genera solo si lo dejas vacío)</span></label>' + input("slug", p ? p.slug : "") + "</div></div>" +
      fld("Descripción", area("descripcion", p ? p.descripcion : "", 3)) +
      '<div class="row">' +
        fld("Precio (MXN) *", input("precioMinorista", p ? p.precioMinorista : "", "number")) +
        fld("Precio anterior (oferta)", input("precioAnterior", p ? (p.precioAnterior || "") : "", "number")) +
      "</div>" +
      '<div class="row row--3">' +
        fld("Stock", input("stock", p ? p.stock : 0, "number")) +
        fld("Vendidos", input("vendidos", p ? p.vendidos : 0, "number")) +
        fld("Calificación (0-5)", input("calificacion", p ? p.calificacion : 0, "number")) +
      "</div>" +
      '<div class="row">' +
        fld("Colores <span class=hint>(separados por coma)</span>", input("colores", p ? arrSplit(p.colores) : "")) +
        fld("Tallas / tamaños <span class=hint>(separados por coma)</span>", input("tallas", p ? arrSplit(p.tallas) : "")) +
      "</div>" +
      fld("Características <span class=hint>(una por línea)</span>", area("caracteristicas", p ? (p.caracteristicas || []).join("\n") : "", 4)) +
      fld("Palabras clave (imágenes)", input("keywords", p ? p.keywords : "")) +
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
    $("#f-prod").addEventListener("submit", async function (e) {
      e.preventDefault();
      var f = new FormData(e.target);
      var datos = {
        nombre: f.get("nombre"), slug: f.get("slug") || slugify(f.get("nombre")),
        descripcion: f.get("descripcion") || "",
        precioMinorista: Number(f.get("precioMinorista")) || 0,
        precioAnterior: f.get("precioAnterior") ? Number(f.get("precioAnterior")) : null,
        stock: Number(f.get("stock")) || 0, vendidos: Number(f.get("vendidos")) || 0,
        calificacion: Number(f.get("calificacion")) || 0,
        colores: arrJoin(f.get("colores")), tallas: arrJoin(f.get("tallas")),
        caracteristicas: listSplit(f.get("caracteristicas")), keywords: f.get("keywords") || null,
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
        '<div class="card"><div class="toolbar"><button class="btn" id="btn-nueva-cat"><i class="bi bi-plus-lg"></i> Nueva categoría</button></div>' +
        '<table><thead><tr><th>Nombre</th><th>Grupo</th><th>Nav</th><th>Orden</th><th></th></tr></thead><tbody>' +
        categoriasCache.map(function (c) {
          return "<tr><td><b>" + esc(c.nombre) + "</b> " + esc(c.emoji || "") + '<br><small class="muted">' + esc(c.slug) + "</small></td>" +
            "<td>" + (c.grupo === "temporada" ? "🎄 Temporada" : "🛍 Producto") + "</td>" +
            "<td>" + (c.enNav ? '<span class="badge badge--on">Sí</span>' : '<span class="badge badge--off">No</span>') + "</td>" +
            "<td>" + c.orden + "</td>" +
            '<td class="actions"><button class="btn btn--ghost btn--sm" data-edit="' + c.id + '"><i class="bi bi-pencil"></i></button>' +
            '<button class="btn btn--ghost btn--sm" data-del="' + c.id + '" style="color:var(--rojo)"><i class="bi bi-trash3"></i></button></td></tr>';
        }).join("") + "</tbody></table></div>";
      $("#btn-nueva-cat").onclick = function () { formCategoria(null); };
      $$("[data-edit]", cont).forEach(function (b) { b.onclick = function () { formCategoria(b.getAttribute("data-edit")); }; });
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
        keywords: f.get("keywords") || null, enNav: !!f.get("enNav"), activo: !!f.get("activo"),
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
      fld("Contenido (HTML)", area("contenido", a ? a.contenido : "", 12)) +
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
    $("#f-blog").addEventListener("submit", async function (e) {
      e.preventDefault();
      var f = new FormData(e.target);
      var datos = {
        titulo: f.get("titulo"), slug: f.get("slug") || slugify(f.get("titulo")), resumen: f.get("resumen") || null,
        contenido: f.get("contenido") || "", autor: f.get("autor") || null, categoria: f.get("categoria") || null,
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
      cont.innerHTML =
        '<div class="card"><table><thead><tr><th>Autor</th><th>Producto</th><th>★</th><th>Estado</th><th></th></tr></thead><tbody>' +
        resenasCache.map(function (r) {
          return "<tr><td><b>" + esc(r.autor) + "</b><br><small class='muted'>" + esc(r.ciudad || "") + "</small></td>" +
            "<td>" + esc((r.Producto && r.Producto.nombre) || "—") + "</td>" +
            "<td>" + "★".repeat(r.estrellas) + "☆".repeat(5 - r.estrellas) + "</td>" +
            "<td>" + (r.aprobada ? '<span class="badge badge--on">Aprobada</span>' : '<span class="badge badge--pend">Pendiente</span>') + "</td>" +
            '<td class="actions"><button class="btn btn--ghost btn--sm" data-aprobar="' + r.id + '" data-val="' + (r.aprobada ? "0" : "1") + '">' + (r.aprobada ? "Ocultar" : "Aprobar") + "</button>" +
            '<button class="btn btn--ghost btn--sm" data-del="' + r.id + '" style="color:var(--rojo)"><i class="bi bi-trash3"></i></button></td></tr>';
        }).join("") + (resenasCache.length ? "" : '<tr><td colspan="5" class="empty">Sin reseñas</td></tr>') + "</tbody></table></div>";
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
    } catch (e) { cont.innerHTML = errCard(e); }
  }

  /* ============================== PEDIDOS ============================== */
  var pedidosCache = [];
  var ESTADOS = ["PENDIENTE", "PAGADO", "ENVIADO", "ENTREGADO", "CANCELADO"];
  async function renderPedidos() {
    var cont = $("#contenido");
    try {
      pedidosCache = await supa("GET", "/rest/v1/Pedido?select=*&order=creadoEn.desc");
      cont.innerHTML =
        '<div class="card"><table><thead><tr><th>Pedido</th><th>Cliente</th><th>Total</th><th>Estado</th><th></th></tr></thead><tbody>' +
        pedidosCache.map(function (p) {
          var cls = p.estado === "ENTREGADO" ? "on" : (p.estado === "CANCELADO" ? "off" : (p.estado === "ENVIADO" ? "env" : "pend"));
          return "<tr><td><small class='muted'>#" + esc(String(p.id).slice(0, 8)) + "</small><br><b>" + fecha(p.creadoEn) + "</b></td>" +
            "<td>" + esc(p.cliente || "—") + "</td><td>" + money(p.total) + "</td>" +
            '<td><span class="badge badge--' + cls + '">' + esc(p.estado) + "</span></td>" +
            '<td class="actions"><button class="btn btn--ghost btn--sm" data-ver="' + p.id + '"><i class="bi bi-eye"></i></button></td></tr>';
        }).join("") + (pedidosCache.length ? "" : '<tr><td colspan="5" class="empty">Sin pedidos aún</td></tr>') + "</tbody></table></div>";
      $$("[data-ver]", cont).forEach(function (b) { b.onclick = function () { verPedido(b.getAttribute("data-ver")); }; });
    } catch (e) { cont.innerHTML = errCard(e); }
  }
  async function verPedido(id) {
    var p = pedidosCache.find(function (x) { return x.id === id; });
    var items = await supa("GET", "/rest/v1/DetallePedido?select=*&pedidoId=eq." + id).catch(function () { return []; });
    var body =
      '<p class="muted"><b>Pedido #' + esc(String(id).slice(0, 8)) + "</b> · " + fecha(p.creadoEn) + "</p>" +
      '<div class="row">' +
        fld("Cliente", input("cliente", p.cliente || "")) +
        '<div class="field"><label>Estado</label>' + select("estado", ESTADOS.map(function (e) { return { v: e, l: e }; }), p.estado) + "</div>" +
      "</div>" +
      fld("Dirección de envío", area("direccion", p.direccionEnvio || "", 2)) +
      fld("Método de pago", input("metodo", p.metodoPago || "")) +
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
  var ROLES = ["ADMINISTRADOR", "DISTRIBUIDOR", "CLIENTE"];
  async function renderClientes() {
    var cont = $("#contenido");
    try {
      clientesCache = await supa("GET", "/rest/v1/Usuario?select=id,nombre,email,rol,telefono,activo&order=creadoEn.desc");
      cont.innerHTML =
        '<div class="card"><div class="toolbar"><button class="btn" id="btn-nuevo-cli"><i class="bi bi-plus-lg"></i> Nuevo cliente</button></div>' +
        '<table><thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th></th></tr></thead><tbody>' +
        clientesCache.map(function (u) {
          return "<tr><td><b>" + esc(u.nombre) + "</b></td><td>" + esc(u.email) + "</td><td><span class='tag'>" + esc(u.rol) + "</span></td>" +
            "<td>" + (u.activo ? '<span class="badge badge--on">Activo</span>' : '<span class="badge badge--off">Inactivo</span>') + "</td>" +
            '<td class="actions"><button class="btn btn--ghost btn--sm" data-edit="' + u.id + '"><i class="bi bi-pencil"></i></button>' +
            '<button class="btn btn--ghost btn--sm" data-del="' + u.id + '" style="color:var(--rojo)"><i class="bi bi-trash3"></i></button></td></tr>';
        }).join("") + "</tbody></table></div>";
      $("#btn-nuevo-cli").onclick = function () { formCliente(null); };
      $$("[data-edit]", cont).forEach(function (b) { b.onclick = function () { formCliente(b.getAttribute("data-edit")); }; });
      $$("[data-del]", cont).forEach(function (b) {
        b.onclick = async function () {
          if (!confirm("¿Eliminar este usuario?")) return;
          try { await supa("DELETE", "/rest/v1/Usuario?id=eq." + b.getAttribute("data-del")); toast("Usuario eliminado"); renderClientes(); }
          catch (e) { toast(e.message, false); }
        };
      });
    } catch (e) { cont.innerHTML = errCard(e); }
  }
  function formCliente(id) {
    var u = id ? clientesCache.find(function (x) { return x.id === id; }) : null;
    var body =
      '<form id="f-cli">' +
      fld("Nombre *", input("nombre", u ? u.nombre : "")) +
      '<div class="row"><div class="field"><label>Correo *</label>' + input("email", u ? u.email : "", "email") + "</div>" +
      '<div class="field"><label>Rol</label>' + select("rol", ROLES.map(function (r) { return { v: r, l: r }; }), u ? u.rol : "CLIENTE") + "</div></div>" +
      fld("Teléfono", input("telefono", u ? u.telefono : "")) +
      fld("Contraseña <span class=hint>" + (u ? "Déjala vacía para no cambiarla" : "Requerida al crear") + "</span>", input("password", "", "password")) +
      check("activo", u ? u.activo !== false : true, "Activo") +
      '<div class="modal__ft"><button type="button" class="btn btn--ghost" data-cerrar>Cancelar</button><button class="btn btn--rojo" type="submit">Guardar</button></div>' +
      "</form>";
    modal(u ? "Editar usuario" : "Nuevo usuario", body);
    $("#f-cli").addEventListener("submit", async function (e) {
      e.preventDefault();
      var f = new FormData(e.target);
      try {
        await supa("POST", "/rpc/ek_upsert_usuario", {
          p_id: u ? u.id : null, p_nombre: f.get("nombre"), p_email: f.get("email"),
          p_password: f.get("password") || "", p_rol: f.get("rol"), p_telefono: f.get("telefono") || null,
          p_activo: !!f.get("activo"),
        });
        cerrarModal(); toast("Usuario guardado"); renderClientes();
      } catch (err) { toast(err.message, false); }
    });
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
  async function renderConfiguracion() {
    var cont = $("#contenido");
    try {
      configCache = await supa("GET", "/rest/v1/Configuracion?select=id,clave,valor");
      var mapa = {};
      configCache.forEach(function (c) { mapa[c.clave] = c.valor; });
      var campos = CFG_META.map(function (m) {
        var v = mapa[m.clave] !== undefined ? mapa[m.clave] : "";
        if (m.tipo === "area") return fld(m.label, '<textarea name="' + m.clave + '" rows="3">' + esc(v) + "</textarea>");
        if (m.tipo === "json") return fld(m.label + " <span class=hint>(JSON válido)</span>", '<textarea name="' + m.clave + '" rows="5">' + esc(v) + "</textarea>");
        if (m.tipo === "bool") return '<div class="field"><label>' + esc(m.label) + "</label>" + check(m.clave, v === "true", "Activado") + "</div>";
        return fld(m.label, '<input name="' + m.clave + '" type="' + (m.tipo === "number" ? "number" : "text") + '" value="' + esc(v) + '">');
      }).join("");
      cont.innerHTML = '<form id="f-conf"><div class="card"><h2>Datos de la tienda</h2><p class="muted">Estos valores se aplican a la interfaz al publicar.</p>' + campos +
        '<div class="modal__ft" style="margin-top:18px"><button class="btn btn--rojo" type="submit"><i class="bi bi-check-lg"></i> Guardar configuración</button></div></div></form>';
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
    } catch (e) { cont.innerHTML = errCard(e); }
  }

  function errCard(e) { return '<div class="card"><div class="empty">Error: ' + esc(e.message) + "</div></div>"; }

  /* ============================== ARRANQUE ============================== */
  validarSesion().then(function (ok) { if (ok) route(); });
})();
