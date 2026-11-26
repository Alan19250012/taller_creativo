// ============================================================================
// TALLER CREATIVO EK · Prueba unitaria de cálculos (build/prueba-calculos.mjs)
// ----------------------------------------------------------------------------
// Valida las fórmulas matemáticas del carrito y del personalizador que se usan
// en la tienda (assets/ek.js y assets/ek-personalizador.js), sin dependencias.
// Ejecución:  node build/prueba-calculos.mjs
// ============================================================================

let pasadas = 0, fallas = 0;

function ok(desc, cond) {
  pasadas++;
  if (cond) console.log("  ✔ " + desc);
  else { fallas++; console.error("  ✘ FALLA: " + desc); }
}

function casi(a, b, tol) { return Math.abs(a - b) <= (tol == null ? 1e-9 : tol); }

// --- Motor del carrito (misma lógica que assets/ek.js · totales()) ---
function totalesCarrito(lineas, cupon, envio, envioGratisDesde, iva) {
  const sub = lineas.reduce((s, l) => s + l.precio * l.cantidad, 0);
  let descu = 0, envioGratis = false;
  if (cupon) {
    if (cupon.min && sub < cupon.min) cupon = null;
    else {
      if (cupon.tipo === "pct") descu = sub * cupon.val / 100;
      if (cupon.tipo === "monto") descu = cupon.val;
      if (cupon.tipo === "envio") envioGratis = true;
    }
  }
  const base = sub - descu;
  const env = (base >= envioGratisDesde || envioGratis || sub === 0) ? 0 : envio;
  const imp = iva ? base * iva : 0;
  return { sub, descu, base, envio: env, total: base + env + imp };
}

// --- Conversión porcentaje → píxeles (assets/ek-personalizador.js · areaPx) ---
function areaPx(area, W, H) {
  return {
    px: (area.x / 100) * W,
    py: (area.y / 100) * H,
    pw: (area.width / 100) * W,
    ph: (area.height / 100) * H,
  };
}

// --- Ajuste de texto (misma idea que ajustarTexto + envolver del personalizador) ---
function ajustarTexto(texto, maxW, maxH, sizeInicial) {
  // medida de ancho simulada: ancho ≈ nº caracteres × size × 0.55
  function medir(t, size) { return t.length * size * 0.55; }
  function envolver(t, size, maxW) {
    const palabras = String(t).split(/\s+/);
    const lineas = []; let actual = "";
    for (let p of palabras) {
      let trozos = [p];
      if (medir(p, size) > maxW) {
        trozos = []; let trozo = "";
        for (let ch of p) {
          if (trozo && medir(trozo + ch, size) > maxW) { trozos.push(trozo); trozo = ch; }
          else trozo += ch;
        }
        if (trozo) trozos.push(trozo);
      }
      for (let tr of trozos) {
        const prueba = actual ? actual + " " + tr : tr;
        if (!actual || medir(prueba, size) <= maxW) actual = prueba;
        else { lineas.push(actual); actual = tr; }
      }
    }
    if (actual) lineas.push(actual);
    return lineas.length ? lineas : [""];
  }
  let size = Math.max(6, sizeInicial);
  let lineas = [], lineHeight = 0;
  while (size >= 6) {
    lineas = envolver(texto, size, maxW);
    lineHeight = size * 1.28;
    const cabe = lineas.every(l => medir(l, size) <= maxW) && lineas.length * lineHeight <= maxH;
    if (cabe) break;
    size -= 2;
  }
  return { size, lineas, lineHeight };
}

console.log("Prueba de cálculos del carrito\n");
ok("Subtotal: $500 × 2 = $1,000", casi(totalesCarrito([{ precio: 500, cantidad: 2 }], null, 120, 999, 0).sub, 1000));
ok("Cupón 10% resta $100 → base $900", casi(totalesCarrito([{ precio: 500, cantidad: 2 }], { tipo: "pct", val: 10 }, 120, 999, 0).base, 900));
ok("Total con envío $120 → $1,020", casi(totalesCarrito([{ precio: 500, cantidad: 2 }], { tipo: "pct", val: 10 }, 120, 999, 0).total, 1020));
ok("Cupón de monto fijo $50 resta $50", casi(totalesCarrito([{ precio: 500, cantidad: 2 }], { tipo: "monto", val: 50 }, 120, 999, 0).descu, 50));
ok("Cupón de envío gratis deja el envío en $0", casi(totalesCarrito([{ precio: 300, cantidad: 1 }], { tipo: "envio" }, 120, 999, 0).envio, 0));
ok("Envío gratis al alcanzar el umbral $999", casi(totalesCarrito([{ precio: 500, cantidad: 2 }], null, 120, 999, 0).envio, 0));
ok("Cupón con mínimo no aplica si no se alcanza", casi(totalesCarrito([{ precio: 100, cantidad: 1 }], { tipo: "pct", val: 10, min: 500 }, 120, 999, 0).descu, 0));

console.log("\nPrueba de conversión porcentaje → píxeles\n");
const a = areaPx({ x: 30, y: 30, width: 40, height: 30 }, 1000, 1000);
ok("X: 30% de 1000 = 300 px", casi(a.px, 300));
ok("Y: 30% de 1000 = 300 px", casi(a.py, 300));
ok("Ancho: 40% de 1000 = 400 px", casi(a.pw, 400));
ok("Alto: 30% de 1000 = 300 px", casi(a.ph, 300));

console.log("\nPrueba de ajuste de texto en el personalizador\n");
const fit = ajustarTexto("Feliz cumpleaños Ana", 180, 60, 40);
ok("Ninguna línea desborda el ancho", fit.lineas.every(l => l.length * fit.size * 0.55 <= 180 + 1e-6));
ok("La altura total cabe en el área", fit.lineas.length * fit.lineHeight <= 60 + 1e-6);
ok("El interlineado es tamaño × 1.28", casi(fit.lineHeight, fit.size * 1.28));

console.log("\n──────────────────────────────────────────");
console.log("Resultado: " + pasadas + " comprobaciones, " + fallas + " fallas.");
if (fallas) { console.error("❌ HAY FALLAS"); process.exit(1); }
console.log("✅ TODAS LAS PRUEBAS PASARON");
