/* ============================================================================
   TALLER CREATIVO EK · Editor de fotos del cliente (assets/ek-foto-editor.js)
   ----------------------------------------------------------------------------
   Modal de edición de imagen antes de confirmar:
     · Recorte arrastrando un rectángulo (aspecto libre).
     · Zoom (slider) y rotación (botones ±90°).
     · Filtros rápidos: Original · Blanco y negro · Vintage.
     · "Done" procesa y devuelve la imagen (dataURL) lista para la vista previa.
   ----------------------------------------------------------------------------
   Fix del zoom: el lienzo mantiene un tamaño fijo (ajustado a la ventana) y el
   zoom escala la imagen DENTRO de ese lienzo, de modo que el recorte siempre
   coincide 1:1 con lo que se ve y el zoom sí se aprecia en la vista de edición.
   Uso: window.EK_FotoEditor(archivo, function(dataURL){ ... });
   ========================================================================== */
(function () {
  "use strict";

  function estilos() {
    if (document.getElementById("ek-foto-editor-css")) return;
    var st = document.createElement("style");
    st.id = "ek-foto-editor-css";
    st.textContent =
      ".ekfe{position:fixed;inset:0;background:rgba(10,14,30,.82);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;overflow:auto}" +
      ".ekfe-box{background:#fff;border-radius:16px;padding:20px;width:100%;max-width:720px;box-shadow:0 30px 80px rgba(0,0,0,.5)}" +
      ".ekfe-box h4{margin:0 0 12px}" +
      ".ekfe-stage{position:relative;background:#0b0e1a;border-radius:12px;overflow:hidden;text-align:center}" +
      ".ekfe-wrap{position:relative;display:inline-block;line-height:0}" +
      ".ekfe-wrap canvas{display:block}" +
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
    var crop = null; // {x,y,w,h} en px del lienzo (área visible)

    var overlay = document.createElement("div");
    overlay.className = "ekfe";
    overlay.innerHTML = '<div class="ekfe-box">' +
      '<h4>✂️ Edita tu foto</h4>' +
      '<div class="ekfe-stage"><div class="ekfe-wrap"><canvas></canvas><div class="ekfe-crop" style="display:none"><div class="h"></div></div></div></div>' +
      '<div class="ekfe-ctrl">' +
        '<button type="button" class="ekfe-btn" data-rot="-90"><i class="bi bi-arrow-counterclockwise"></i> Girar</button>' +
        '<button type="button" class="ekfe-btn" data-rot="90"><i class="bi bi-arrow-clockwise"></i> Girar</button>' +
        '<label>Zoom</label><input type="range" min="1" max="3" step="0.1" value="1" data-zoom>' +
        '<button type="button" class="ekfe-btn" data-filtro="original">Original</button>' +
        '<button type="button" class="ekfe-btn" data-filtro="bn">B/N</button>' +
        '<button type="button" class="ekfe-btn" data-filtro="vintage">Vintage</button>' +
        '<button type="button" class="ekfe-done" data-done>Done</button>' +
      '</div></div>';
    document.body.appendChild(overlay);

    var canvas = overlay.querySelector("canvas");
    var ctx = canvas.getContext("2d");
    var cropEl = overlay.querySelector(".ekfe-crop");
    var img = new Image();

    function dimsRotadas() {
      var r = (rotacion % 180) !== 0;
      return { w: r ? img.naturalHeight : img.naturalWidth, h: r ? img.naturalWidth : img.naturalHeight };
    }

    // Tamaño máximo del lienzo (área visible) en píxeles CSS, siempre dentro de la ventana.
    function maxLienzo() {
      var w = Math.min(560, Math.max(200, window.innerWidth - 110));
      var h = Math.min(440, Math.max(180, Math.floor(window.innerHeight * 0.5)));
      return { w: w, h: h };
    }

    function layout() {
      var d = dimsRotadas();
      var m = maxLienzo();
      var s = Math.min(m.w / d.w, m.h / d.h, 1); // no ampliar más allá del tamaño natural
      return { s: s, cw: Math.max(1, Math.round(d.w * s)), ch: Math.max(1, Math.round(d.h * s)) };
    }

    function filtroActual() {
      return filtro === "bn" ? "grayscale(1)" : (filtro === "vintage" ? "sepia(.5) saturate(.7)" : "none");
    }

    function dibujar() {
      if (!img.naturalWidth || !img.naturalHeight) return;
      var l = layout();
      canvas.width = l.cw;
      canvas.height = l.ch;
      canvas.style.width = l.cw + "px";
      canvas.style.height = l.ch + "px";
      ctx.clearRect(0, 0, l.cw, l.ch);
      ctx.save();
      ctx.filter = filtroActual();
      ctx.translate(l.cw / 2, l.ch / 2);
      ctx.rotate(rotacion * Math.PI / 180);
      ctx.scale(l.s * zoom, l.s * zoom);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      ctx.restore();
      ctx.filter = "none";
    }

    img.onload = function () {
      var l = layout();
      dibujar();
      crop = { x: Math.round(l.cw * 0.1), y: Math.round(l.ch * 0.1), w: Math.round(l.cw * 0.8), h: Math.round(l.ch * 0.8) };
      posicionarCrop();
      cropEl.style.display = "";
    };
    img.src = URL.createObjectURL(archivo);

    function posicionarCrop() {
      if (!crop) return;
      cropEl.style.left = crop.x + "px";
      cropEl.style.top = crop.y + "px";
      cropEl.style.width = crop.w + "px";
      cropEl.style.height = crop.h + "px";
    }

    function limites() {
      var l = layout();
      return { w: l.cw, h: l.ch };
    }

    // Mover y redimensionar el rectángulo de recorte
    var arrastrando = false, modo = "";
    cropEl.addEventListener("mousedown", function (e) {
      if (e.target.classList.contains("h")) modo = "resize"; else modo = "move";
      arrastrando = true; e.preventDefault();
      var x0 = e.clientX, y0 = e.clientY, c0 = { x: crop.x, y: crop.y, w: crop.w, h: crop.h };
      function mover(ev) {
        var dx = ev.clientX - x0, dy = ev.clientY - y0, lim = limites();
        if (modo === "move") { crop.x = Math.max(0, Math.min(lim.w - crop.w, c0.x + dx)); crop.y = Math.max(0, Math.min(lim.h - crop.h, c0.y + dy)); }
        else { crop.w = Math.max(40, Math.min(lim.w - crop.x, c0.w + dx)); crop.h = Math.max(40, Math.min(lim.h - crop.y, c0.h + dy)); }
        posicionarCrop();
      }
      function soltar() { arrastrando = false; document.removeEventListener("mousemove", mover); document.removeEventListener("mouseup", soltar); }
      document.addEventListener("mousemove", mover);
      document.addEventListener("mouseup", soltar);
    });

    overlay.addEventListener("click", function (e) {
      var t = e.target;
      if (t.hasAttribute("data-rot")) { rotacion = (rotacion + (+t.getAttribute("data-rot")) + 360) % 360; dibujar(); posicionarCrop(); }
      else if (t.hasAttribute("data-filtro")) { filtro = t.getAttribute("data-filtro"); overlay.querySelectorAll("[data-filtro]").forEach(function (b) { b.classList.toggle("is-on", b === t); }); dibujar(); }
      else if (t.hasAttribute("data-done")) { procesar(); }
      else if (t === overlay) { overlay.remove(); }
    });
    overlay.querySelector("[data-zoom]").addEventListener("input", function () { zoom = +this.value; dibujar(); posicionarCrop(); });

    function procesar() {
      if (!crop || !img.naturalWidth) return;
      var l = layout();
      var d = dimsRotadas();
      // Tamaño de la imagen RENDERIZADA (rotación + zoom) a resolución completa
      var Rw = Math.round(d.w * l.s * zoom);
      var Rh = Math.round(d.h * l.s * zoom);
      var render = document.createElement("canvas");
      render.width = Rw; render.height = Rh;
      var rc = render.getContext("2d");
      rc.filter = filtroActual();
      rc.translate(Rw / 2, Rh / 2);
      rc.rotate(rotacion * Math.PI / 180);
      rc.scale(l.s * zoom, l.s * zoom);
      rc.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      rc.filter = "none";

      // El recorte está en coordenadas del lienzo (área visible); lo traducimos a
      // coordenadas de la imagen renderizada (que está centrada dentro del lienzo).
      var rx = crop.x - (l.cw - Rw) / 2;
      var ry = crop.y - (l.ch - Rh) / 2;
      rx = Math.max(0, Math.min(Rw - 1, rx));
      ry = Math.max(0, Math.min(Rh - 1, ry));
      var cw = Math.min(crop.w, Rw - rx);
      var ch = Math.min(crop.h, Rh - ry);

      var out = document.createElement("canvas");
      out.width = Math.max(1, Math.round(cw));
      out.height = Math.max(1, Math.round(ch));
      out.getContext("2d").drawImage(render, rx, ry, cw, ch, 0, 0, out.width, out.height);
      overlay.remove();
      if (onDone) onDone(out.toDataURL("image/png"));
    }
  };
})();
