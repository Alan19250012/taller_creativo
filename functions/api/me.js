// GET /api/me  →  valida el token y devuelve la sesión actual
import { json, cors, verifyJwt, tokenDe } from "../_lib.js";

export async function onRequest(context) {
  const env = context.env;
  const payload = await verifyJwt(tokenDe(context.request), env.JWT_SECRET);
  if (!payload) return cors(json({ ok: false, error: "No autorizado" }, 401));
  return cors(json({ ok: true, usuario: payload }));
}
