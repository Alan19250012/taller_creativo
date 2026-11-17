/* ============================================================================
   TALLER CREATIVO EK · Personalizador de producto (assets/ek-personalizador.js)
   ----------------------------------------------------------------------------
   Vista del cliente. Se activa cuando un producto tiene `personalizable` y
   al menos una imagen de personalización con su `print_area`.
   - Soporta VARIAS imágenes de personalización (cada una con su propia área).
   - El cliente escribe su texto y lo ve sobre la imagen seleccionada.
   - Dibuja la imagen base en un <canvas> y renderiza el texto DENTRO del área,
     con AUTOSCALING (reduce la fuente hasta que quepa) y saltos de línea.
   - "Agregar al carrito" captura la composición con canvas.toDataURL().
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
      ".ekp-thumbs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}" +
      ".ekp-thumb{width:64px;height:64px;border:2px solid #e5e7eb;border-radius:10px;overflow:hidden;padding:0;background:#f9fafb;cursor:pointer}" +
      ".ekp-thumb img{width:100%;height:100%;object-fit:cover;display:block}" +
      ".ekp-thumb.is-on{border-color:#DA1D2A}" +
      "@media(max-width:760px){.ekp-grid{grid-template-columns:1fr}}";
    document.head.appendChild(st);
  }

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

  function ajustarTexto(ctx, texto, fuente, maxW, maxH) {
    var parrafos = String(texto || "").split("\n");
    var size = Math.max(12, Math.floor(maxH / 1.3));
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
    if (!p || !p.personalizable) return;

    // Construye la lista de imágenes de personalización (cada una con su área)
    var items = [];
    var imgs = (p.imagenes_personalizacion && p.imagenes_personalizacion.length)
      ? p.imagenes_personalizacion
      : (p.imagen_personalizacion ? [p.imagen_personalizacion] : []);
    var areas = (p.print_areas && p.print_areas.length) ? p.print_areas : (p.print_area ? [p.print_area] : []);
    imgs.forEach(function (img, i) { if (img) items.push({ imagen: img, area: areas[i] || null }); });
    if (!items.length && p.imagen) items.push({ imagen: p.imagen, area: p.print_area || null });
    if (!items.length) return;

    var idx = 0;
    inyectarEstilos();

    var destino = document.getElementById("ek-producto");
    if (!destino) return;

    // --- Estructura (se inserta justo debajo del bloque de compra) ---
    var miniaturas = items.length > 1
      ? '<div class="ekp-thumbs">' + items.map(function (it, i) {
          return '<button type="button" class="ekp-thumb' + (i === 0 ? " is-on" : "") + '" data-i="' + i + '" title="Imagen ' + (i + 1) + '"><img src="' + it.imagen + '" alt=""></button>';
        }).join("") + "</div>"
      : "";
    var sec = document.createElement("section");
    sec.className = "ekp";
    sec.innerHTML =
      '<h3>🎨 Personaliza tu producto</h3>' +
      '<p class="muted">Escribe tu texto: se ajusta automáticamente al área de impresión.</p>' +
      miniaturas +
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

    var detalle = destino.querySelector(".ek-detail");
    if (detalle) detalle.insertAdjacentElement("afterend", sec);
    else destino.appendChild(sec);

    var canvas = sec.querySelector("canvas");
    var ctx = canvas.getContext("2d");
    var txt = sec.querySelector("#ekp-texto");
    var fuente = sec.querySelector("#ekp-fuente");
    var color = sec.querySelector("#ekp-color");

    // Carga la imagen seleccionada
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
    img.src = items[0].imagen;

    function areaActual() { return items[idx].area || { x: 30, y: 30, width: 40, height: 30 }; }

    function dibujar() {
      if (!img.naturalWidth) return;
      var pa = areaActual();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      var px = (pa.x / 100) * canvas.width;
      var py = (pa.y / 100) * canvas.height;
      var pw = (pa.width / 100) * canvas.width;
      var ph = (pa.height / 100) * canvas.height;

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

    // Cambio de imagen (miniaturas)
    sec.querySelectorAll(".ekp-thumb").forEach(function (b) {
      b.addEventListener("click", function () {
        idx = +b.getAttribute("data-i");
        sec.querySelectorAll(".ekp-thumb").forEach(function (x) { x.classList.toggle("is-on", x === b); });
        img.src = items[idx].imagen;
      });
    });

    function redibujar() {
      if (document.fonts && document.fonts.load) {
        document.fonts.load("16px " + fuente.value).then(dibujar).catch(dibujar);
      } else dibujar();
    }
    txt.addEventListener("input", redibujar);
    fuente.addEventListener("change", redibujar);
    color.addEventListener("input", dibujar);

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
