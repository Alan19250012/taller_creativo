// POST /api/login  →  verifica credenciales (bcrypt vía RPC ek_login) y firma JWT
import { json, cors, signJwt } from "../_lib.js";

export async function onRequestPost(context) {
  const env = context.env;
  let body;
  try {
    body = await context.request.json();
  } catch (e) {
    return cors(json({ ok: false, error: "JSON inválido" }, 400));
  }

  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!email || !password) {
    return cors(json({ ok: false, error: "Escribe correo y contraseña" }, 400));
  }

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/ek_login`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ p_email: email, p_password: password }),
  });

  const raw = await res.json().catch(() => ({}));
  const data = Array.isArray(raw) ? raw[0] : raw;
  if (!res.ok || !data || data.ok !== true) {
    return cors(json({ ok: false, error: "Correo o contraseña incorrectos" }, 401));
  }

  const token = await signJwt(
    { sub: data.id, email: data.email, nombre: data.nombre, rol: data.rol },
    env.JWT_SECRET
  );

  return cors(json({
    ok: true,
    token,
    usuario: { id: data.id, nombre: data.nombre, email: data.email, rol: data.rol, telefono: data.telefono || null },
  }));
}
