// GET /api/mis-pedidos  →  historial de pedidos del cliente autenticado
// Verifica el JWT y lee (con service role) los pedidos vinculados a usuarioId = sub.
import { json, cors, verifyJwt, tokenDe } from "../_lib.js";

export async function onRequest(context) {
  const env = context.env;
  const payload = await verifyJwt(tokenDe(context.request), env.JWT_SECRET);
  if (!payload) return cors(json({ ok: false, error: "No autorizado" }, 401));

  const uid = payload.sub;
  const h = {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  };

  try {
    const [pedidos, detalles, productos] = await Promise.all([
      fetch(`${env.SUPABASE_URL}/rest/v1/Pedido?select=id,codigo,estado,total,creadoEn,direccionEnvio,metodoPago&usuarioId=eq.${uid}&order=creadoEn.desc`, { headers: h }).then((r) => r.json()),
      fetch(`${env.SUPABASE_URL}/rest/v1/DetallePedido?select=pedidoId,productoId,nombreProducto,cantidad,precioUnitario,talla`, { headers: h }).then((r) => r.json()),
      fetch(`${env.SUPABASE_URL}/rest/v1/Producto?select=id,slug`, { headers: h }).then((r) => r.json()),
    ]);

    const slugPorId = {};
    (Array.isArray(productos) ? productos : []).forEach((p) => { slugPorId[p.id] = p.slug; });

    const lista = (Array.isArray(pedidos) ? pedidos : []).map((p) => {
      const items = (Array.isArray(detalles) ? detalles : [])
        .filter((d) => d.pedidoId === p.id)
        .map((d) => ({ slug: slugPorId[d.productoId] || "", nombre: d.nombreProducto, cantidad: d.cantidad, precio: d.precioUnitario, talla: d.talla || "" }));
      return { id: p.id, codigo: p.codigo, estado: p.estado, total: p.total, creadoEn: p.creadoEn, direccionEnvio: p.direccionEnvio, metodoPago: p.metodoPago, items };
    });

    return cors(json({ ok: true, pedidos: lista }));
  } catch (e) {
    return cors(json({ ok: false, error: e.message }, 500));
  }
}
