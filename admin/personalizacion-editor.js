/* ============================================================================
   TALLER CREATIVO EK · Editor de personalización (admin/personalizacion-editor.js)
   ----------------------------------------------------------------------------
   Componente vanilla JS para el panel. Une en un solo lugar:
     · La imagen personalizable base (sin texto) del producto.
     · La lista de campos dinámicos (texto / texto multilínea / fuente / foto).
     · El posicionamiento VISUAL de cada campo sobre la imagen (área en %).
     · La forma de la foto del cliente (cuadrada o redonda).

   Cada campo "texto"/"textarea"/"foto" se dibuja como una caja arrastrable
   sobre la imagen base; su posición se guarda en campo.area = {x,y,width,height}
   (porcentajes). El campo "select" es el selector de fuente y NO se posiciona.

   API:
     var ed = window.PersonalizacionEditor({ container, campos, imagen });
     ed.getCampos()  → [{tipo,label,max,opciones,obligatorio,area,forma}, …]
     ed.getImagen()  → URL de la imagen personalizable base
   ========================================================================== */
(function () {
  "use strict";

  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"']/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]; }); }

  function inyectarEstilos() {
    if (document.getElementById("pe-css")) return;
    var st = document.createElement("style");
    st.id = "pe-css";
    st.textContent =
      ".pe-head{display:flex;align-items:center;gap:12px;margin-bottom:10px}" +
      ".pe-help{font-size:.82rem;color:var(--gris,#6b7280);margin:0 0 12px}" +
      ".pe-grid{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:16px;align-items:start}" +
      ".pe-stage{position:relative;border:1px solid var(--linea,#e5e7eb);border-radius:8px;background:#f9fafb;overflow:auto;min-height:180px}" +
      ".pe-stage .pe-img-el{display:block;max-width:100%;height:auto;user-select:none;-webkit-user-drag:none}" +
      ".pe-stage .pe-empty{position:absolute;inset:0;display:grid;place-items:center;color:#9ca3af;font-size:.85rem;padding:20px;text-align:center}" +
      ".pe-box{position:absolute;border:2px dashed;box-sizing:border-box;cursor:move;min-width:24px;min-height:24px}" +
      ".pe-box__shape{position:absolute;opacity:.3;pointer-events:none}" +
      ".pe-box__label{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);color:#fff;font-size:.72rem;font-weight:700;text-shadow:0 1px 2px rgba(0,0,0,.65);pointer-events:none;white-space:nowrap;max-width:92%;overflow:hidden;text-overflow:ellipsis}" +
      ".pe-box__handle{position:absolute;right:-7px;bottom:-7px;width:14px;height:14px;background:#DA1D2A;border:2px solid #fff;border-radius:50%;cursor:se-resize}" +
      ".pe-list{display:flex;flex-direction:column;gap:8px}" +
      ".pe-card{border:1px solid var(--linea,#e5e7eb);border-radius:8px;padding:10px;background:#fff}" +
      ".pe-card__top{display:flex;align-items:center;gap:6px;margin-bottom:6px}" +
      ".pe-dot{width:12px;height:12px;border-radius:50%;flex-shrink:0}" +
      ".pe-card__top select{flex:1;padding:7px 8px;border:1px solid var(--linea,#e5e7eb);border-radius:7px;font:inherit}" +
      ".pe-quitar{border:0;background:#fff;color:var(--rojo,#DA1D2A);cursor:pointer;font-size:1rem;padding:2px 6px;border-radius:6px}" +
      ".pe-quitar:hover{background:#fef2f2}" +
      ".pe-label,.pe-max,.pe-opciones{width:100%;padding:8px 10px;border:1px solid var(--linea,#e5e7eb);border-radius:8px;font:inherit;margin-bottom:6px}" +
      ".pe-extra{margin-bottom:4px}" +
      ".pe-ob{display:flex;align-items:center;gap:6px;font-size:.82rem;font-weight:600}" +
      ".pe-forma{display:flex;align-items:center;gap:6px;font-size:.8rem;margin-top:6px}" +
      ".pe-forma-sel{padding:4px 6px;border:1px solid var(--linea,#e5e7eb);border-radius:6px}" +
      ".pe-note{font-size:.74rem;color:var(--gris,#6b7280);margin-top:4px}" +
      ".pe-add{margin-top:4px}" +
      "@media(max-width:900px){.pe-grid{grid-template-columns:1fr}}";
    document.head.appendChild(st);
  }

  window.PersonalizacionEditor = function (opts) {
    inyectarEstilos();
    var cont = opts.container;
    var imagen = opts.imagen || "";
    var TIPOS = [
      { v: "texto", l: "Texto (1 línea)" },
      { v: "textarea", l: "Texto multilínea" },
      { v: "select", l: "Selector de fuente" },
      { v: "foto", l: "Foto del cliente" },
    ];
    var COLORES = ["#DA1D2A", "#244093", "#16a34a", "#d97706", "#7c3aed", "#0891b2", "#db2777", "#65a30d"];

    function normalizar(c) {
      return {
        tipo: c.tipo || "texto",
        label: c.label || "",
        max: c.max != null ? c.max : "",
        opciones: (c.opciones || []).join(", "),
        obligatorio: !!c.obligatorio,
        area: c.area || null,
        forma: c.forma || "cuadrada",
      };
    }
    var lista = (opts.campos || []).map(normalizar);
    var boxes = {};

    function colorDe(i) { return COLORES[i % COLORES.length]; }
    function sePosiciona(c) { return c.tipo === "texto" || c.tipo === "textarea" || c.tipo === "foto"; }
    function areaPorDefecto(i) {
      var ox = (i % 4) * 6, oy = (i % 4) * 5;
      return { x: 20 + ox, y: 20 + oy, width: 36, height: 16 };
    }
    function imgEl() { return cont.querySelector(".pe-img-el"); }
    function imgSize() {
      var el = imgEl();
      return { w: (el && (el.clientWidth || el.naturalWidth)) || 0, h: (el && (el.clientHeight || el.naturalHeight)) || 0 };
    }
    function round1(n) { return Math.round(n * 10) / 10; }

    function posicionarBox(i) {
      var c = lista[i], box = boxes[i];
      if (!box || !c.area) return;
      var s = imgSize();
      if (!s.w || !s.h) return;
      var px = c.area.x / 100 * s.w, py = c.area.y / 100 * s.h;
      var pw = c.area.width / 100 * s.w, ph = c.area.height / 100 * s.h;
      box.style.left = px + "px";
      box.style.top = py + "px";
      box.style.width = pw + "px";
      box.style.height = ph + "px";
      var shape = box.querySelector(".pe-box__shape");
      if (shape) {
        if (c.forma === "redonda") {
          var d = Math.min(pw, ph);
          shape.style.width = d + "px";
          shape.style.height = d + "px";
          shape.style.left = ((pw - d) / 2) + "px";
          shape.style.top = ((ph - d) / 2) + "px";
          shape.style.borderRadius = "50%";
        } else {
          shape.style.width = "100%";
          shape.style.height = "100%";
          shape.style.left = "0";
          shape.style.top = "0";
          shape.style.borderRadius = "4px";
        }
      }
      var lbl = box.querySelector(".pe-box__label");
      if (lbl) lbl.textContent = c.label || ("Campo " + (i + 1));
    }

    function hacerArrastrable(box, i) {
      var handle = box.querySelector(".pe-box__handle");
      function aPix() {
        var s = imgSize(), a = lista[i].area;
        return { x: a.x / 100 * s.w, y: a.y / 100 * s.h, w: a.width / 100 * s.w, h: a.height / 100 * s.h, W: s.w, H: s.h };
      }
      function guardarPx(p) {
        lista[i].area = {
          x: round1(p.x / p.W * 100), y: round1(p.y / p.H * 100),
          width: round1(p.w / p.W * 100), height: round1(p.h / p.H * 100),
        };
      }
      box.addEventListener("mousedown", function (e) {
        if (e.target === handle) return;
        e.preventDefault();
        var p = aPix(), iniX = e.clientX, iniY = e.clientY, ox = p.x, oy = p.y;
        function mover(ev) {
          var nx = Math.max(0, Math.min(p.W - p.w, ox + (ev.clientX - iniX)));
          var ny = Math.max(0, Math.min(p.H - p.h, oy + (ev.clientY - iniY)));
          guardarPx({ x: nx, y: ny, w: p.w, h: p.h, W: p.W, H: p.H });
          posicionarBox(i);
        }
        function soltar() { document.removeEventListener("mousemove", mover); document.removeEventListener("mouseup", soltar); }
        document.addEventListener("mousemove", mover);
        document.addEventListener("mouseup", soltar);
      });
      handle.addEventListener("mousedown", function (e) {
        e.preventDefault(); e.stopPropagation();
        var p = aPix(), iniX = e.clientX, iniY = e.clientY, ow = p.w, oh = p.h;
        function redim(ev) {
          var nw = Math.max(16, Math.min(p.W - p.x, ow + (ev.clientX - iniX)));
          var nh = Math.max(16, Math.min(p.H - p.y, oh + (ev.clientY - iniY)));
          guardarPx({ x: p.x, y: p.y, w: nw, h: nh, W: p.W, H: p.H });
          posicionarBox(i);
        }
        function soltar() { document.removeEventListener("mousemove", redim); document.removeEventListener("mouseup", soltar); }
        document.addEventListener("mousemove", redim);
        document.addEventListener("mouseup", soltar);
      });
    }

    function renderBoxes() {
      var stage = cont.querySelector(".pe-stage");
      if (!stage) return;
      stage.querySelectorAll(".pe-box").forEach(function (b) { b.remove(); });
      boxes = {};
      lista.forEach(function (c, i) {
        if (!sePosiciona(c)) return;
        if (!c.area) c.area = areaPorDefecto(i);
        var box = document.createElement("div");
        box.className = "pe-box";
        box.setAttribute("data-i", i);
        box.style.borderColor = colorDe(i);
        box.innerHTML =
          '<div class="pe-box__shape" style="background:' + colorDe(i) + '"></div>' +
          '<span class="pe-box__label">' + esc(c.label || ("Campo " + (i + 1))) + '</span>' +
          '<div class="pe-box__handle"></div>';
        stage.appendChild(box);
        boxes[i] = box;
        hacerArrastrable(box, i);
        posicionarBox(i);
      });
    }

    function setImagen(url) {
      imagen = url || "";
      var el = imgEl();
      var thumb = cont.querySelector(".pe-thumb");
      var vacio = cont.querySelector(".pe-empty");
      if (el) {
        el.onload = function () { if (vacio) vacio.style.display = "none"; renderBoxes(); };
        if (imagen) el.src = imagen; else el.removeAttribute("src");
      }
      if (thumb) { if (imagen) { thumb.src = imagen; thumb.style.display = ""; } else { thumb.style.display = "none"; } }
      if (vacio) vacio.style.display = imagen ? "none" : "";
      if (!imagen) renderBoxes();
    }

    function cardHTML(c, i) {
      var extra = "";
      if (c.tipo === "texto" || c.tipo === "textarea") extra = '<input class="pe-max" placeholder="Máx. caracteres (vacío = sin límite)" value="' + esc(c.max) + '">';
      else if (c.tipo === "select") extra = '<input class="pe-opciones" placeholder="Fuentes separadas por coma (ej. Block, Script)" value="' + esc(c.opciones) + '">';
      var nota = c.tipo === "select" ? '<div class="pe-note">Este selector define la fuente del texto (no se posiciona sobre la imagen).</div>' : "";
      var forma = c.tipo === "foto"
        ? '<label class="pe-forma">Forma de la foto: <select class="pe-forma-sel"><option value="cuadrada"' + (c.forma !== "redonda" ? " selected" : "") + '>Cuadrada</option><option value="redonda"' + (c.forma === "redonda" ? " selected" : "") + '>Redonda</option></select></label>'
        : "";
      return '<div class="pe-card" data-i="' + i + '">' +
        '<div class="pe-card__top">' +
          '<span class="pe-dot" style="background:' + colorDe(i) + '"></span>' +
          '<select class="pe-tipo">' + TIPOS.map(function (t) { return '<option value="' + t.v + '"' + (c.tipo === t.v ? " selected" : "") + '>' + t.l + '</option>'; }).join("") + '</select>' +
          '<button type="button" class="pe-quitar" title="Quitar campo">✕</button>' +
        '</div>' +
        '<input class="pe-label" placeholder="Etiqueta visible al cliente" value="' + esc(c.label) + '">' +
        '<div class="pe-extra">' + extra + '</div>' +
        '<label class="pe-ob"><input type="checkbox" class="pe-obl"' + (c.obligatorio ? " checked" : "") + '> Obligatorio (*)</label>' +
        forma + nota +
      '</div>';
    }

    function pintar() {
      cont.innerHTML =
        '<div class="pe-head">' +
          '<button type="button" class="btn btn--sm btn--ghost pe-subir"><i class="bi bi-upload"></i> Subir imagen base (sin texto)</button>' +
          '<input type="file" class="pe-file" accept="image/*" hidden>' +
          '<img class="pe-thumb" style="display:none;max-height:64px;border-radius:8px;border:1px solid var(--linea)" alt="">' +
        '</div>' +
        '<p class="pe-help">Arrastra cada caja de color sobre la imagen para ubicar cada campo de texto y el lugar de la foto del cliente. Arrastra la esquina roja para cambiar el tamaño. El "selector de fuente" no se posiciona.</p>' +
        '<div class="pe-grid">' +
          '<div class="pe-stage"><img class="pe-img-el" alt="Imagen personalizable">' +
            (imagen ? "" : '<div class="pe-empty">Sube una imagen personalizable (sin texto) para posicionar los campos aquí.</div>') +
          '</div>' +
          '<div class="pe-list">' + lista.map(cardHTML).join("") +
            '<button type="button" class="btn btn--sm btn--ghost pe-add"><i class="bi bi-plus-lg"></i> Agregar campo</button>' +
          '</div>' +
        '</div>';
      setImagen(imagen);
    }

    function subirImagen(file) {
      if (!file) return;
      var lector = new FileReader();
      lector.onload = async function () {
        try {
          var res = await fetch("/api/upload", {
            method: "POST",
            headers: { "content-type": "application/json", authorization: "Bearer " + (localStorage.getItem("ek_admin_token") || "") },
            body: JSON.stringify({ base64: lector.result, nombre: file.name, tipo: "personalizacion" }),
          });
          var d = await res.json();
          if (d.ok && d.url) setImagen(d.url);
          else window.alert(d.error || "Error al subir la imagen");
        } catch (e) { window.alert("Error de conexión al subir la imagen"); }
      };
      lector.readAsDataURL(file);
    }

    // --- Eventos ---
    cont.addEventListener("input", function (e) {
      var card = e.target.closest(".pe-card");
      if (!card) return;
      var i = +card.getAttribute("data-i"), c = lista[i];
      if (e.target.classList.contains("pe-label")) {
        c.label = e.target.value;
        var lbl = boxes[i] && boxes[i].querySelector(".pe-box__label");
        if (lbl) lbl.textContent = c.label || ("Campo " + (i + 1));
      } else if (e.target.classList.contains("pe-max")) c.max = e.target.value;
      else if (e.target.classList.contains("pe-opciones")) c.opciones = e.target.value;
      else if (e.target.classList.contains("pe-obl")) c.obligatorio = e.target.checked;
    });
    cont.addEventListener("change", function (e) {
      var sel = e.target.closest(".pe-tipo");
      if (sel) {
        var card = sel.closest(".pe-card");
        var i = +card.getAttribute("data-i");
        lista[i].tipo = sel.value;
        if (sePosiciona(lista[i]) && !lista[i].area) lista[i].area = areaPorDefecto(i);
        pintar();
        return;
      }
      var fs = e.target.closest(".pe-forma-sel");
      if (fs) {
        var card2 = fs.closest(".pe-card");
        var j = +card2.getAttribute("data-i");
        lista[j].forma = fs.value;
        posicionarBox(j);
        return;
      }
      var fil = e.target.closest(".pe-file");
      if (fil && fil.files[0]) { subirImagen(fil.files[0]); fil.value = ""; }
    });
    cont.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      if (b.classList.contains("pe-add")) { lista.push(normalizar({ tipo: "texto" })); pintar(); }
      else if (b.classList.contains("pe-quitar")) { var card = b.closest(".pe-card"); lista.splice(+card.getAttribute("data-i"), 1); pintar(); }
      else if (b.classList.contains("pe-subir")) { cont.querySelector(".pe-file").click(); }
    });

    pintar();

    return {
      getCampos: function () {
        return lista.filter(function (c) { return c.label; }).map(function (c) {
          var out = { tipo: c.tipo, label: c.label, obligatorio: !!c.obligatorio };
          if (c.tipo === "texto" || c.tipo === "textarea") out.max = c.max ? Number(c.max) : null;
          if (c.tipo === "select") out.opciones = String(c.opciones || "").split(",").map(function (x) { return x.trim(); }).filter(Boolean);
          if (sePosiciona(c) && c.area) out.area = c.area;
          if (c.tipo === "foto") out.forma = c.forma || "cuadrada";
          return out;
        });
      },
      getImagen: function () { return imagen; },
      setImagen: setImagen,
      refrescar: function () { renderBoxes(); },
    };
  };
})();
