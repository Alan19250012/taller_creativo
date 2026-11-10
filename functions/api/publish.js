// POST /api/publish  →  dispara el Deploy Hook de Cloudflare Pages (redeploy SSG)
import { json, cors, verifyJwt, tokenDe } from "../_lib.js";

export async function onRequestPost(context) {
  const env = context.env;
  const payload = await verifyJwt(tokenDe(context.request), env.JWT_SECRET);
  if (!payload) return cors(json({ ok: false, error: "No autorizado" }, 401));
  if (payload.rol !== "ADMINISTRADOR") {
    return cors(json({ ok: false, error: "No tienes permisos de administrador" }, 403));
  }

  if (!env.DEPLOY_HOOK_URL) {
    return cors(json({ ok: false, error: "DEPLOY_HOOK_URL no está configurado" }, 500));
  }

  try {
    const res = await fetch(env.DEPLOY_HOOK_URL, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
    if (!res.ok) {
      return cors(json({ ok: false, error: "Cloudflare respondió " + res.status }, res.status));
    }
    return cors(json({ ok: true, mensaje: "Despliegue iniciado" }));
  } catch (e) {
    return cors(json({ ok: false, error: "No se pudo disparar el despliegue: " + e.message }, 500));
  }
}
