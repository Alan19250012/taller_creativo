// POST /api/checkout-mp  →  crea una preferencia de Mercado Pago con PRECIOS REVALIDADOS EN EL SERVIDOR.
// Igual que /api/checkout: el navegador manda slug/cantidad/talla/color y aquí se
// recalculan precios, cupón y envío contra Supabase. La clave vive solo en el servidor.
import { json, cors } from "../_lib.js";

async function supabase(env, path) {
  const res = await fetch(env.SUPABASE_URL + path, {
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: "Bearer " + env.SUPABASE_SERVICE_ROLE_KEY,
    },
  });
  if (!res.ok) throw new Error("Supabase " + res.status + " " + (await res.text()).slice(0, 120));
  return res.json();
}

export async function onRequestPost(context) {
  const env = context.env;
  let body;
  try {
    body = await context.request.json();
  } catch (e) {
    return cors(json({ ok: false, error: "JSON inválido" }, 400));
  }

  const items = Array.isArray(body.items) ? body.items : [];
  const usuarioId = body.usuarioId || "";
  const cuponCodigo = String(body.cupon || "").trim().toUpperCase();

  if (!items.length) return cors(json({ ok: false, error: "Carrito vacío" }, 400));
  if (!env.MERCADO_PAGO_ACCESS_TOKEN) {
    return cors(json({ ok: false, error: "MERCADO_PAGO_ACCESS_TOKEN no configurada" }, 500));
  }

  // 1) Precios reales desde la base de datos
  const lineas = [];
  for (const it of items) {
    const slug = String(it.slug || "").trim();
    const cantidad = Math.max(1, Math.round(Number(it.cantidad) || 1));
    if (!slug) return cors(json({ ok: false, error: "Artículo sin slug" }, 400));

    let prod;
    try {
      const rows = await supabase(env, "/rest/v1/Producto?slug=eq." + encodeURIComponent(slug) + "&select=id,slug,nombre,precioMinorista&limit=1");
      prod = rows && rows[0];
    } catch (e) {
      prod = null;
    }
    if (!prod) return cors(json({ ok: false, error: "Producto no encontrado: " + slug }, 400));

    let precio = Number(prod.precioMinorista) || 0;
    if (it.talla || it.color) {
      try {
        const vrows = await supabase(env, "/rest/v1/Variante?productoId=eq." + prod.id +
          "&talla=eq." + encodeURIComponent(String(it.talla || "")) +
          "&color=eq." + encodeURIComponent(String(it.color || "")) + "&select=precio&limit=1");
        if (vrows && vrows[0] && vrows[0].precio != null) precio = Number(vrows[0].precio) || precio;
      } catch (e) { /* se conserva el precio base */ }
    }

    if (!(precio > 0)) return cors(json({ ok: false, error: "Producto sin precio configurado: " + slug }, 400));

    lineas.push({ slug: prod.slug, nombre: prod.nombre, cantidad, precio, talla: it.talla || null, color: it.color || null });
  }

  // 2) Cupón desde la base de datos
  let descuento = 0, envioGratis = false;
  if (cuponCodigo) {
    try {
      const crows = await supabase(env, "/rest/v1/Cupon?codigo=eq." + encodeURIComponent(cuponCodigo) + "&select=*&limit=1");
      const cupon = crows && crows[0];
      if (cupon && cupon.activo !== false) {
        const subtotal = lineas.reduce((s, l) => s + l.precio * l.cantidad, 0);
        if (!cupon.minimo || subtotal >= Number(cupon.minimo)) {
          if (cupon.tipo === "pct") descuento = subtotal * (Number(cupon.valor) || 0) / 100;
          else if (cupon.tipo === "monto") descuento = Number(cupon.valor) || 0;
          else if (cupon.tipo === "envio") envioGratis = true;
        }
      }
    } catch (e) { /* cupón ignorado si falla */ }
  }

  // 3) Envío desde Configuracion
  const subtotal = lineas.reduce((s, l) => s + l.precio * l.cantidad, 0);
  if (descuento > subtotal) descuento = subtotal;
  let envioFinal = 0, envioGratisDesde = Infinity;
  try {
    const confRows = await supabase(env, "/rest/v1/Configuracion?select=clave,valor");
    const conf = {};
    (confRows || []).forEach((c) => { conf[c.clave] = c.valor; });
    envioFinal = Number(conf.envio) || 0;
    envioGratisDesde = Number(conf.envioGratisDesde) || Infinity;
  } catch (e) { /* envío 0 si no hay configuración */ }

  const base = subtotal - descuento;
  if (envioGratis || base >= envioGratisDesde) envioFinal = 0;

  // 4) Reparte el descuento proporcionalmente
  const factor = subtotal > 0 ? (subtotal - descuento) / subtotal : 1;

  const mpItems = lineas.map(function (l, i) {
    const item = {
      id: String(i + 1),
      title: String(l.nombre).slice(0, 256),
      quantity: l.cantidad,
      unit_price: Math.max(0, Number((l.precio * factor).toFixed(2))),
      currency_id: "MXN",
    };
    if (l.talla || l.color) item.description = String((l.talla || "") + " / " + (l.color || "")).slice(0, 256);
    return item;
  });

  if (envioFinal > 0) {
    mpItems.push({
      id: String(lineas.length + 1),
      title: "Envío",
      quantity: 1,
      unit_price: Number(envioFinal.toFixed(2)),
      currency_id: "MXN",
    });
  }

  // Código único de pedido: external_reference para idempotencia del webhook
  const codigo = "EK-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();

  const origin = new URL(context.request.url).origin;
  const baseUrl = body.base || "carrito.html";

  const preferencia = {
    items: mpItems,
    external_reference: codigo,
    back_urls: {
      success: baseUrl + "?pago=ok",
      failure: baseUrl + "?pago=cancelado",
      pending: baseUrl + "?pago=pendiente",
    },
    auto_return: "approved",
    notification_url: origin + "/api/webhook-mp",
    ...(usuarioId ? { metadata: { usuarioId: String(usuarioId) } } : {}),
  };

  const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + env.MERCADO_PAGO_ACCESS_TOKEN,
      "content-type": "application/json",
    },
    body: JSON.stringify(preferencia),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return cors(json({ ok: false, error: (data && data.message) || "Error de Mercado Pago" }, res.status));
  }
  return cors(json({ ok: true, url: data.init_point || data.sandbox_init_point || "", id: data.id }));
}
