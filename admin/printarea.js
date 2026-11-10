/* ============================================================================
   TALLER CREATIVO EK · Configurador de Área de Impresión (print_area)
   ----------------------------------------------------------------------------
   Componente vanilla JS para el panel admin. Dibuja un rectángulo sobre la
   imagen base del producto (taza, bolsa, etc.) y permite:
     · Arrastrar el rectángulo para moverlo.
     · Arrastrar la esquina inferior-derecha para redimensionarlo.
     · Ajustar x / y / ancho / alto con entradas numéricas.
   El valor se expresa SIEMPRE en PORCENTAJES relativos a la imagen base,
   para que sea responsivo: { x, y, width, height }  (ej. x=50 → 50% del ancho).
   ========================================================================== */
(function () {
  "use strict";

  // Estilos del editor (inyectados una sola vez)
  function inyectarEstilos() {
    if (document.getElementById("printarea-css")) return;
    var st = document.createElement("style");
    st.id = "printarea-css";
    st.textContent =
      ".pa-stage{position:relative;display:inline-block;max-width:100%;border:1px solid #e5e7eb;border-radius:8px;overflow:auto;background:#f9fafb}" +
      ".pa-stage img{display:block;max-width:100%;height:auto;user-select:none;-webkit-user-drag:none}" +
      ".pa-box{position:absolute;border:2px dashed #DA1D2A;background:rgba(218,29,42,.12);cursor:move;box-sizing:border-box;min-width:24px;min-height:24px}" +
      ".pa-box .pa-handle{position:absolute;right:-7px;bottom:-7px;width:14px;height:14px;background:#DA1D2A;border:2px solid #fff;border-radius:50%;cursor:se-resize}" +
      ".pa-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:12px}" +
      ".pa-grid label{font-size:.78rem;font-weight:600;color:#374151;display:block;margin-bottom:4px}" +
      ".pa-grid input{width:100%;padding:7px 9px;border:1px solid #e5e7eb;border-radius:7px;font:inherit}" +
      ".pa-note{font-size:.78rem;color:#6b7280;margin-top:10px}";
    document.head.appendChild(st);
  }

  window.PrintAreaEditor = function (opciones) {
    inyectarEstilos();
    var cont = opciones.container;
    var valor = opciones.valor ? {
      x: Number(opciones.valor.x) || 0,
      y: Number(opciones.valor.y) || 0,
      width: Number(opciones.valor.width) || 20,
      height: Number(opciones.valor.height) || 20,
    } : null;

    // --- Construcción del DOM ---
    cont.innerHTML =
      '<div class="pa-stage" id="pa-stage"><img id="pa-img" alt="Imagen base"></div>' +
      '<div class="pa-grid">' +
        '<div><label>X (%)</label><input type="number" id="pa-x" step="0.1"></div>' +
        '<div><label>Y (%)</label><input type="number" id="pa-y" step="0.1"></div>' +
        '<div><label>Ancho (%)</label><input type="number" id="pa-w" step="0.1"></div>' +
        '<div><label>Alto (%)</label><input type="number" id="pa-h" step="0.1"></div>' +
      "</div>" +
      '<p class="pa-note">Arrastra el rectángulo para moverlo y su esquina para redimensionarlo. Los valores son porcentajes respecto a la imagen.</p>';

    var stage = cont.querySelector("#pa-stage");
    var img = cont.querySelector("#pa-img");
    var box = document.createElement("div");
    box.className = "pa-box";
    box.innerHTML = '<div class="pa-handle"></div>';
    stage.appendChild(box);

    var inpX = cont.querySelector("#pa-x"), inpY = cont.querySelector("#pa-y");
    var inpW = cont.querySelector("#pa-w"), inpH = cont.querySelector("#pa-h");

    function setImagen(url) {
      img.onload = function () {
        // Al cargar, si no hay valor, crea un área por defecto centrada (40% del ancho/alto)
        if (!valor) {
          valor = { x: 30, y: 30, width: 40, height: 30 };
        }
        posicionar();
      };
      img.src = url || "";
      if (!url) { img.removeAttribute("src"); posicionar(); }
    }

    // Convierte el valor (%) a píxeles según el tamaño renderizado de la imagen
    function aPixeles() {
      var w = img.clientWidth || img.naturalWidth || 0;
      var h = img.clientHeight || img.naturalHeight || 0;
      return {
        x: (valor.x / 100) * w,
        y: (valor.y / 100) * h,
        w: (valor.width / 100) * w,
        h: (valor.height / 100) * h,
        imgW: w, imgH: h,
      };
    }
    function aPorcentaje(px, imgW, imgH) {
      return {
        x: +( (px.x / imgW) * 100 ).toFixed(1),
        y: +( (px.y / imgH) * 100 ).toFixed(1),
        width: +( (px.w / imgW) * 100 ).toFixed(1),
        height: +( (px.h / imgH) * 100 ).toFixed(1),
      };
    }

    function posicionar() {
      if (!valor) return;
      var p = aPixeles();
      box.style.left = p.x + "px";
      box.style.top = p.y + "px";
      box.style.width = p.w + "px";
      box.style.height = p.h + "px";
      inpX.value = valor.x; inpY.value = valor.y;
      inpW.value = valor.width; inpH.value = valor.height;
    }

    // --- Arrastrar (mover) ---
    box.addEventListener("mousedown", function (e) {
      if (e.target.classList.contains("pa-handle")) return; // el resize se maneja aparte
      e.preventDefault();
      var p = aPixeles();
      var inicioX = e.clientX, inicioY = e.clientY;
      var origX = p.x, origY = p.y;
      function mover(ev) {
        var dx = ev.clientX - inicioX, dy = ev.clientY - inicioY;
        var nx = Math.max(0, Math.min(p.imgW - p.w, origX + dx));
        var ny = Math.max(0, Math.min(p.imgH - p.h, origY + dy));
        var nv = aPorcentaje({ x: nx, y: ny, w: p.w, h: p.h }, p.imgW, p.imgH);
        valor.x = nv.x; valor.y = nv.y;
        posicionar();
      }
      function soltar() { document.removeEventListener("mousemove", mover); document.removeEventListener("mouseup", soltar); }
      document.addEventListener("mousemove", mover);
      document.addEventListener("mouseup", soltar);
    });

    // --- Redimensionar (esquina) ---
    box.querySelector(".pa-handle").addEventListener("mousedown", function (e) {
      e.preventDefault(); e.stopPropagation();
      var p = aPixeles();
      var inicioX = e.clientX, inicioY = e.clientY;
      var origW = p.w, origH = p.h;
      function redim(ev) {
        var dx = ev.clientX - inicioX, dy = ev.clientY - inicioY;
        var nw = Math.max(24, Math.min(p.imgW - p.x, origW + dx));
        var nh = Math.max(24, Math.min(p.imgH - p.y, origH + dy));
        var nv = aPorcentaje({ x: p.x, y: p.y, w: nw, h: nh }, p.imgW, p.imgH);
        valor.width = nv.width; valor.height = nv.height;
        posicionar();
      }
      function soltar() { document.removeEventListener("mousemove", redim); document.removeEventListener("mouseup", soltar); }
      document.addEventListener("mousemove", redim);
      document.addEventListener("mouseup", soltar);
    });

    // --- Entradas numéricas ---
    function leerEntradas() {
      valor.x = Math.max(0, Math.min(100, Number(inpX.value) || 0));
      valor.y = Math.max(0, Math.min(100, Number(inpY.value) || 0));
      valor.width = Math.max(1, Math.min(100 - valor.x, Number(inpW.value) || 10));
      valor.height = Math.max(1, Math.min(100 - valor.y, Number(inpH.value) || 10));
      posicionar();
    }
    [inpX, inpY, inpW, inpH].forEach(function (i) { i.addEventListener("input", leerEntradas); });

    setImagen(opciones.imagen || "");

    // API pública
    return {
      setImagen: setImagen,
      getValor: function () { return valor ? { x: valor.x, y: valor.y, width: valor.width, height: valor.height } : null; },
    };
  };
})();
