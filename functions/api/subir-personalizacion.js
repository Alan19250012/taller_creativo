// POST /api/subir-personalizacion  →  sube la imagen compuesta del cliente (público)
// Se usa desde la tienda al "Agregar al carrito" un producto personalizado.
// Sube al bucket "imagenes" (carpeta "pedidos") y devuelve la URL pública.
import { json, cors } from "../_lib.js";

export async function onRequestPost(context) {
  const env = context.env;
  let body;
  try {
    body = await context.request.json();
  } catch (e) {
    return cors(json({ ok: false, error: "JSON inválido" }, 400));
  }

  const base64 = body.base64;
  const nombre = String(body.nombre || "personalizacion.png");
  if (!base64) return cors(json({ ok: false, error: "Falta la imagen" }, 400));

  const m = base64.match(/^data:([^;]+);base64,/);
  const mime = m ? m[1] : "image/png";
  const ext = ({ "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" })[mime] || "png";
  const limpio = base64.replace(/^data:[^;]+;base64,/, "");
  let bytes;
  try {
    bytes = Uint8Array.from(atob(limpio), function (c) { return c.charCodeAt(0); });
  } catch (e) {
    return cors(json({ ok: false, error: "Base64 inválido" }, 400));
  }
  if (!bytes.length) return cors(json({ ok: false, error: "Imagen vacía" }, 400));
  if (bytes.length > 20 * 1024 * 1024) return cors(json({ ok: false, error: "Imagen demasiado grande (máx. 20 MB)" }, 400));

  const base = nombre.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = "pedidos/" + Date.now() + "-" + base + "." + ext;

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

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    return cors(json({ ok: false, error: "Error al subir: " + err.slice(0, 200) }, res.status));
  }

  const url = env.SUPABASE_URL + "/storage/v1/object/public/imagenes/" + path;
  return cors(json({ ok: true, url }));
}
