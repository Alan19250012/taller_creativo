// POST /api/checkout  →  crea una sesión de Stripe Checkout con PRECIOS REVALIDADOS EN EL SERVIDOR.
// El navegador manda slug/cantidad/talla/color; los precios, el cupón y el envío se
// recalculan aquí contra Supabase (service role). El precio que envíe el cliente se ignora.
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
  const success_url = body.success_url;
  const cancel_url = body.cancel_url;
  const email = body.email || body.customer_email || "";
  const usuarioId = body.usuarioId || "";
  const cuponCodigo = String(body.cupon || "").trim().toUpperCase();

  if (!items.length) return cors(json({ ok: false, error: "Carrito vacío" }, 400));
  if (!env.STRIPE_SECRET_KEY) return cors(json({ ok: false, error: "STRIPE_SECRET_KEY no configurada" }, 500));

  // 1) Precios reales desde la base de datos (por slug; si hay talla/color, por variante)
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

    lineas.push({
      slug: prod.slug,
      nombre: prod.nombre,
      cantidad,
      precio,
      talla: it.talla || null,
      color: it.color || null,
      personalizacion: it.personalizacion || null,
    });
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
    } catch (e) { /* cupón ignorado si falla la consulta */ }
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

  // 4) Reparte el descuento proporcionalmente sobre el precio unitario (Stripe no acepta
  //    líneas negativas, así que el descuento se absorbe en cada precio).
  const factor = subtotal > 0 ? (subtotal - descuento) / subtotal : 1;

  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("payment_method_types[0]", "card");
  if (success_url) params.set("success_url", success_url);
  if (cancel_url) params.set("cancel_url", cancel_url);
  if (email) params.set("customer_email", email);
  if (usuarioId) params.set("client_reference_id", usuarioId);
  params.set("phone_number_collection[enabled]", "true");

  lineas.forEach((l, i) => {
    const unit = Math.max(0, Math.round(l.precio * factor * 100)); // centavos
    params.set(`line_items[${i}][quantity]`, String(l.cantidad));
    params.set(`line_items[${i}][price_data][currency]`, "mxn");
    params.set(`line_items[${i}][price_data][unit_amount]`, String(unit));
    params.set(`line_items[${i}][price_data][product_data][name]`, String(l.nombre).slice(0, 200));
    if (l.talla || l.color) {
      params.set(`line_items[${i}][price_data][product_data][metadata][variante]`, String((l.talla || "") + " / " + (l.color || "")).slice(0, 200));
    }
    if (l.personalizacion) {
      params.set(`line_items[${i}][price_data][product_data][metadata][personalizacion]`, JSON.stringify(l.personalizacion).slice(0, 490));
    }
    params.set(`line_items[${i}][price_data][product_data][metadata][slug]`, String(l.slug).slice(0, 100));
  });

  // Envío como línea aparte (calculado en el servidor)
  if (envioFinal > 0) {
    const i = lineas.length;
    params.set(`line_items[${i}][quantity]`, "1");
    params.set(`line_items[${i}][price_data][currency]`, "mxn");
    params.set(`line_items[${i}][price_data][unit_amount]`, String(Math.round(envioFinal * 100)));
    params.set(`line_items[${i}][price_data][product_data][name]`, "Envío");
  }

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
