// POST /api/checkout-mp  →  crea una preferencia de Mercado Pago (Checkout Pro)
// y devuelve la URL de pago (init_point). La clave (ACCESS TOKEN) vive solo en
// el servidor, igual que la clave secreta de Stripe.
//
// Cuerpo (JSON):
//   { items: [{ nombre, precio, cantidad, talla?, color? }], usuarioId?, base? }
//
// El total de Mercado Pago se calcula desde los items que manda el frontend
// (misma estrategia que /api/checkout de Stripe).
import { json, cors } from "../_lib.js";

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
  if (!items.length) return cors(json({ ok: false, error: "Carrito vacío" }, 400));
  if (!env.MERCADO_PAGO_ACCESS_TOKEN) {
    return cors(json({ ok: false, error: "MERCADO_PAGO_ACCESS_TOKEN no configurada" }, 500));
  }

  // Código único de pedido: se reutiliza como external_reference para dar
  // idempotencia al webhook (evita pedidos duplicados ante reintentos).
  const codigo = "EK-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();

  const origin = new URL(context.request.url).origin;
  const base = body.base || "carrito.html";

  const preferencia = {
    items: items.map(function (it, i) {
      const item = {
        id: String(i + 1),
        title: String(it.nombre || "Artículo").slice(0, 256),
        quantity: Math.max(1, Math.round(Number(it.cantidad) || 1)),
        unit_price: Math.max(0, Number(it.precio) || 0),
        currency_id: "MXN",
      };
      if (it.talla || it.color) item.description = String((it.talla || "") + " / " + (it.color || "")).slice(0, 256);
      return item;
    }),
    external_reference: codigo,
    back_urls: {
      success: base + "?pago=ok",
      failure: base + "?pago=cancelado",
      pending: base + "?pago=pendiente",
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
