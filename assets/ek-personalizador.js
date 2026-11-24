/* ============================================================================
   TALLER CREATIVO EK · Personalizador de producto (assets/ek-personalizador.js)
   ----------------------------------------------------------------------------
   Vista del cliente. Lee los campos dinámicos de Producto.personalizacion_campos
   y construye un formulario con vista previa en tiempo real (canvas).

   Modelo de campo (cada campo puede tener su propia área de impresión):
     { tipo: "texto"|"textarea"|"foto",
       label, max, opciones, obligatorio,
       area: {x,y,width,height}  (porcentajes sobre la imagen personalizable),
       forma: "cuadrada"|"redonda"  (solo campos "foto") }

   - El cliente elige la tipografía y el color del texto (aplican a todos los campos de texto).
   - "texto"/"textarea" se dibujan centrados dentro de su área.
   - "foto" se dibuja recortada (cuadrada o redonda) dentro de su área.
   - "Agregar al carrito" compone la imagen y adjunta los textos como metadatos.
   ========================================================================== */
(function () {
  "use strict";

  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"']/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]; }); }

  var FUENTES = [
    { n: "Montserrat", c: "Montserrat" },
    { n: "Poppins", c: "Poppins" },
    { n: "Playfair Display", c: "Playfair Display" },
    { n: "Pacifico", c: "Pacifico" },
    { n: "Caveat", c: "Caveat" },
    { n: "Great Vibes", c: "Great Vibes" },
    { n: "Dancing Script", c: "Dancing Script" },
    { n: "Lobster", c: "Lobster" },
    { n: "Oswald", c: "Oswald" },
    { n: "Cinzel", c: "Cinzel" },
    { n: "Bebas Neue", c: "Bebas Neue" },
    { n: "Amatic SC", c: "Amatic SC" },
  ];

  var estilosInyectados = false;
  function inyectarEstilos() {
    if (estilosInyectados) return;
    estilosInyectados = true;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Poppins:wght@400;700&family=Playfair+Display:wght@700&family=Pacifico&family=Caveat:wght@400;700&family=Great+Vibes&family=Dancing+Script:wght@400;700&family=Lobster&family=Oswald:wght@400;700&family=Cinzel:wght@400;700&family=Bebas+Neue&family=Amatic+SC:wght@400;700&display=swap";
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
      ".ekp-field textarea,.ekp-field select,.ekp-field input[type=text]{width:100%;padding:9px 11px;border:1px solid #e5e7eb;border-radius:8px;font:inherit}" +
      ".ekp-field input[type=color]{width:56px;height:40px;border:1px solid #e5e7eb;border-radius:8px;padding:2px;background:#fff;cursor:pointer}" +
      ".ekp-contador{display:block;font-size:.76rem;color:#6b7280;margin-top:4px}" +
      ".ekp-contador.lleno{color:#DA1D2A;font-weight:700}" +
      ".ekp-btn{display:inline-flex;align-items:center;gap:8px;background:#DA1D2A;color:#fff;border:0;padding:12px 18px;border-radius:9px;font-weight:700;cursor:pointer;font:inherit}" +
      ".ekp-btn[disabled]{opacity:.45;cursor:not-allowed}" +
      ".ekp-btn-ghost{display:inline-flex;align-items:center;gap:8px;background:#fff;color:#244093;border:1px solid #e5e7eb;padding:9px 14px;border-radius:9px;font-weight:600;cursor:pointer;font:inherit}" +
      ".ekp-field .ekp-foto-wrap{display:flex;align-items:center;gap:10px}" +
      ".ekp-foto-prev{max-width:90px;max-height:90px;border-radius:8px;object-fit:cover;border:1px solid #e5e7eb}" +
      ".ekp-foto-prev.is-round{border-radius:50%;width:90px;height:90px}" +
      ".ekp-estilo{display:flex;gap:8px;margin-top:6px;align-items:center}" +
      ".ekp-estilo select{flex:1;min-width:0;padding:7px 9px;border:1px solid #e5e7eb;border-radius:8px;font:inherit;background:#fff}" +
      ".ekp-estilo input[type=color]{width:44px;height:38px;border:1px solid #e5e7eb;border-radius:8px;padding:2px;background:#fff;cursor:pointer;flex-shrink:0}" +
      ".ekp-estilo label{display:inline-flex;align-items:center;gap:4px;font-size:.74rem;color:#6b7280;margin:0}" +
      "@media(max-width:760px){.ekp-grid{grid-template-columns:1fr}}";
    document.head.appendChild(st);
  }

  function envolver(ctx, texto, maxW) {
    // Divide por palabras y, si una palabra es más ancha que el área, la parte
    // por caracteres para que el texto nunca se salga del contenedor.
    var lineas = [], palabras = String(texto).split(/\s+/), actual = "";
    function trozosDe(palabra) {
      if (ctx.measureText(palabra).width <= maxW) return [palabra];
      var trozos = [], trozo = "";
      for (var i = 0; i < palabra.length; i++) {
        var prueba = trozo + palabra[i];
        if (trozo && ctx.measureText(prueba).width > maxW) { trozos.push(trozo); trozo = palabra[i]; }
        else trozo = prueba;
      }
      if (trozo) trozos.push(trozo);
      return trozos.length ? trozos : [palabra];
    }
    for (var i = 0; i < palabras.length; i++) {
      var trozos = trozosDe(palabras[i]);
      for (var j = 0; j < trozos.length; j++) {
        var prueba = actual ? actual + " " + trozos[j] : trozos[j];
        if (!actual || ctx.measureText(prueba).width <= maxW) actual = prueba;
        else { lineas.push(actual); actual = trozos[j]; }
      }
    }
    if (actual) lineas.push(actual);
    return lineas.length ? lineas : [""];
  }
  function ajustarTexto(ctx, texto, fuente, maxW, maxH) {
    var parrafos = String(texto || "").split("\n");
    // Arranca con un tamaño razonable (según alto Y ancho) y baja hasta que todo
    // quepa tanto en ancho como en alto.
    var size = Math.max(8, Math.floor(Math.min(maxH / 1.2, maxW / 4))), lineas = [], lineHeight, cabe;
    while (size >= 6) {
      ctx.font = size + "px " + fuente;
      lineas = [];
      parrafos.forEach(function (p) { lineas = lineas.concat(envolver(ctx, p, maxW)); });
      lineHeight = size * 1.28;
      cabe = true;
      for (var i = 0; i < lineas.length; i++) {
        if (ctx.measureText(lineas[i]).width > maxW) { cabe = false; break; }
      }
      if (cabe && lineas.length * lineHeight <= maxH) break;
      size -= 2;
    }
    return { size: size, lineas: lineas, lineHeight: lineHeight };
  }

  window.EK_personalizador = function (p) {
    if (!p || !p.personalizable) return;

    var campos = (p.personalizacion_campos && p.personalizacion_campos.length)
      ? p.personalizacion_campos
      : [{ tipo: "texto", label: "Tu texto", max: null, obligatorio: false }];

    // Normaliza cada campo para garantizar estructura
    campos = campos.map(function (c) {
      var out = {
        tipo: c.tipo || "texto",
        label: c.label || "",
        max: c.max != null ? c.max : null,
        opciones: c.opciones || [],
        obligatorio: !!c.obligatorio,
        area: c.area || null,
        forma: c.forma || "cuadrada",
      };
      return out;
    });

    // La personalización es POR VARIANTE: cada combinación talla/color tiene su
    // propia imagen en blanco y sus propias áreas por campo.
    function varianteActual() {
      return (window.EK_getVariante && window.EK_getVariante()) || null;
    }
    function baseImagen() {
      var v = varianteActual();
      if (v && v.imagen_personalizacion) return v.imagen_personalizacion;
      if (p.imagen_personalizacion) return p.imagen_personalizacion;
      if (p.imagenes_personalizacion && p.imagenes_personalizacion[0]) return p.imagenes_personalizacion[0];
      if (p.imagen) return p.imagen;
      return null;
    }
    // Área del campo i: 1) área propia de la variante (areas_campos[i]),
    // 2) área general de la variante (print_area), 3) área del producto, 4) default.
    function areaDeCampo(c, i) {
      if (c.area && c.area.width != null) return c.area;
      var v = varianteActual();
      if (v && v.areas_campos && v.areas_campos[i] && v.areas_campos[i].width != null) return v.areas_campos[i];
      if (v && v.print_area) return v.print_area;
      if (p.print_areas && p.print_areas[0]) return p.print_areas[0];
      if (p.print_area) return p.print_area;
      return { x: 30, y: 30, width: 40, height: 30 };
    }

    var imgBase = baseImagen();
    if (!imgBase) return;

    inyectarEstilos();
    var destino = document.getElementById("ek-producto");
    if (!destino) return;

    var sec = document.createElement("section");
    sec.className = "ekp";
    sec.innerHTML =
      '<h3>🎨 Personaliza tu producto</h3>' +
      '<p class="muted">Completa los campos y mira la vista previa en tiempo real.</p>' +
      '<div class="ekp-grid">' +
        '<div class="ekp-canvas"><canvas></canvas></div>' +
        '<div>' +
          campos.map(function (c, i) {
          if (c.tipo === "select") { return ""; }
          // Cada campo de texto tiene SU PROPIA tipografía y color.
          var estilo = '<div class="ekp-estilo"><select data-fuente="' + i + '" aria-label="Tipo de letra">' +
            FUENTES.map(function (f) { return '<option value="' + f.c + '">' + f.n + '</option>'; }).join("") +
            '</select><input type="color" data-color="' + i + '" value="#000000" aria-label="Color" title="Color del texto"></div>';
          if (c.tipo === "textarea") {
            return '<div class="ekp-field"><label>' + esc(c.label) + (c.obligatorio ? " *" : "") + '</label><textarea data-campo="' + i + '" rows="2" maxlength="' + (c.max || 500) + '"></textarea>' + estilo + (c.max ? '<small class="ekp-contador" data-contador="' + i + '"></small>' : '') + '</div>';
          }
          if (c.tipo === "foto") {
            return '<div class="ekp-field"><label>' + esc(c.label) + (c.obligatorio ? " *" : "") + '</label>' +
              '<div class="ekp-foto-wrap">' +
                '<input type="file" data-foto="' + i + '" accept="image/jpeg,image/png" hidden>' +
                '<button type="button" class="ekp-btn-ghost" data-foto-btn="' + i + '"><i class="bi bi-image"></i> Subir foto</button>' +
                '<button type="button" class="ekp-btn-ghost" data-foto-cambiar="' + i + '" style="display:none">Cambiar</button>' +
                '<img data-foto-img="' + i + '" class="ekp-foto-prev' + (c.forma === "redonda" ? " is-round" : "") + '" style="display:none" alt="">' +
              '</div>' +
              '</div>';
          }
          // texto (1 línea)
          return '<div class="ekp-field"><label>' + esc(c.label) + (c.obligatorio ? " *" : "") + '</label><input type="text" data-campo="' + i + '" maxlength="' + (c.max || 500) + '">' + estilo + (c.max ? '<small class="ekp-contador" data-contador="' + i + '"></small>' : '') + '</div>';
        }).join("") +
        '<button class="ekp-btn" id="ekp-agregar" type="button"><i class="bi bi-bag-plus"></i> Agregar al carrito</button>' +
        '</div>' +
      '</div>';

    var detalle = destino.querySelector(".ek-detail");
    if (detalle) detalle.insertAdjacentElement("afterend", sec);
    else destino.appendChild(sec);

    var canvas = sec.querySelector("canvas");
    var ctx = canvas.getContext("2d");
    var fotos = {};         // índice de campo foto → dataURL
    var fotosImg = {};      // índice de campo foto → Image cargada
    var fotoArchivos = {};  // índice de campo foto → File original (para re-editar sin volver a subir)
    var fuentes = {};       // índice de campo texto → tipografía elegida
    var colores = {};       // índice de campo texto → color (hex)

    function fuenteDe(i) { return fuentes[i] || "Montserrat"; }
    function colorDe(i) { return colores[i] || "#000000"; }

    var img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () { canvas.width = img.naturalWidth; canvas.height = img.naturalHeight; dibujar(); };
    img.onerror = function () { sec.querySelector(".muted").textContent = "No se pudo cargar la imagen base."; };
    img.src = imgBase;

    // Al cambiar de variante, actualiza la imagen base y re-dibuja (las áreas
    // por campo también cambian aunque la imagen sea la misma).
    if (window.EK_getVariante) {
      window.EK_onVarianteChange = function () {
        var nueva = baseImagen();
        if (nueva && nueva !== img.src) { img.src = nueva; }
        else if (img.naturalWidth) { dibujar(); }
      };
    }

    function areaPx(area) {
      return {
        px: (area.x / 100) * canvas.width,
        py: (area.y / 100) * canvas.height,
        pw: (area.width / 100) * canvas.width,
        ph: (area.height / 100) * canvas.height,
      };
    }

    function dibujar() {
      if (!img.naturalWidth) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 1) Fotos (recortadas a su forma) debajo de los textos
      campos.forEach(function (c, i) {
        if (c.tipo === "foto" && fotosImg[i] && fotosImg[i].complete && fotosImg[i].naturalWidth) dibujarFoto(i, c);
      });
      // 2) Textos encima
      campos.forEach(function (c, i) {
        if (c.tipo === "texto" || c.tipo === "textarea") dibujarTexto(i, c);
      });
    }

    function dibujarFoto(i, c) {
      var im = fotosImg[i];
      var area = areaDeCampo(c, i);
      var a = areaPx(area);
      ctx.save();
      if (c.forma === "redonda") {
        var d = Math.min(a.pw, a.ph);
        ctx.beginPath();
        ctx.arc(a.px + a.pw / 2, a.py + a.ph / 2, d / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
      }
      var scale = Math.min(a.pw / im.naturalWidth, a.ph / im.naturalHeight);
      var dw = im.naturalWidth * scale, dh = im.naturalHeight * scale;
      ctx.drawImage(im, a.px + (a.pw - dw) / 2, a.py + (a.ph - dh) / 2, dw, dh);
      ctx.restore();
    }

    function dibujarTexto(i, c) {
      var el = sec.querySelector('[data-campo="' + i + '"]');
      var texto = el ? el.value : "";
      if (!texto || !String(texto).trim()) return;
      var area = areaDeCampo(c, i);
      var a = areaPx(area);
      var fit = ajustarTexto(ctx, texto, fuenteDe(i), a.pw, a.ph);
      ctx.fillStyle = colorDe(i);
      ctx.font = fit.size + "px " + fuenteDe(i);
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      var totalH = fit.lineas.length * fit.lineHeight;
      var inicioY = a.py + (a.ph - totalH) / 2 + fit.lineHeight / 2;
      fit.lineas.forEach(function (linea, li) { ctx.fillText(linea, a.px + a.pw / 2, inicioY + li * fit.lineHeight); });
    }

    // Contadores + redibujar
    campos.forEach(function (c, i) {
      var el = sec.querySelector('[data-campo="' + i + '"]');
      var cont = sec.querySelector('[data-contador="' + i + '"]');
      if (el) {
        function actualizarContador() {
          if (cont && c.max) {
            var rest = Math.max(0, c.max - el.value.length);
            cont.textContent = rest + " caracteres restantes";
            cont.classList.toggle("lleno", rest === 0);
          }
        }
        el.addEventListener("input", function () { actualizarContador(); dibujar(); });
        el.addEventListener("change", function () { actualizarContador(); dibujar(); });
        actualizarContador();
      }
    });

    // Tipografía y color por campo: cada contenedor tiene su propia selección.
    function redibujarFuente(i) {
      if (document.fonts && document.fonts.load) {
        document.fonts.load("16px " + fuenteDe(i)).then(dibujar).catch(dibujar);
      } else dibujar();
    }
    sec.addEventListener("change", function (e) {
      var fs = e.target.closest("[data-fuente]");
      if (fs) { fuentes[+fs.getAttribute("data-fuente")] = fs.value; redibujarFuente(+fs.getAttribute("data-fuente")); }
    });
    sec.addEventListener("input", function (e) {
      var cs = e.target.closest("[data-color]");
      if (cs) { colores[+cs.getAttribute("data-color")] = cs.value; dibujar(); }
    });

    // Subida de fotos (con editor si está disponible). La foto original se conserva
    // para poder volver a editarla sin tener que subirla de nuevo.
    function aplicarFoto(i, dataURL) {
      fotos[i] = dataURL;
      var im = new Image();
      im.onload = function () { fotosImg[i] = im; dibujar(); };
      im.src = dataURL;
      var prev = sec.querySelector('[data-foto-img="' + i + '"]');
      if (prev) { prev.src = dataURL; prev.style.display = ""; }
      var btn = sec.querySelector('[data-foto-btn="' + i + '"]');
      if (btn) btn.innerHTML = '<i class="bi bi-pencil-square"></i> Editar foto';
      var camb = sec.querySelector('[data-foto-cambiar="' + i + '"]');
      if (camb) camb.style.display = "";
      validar();
    }
    function editarFoto(i, archivo) {
      if (window.EK_FotoEditor) {
        window.EK_FotoEditor(archivo, function (dataURL) { aplicarFoto(i, dataURL); });
      } else {
        var lector = new FileReader();
        lector.onload = function () { aplicarFoto(i, lector.result); };
        lector.readAsDataURL(archivo);
      }
    }
    sec.addEventListener("click", function (e) {
      var b = e.target.closest("[data-foto-btn]");
      if (b) {
        var i = +b.getAttribute("data-foto-btn");
        if (fotoArchivos[i]) editarFoto(i, fotoArchivos[i]);
        else sec.querySelector('[data-foto="' + i + '"]').click();
        return;
      }
      var cb = e.target.closest("[data-foto-cambiar]");
      if (cb) sec.querySelector('[data-foto="' + +cb.getAttribute("data-foto-cambiar") + '"]').click();
    });
    sec.addEventListener("change", function (e) {
      var f = e.target.closest("[data-foto]");
      if (!f || !f.files[0]) return;
      var i = +f.getAttribute("data-foto");
      var archivo = f.files[0];
      if (!/image\/(jpeg|png)/.test(archivo.type)) { window.alert("Solo se permiten JPG o PNG."); f.value = ""; return; }
      fotoArchivos[i] = archivo;
      editarFoto(i, archivo);
      f.value = "";
    });

    // Validación
    var btnAgregar = sec.querySelector("#ekp-agregar");
    function validar() {
      var ok = true;
      campos.forEach(function (c, i) {
        if (!c.obligatorio) return;
        if (c.tipo === "foto") { if (!fotos[i]) ok = false; }
        else if (c.tipo === "select") { /* la fuente ya no es elegible por el cliente */ }
        else { var el = sec.querySelector('[data-campo="' + i + '"]'); if (!el || !String(el.value).trim()) ok = false; }
      });
      btnAgregar.disabled = !ok;
      return ok;
    }
    campos.forEach(function (c, i) {
      var el = sec.querySelector('[data-campo="' + i + '"]');
      if (el) { el.addEventListener("input", validar); el.addEventListener("change", validar); }
    });
    btnAgregar.addEventListener("click", function () {
      if (!validar()) return;
      btnAgregar.disabled = true;
      try {
        var dataURL = canvas.toDataURL("image/png");
        var meta = {};
        campos.forEach(function (c, i) {
          if (c.tipo === "foto") meta[c.label] = fotos[i] ? "[Foto adjunta]" : "";
          else if (c.tipo === "select") meta[c.label] = "";
          else {
            var el = sec.querySelector('[data-campo="' + i + '"]');
            var valor = el ? el.value : "";
            meta[c.label] = valor;
            // Se guarda también la tipografía y el color (hex) de cada texto.
            if (String(valor).trim()) {
              meta[c.label + " (fuente)"] = fuenteDe(i);
              meta[c.label + " (color)"] = colorDe(i);
            }
          }
        });
        // Sube la composición al servidor y guarda la URL (no el data-URL gigante)
        fetch("/api/subir-personalizacion", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ base64: dataURL, nombre: "personalizacion.png" }),
        })
          .then(function (r) { return r.json(); })
          .then(function (d) {
            if (d.ok && d.url) {
              if (window.EK_agregarPersonalizado) window.EK_agregarPersonalizado(p.s, d.url, meta);
              else window.alert("No se pudo agregar al carrito.");
            } else {
              window.alert(d.error || "No se pudo guardar la personalización.");
            }
          })
          .catch(function () { window.alert("Error de conexión al guardar la personalización."); })
          .finally(function () { btnAgregar.disabled = false; validar(); });
      } catch (e) {
        window.alert("No se pudo generar la vista previa (la imagen puede no permitir exportación).");
        btnAgregar.disabled = false;
      }
    });
    validar();
  };
})();
