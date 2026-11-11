// POST /api/registro  →  crea una cuenta de CLIENTE (nombre, correo, teléfono, contraseña)
// La contraseña se cifra con bcrypt en Postgres (función ek_registrar_cliente,
// ejecutable solo por la service role). Después firma el JWT para dejar la sesión abierta.
import { json, cors, signJwt } from "../_lib.js";

export async function onRequestPost(context) {
  const env = context.env;
  let body;
  try {
    body = await context.request.json();
  } catch (e) {
    return cors(json({ ok: false, error: "JSON inválido" }, 400));
  }

  const nombre = String(body.nombre || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const telefono = String(body.telefono || "").trim() || null;
  const password = String(body.password || "");

  if (!nombre) return cors(json({ ok: false, error: "Escribe tu nombre" }, 400));
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return cors(json({ ok: false, error: "Correo inválido" }, 400));
  if (password.length < 6) return cors(json({ ok: false, error: "La contraseña debe tener al menos 6 caracteres" }, 400));

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/ek_registrar_cliente`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ p_nombre: nombre, p_email: email, p_telefono: telefono, p_password: password }),
  });

  const raw = await res.json().catch(() => ({}));
  const data = Array.isArray(raw) ? raw[0] : raw;
  if (!res.ok || !data || data.ok !== true) {
    return cors(json({ ok: false, error: (data && data.error) || "No se pudo crear la cuenta" }, 400));
  }

  const usuario = { id: data.id, nombre: data.nombre, email: data.email, rol: data.rol, telefono: data.telefono || null };
  const token = await signJwt({ sub: data.id, email: data.email, nombre: data.nombre, rol: data.rol }, env.JWT_SECRET);

  return cors(json({ ok: true, token, usuario }));
}
