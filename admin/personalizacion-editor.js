/* ============================================================================
   TALLER CREATIVO EK · Posicionador de personalización por variante
   (admin/personalizacion-editor.js)
   ----------------------------------------------------------------------------
   Componente vanilla JS. Dibuja la imagen personalizable (en blanco) de UNA
   variante y una caja arrastrable por cada campo posicionable (texto /
   texto multilínea / foto). La foto se dibuja como círculo si su forma es
   "redonda". Guarda las áreas en un array PARALELO a la lista de campos del
   producto.

   API:
     var pos = window.PosicionadorPersonalizacion({
       container, campos, imagen, areas,
       onImagen: function (url) { … }   // avisa cuando se sube la imagen
     });
     pos.getAreas()          → [ {x,y,width,height}|null, … ]  (paralelo a campos)
     pos.setCampos(campos, areas)  → actualiza campos/áreas y re-dibuja las cajas
     pos.setImagen(url)
     pos.refrescar()
   ========================================================================== */
(function () {
  "use strict";

  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"']/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]; }); }

  function inyectarEstilos() {
    if (document.getElementById("pos-css")) return;
    var st = document.createElement("style");
    st.id = "pos-css";
    st.textContent =
      ".pos-head{display:flex;align-items:center;gap:10px;margin-bottom:8px}" +
      ".pos-help{font-size:.78rem;color:var(--gris,#6b7280);margin:0 0 8px}" +
      ".pos-stage{position:relative;border:1px solid var(--linea,#e5e7eb);border-radius:8px;background:#f9fafb;overflow:auto;min-height:160px}" +
      ".pos-stage .pos-img-el{display:block;max-width:100%;height:auto;user-select:none;-webkit-user-drag:none}" +
      ".pos-stage .pos-empty{position:absolute;inset:0;display:grid;place-items:center;color:#9ca3af;font-size:.82rem;padding:16px;text-align:center}" +
      ".pos-box{position:absolute;border:2px dashed;box-sizing:border-box;cursor:move;min-width:24px;min-height:24px}" +
      ".pos-box__shape{position:absolute;opacity:.3;pointer-events:none}" +
      ".pos-box__label{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);color:#fff;font-size:.7rem;font-weight:700;text-shadow:0 1px 2px rgba(0,0,0,.65);pointer-events:none;white-space:nowrap;max-width:92%;overflow:hidden;text-overflow:ellipsis}" +
      ".pos-box__handle{position:absolute;right:-7px;bottom:-7px;width:14px;height:14px;background:#DA1D2A;border:2px solid #fff;border-radius:50%;cursor:se-resize}";
    document.head.appendChild(st);
  }

  window.PosicionadorPersonalizacion = function (opts) {
    inyectarEstilos();
    var cont = opts.container;
    var campos = (opts.campos || []).slice();
    var imagen = opts.imagen || "";
    var areas = (opts.areas || []).slice();
    var onImagen = opts.onImagen || function () {};
    var boxes = {};

    var COLORES = ["#DA1D2A", "#244093", "#16a34a", "#d97706", "#7c3aed", "#0891b2", "#db2777", "#65a30d"];
    function colorDe(i) { return COLORES[i % COLORES.length]; }
    function sePosiciona(c) { return c.tipo === "texto" || c.tipo === "textarea" || c.tipo === "foto"; }
    function areaPorDefecto(i) {
      var ox = (i % 4) * 6, oy = (i % 4) * 5;
      return { x: 20 + ox, y: 20 + oy, width: 36, height: 16 };
    }
    function imgEl() { return cont.querySelector(".pos-img-el"); }
    function imgSize() {
      var el = imgEl();
      return { w: (el && (el.clientWidth || el.naturalWidth)) || 0, h: (el && (el.clientHeight || el.naturalHeight)) || 0 };
    }
    function round1(n) { return Math.round(n * 10) / 10; }

    function posicionarBox(i) {
      var box = boxes[i], area = areas[i];
      if (!box || !area) return;
      var s = imgSize();
      if (!s.w || !s.h) return;
      var px = area.x / 100 * s.w, py = area.y / 100 * s.h;
      var pw = area.width / 100 * s.w, ph = area.height / 100 * s.h;
      box.style.left = px + "px";
      box.style.top = py + "px";
      box.style.width = pw + "px";
      box.style.height = ph + "px";
      var shape = box.querySelector(".pos-box__shape");
      var c = campos[i] || {};
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
      var lbl = box.querySelector(".pos-box__label");
      if (lbl) lbl.textContent = c.label || ("Campo " + (i + 1));
    }

    function hacerArrastrable(box, i) {
      var handle = box.querySelector(".pos-box__handle");
      function aPix() {
        var s = imgSize(), a = areas[i];
        return { x: a.x / 100 * s.w, y: a.y / 100 * s.h, w: a.width / 100 * s.w, h: a.height / 100 * s.h, W: s.w, H: s.h };
      }
      function guardarPx(p) {
        areas[i] = {
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
      var stage = cont.querySelector(".pos-stage");
      if (!stage) return;
      stage.querySelectorAll(".pos-box").forEach(function (b) { b.remove(); });
      boxes = {};
      campos.forEach(function (c, i) {
        if (!sePosiciona(c)) { areas[i] = null; return; }
        if (!areas[i]) areas[i] = areaPorDefecto(i);
        var box = document.createElement("div");
        box.className = "pos-box";
        box.setAttribute("data-i", i);
        box.style.borderColor = colorDe(i);
        box.innerHTML =
          '<div class="pos-box__shape" style="background:' + colorDe(i) + '"></div>' +
          '<span class="pos-box__label">' + esc(c.label || ("Campo " + (i + 1))) + '</span>' +
          '<div class="pos-box__handle"></div>';
        stage.appendChild(box);
        boxes[i] = box;
        hacerArrastrable(box, i);
        posicionarBox(i);
      });
    }

    function setImagen(url) {
      imagen = url || "";
      var el = imgEl();
      var thumb = cont.querySelector(".pos-thumb");
      var vacio = cont.querySelector(".pos-empty");
      if (el) {
        el.onload = function () { if (vacio) vacio.style.display = "none"; renderBoxes(); };
        if (imagen) el.src = imagen; else el.removeAttribute("src");
      }
      if (thumb) { if (imagen) { thumb.src = imagen; thumb.style.display = ""; } else { thumb.style.display = "none"; } }
      if (vacio) vacio.style.display = imagen ? "none" : "";
      if (!imagen) renderBoxes();
    }

    function pintar() {
      cont.innerHTML =
        '<div class="pos-head">' +
          '<button type="button" class="btn btn--sm btn--ghost pos-subir"><i class="bi bi-upload"></i> Imagen personalizable</button>' +
          '<input type="file" class="pos-file" accept="image/*" hidden>' +
          '<img class="pos-thumb" style="display:none;max-height:48px;border-radius:8px;border:1px solid var(--linea)" alt="">' +
        '</div>' +
        '<p class="pos-help">Arrastra cada caja sobre la imagen para ubicar cada campo de texto o el lugar de la foto. La esquina roja cambia el tamaño.</p>' +
        '<div class="pos-stage"><img class="pos-img-el" alt="Imagen personalizable">' +
          (imagen ? "" : '<div class="pos-empty">Sube la imagen en blanco de esta variante para posicionar los campos.</div>') +
        '</div>';
      setImagen(imagen);
    }

    function subir(file) {
      if (!file) return;
      var lector = new FileReader();
      lector.onload = async function () {
        try {
          var res = await fetch("/api/upload", {
            method: "POST",
            headers: { "content-type": "application/json", authorization: "Bearer " + (localStorage.getItem("ek_admin_token") || "") },
            body: JSON.stringify({ base64: lector.result, nombre: file.name, tipo: "variantes" }),
          });
          var d = await res.json();
          if (d.ok && d.url) { setImagen(d.url); onImagen(d.url); }
          else window.alert(d.error || "Error al subir la imagen");
        } catch (e) { window.alert("Error de conexión al subir la imagen"); }
      };
      lector.readAsDataURL(file);
    }

    cont.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (b && b.classList.contains("pos-subir")) cont.querySelector(".pos-file").click();
    });
    cont.addEventListener("change", function (e) {
      var f = e.target.closest(".pos-file");
      if (f && f.files[0]) { subir(f.files[0]); f.value = ""; }
    });

    pintar();

    return {
      getAreas: function () { return areas.slice(); },
      setImagen: setImagen,
      setCampos: function (nuevosCampos, nuevasAreas) {
        campos = (nuevosCampos || []).slice();
        areas = (nuevasAreas || []).slice();
        renderBoxes();
      },
      refrescar: function () { renderBoxes(); },
    };
  };
})();
