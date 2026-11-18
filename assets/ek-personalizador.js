/* ============================================================================
   TALLER CREATIVO EK · Personalizador de producto (assets/ek-personalizador.js)
   ----------------------------------------------------------------------------
   Vista del cliente. Lee los campos dinámicos de Producto.personalizacion_campos
   y construye un formulario con vista previa en tiempo real (canvas).
   Tipos de campo: texto · textarea · select (fuente) · foto.
   - Contador de caracteres + validación de obligatorios.
   - "Agregar al carrito" compone la imagen y adjunta los textos como metadatos.
   ========================================================================== */
(function () {
  "use strict";

  var FUENTES_MAPA = { "block": "Montserrat", "script": "Caveat", "serif": "Playfair Display", "cursiva": "Pacifico", "montserrat": "Montserrat", "pacifico": "Pacifico", "caveat": "Caveat", "playfair display": "Playfair Display" };

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
      ".ekp-field textarea,.ekp-field select,.ekp-field input[type=text]{width:100%;padding:9px 11px;border:1px solid #e5e7eb;border-radius:8px;font:inherit}" +
      ".ekp-contador{display:block;font-size:.76rem;color:#6b7280;margin-top:4px}" +
      ".ekp-contador.lleno{color:#DA1D2A;font-weight:700}" +
      ".ekp-btn{display:inline-flex;align-items:center;gap:8px;background:#DA1D2A;color:#fff;border:0;padding:12px 18px;border-radius:9px;font-weight:700;cursor:pointer;font:inherit}" +
      ".ekp-btn[disabled]{opacity:.45;cursor:not-allowed}" +
      ".ekp-btn-ghost{display:inline-flex;align-items:center;gap:8px;background:#fff;color:#244093;border:1px solid #e5e7eb;padding:9px 14px;border-radius:9px;font-weight:600;cursor:pointer;font:inherit}" +
      ".ekp-thumbs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}" +
      ".ekp-thumb{width:64px;height:64px;border:2px solid #e5e7eb;border-radius:10px;overflow:hidden;padding:0;background:#f9fafb;cursor:pointer}" +
      ".ekp-thumb img{width:100%;height:100%;object-fit:cover;display:block}" +
      ".ekp-thumb.is-on{border-color:#DA1D2A}" +
      "@media(max-width:760px){.ekp-grid{grid-template-columns:1fr}}";
    document.head.appendChild(st);
  }

  function envolver(ctx, texto, maxW) {
    var lineas = [], palabras = String(texto).split(/\s+/), actual = "";
    for (var i = 0; i < palabras.length; i++) {
      var prueba = actual ? actual + " " + palabras[i] : palabras[i];
      if (!actual || ctx.measureText(prueba).width <= maxW) actual = prueba;
      else { if (actual) lineas.push(actual); actual = palabras[i]; }
    }
    if (actual) lineas.push(actual);
    return lineas.length ? lineas : [""];
  }
  function ajustarTexto(ctx, texto, fuente, maxW, maxH) {
    var parrafos = String(texto || "").split("\n");
    var size = Math.max(12, Math.floor(maxH / 1.3)), lineas = [], lineHeight;
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

    var campos = (p.personalizacion_campos && p.personalizacion_campos.length)
      ? p.personalizacion_campos
      : [{ tipo: "texto", label: "Tu texto", max: null, obligatorio: false }];

    // Imágenes base (por variante o generales)
    var variantesPers = (p.variantes || []).filter(function (v) { return v.imagen_personalizacion; });
    var items = [];
    var areaDef = (p.print_areas && p.print_areas[0]) || p.print_area || { x: 30, y: 30, width: 40, height: 30 };
    if (variantesPers.length) {
      var v0 = (window.EK_getVariante ? window.EK_getVariante() : null);
      items.push({ imagen: (v0 && v0.imagen_personalizacion) || variantesPers[0].imagen_personalizacion, area: (v0 && v0.print_area) || variantesPers[0].print_area || areaDef });
    } else {
      var imgs = (p.imagenes_personalizacion && p.imagenes_personalizacion.length) ? p.imagenes_personalizacion : (p.imagen_personalizacion ? [p.imagen_personalizacion] : []);
      var areas = (p.print_areas && p.print_areas.length) ? p.print_areas : (p.print_area ? [p.print_area] : []);
      imgs.forEach(function (img, i) { if (img) items.push({ imagen: img, area: areas[i] || null }); });
    }
    if (!items.length && p.imagen) items.push({ imagen: p.imagen, area: areaDef });
    if (!items.length) return;

    var idx = 0;
    inyectarEstilos();
    var destino = document.getElementById("ek-producto");
    if (!destino) return;

    var miniaturas = items.length > 1
      ? '<div class="ekp-thumbs">' + items.map(function (it, i) { return '<button type="button" class="ekp-thumb' + (i === 0 ? " is-on" : "") + '" data-i="' + i + '"><img src="' + it.imagen + '" alt=""></button>'; }).join("") + "</div>"
      : "";

    var sec = document.createElement("section");
    sec.className = "ekp";
    sec.innerHTML =
      '<h3>🎨 Personaliza tu producto</h3>' +
      '<p class="muted">Completa los campos y mira la vista previa en tiempo real.</p>' +
      miniaturas +
      '<div class="ekp-grid">' +
        '<div class="ekp-canvas"><canvas></canvas></div>' +
        '<div>' + campos.map(function (c, i) {
          if (c.tipo === "textarea") {
            return '<div class="ekp-field"><label>' + esc(c.label) + (c.obligatorio ? " *" : "") + '</label><textarea data-campo="' + i + '" rows="2" maxlength="' + (c.max || 500) + '"></textarea>' + (c.max ? '<small class="ekp-contador" data-contador="' + i + '"></small>' : '') + '</div>';
          }
          if (c.tipo === "select") {
            return '<div class="ekp-field"><label>' + esc(c.label) + (c.obligatorio ? " *" : "") + '</label><select data-campo="' + i + '">' + (c.opciones || []).map(function (o) { return '<option value="' + esc(o) + '">' + esc(o) + '</option>'; }).join("") + '</select></div>';
          }
          if (c.tipo === "foto") {
            return '<div class="ekp-field"><label>' + esc(c.label) + (c.obligatorio ? " *" : "") + '</label>' +
              '<input type="file" data-foto="' + i + '" accept="image/jpeg,image/png" hidden>' +
              '<button type="button" class="ekp-btn-ghost" data-foto-btn="' + i + '"><i class="bi bi-image"></i> Subir foto</button>' +
              '<img data-foto-img="' + i + '" style="display:none;max-width:90px;max-height:90px;margin-top:8px;border-radius:8px" alt="">' +
              '</div>';
          }
          // texto (1 línea)
          return '<div class="ekp-field"><label>' + esc(c.label) + (c.obligatorio ? " *" : "") + '</label><input type="text" data-campo="' + i + '" maxlength="' + (c.max || 500) + '">' + (c.max ? '<small class="ekp-contador" data-contador="' + i + '"></small>' : '') + '</div>';
        }).join("") +
        '<button class="ekp-btn" id="ekp-agregar" type="button"><i class="bi bi-bag-plus"></i> Agregar al carrito</button>' +
        '</div>' +
      '</div>';

    var detalle = destino.querySelector(".ek-detail");
    if (detalle) detalle.insertAdjacentElement("afterend", sec);
    else destino.appendChild(sec);

    var canvas = sec.querySelector("canvas");
    var ctx = canvas.getContext("2d");
    var fotos = {};   // índice de campo foto → dataURL

    var img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () { canvas.width = img.naturalWidth; canvas.height = img.naturalHeight; dibujar(); };
    img.onerror = function () { sec.querySelector(".muted").textContent = "No se pudo cargar la imagen base."; };
    img.src = items[0].imagen;

    if (variantesPers.length) {
      window.EK_onVarianteChange = function (v) {
        if (!v || !v.imagen_personalizacion) return;
        items[0] = { imagen: v.imagen_personalizacion, area: v.print_area || areaDef };
        idx = 0; img.src = v.imagen_personalizacion;
      };
    }

    function areaActual() { return items[idx].area || areaDef; }
    function fuenteActual() {
      for (var i = 0; i < campos.length; i++) {
        if (campos[i].tipo === "select") {
          var el = sec.querySelector('[data-campo="' + i + '"]');
          var v = el ? el.value : (campos[i].opciones && campos[i].opciones[0]);
          return FUENTES_MAPA[String(v).toLowerCase()] || v || "Montserrat";
        }
      }
      return "Montserrat";
    }

    function dibujar() {
      if (!img.naturalWidth) return;
      var pa = areaActual();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      var px = (pa.x / 100) * canvas.width, py = (pa.y / 100) * canvas.height;
      var pw = (pa.width / 100) * canvas.width, ph = (pa.height / 100) * canvas.height;

      // Fotos subidas: se dibujan arriba del área (escaladas)
      var fotosArr = [];
      campos.forEach(function (c, i) { if (c.tipo === "foto" && fotos[i]) fotosArr.push(fotos[i]); });
      var altoFotos = 0;
      if (fotosArr.length) {
        var fImg = new Image();
        fImg.onload = function () {
          var fh = ph * 0.5, fw = Math.min(pw, (fImg.width / fImg.height) * fh);
          ctx.drawImage(fImg, px + (pw - fw) / 2, py, fw, fh);
          altoFotos = fh;
          dibujarTexto(px, py + altoFotos, pw, ph - altoFotos);
        };
        fImg.src = fotosArr[0];
        return;
      }
      dibujarTexto(px, py, pw, ph);
    }

    function dibujarTexto(tx, ty, tw, th) {
      var lineasTexto = [];
      campos.forEach(function (c, i) {
        if (c.tipo === "texto" || c.tipo === "textarea") {
          var el = sec.querySelector('[data-campo="' + i + '"]');
          if (el && String(el.value).trim()) lineasTexto.push(el.value);
        }
      });
      if (!lineasTexto.length) return;
      var fit = ajustarTexto(ctx, lineasTexto.join("\n"), fuenteActual(), tw, th);
      ctx.fillStyle = "#000000";
      ctx.font = fit.size + "px " + fuenteActual();
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      var totalH = fit.lineas.length * fit.lineHeight;
      var inicioY = ty + (th - totalH) / 2 + fit.lineHeight / 2;
      fit.lineas.forEach(function (linea, i) { ctx.fillText(linea, tx + tw / 2, inicioY + i * fit.lineHeight); });
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

    // Subida de fotos (con editor si está disponible)
    sec.addEventListener("click", function (e) {
      var b = e.target.closest("[data-foto-btn]");
      if (!b) return;
      var i = +b.getAttribute("data-foto-btn");
      sec.querySelector('[data-foto="' + i + '"]').click();
    });
    sec.addEventListener("change", function (e) {
      var f = e.target.closest("[data-foto]");
      if (!f || !f.files[0]) return;
      var i = +f.getAttribute("data-foto");
      var archivo = f.files[0];
      if (!/image\/(jpeg|png)/.test(archivo.type)) { window.alert("Solo se permiten JPG o PNG."); f.value = ""; return; }
      if (window.EK_FotoEditor) {
        window.EK_FotoEditor(archivo, function (dataURL) {
          fotos[i] = dataURL;
          var prev = sec.querySelector('[data-foto-img="' + i + '"]');
          if (prev) { prev.src = dataURL; prev.style.display = ""; }
          dibujar();
        });
      } else {
        var lector = new FileReader();
        lector.onload = function () { fotos[i] = lector.result; var prev = sec.querySelector('[data-foto-img="' + i + '"]'); if (prev) { prev.src = lector.result; prev.style.display = ""; } dibujar(); };
        lector.readAsDataURL(archivo);
      }
      f.value = "";
    });

    // Validación
    var btnAgregar = sec.querySelector("#ekp-agregar");
    function validar() {
      var ok = true;
      campos.forEach(function (c, i) {
        if (!c.obligatorio) return;
        if (c.tipo === "foto") { if (!fotos[i]) ok = false; }
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
          else { var el = sec.querySelector('[data-campo="' + i + '"]'); meta[c.label] = el ? el.value : ""; }
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
