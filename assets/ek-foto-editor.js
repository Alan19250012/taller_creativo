/* ============================================================================
   TALLER CREATIVO EK · Editor de fotos del cliente (assets/ek-foto-editor.js)
   ----------------------------------------------------------------------------
   Modal de edición de imagen antes de confirmar:
     · Recorte arrastrando un rectángulo (aspecto libre).
     · Zoom (slider) y rotación (botones ±90°).
     · Filtros rápidos: Original · Blanco y negro · Vintage.
     · "Done" procesa y devuelve la imagen (dataURL) lista para la vista previa.
   Uso: window.EK_FotoEditor(archivo, function(dataURL){ ... });
   ========================================================================== */
(function () {
  "use strict";

  function estilos() {
    if (document.getElementById("ek-foto-editor-css")) return;
    var st = document.createElement("style");
    st.id = "ek-foto-editor-css";
    st.textContent =
      ".ekfe{position:fixed;inset:0;background:rgba(10,14,30,.82);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px}" +
      ".ekfe-box{background:#fff;border-radius:16px;padding:20px;width:100%;max-width:720px;box-shadow:0 30px 80px rgba(0,0,0,.5)}" +
      ".ekfe-box h4{margin:0 0 12px}" +
      ".ekfe-stage{position:relative;background:#0b0e1a;border-radius:12px;overflow:hidden;max-height:56vh;display:flex;align-items:center;justify-content:center}" +
      ".ekfe-stage canvas{display:block;max-width:100%;max-height:56vh}" +
      ".ekfe-crop{position:absolute;border:2px dashed #fff;box-shadow:0 0 0 9999px rgba(0,0,0,.55);cursor:move;box-sizing:border-box}" +
      ".ekfe-crop .h{position:absolute;right:-8px;bottom:-8px;width:16px;height:16px;background:#fff;border-radius:50%;cursor:se-resize}" +
      ".ekfe-ctrl{display:flex;gap:14px;flex-wrap:wrap;align-items:center;margin-top:14px}" +
      ".ekfe-ctrl label{font-size:.8rem;font-weight:700;color:#374151}" +
      ".ekfe-ctrl input[type=range]{width:140px}" +
      ".ekfe-btn{border:0;cursor:pointer;padding:8px 12px;border-radius:8px;font-weight:700;font:inherit;background:#eef0f5;color:#1c2333}" +
      ".ekfe-btn.is-on{background:#244093;color:#fff}" +
      ".ekfe-done{margin-left:auto;background:#DA1D2A;color:#fff;padding:10px 18px;border:0;border-radius:9px;font-weight:700;cursor:pointer;font:inherit}";
    document.head.appendChild(st);
  }

  window.EK_FotoEditor = function (archivo, onDone) {
    estilos();
    var rotacion = 0, zoom = 1, filtro = "original";
    var crop = null; // {x,y,w,h} en px dentro del canvas

    var overlay = document.createElement("div");
    overlay.className = "ekfe";
    overlay.innerHTML = '<div class="ekfe-box">' +
      '<h4>✂️ Edita tu foto</h4>' +
      '<div class="ekfe-stage"><canvas></canvas><div class="ekfe-crop" style="display:none"><div class="h"></div></div></div>' +
      '<div class="ekfe-ctrl">' +
        '<button type="button" class="ekfe-btn" data-rot="-90"><i class="bi bi-arrow-counterclockwise"></i> Girar</button>' +
        '<button type="button" class="ekfe-btn" data-rot="90"><i class="bi bi-arrow-clockwise"></i> Girar</button>' +
        '<label>Zoom</label><input type="range" min="0.5" max="3" step="0.1" value="1" data-zoom>' +
        '<button type="button" class="ekfe-btn" data-filtro="original">Original</button>' +
        '<button type="button" class="ekfe-btn" data-filtro="bn">B/N</button>' +
        '<button type="button" class="ekfe-btn" data-filtro="vintage">Vintage</button>' +
        '<button type="button" class="ekfe-done" data-done>Done</button>' +
      '</div></div>';
    document.body.appendChild(overlay);

    var stage = overlay.querySelector(".ekfe-stage");
    var canvas = overlay.querySelector("canvas");
    var ctx = canvas.getContext("2d");
    var cropEl = overlay.querySelector(".ekfe-crop");
    var img = new Image();

    function dims() {
      var r = (rotacion % 180) !== 0;
      var w = r ? img.naturalHeight : img.naturalWidth;
      var h = r ? img.naturalWidth : img.naturalHeight;
      return { w: w * zoom, h: h * zoom };
    }

    function pintar() {
      var d = dims();
      canvas.width = d.w; canvas.height = d.h;
      ctx.save();
      ctx.filter = filtro === "bn" ? "grayscale(1)" : (filtro === "vintage" ? "sepia(.5) saturate(.7)" : "none");
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rotacion * Math.PI / 180);
      ctx.scale(zoom, zoom);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      ctx.restore();
      ctx.filter = "none";
    }

    img.onload = function () {
      pintar();
      var d = dims();
      crop = { x: d.w * 0.1, y: d.h * 0.1, w: d.w * 0.8, h: d.h * 0.8 };
      posicionarCrop();
      cropEl.style.display = "";
    };
    img.src = URL.createObjectURL(archivo);

    function posicionarCrop() {
      cropEl.style.left = crop.x + "px";
      cropEl.style.top = crop.y + "px";
      cropEl.style.width = crop.w + "px";
      cropEl.style.height = crop.h + "px";
    }

    // Mover y redimensionar el rectángulo de recorte
    var arrastrando = false, modo = "";
    cropEl.addEventListener("mousedown", function (e) {
      if (e.target.classList.contains("h")) modo = "resize"; else modo = "move";
      arrastrando = true; e.preventDefault();
      var x0 = e.clientX, y0 = e.clientY, c0 = { x: crop.x, y: crop.y, w: crop.w, h: crop.h };
      function mover(ev) {
        var dx = ev.clientX - x0, dy = ev.clientY - y0, d = dims();
        if (modo === "move") { crop.x = Math.max(0, Math.min(d.w - crop.w, c0.x + dx)); crop.y = Math.max(0, Math.min(d.h - crop.h, c0.y + dy)); }
        else { crop.w = Math.max(40, Math.min(d.w - crop.x, c0.w + dx)); crop.h = Math.max(40, Math.min(d.h - crop.y, c0.h + dy)); }
        posicionarCrop();
      }
      function soltar() { arrastrando = false; document.removeEventListener("mousemove", mover); document.removeEventListener("mouseup", soltar); }
      document.addEventListener("mousemove", mover);
      document.addEventListener("mouseup", soltar);
    });

    overlay.addEventListener("click", function (e) {
      var t = e.target;
      if (t.hasAttribute("data-rot")) { rotacion = (rotacion + (+t.getAttribute("data-rot")) + 360) % 360; pintar(); posicionarCrop(); }
      else if (t.hasAttribute("data-filtro")) { filtro = t.getAttribute("data-filtro"); overlay.querySelectorAll("[data-filtro]").forEach(function (b) { b.classList.toggle("is-on", b === t); }); pintar(); }
      else if (t.hasAttribute("data-done")) { procesar(); }
      else if (t === overlay) { overlay.remove(); }
    });
    overlay.querySelector("[data-zoom]").addEventListener("input", function () { zoom = +this.value; pintar(); posicionarCrop(); });

    function procesar() {
      if (!crop) return;
      var out = document.createElement("canvas");
      out.width = Math.round(crop.w); out.height = Math.round(crop.h);
      var c = out.getContext("2d");
      c.filter = filtro === "bn" ? "grayscale(1)" : (filtro === "vintage" ? "sepia(.5) saturate(.7)" : "none");
      c.translate(out.width / 2, out.height / 2);
      c.rotate(rotacion * Math.PI / 180);
      c.scale(zoom, zoom);
      c.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      c.filter = "none";
      // Ajuste fino: como el crop está en coordenadas del canvas, trasladamos el recorte
      var out2 = document.createElement("canvas");
      out2.width = out.width; out2.height = out.height;
      var c2 = out2.getContext("2d");
      c2.drawImage(out, -(crop.x), -(crop.y));
      overlay.remove();
      if (onDone) onDone(out2.toDataURL("image/png"));
    }
  };
})();
