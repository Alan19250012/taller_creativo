// POST /api/checkout  →  crea una sesión de Stripe Checkout y devuelve la URL
// El carrito (nombre/precio/cantidad) lo manda el frontend. No se expone la
// clave secreta de Stripe: solo vive en esta función (server).
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
  const success_url = body.success_url;
  const cancel_url = body.cancel_url;
  if (!items.length) return cors(json({ ok: false, error: "Carrito vacío" }, 400));
  if (!env.STRIPE_SECRET_KEY) return cors(json({ ok: false, error: "STRIPE_SECRET_KEY no configurada" }, 500));

  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("payment_method_types[0]", "card");
  if (success_url) params.set("success_url", success_url);
  if (cancel_url) params.set("cancel_url", cancel_url);
  if (body.customer_email) params.set("customer_email", body.customer_email);

  items.forEach((it, i) => {
    const nombre = String(it.nombre || "Artículo").slice(0, 200);
    const cantidad = Math.max(1, Math.round(Number(it.cantidad) || 1));
    const unit = Math.max(0, Math.round((Number(it.precio) || 0) * 100));
    params.set(`line_items[${i}][quantity]`, String(cantidad));
    params.set(`line_items[${i}][price_data][currency]`, "mxn");
    params.set(`line_items[${i}][price_data][unit_amount]`, String(unit));
    params.set(`line_items[${i}][price_data][product_data][name]`, nombre);
    if (it.talla || it.color) {
      params.set(`line_items[${i}][price_data][product_data][metadata][variante]`, String((it.talla || "") + " / " + (it.color || "")).slice(0, 200));
    }
  });

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + env.STRIPE_SECRET_KEY,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return cors(json({ ok: false, error: (data.error && data.error.message) || "Error de Stripe" }, res.status));
  }
  return cors(json({ ok: true, url: data.url, id: data.id }));
}
