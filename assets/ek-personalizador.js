/* ============================================================================
   TALLER CREATIVO EK · Personalizador de producto (assets/ek-personalizador.js)
   ----------------------------------------------------------------------------
   Vista del cliente. Se activa cuando un producto tiene `print_area` e `imagen`.
   - Dibuja la imagen base en un <canvas>.
   - Renderiza el texto del cliente DENTRO del área de impresión (print_area),
     con AUTOSCALING: reduce el tamaño de fuente hasta que quepa (ancho y alto).
   - Soporta saltos de línea (\n), tipografías de Google Fonts y color.
   - "Agregar al carrito" captura la composición con canvas.toDataURL('image/png').
   ========================================================================== */
(function () {
  "use strict";

  var FUENTES = [
    { n: "Montserrat", c: "Montserrat" },
    { n: "Poppins", c: "Poppins" },
    { n: "Playfair Display", c: "Playfair Display" },
    { n: "Pacifico", c: "Pacifico" },
    { n: "Caveat", c: "Caveat" },
  ];

  var estilosInyectados = false;
  function inyectarEstilos() {
    if (estilosInyectados) return;
    estilosInyectados = true;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Poppins:wght@400;700&family=Playfair+Display:wght@700&family=Pacifico&family=Caveat&display=swap";
    document.head.appendChild(link);

    var st = document.createElement("style");
    st.textContent =
      ".ekp{margin:26px 0;padding:22px;border:1px solid var(--linea,#e5e7eb);border-radius:16px;background:#fff}" +
      ".ekp h3{margin:0 0 4px}" +
      ".ekp .muted{color:#6b7280;font-size:.9rem;margin:0 0 16px}" +
      ".ekp-grid{display:grid;grid-template-columns:1fr 300px;gap:22px;align-items:start}" +
      ".ekp-canvas{max-width:100%;overflow:auto}" +
      ".ekp-canvas canvas{max-width:100%;height:auto;border:1px solid #e5e7eb;border-radius:10px;display:block}" +
      ".ekp-field{margin-bottom:14px}" +
      ".ekp-field label{display:block;font-size:.85rem;font-weight:600;margin-bottom:5px}" +
      ".ekp-field textarea,.ekp-field select{width:100%;padding:9px 11px;border:1px solid #e5e7eb;border-radius:8px;font:inherit}" +
      ".ekp-field input[type=color]{width:54px;height:38px;border:1px solid #e5e7eb;border-radius:8px;padding:2px;background:#fff}" +
      ".ekp-btn{display:inline-flex;align-items:center;gap:8px;background:#DA1D2A;color:#fff;border:0;padding:12px 18px;border-radius:9px;font-weight:700;cursor:pointer;font:inherit}" +
      "@media(max-width:760px){.ekp-grid{grid-template-columns:1fr}}";
    document.head.appendChild(st);
  }

  // Envuelve palabras para que el texto quepa en el ancho máximo.
  function envolver(ctx, texto, maxW) {
    var lineas = [];
    var palabras = texto.split(/\s+/);
    var actual = "";
    for (var i = 0; i < palabras.length; i++) {
      var prueba = actual ? actual + " " + palabras[i] : palabras[i];
      if (!actual || ctx.measureText(prueba).width <= maxW) {
        actual = prueba;
      } else {
        if (actual) lineas.push(actual);
        actual = palabras[i];
      }
    }
    if (actual) lineas.push(actual);
    return lineas.length ? lineas : [""];
  }

  // Algoritmo de autoscaling: reduce el tamaño de fuente hasta que TODO el texto
  // (con sus saltos de línea y ajuste de palabras) quepa en maxW × maxH.
  function ajustarTexto(ctx, texto, fuente, maxW, maxH) {
    var parrafos = String(texto || "").split("\n");
    var size = Math.max(12, Math.floor(maxH / 1.3));  // empieza grande
    var lineas = [], lineHeight;
    while (size > 8) {
      ctx.font = size + "px " + fuente;
      lineas = [];
      parrafos.forEach(function (p) { lineas = lineas.concat(envolver(ctx, p, maxW)); });
      lineHeight = size * 1.28;
      if (lineas.length * lineHeight <= maxH) break;
      size -= 2;
    }
    return { size: size, lineas: lineas, lineHeight: lineHeight };
  }

  window.EK_personalizador = function (p) {
    if (!p || !p.print_area || !p.imagen) return;
    var pa = p.print_area;
    inyectarEstilos();

    var destino = document.getElementById("ek-producto");
    if (!destino) return;

    // --- Estructura ---
    var sec = document.createElement("section");
    sec.className = "ekp";
    sec.innerHTML =
      '<h3>🎨 Personaliza tu producto</h3>' +
      '<p class="muted">Escribe tu texto: se ajusta automáticamente al área de impresión.</p>' +
      '<div class="ekp-grid">' +
        '<div class="ekp-canvas"><canvas></canvas></div>' +
        '<div>' +
          '<div class="ekp-field"><label>Tu texto</label><textarea id="ekp-texto" rows="3">Tu texto</textarea></div>' +
          '<div class="ekp-field"><label>Tipografía</label><select id="ekp-fuente">' +
            FUENTES.map(function (f) { return '<option value="' + f.c + '">' + f.n + "</option>"; }).join("") +
          "</select></div>" +
          '<div class="ekp-field"><label>Color del texto</label><input type="color" id="ekp-color" value="#000000"></div>' +
          '<button class="ekp-btn" id="ekp-agregar" type="button"><i class="bi bi-bag-plus"></i> Agregar al carrito</button>' +
        "</div>" +
      "</div>";

    destino.appendChild(sec);

    var canvas = sec.querySelector("canvas");
    var ctx = canvas.getContext("2d");
    var txt = sec.querySelector("#ekp-texto");
    var fuente = sec.querySelector("#ekp-fuente");
    var color = sec.querySelector("#ekp-color");

    // Carga la imagen base (crossOrigin para poder exportar el canvas)
    var img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      dibujar();
    };
    img.onerror = function () {
      sec.querySelector(".muted").textContent = "No se pudo cargar la imagen base.";
    };
    img.src = p.imagen;

    // Renderiza la composición: imagen base + texto dentro del print_area
    function dibujar() {
      if (!img.naturalWidth) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // print_area en píxeles (porcentajes → píxeles relativos a la imagen)
      var px = (pa.x / 100) * canvas.width;
      var py = (pa.y / 100) * canvas.height;
      var pw = (pa.width / 100) * canvas.width;
      var ph = (pa.height / 100) * canvas.height;

      // (opcional) dibuja el rectángulo del área para referencia en desarrollo:
      // ctx.strokeStyle = "rgba(255,0,0,.4)"; ctx.strokeRect(px, py, pw, ph);

      var fit = ajustarTexto(ctx, txt.value, fuente.value, pw, ph);
      ctx.fillStyle = color.value;
      ctx.font = fit.size + "px " + fuente.value;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      var totalH = fit.lineas.length * fit.lineHeight;
      var inicioY = py + (ph - totalH) / 2 + fit.lineHeight / 2;
      fit.lineas.forEach(function (linea, i) {
        ctx.fillText(linea, px + pw / 2, inicioY + i * fit.lineHeight);
      });
    }

    // Espera a que las fuentes estén listas antes de pintar
    function redibujar() {
      if (document.fonts && document.fonts.load) {
        document.fonts.load("16px " + fuente.value).then(dibujar).catch(dibujar);
      } else dibujar();
    }
    txt.addEventListener("input", redibujar);
    fuente.addEventListener("change", redibujar);
    color.addEventListener("input", dibujar);

    // Captura la composición y la agrega al carrito
    sec.querySelector("#ekp-agregar").addEventListener("click", function () {
      try {
        var dataURL = canvas.toDataURL("image/png");
        if (window.EK_agregarPersonalizado) window.EK_agregarPersonalizado(p.s, dataURL);
        else window.alert("No se pudo agregar al carrito.");
      } catch (e) {
        window.alert("No se pudo generar la vista previa (la imagen puede no permitir exportación).");
      }
    });
  };
})();
