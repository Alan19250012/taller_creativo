// POST /api/perfil  →  actualiza nombre, teléfono y (opcional) contraseña del cliente autenticado
import { json, cors, verifyJwt, tokenDe } from "../_lib.js";

export async function onRequestPost(context) {
  const env = context.env;
  const payload = await verifyJwt(tokenDe(context.request), env.JWT_SECRET);
  if (!payload) return cors(json({ ok: false, error: "No autorizado" }, 401));

  let body;
  try {
    body = await context.request.json();
  } catch (e) {
    return cors(json({ ok: false, error: "JSON inválido" }, 400));
  }

  const nombre = String(body.nombre || "").trim();
  const telefono = String(body.telefono || "").trim() || null;
  const password = String(body.password || "");

  if (!nombre) return cors(json({ ok: false, error: "Escribe tu nombre" }, 400));
  if (password && password.length < 6) return cors(json({ ok: false, error: "La nueva contraseña debe tener al menos 6 caracteres" }, 400));

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/ek_actualizar_perfil`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ p_id: payload.sub, p_nombre: nombre, p_telefono: telefono, p_password: password }),
  });

  const raw = await res.json().catch(() => ({}));
  const data = Array.isArray(raw) ? raw[0] : raw;
  if (!res.ok || !data || data.ok !== true) {
    return cors(json({ ok: false, error: (data && data.error) || "No se pudo actualizar el perfil" }, 400));
  }

  return cors(json({ ok: true, nombre: data.nombre, telefono: data.telefono }));
}
