// ============================================================================
//  Utilidades compartidas de las Pages Functions (cero dependencias)
//  · json(): respuesta JSON
//  · signJwt()/verifyJwt(): JWT HS256 con WebCrypto (no requiere npm)
// ============================================================================

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export function cors(response) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Headers", "authorization, content-type");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  return response;
}

// --- base64url ---
function b64url(bytes) {
  const arr = new Uint8Array(bytes);
  let s = "";
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const bin = atob(str);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
function decodeUtf8(bytes) {
  return new TextDecoder().decode(bytes);
}

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

// --- JWT HS256 ---
export async function signJwt(payload, secret, expSeconds = 60 * 60 * 8) {
  const enc = new TextEncoder();
  const header = { alg: "HS256", typ: "JWT" };
  const p = { ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + expSeconds };
  const h = b64url(enc.encode(JSON.stringify(header)));
  const body = b64url(enc.encode(JSON.stringify(p)));
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(h + "." + body));
  return h + "." + body + "." + b64url(sig);
}

export async function verifyJwt(token, secret) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const key = await hmacKey(secret);
    const sig = b64urlDecode(parts[2]);
    const ok = await crypto.subtle.verify("HMAC", key, sig, new TextEncoder().encode(parts[0] + "." + parts[1]));
    if (!ok) return null;
    const payload = JSON.parse(decodeUtf8(b64urlDecode(parts[1])));
    if (payload.exp && Date.now() >= payload.exp * 1000) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

export function tokenDe(request) {
  const auth = request.headers.get("authorization") || "";
  return auth.startsWith("Bearer ") ? auth.slice(7) : "";
}
