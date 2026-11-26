// POST /api/cotizaciones  →  recibe una solicitud de cotización del público
// y la guarda en la tabla "Cotizacion". El panel la consulta vía /api/admin.
//
// Cuerpo (JSON):
//   { nombre, telefono, email, producto, descripcion,
//     cantidad, materiales, medidas, fecha, imagen (base64 opcional) }
//
// La imagen de referencia (si se envía) se sube a Supabase Storage antes de
// insertar el registro, con el mismo mecanismo de /api/upload.
import { json, cors } from "../_lib.js";

const MIME_EXT = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif" };

async function subirImagen(env, base64) {
  const m = (base64 || "").match(/^data:([^;]+);base64,/);
  const mime = m ? m[1] : null;
  if (!mime || !MIME_EXT[mime]) return null;

  const limpio = base64.replace(/^data:[^;]+;base64,/, "");
  let bytes;
  try {
    bytes = Uint8Array.from(atob(limpio), (c) => c.charCodeAt(0));
  } catch (e) {
    return null;
  }
  if (!bytes.length || bytes.length > 4 * 1024 * 1024) return null; // máximo 4 MB

  const path = "cotizaciones/" + Date.now() + "." + MIME_EXT[mime];
  const res = await fetch(env.SUPABASE_URL + "/storage/v1/object/imagenes/" + path, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: "Bearer " + env.SUPABASE_SERVICE_ROLE_KEY,
      "content-type": mime,
      "x-upsert": "false",
    },
    body: bytes,
  });
  if (!res.ok) return null;
  return env.SUPABASE_URL + "/storage/v1/object/public/imagenes/" + path;
}

export async function onRequestPost(context) {
  const env = context.env;
  let body;
  try {
    body = await context.request.json();
  } catch (e) {
    return cors(json({ ok: false, error: "JSON inválido" }, 400));
  }

  const nombre = String(body.nombre || "").trim();
  const telefono = String(body.telefono || "").trim() || null;
  const email = String(body.email || "").trim().toLowerCase() || null;
  const producto = String(body.producto || "").trim() || null;
  const descripcion = String(body.descripcion || "").trim();
  const cantidad = String(body.cantidad || "").trim() || null;
  const materiales = String(body.materiales || "").trim() || null;
  const medidas = String(body.medidas || "").trim() || null;
  const fecha = String(body.fecha || "").trim() || null;

  // Honeypot anti-spam: campo oculto que solo los bots rellenan
  if (body.website && String(body.website).length) return cors(json({ ok: false, error: "Solicitud rechazada" }, 400));

  if (!nombre) return cors(json({ ok: false, error: "Escribe tu nombre" }, 400));
  if (descripcion.length < 5) return cors(json({ ok: false, error: "Describe brevemente qué necesitas" }, 400));
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return cors(json({ ok: false, error: "Correo inválido" }, 400));

  const imagen = await subirImagen(env, body.imagen);

  const res = await fetch(env.SUPABASE_URL + "/rest/v1/Cotizacion", {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: "Bearer " + env.SUPABASE_SERVICE_ROLE_KEY,
      "content-type": "application/json",
      "Prefer": "return=representation",
    },
    body: JSON.stringify({ nombre, telefono, email, producto, descripcion, cantidad, materiales, medidas, fecha, imagen, estado: "PENDIENTE" }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) return cors(json({ ok: false, error: (data && data.message) || "No se pudo guardar la cotización" }, res.status));
  return cors(json({ ok: true, id: Array.isArray(data) && data[0] ? data[0].id : null }));
}
