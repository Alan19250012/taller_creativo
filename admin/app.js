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
          stat(money(ventas), "Ventas totales", "bi-cash-stack") +
          stat(peds.length, "Pedidos", "bi-receipt") +
          stat(pend, "Pendientes", "bi-hourglass-split") +
          stat(users.length, "Clientes", "bi-people") +
          stat(prods.length, "Productos", "bi-box-seam") +
          stat(resPend, "Reseñas por aprobar", "bi-star") +
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
        fld("Colores <span class=hint>(separados por coma)</span>", input("colores", p ? arrSplit(p.colores) : "")) +
        fld("Tallas / tamaños <span class=hint>(separados por coma)</span>", input("tallas", p ? arrSplit(p.tallas) : "")) +
      "</div>" +
      fld("Características <span class=hint>(una por línea)</span>", area("caracteristicas", p ? (p.caracteristicas || []).join("\n") : "", 4)) +
      fld("Stock y precio por variante <span class=hint>(opcional · una por línea: talla | color | stock | precio)</span>", area("variantes", variantesTxt, 5)) +
      fld("Palabras clave (imágenes)", input("keywords", p ? p.keywords : "")) +
      fld("Imagen principal <span class=hint>(URL, o súbela con el botón)</span>",
        '<input name="imagen" id="imagen" type="text" value="' + esc(p ? (p.imagen || "") : "") + '" placeholder="https://...">' +
        '<input type="file" id="up-imagen" accept="image/*" style="margin-top:8px"><small class="hint" id="up-estado"></small>') +
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
    // Subida de imagen principal
    var upInput = $("#up-imagen");
    if (upInput) upInput.addEventListener("change", async function () {
      var file = upInput.files[0];
      if (!file) return;
      var estado = $("#up-estado");
      if (estado) estado.textContent = "Subiendo…";
      var lector = new FileReader();
      lector.onload = async function () {
        try {
          var res = await fetch("/api/upload", { method: "POST", headers: authHeaders(), body: JSON.stringify({ base64: lector.result, nombre: file.name, tipo: "productos" }) });
          var d = await res.json();
          if (d.ok && d.url) {
            var inp = $("#imagen");
            if (inp) inp.value = d.url;
            if (estado) estado.textContent = "✔ Imagen subida";
          } else {
            if (estado) estado.textContent = "Error: " + (d.error || "desconocido");
          }
        } catch (e) { if (estado) estado.textContent = "Error de conexión"; }
      };
      lector.readAsDataURL(file);
    });
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
        imagen: f.get("imagen") || null,
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
        // variantes (talla | color | stock | precio)
        await supa("DELETE", "/rest/v1/Variante?productoId=eq." + pid).catch(function () {});
        var varRows = String(f.get("variantes") || "").split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean)
          .map(function (l) { var pp = l.split("|").map(function (x) { return x.trim(); }); return { talla: pp[0] || null, color: pp[1] || null, stock: Number(pp[2]) || 0, precio: pp[3] ? Number(pp[3]) : null }; });
        for (var j = 0; j < varRows.length; j++) {
          if (varRows[j].talla || varRows[j].color) {
            await supa("POST", "/rest/v1/Variante", { productoId: pid, talla: varRows[j].talla, color: varRows[j].color, stock: varRows[j].stock, precio: varRows[j].precio });
          }
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
      pintarResenas("TODAS");
    } catch (e) { cont.innerHTML = errCard(e); }
  }
  function pintarResenas(filtro) {
    var cont = $("#contenido");
    var lista = filtro === "TODAS" ? resenasCache : resenasCache.filter(function (r) { return (filtro === "APROBADAS") === !!r.aprobada; });
    cont.innerHTML =
      '<div class="card"><div class="toolbar">' +
        '<span class="muted">Filtrar:</span>' +
        '<select id="filtro-resenas" style="width:auto"><option value="TODAS">Todas</option><option value="APROBADAS">Aprobadas</option><option value="PENDIENTES">Pendientes</option></select>' +
      "</div>" +
      '<table><thead><tr><th>Autor</th><th>Producto</th><th>★</th><th>Estado</th><th></th></tr></thead><tbody>' +
      lista.map(function (r) {
        return "<tr><td><b>" + esc(r.autor) + "</b><br><small class='muted'>" + esc(r.ciudad || "") + "</small></td>" +
          "<td>" + esc((r.Producto && r.Producto.nombre) || "—") + "</td>" +
          "<td>" + "★".repeat(r.estrellas) + "☆".repeat(5 - r.estrellas) + "</td>" +
          "<td>" + (r.aprobada ? '<span class="badge badge--on">Aprobada</span>' : '<span class="badge badge--pend">Pendiente</span>') + "</td>" +
          '<td class="actions"><button class="btn btn--ghost btn--sm" data-aprobar="' + r.id + '" data-val="' + (r.aprobada ? "0" : "1") + '">' + (r.aprobada ? "Ocultar" : "Aprobar") + "</button>" +
          '<button class="btn btn--ghost btn--sm" data-del="' + r.id + '" style="color:var(--rojo)"><i class="bi bi-trash3"></i></button></td></tr>';
      }).join("") + (lista.length ? "" : '<tr><td colspan="5" class="empty">Sin reseñas en este filtro</td></tr>') + "</tbody></table></div>";
    var sel = $("#filtro-resenas");
    if (sel) { sel.value = filtro; sel.onchange = function () { pintarResenas(sel.value); }; }
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
  var ESTADOS = ["PENDIENTE", "PAGADO", "ENVIADO", "ENTREGADO", "CANCELADO"];
  async function renderPedidos() {
    var cont = $("#contenido");
    try {
      pedidosCache = await supa("GET", "/rest/v1/Pedido?select=*&order=creadoEn.desc");
      pintarPedidos("TODOS");
    } catch (e) { cont.innerHTML = errCard(e); }
  }
  function pintarPedidos(filtro) {
    var cont = $("#contenido");
    var lista = filtro === "TODOS" ? pedidosCache : pedidosCache.filter(function (p) { return p.estado === filtro; });
    cont.innerHTML =
      '<div class="card"><div class="toolbar">' +
        '<span class="muted">Filtrar por estado:</span>' +
        '<select id="filtro-pedidos" style="width:auto">' +
          '<option value="TODOS">Todos</option>' + ESTADOS.map(function (e) { return '<option value="' + e + '">' + e + "</option>"; }).join("") +
        "</select>" +
      "</div>" +
      '<table><thead><tr><th>Pedido</th><th>Cliente</th><th>Total</th><th>Estado</th><th></th></tr></thead><tbody>' +
      lista.map(function (p) {
        var cls = p.estado === "ENTREGADO" ? "on" : (p.estado === "CANCELADO" ? "off" : (p.estado === "ENVIADO" ? "env" : "pend"));
        return "<tr><td><small class='muted'>#" + esc(String(p.id).slice(0, 8)) + "</small><br><b>" + fecha(p.creadoEn) + "</b></td>" +
          "<td>" + esc(p.cliente || "—") + "</td><td>" + money(p.total) + "</td>" +
          '<td><span class="badge badge--' + cls + '">' + esc(p.estado) + "</span></td>" +
          '<td class="actions"><button class="btn btn--ghost btn--sm" data-ver="' + p.id + '"><i class="bi bi-eye"></i></button></td></tr>';
      }).join("") + (lista.length ? "" : '<tr><td colspan="5" class="empty">Sin pedidos en este estado</td></tr>') + "</tbody></table></div>";
    var sel = $("#filtro-pedidos");
    if (sel) { sel.value = filtro; sel.onchange = function () { pintarPedidos(sel.value); }; }
    $$("[data-ver]", cont).forEach(function (b) { b.onclick = function () { verPedido(b.getAttribute("data-ver")); }; });
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
      pintarClientes("TODOS");
    } catch (e) { cont.innerHTML = errCard(e); }
  }
  function pintarClientes(filtro) {
    var cont = $("#contenido");
    var lista = filtro === "TODOS" ? clientesCache : clientesCache.filter(function (u) { return u.rol === filtro; });
    cont.innerHTML =
      '<div class="card"><div class="toolbar">' +
        '<button class="btn" id="btn-nuevo-cli"><i class="bi bi-plus-lg"></i> Nuevo cliente</button>' +
        '<span class="muted">Filtrar por rol:</span>' +
        '<select id="filtro-clientes" style="width:auto"><option value="TODOS">Todos</option>' + ROLES.map(function (r) { return '<option value="' + r + '">' + r + "</option>"; }).join("") + "</select>" +
      "</div>" +
      '<table><thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th></th></tr></thead><tbody>' +
      lista.map(function (u) {
        return "<tr><td><b>" + esc(u.nombre) + "</b></td><td>" + esc(u.email) + "</td><td><span class='tag'>" + esc(u.rol) + "</span></td>" +
          "<td>" + (u.activo ? '<span class="badge badge--on">Activo</span>' : '<span class="badge badge--off">Inactivo</span>') + "</td>" +
          '<td class="actions"><button class="btn btn--ghost btn--sm" data-edit="' + u.id + '"><i class="bi bi-pencil"></i></button>' +
          '<button class="btn btn--ghost btn--sm" data-del="' + u.id + '" style="color:var(--rojo)"><i class="bi bi-trash3"></i></button></td></tr>';
      }).join("") + "</tbody></table></div>";
    $("#btn-nuevo-cli").onclick = function () { formCliente(null); };
    var sel = $("#filtro-clientes");
    if (sel) { sel.value = filtro; sel.onchange = function () { pintarClientes(sel.value); }; }
    $$("[data-edit]", cont).forEach(function (b) { b.onclick = function () { formCliente(b.getAttribute("data-edit")); }; });
    $$("[data-del]", cont).forEach(function (b) {
      b.onclick = async function () {
        if (!confirm("¿Eliminar este usuario?")) return;
        try { await supa("DELETE", "/rest/v1/Usuario?id=eq." + b.getAttribute("data-del")); toast("Usuario eliminado"); renderClientes(); }
        catch (e) { toast(e.message, false); }
      };
    });
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
            return '<div class="ek-row" style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--linea)">' +
              '<i class="bi ' + (tipoIcono(b.tipo) || "bi-bounding-box") + '" style="font-size:1.2rem;color:var(--azul)"></i>' +
              '<div style="flex:1"><b>' + esc(tipoL(b.tipo)) + '</b><br><small class="muted">' + resumenBloque(b) + "</small></div>" +
              '<button class="btn btn--ghost btn--sm" data-subir="' + i + '"' + (i === 0 ? " disabled" : "") + '><i class="bi bi-arrow-up"></i></button>' +
              '<button class="btn btn--ghost btn--sm" data-bajar="' + i + '"' + (i === bloques.length - 1 ? " disabled" : "") + '><i class="bi bi-arrow-down"></i></button>' +
              '<button class="btn btn--ghost btn--sm" data-editar="' + i + '"><i class="bi bi-pencil"></i></button>' +
              '<button class="btn btn--ghost btn--sm" data-del-bloque="' + i + '" style="color:var(--rojo)"><i class="bi bi-trash3"></i></button>' +
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
      '<div class="modal__ft"><button type="button" class="btn btn--ghost" data-cerrar>Cancelar</button><button class="btn btn--rojo" type="submit">Guardar bloque</button></div></form>';
    modal((editando ? "Editar bloque · " : "Nuevo bloque · ") + tipoL(b.tipo), body);
    $("#f-bloque").addEventListener("submit", function (e) {
      e.preventDefault();
      var f = new FormData(e.target);
      var conf = {};
      if (b.tipo === "hero") conf = { etiqueta: f.get("etiqueta") || null, titulo: f.get("titulo"), subtitulo: f.get("subtitulo") || null, boton: f.get("boton") || null, enlace: f.get("enlace") || null, tema: f.get("tema"), imagen: f.get("imagen") || null };
      if (b.tipo === "productos") conf = { titulo: f.get("titulo") || "Destacados", categoria: f.get("categoria") || null, subcategoria: f.get("subcategoria") || null, limite: Number(f.get("limite")) || 8 };
      if (b.tipo === "categorias") conf = { titulo: f.get("titulo") || "Categorías", grupo: f.get("grupo"), limite: Number(f.get("limite")) || 10 };
      if (b.tipo === "texto") conf = { titulo: f.get("titulo") || null, contenido: f.get("contenido") || "" };
      if (b.tipo === "promo") conf = { titulo: f.get("titulo"), subtitulo: f.get("subtitulo") || null, boton: f.get("boton") || null, enlace: f.get("enlace") || null, tema: f.get("tema") };
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
