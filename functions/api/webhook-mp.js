// POST /api/webhook-mp  →  notificación de Mercado Pago (pago aprobado)
// 1) Re-consulta el pago en la API de Mercado Pago (fuente de verdad: un tercero
//    no puede marcar "approved" llamando a este endpoint).
// 2) Si está aprobado, crea Pedido + DetallePedido + Factura en Supabase.
// 3) Envía la factura por correo con Resend.
//
// Idempotencia: usa external_reference como código de pedido y no crea el pedido
// si ese código ya existe (evita duplicados ante reintentos de Mercado Pago).
import { json } from "../_lib.js";

// --- helpers Supabase ---
async function pg(env, tabla, method, body) {
  const headers = {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: "Bearer " + env.SUPABASE_SERVICE_ROLE_KEY,
  };
  let payload;
  if (method !== "GET" && method !== "DELETE") {
    headers["content-type"] = "application/json";
    headers["Prefer"] = "return=representation";
    payload = JSON.stringify(body);
  }
  const res = await fetch(env.SUPABASE_URL + "/rest/v1/" + tabla, { method, headers, body: payload });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error("Supabase " + tabla + ": " + res.status + " " + err);
  }
  return res.json();
}

function esc(t) {
  return String(t == null ? "" : t).replace(/[&<>"']/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]; });
}
function money(n) { return "$" + Number(n || 0).toLocaleString("es-MX"); }

function facturaHTML(conf, num, fecha, items, total, cliente) {
  const filas = items.map(function (it) {
    return "<tr><td>" + esc(it.nombre) + "</td><td style='text-align:center'>" + it.cantidad + "</td><td style='text-align:right'>" + money(it.precio) + "</td><td style='text-align:right'>" + money(it.precio * it.cantidad) + "</td></tr>";
  }).join("");
  return `<!doctype html><html><body style="margin:0;background:#f4f5f9;font-family:Arial,sans-serif;color:#1c2333">
<div style="max-width:600px;margin:0 auto;padding:24px">
  <div style="background:#009EE3;color:#fff;padding:22px 24px;border-radius:12px 12px 0 0">
    <h1 style="margin:0;font-size:20px">${esc(conf.marca || "Taller Creativo EK")}</h1>
    <div style="opacity:.9;font-size:13px">Factura de compra · Mercado Pago</div>
  </div>
  <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px">
    <p>Hola <b>${esc(cliente)}</b>,</p>
    <p>¡Gracias por tu compra! Tu pago fue <b>confirmado</b>. Aquí está el detalle de tu factura:</p>
    <p style="font-size:13px;color:#6b7280">Factura <b>${esc(num)}</b> · ${esc(fecha)}</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <thead><tr style="background:#f3f4f6">
        <th style="text-align:left;padding:8px">Artículo</th><th style="padding:8px">Cant.</th>
        <th style="text-align:right;padding:8px">Precio</th><th style="text-align:right;padding:8px">Importe</th>
      </tr></thead><tbody>${filas}</tbody>
    </table>
    <div style="margin-top:18px;text-align:right;font-size:18px">Total: <b style="color:#009EE3">${money(total)}</b></div>
    <p style="font-size:12px;color:#6b7280;margin-top:22px;border-top:1px solid #e5e7eb;padding-top:14px">
      ${esc(conf.marca || "")} · ${esc(conf.email || "")}<br>
      Gracias por comprar en ${esc(conf.marca || "nuestra tienda")}. Cualquier duda, responde este correo o escríbenos por WhatsApp.
    </p>
  </div>
</div></body></html>`;
}

export async function onRequestPost(context) {
  const env = context.env;
  let body;
  try { body = await context.request.json(); } catch (e) { return new Response("JSON inválido", { status: 400 }); }

  // Notificaciones de pago: body.type === "payment" y body.data.id = id del pago.
  if ((body.type || "") !== "payment") return json({ received: true });
  const id = (body.data && body.data.id) || body.id || "";
  if (!id || !env.MERCADO_PAGO_ACCESS_TOKEN) return json({ received: true });

  // Re-consulta el pago: solo la API de Mercado Pago confirma el estado real.
  const pres = await fetch("https://api.mercadopago.com/v1/payments/" + encodeURIComponent(id), {
    headers: { Authorization: "Bearer " + env.MERCADO_PAGO_ACCESS_TOKEN },
  });
  if (!pres.ok) return new Response("No autorizado", { status: 400 });
  const payment = await pres.json().catch(() => null);
  if (!payment || payment.status !== "approved") return json({ received: true });

  const codigo = payment.external_reference || ("EK-" + String(payment.id || "").slice(-10).toUpperCase());
  const total = Number(payment.transaction_amount) || 0;
  const email = (payment.payer && payment.payer.email) || "";
  const cliente = payment.payer
    ? [payment.payer.first_name, payment.payer.last_name].filter(Boolean).join(" ") || payment.payer.email
    : "Cliente";
  const usuarioId = (payment.metadata && payment.metadata.usuarioId) || null;

  const items = (payment.additional_info && Array.isArray(payment.additional_info.items) && payment.additional_info.items) || [];
  const detalles = items.length
    ? items.map(function (it) {
        return { nombreProducto: it.title || "Artículo", cantidad: Math.max(1, it.quantity || 1), precioUnitario: Number(it.unit_price) || 0, tipoPrecio: "minorista" };
      })
    : [{ nombreProducto: payment.description || "Pedido", cantidad: 1, precioUnitario: total, tipoPrecio: "minorista" }];

  // Idempotencia: no duplicar el pedido si Mercado Pago reintenta la notificación.
  const yaExiste = await pg(env, "Pedido?codigo=eq." + encodeURIComponent(codigo) + "&select=id", "GET").catch(() => []);
  if (Array.isArray(yaExiste) && yaExiste[0]) return json({ received: true });

  try {
    const pedidoRows = await pg(env, "Pedido", "POST", {
      cliente, estado: "PAGADO", subtotal: total, impuesto: 0, envio: 0, total,
      metodoPago: "Mercado Pago", direccionEnvio: null, usuarioId, codigo,
    });
    const pedidoId = pedidoRows && pedidoRows[0] && pedidoRows[0].id;
    for (const it of detalles) {
      await pg(env, "DetallePedido", "POST", {
        pedidoId, nombreProducto: it.nombreProducto, cantidad: it.cantidad, precioUnitario: it.precioUnitario, tipoPrecio: it.tipoPrecio,
      });
    }

    const num = "EK-" + String(payment.id || "").slice(-10).toUpperCase();
    try { await pg(env, "Factura", "POST", { numero: num, pedidoId }); } catch (e) { /* ya existe o no aplica */ }

    if (env.RESEND_API_KEY && email) {
      const confRes = await fetch(env.SUPABASE_URL + "/rest/v1/Configuracion?select=clave,valor", {
        headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: "Bearer " + env.SUPABASE_SERVICE_ROLE_KEY },
      });
      const confRows = await confRes.json().catch(() => []);
      const conf = {};
      (confRows || []).forEach(function (c) { conf[c.clave] = c.valor; });

      const html = facturaHTML(conf, num, new Date().toLocaleString("es-MX"), detalles.map(function (d) { return { nombre: d.nombreProducto, cantidad: d.cantidad, precio: d.precioUnitario }; }), total, cliente);
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: "Bearer " + env.RESEND_API_KEY, "content-type": "application/json" },
        body: JSON.stringify({
          from: env.EMAIL_FROM || "Taller Creativo EK <onboarding@resend.dev>",
          to: [email],
          subject: "Tu factura · " + (conf.marca || "Taller Creativo EK"),
          html,
        }),
      }).catch(() => {});
    }
  } catch (err) {
    console.error("Error procesando pago Mercado Pago:", err.message);
    return new Response("Error interno", { status: 500 });
  }

  return json({ received: true });
}
