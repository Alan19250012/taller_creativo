// POST /api/webhook  →  webhook de Stripe (checkout.session.completed)
// 1) Verifica la firma del webhook (HMAC-SHA256 con WebCrypto).
// 2) Crea el Pedido + DetallePedido en Supabase.
// 3) Genera la factura HTML y la envía por correo con Resend.
import { json } from "../_lib.js";

const TEXT_ENC = new TextEncoder();

// --- verificación de firma de Stripe (v1 = HMAC-SHA256 hex) ---
async function verificarFirma(body, header, secret) {
  if (!header || !secret) return false;
  let t = "", v1 = "";
  header.split(",").forEach(function (p) {
    const i = p.indexOf("=");
    if (i < 0) return;
    const k = p.slice(0, i).trim();
    const v = p.slice(i + 1).trim();
    if (k === "t") t = v;
    if (k === "v1") v1 = v;
  });
  if (!t || !v1) return false;
  // tolerancia de 5 minutos
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;

  const key = await crypto.subtle.importKey("raw", TEXT_ENC.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, TEXT_ENC.encode(t + "." + body));
  const hex = Array.from(new Uint8Array(sig)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
  return igualSeguro(hex, v1);
}
function igualSeguro(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

// --- helpers Supabase ---
async function pg(env, tabla, method, body) {
  const headers = {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: "Bearer " + env.SUPABASE_SERVICE_ROLE_KEY,
  };
  let url = env.SUPABASE_URL + "/rest/v1/" + tabla;
  let payload;
  if (method === "GET" || method === "DELETE") {
    // url ya incluye filtros
  } else {
    headers["content-type"] = "application/json";
    headers["Prefer"] = "return=representation";
    payload = JSON.stringify(body);
  }
  const res = await fetch(url, { method, headers, body: payload });
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
  <div style="background:#DA1D2A;color:#fff;padding:22px 24px;border-radius:12px 12px 0 0">
    <h1 style="margin:0;font-size:20px">${esc(conf.marca || "Taller Creativo EK")}</h1>
    <div style="opacity:.9;font-size:13px">Factura de compra</div>
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
    <div style="margin-top:18px;text-align:right;font-size:18px">Total: <b style="color:#DA1D2A">${money(total)}</b></div>
    <p style="font-size:12px;color:#6b7280;margin-top:22px;border-top:1px solid #e5e7eb;padding-top:14px">
      ${esc(conf.marca || "")} · ${esc(conf.email || "")}<br>
      Gracias por comprar en ${esc(conf.marca || "nuestra tienda")}. Cualquier duda, responde este correo o escríbenos por WhatsApp.
    </p>
  </div>
</div></body></html>`;
}

export async function onRequestPost(context) {
  const env = context.env;
  const rawBody = await context.request.text();
  const firma = context.request.headers.get("stripe-signature") || "";

  if (!(await verificarFirma(rawBody, firma, env.STRIPE_WEBHOOK_SECRET))) {
    return new Response("Firma inválida", { status: 400 });
  }

  let event;
  try { event = JSON.parse(rawBody); } catch (e) { return new Response("JSON inválido", { status: 400 }); }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    try {
      // 1) línea de items de Stripe
      const liRes = await fetch("https://api.stripe.com/v1/checkout/sessions/" + session.id + "/line_items", {
        headers: { Authorization: "Bearer " + env.STRIPE_SECRET_KEY },
      });
      const liData = await liRes.json();
      const items = (liData.data || []).map(function (li) {
        const unit = li.price && li.price.unit_amount != null ? li.price.unit_amount / 100 : (li.amount_total / Math.max(1, li.quantity)) / 100;
        return {
          nombre: li.description || (li.price && li.price.product_data && li.price.product_data.name) || "Artículo",
          cantidad: li.quantity || 1,
          precio: unit,
        };
      });

      const total = (session.amount_total || 0) / 100;
      const cliente = (session.customer_details && session.customer_details.name) || (session.customer_details && session.customer_details.email) || "Cliente";
      const email = (session.customer_details && session.customer_details.email) || session.customer_email || "";
      const telefono = (session.customer_details && session.customer_details.phone) || null;
      const dir = session.customer_details && session.customer_details.address
        ? [session.customer_details.address.line1, session.customer_details.address.city, session.customer_details.address.postal_code].filter(Boolean).join(", ")
        : null;

      // Vínculo con la cuenta del cliente: client_reference_id (id de Usuario) o, si no, por correo.
      let usuarioId = session.client_reference_id || null;
      if (!usuarioId && email) {
        try {
          const u = await pg(env, "Usuario?email=eq." + encodeURIComponent(email.trim().toLowerCase()) + "&select=id", "GET");
          if (u && u[0] && u[0].id) usuarioId = u[0].id;
        } catch (e) { /* sin enlace por correo */ }
      }

      // Código único de pedido (generado automáticamente)
      const codigo = "EK-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();

      // 2) Pedido en Supabase
      const pedidoRows = await pg(env, "Pedido", "POST", {
        cliente, estado: "PAGADO", subtotal: total, impuesto: 0, envio: 0, total,
        metodoPago: "Tarjeta (Stripe)", direccionEnvio: dir, usuarioId, telefono, codigo,
      });
      const pedidoId = pedidoRows && pedidoRows[0] && pedidoRows[0].id;

      for (const it of items) {
        await pg(env, "DetallePedido", "POST", {
          pedidoId, nombreProducto: it.nombre, cantidad: it.cantidad, precioUnitario: it.precio, tipoPrecio: "minorista",
        });
      }

      // 3) Factura (registro)
      const num = "EK-" + (session.payment_intent || session.id).slice(-10).toUpperCase();
      try {
        await pg(env, "Factura", "POST", { numero: num, pedidoId });
      } catch (e) { /* la factura ya existe o no aplica */ }

      // 4) Correo con la factura (Resend)
      if (env.RESEND_API_KEY && email) {
        const confRes = await fetch(env.SUPABASE_URL + "/rest/v1/Configuracion?select=clave,valor", {
          headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: "Bearer " + env.SUPABASE_SERVICE_ROLE_KEY },
        });
        const confRows = await confRes.json().catch(() => []);
        const conf = {};
        (confRows || []).forEach(function (c) { conf[c.clave] = c.valor; });

        const html = facturaHTML(conf, num, new Date().toLocaleString("es-MX"), items, total, cliente);
        const mailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: "Bearer " + env.RESEND_API_KEY, "content-type": "application/json" },
          body: JSON.stringify({
            from: env.EMAIL_FROM || "Taller Creativo EK <onboarding@resend.dev>",
            to: [email],
            subject: "Tu factura · " + (conf.marca || "Taller Creativo EK"),
            html,
          }),
        });
        const mailData = await mailRes.json().catch(() => ({}));
        if (!mailRes.ok) console.error("Resend error:", JSON.stringify(mailData));
      }
    } catch (err) {
      console.error("Error procesando pago:", err.message);
      return new Response("Error interno", { status: 500 });
    }
  }

  return json({ received: true });
}
