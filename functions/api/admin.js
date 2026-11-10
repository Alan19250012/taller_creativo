// POST /api/admin  →  proxy protegido hacia Supabase (PostgREST) con service role
// Solo administradores autenticados. La service role key NUNCA sale al navegador.
//
// Cuerpo esperado (JSON):
//   { method: "GET"|"POST"|"PATCH"|"DELETE",
//     url:    "/rest/v1/Producto?select=*&order=creadoEn.desc",
//     body:   { ... }   (opcional, para POST/PATCH) }
//
// Se valida la tabla contra una lista blanca.
import { json, cors, verifyJwt, tokenDe } from "../_lib.js";

const TABLAS_PERMITIDAS = new Set([
  "Usuario", "Categoria", "Subcategoria", "Producto", "Resena", "Pedido",
  "DetallePedido", "Factura", "Articulo", "Banner", "Cupon", "Pagina", "Configuracion", "Auditoria",
  "_CategoriaToProducto", "_ProductoToSubcategoria", "_CategoriaToSubcategoria",
]);

const RPCS_PERMITIDAS = new Set([
  "ek_upsert_usuario",
]);

export async function onRequestPost(context) {
  const env = context.env;
  const payload = await verifyJwt(tokenDe(context.request), env.JWT_SECRET);
  if (!payload) return cors(json({ ok: false, error: "No autorizado" }, 401));
  if (payload.rol !== "ADMINISTRADOR") {
    return cors(json({ ok: false, error: "No tienes permisos de administrador" }, 403));
  }

  let req;
  try {
    req = await context.request.json();
  } catch (e) {
    return cors(json({ ok: false, error: "JSON inválido" }, 400));
  }

  const method = String(req.method || "GET").toUpperCase();
  const url = String(req.url || "");

  // RPC (funciones del backend, p.ej. ek_upsert_usuario)
  if (/^\/rpc\/[A-Za-z_][A-Za-z0-9_]*$/.test(url.split("?")[0])) {
    const rpc = url.split("?")[0].replace(/^\/rpc\//, "");
    if (!RPCS_PERMITIDAS.has(rpc)) {
      return cors(json({ ok: false, error: "Función no permitida: " + rpc }, 403));
    }
    const res = await fetch(env.SUPABASE_URL + "/rest/v1/rpc/" + rpc, {
      method: "POST",
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(req.body || {}),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) return cors(json({ ok: false, error: (data && data.message) || "Error en RPC" }, res.status));
    return cors(json({ ok: true, data }));
  }

  if (!/^\/rest\/v1\/[A-Za-z_]/.test(url)) {
    return cors(json({ ok: false, error: "Ruta inválida" }, 400));
  }

  // Extraer nombre de tabla: primer segmento tras /rest/v1/
  const path = url.split("?")[0].replace(/^\/rest\/v1\//, "");
  const tabla = path.split("/")[0];
  if (!TABLAS_PERMITIDAS.has(tabla)) {
    return cors(json({ ok: false, error: "Tabla no permitida: " + tabla }, 403));
  }

  const headers = {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  };
  if (["POST", "PATCH", "DELETE"].includes(method)) {
    headers["content-type"] = "application/json";
    headers["Prefer"] = "return=representation";
  }

  const res = await fetch(env.SUPABASE_URL + url, {
    method,
    headers,
    body: ["POST", "PATCH"].includes(method) && req.body !== undefined
      ? JSON.stringify(req.body)
      : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  let data = null;
  if (contentType.includes("json")) data = await res.json().catch(() => null);
  else data = await res.text().catch(() => null);

  if (!res.ok) {
    const mensaje = data && data.message ? data.message : "Error de Supabase";
    return cors(json({ ok: false, error: mensaje, detalle: data }, res.status));
  }
  return cors(json({ ok: true, data }));
}
