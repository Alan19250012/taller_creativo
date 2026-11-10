// POST /api/upload  →  sube una imagen a Supabase Storage (bucket "imagenes")
// Solo administradores. Recibe { base64, nombre, tipo } y devuelve la URL pública.
import { json, cors, verifyJwt, tokenDe } from "../_lib.js";

export async function onRequestPost(context) {
  const env = context.env;
  const payload = await verifyJwt(tokenDe(context.request), env.JWT_SECRET);
  if (!payload) return cors(json({ ok: false, error: "No autorizado" }, 401));
  if (payload.rol !== "ADMINISTRADOR") {
    return cors(json({ ok: false, error: "No tienes permisos de administrador" }, 403));
  }

  let body;
  try {
    body = await context.request.json();
  } catch (e) {
    return cors(json({ ok: false, error: "JSON inválido" }, 400));
  }

  const base64 = body.base64;
  const nombre = String(body.nombre || "imagen.jpg");
  const tipo = String(body.tipo || "productos").replace(/[^a-zA-Z0-9_-]/g, "");
  if (!base64) return cors(json({ ok: false, error: "Falta la imagen (base64)" }, 400));

  const limpio = base64.replace(/^data:[^;]+;base64,/, "");
  let bytes;
  try {
    bytes = Uint8Array.from(atob(limpio), function (c) { return c.charCodeAt(0); });
  } catch (e) {
    return cors(json({ ok: false, error: "Base64 inválido" }, 400));
  }
  if (!bytes.length) return cors(json({ ok: false, error: "Imagen vacía" }, 400));

  const nombreSeguro = nombre.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = tipo + "/" + Date.now() + "-" + nombreSeguro;

  const res = await fetch(env.SUPABASE_URL + "/storage/v1/object/imagenes/" + path, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: "Bearer " + env.SUPABASE_SERVICE_ROLE_KEY,
      "content-type": "application/octet-stream",
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
