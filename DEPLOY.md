# 🚀 Desplegar Taller Creativo EK · Tienda estática + Panel admin + Supabase

Arquitectura **Jamstack híbrida**:

| Qué | Cómo se actualiza |
|---|---|
| Catálogo (productos, precios, categorías, banners, blog, configuración de la interfaz) | **Estático** → se regenera desde Supabase y se redeploya con un Deploy Hook (1-3 min) |
| Stock, reseñas, calificación y ventas | **Tiempo real** → la tienda los lee desde Supabase al abrirse (`assets/ek-live.js`) |
| Pedidos, clientes y contraseñas | Solo dentro del **panel** (privado, con service role vía Pages Functions) |

```
Tienda estática (Cloudflare Pages)          Panel admin  (/admin)
        │  assets/ek-*.js (generados)            │  HTML+JS puro
        │                                        │
        │  ek-live.js → Supabase (anon, RLS)     │  /api/* → Supabase (service role)
        └──────────────┬─────────────────────────┴───────────────
                       │
                  Supabase (Postgres + Auth bcrypt + RLS)
```

---

## 1. Preparar Supabase (una sola vez)

1. Entra a tu proyecto de Supabase → **SQL Editor** → **New query**.
2. Pega el contenido de **`schema.sql`** (el de la raíz del proyecto) y pulsa **Run**.
   - Crea/recrea todas las tablas, la función de login `ek_login`, `ek_upsert_usuario`, las políticas RLS y el usuario admin.
3. Pega el contenido de **`seed.sql`** y pulsa **Run**.
   - Carga el catálogo real: **100 productos, 22 categorías, 56 subcategorías, 10 banners, 10 reseñas, 8 artículos de blog** y la configuración.

> `schema.sql` ya hace `DROP ... CASCADE`, así que puedes re-ejecutarlo sin error (borra y recrea).
> Credenciales del panel: **admin@ek.com / admin123**.

### Regenerar el seed si cambias el catálogo a mano
El seed se genera desde los archivos del sitio con:
```bash
node generar-seed.mjs      # desde la raíz del proyecto
```

---

## 2. Probar en local (opcional)

```bash
cd "taller creativo esperimental"

# Regenera los archivos estáticos desde Supabase
node build/sincronizar-supabase.mjs

# Ver la tienda (sin panel, sin funciones)
node build/servidor.mjs          # → http://localhost:5173
```

Para probar la tienda **+ panel + funciones** en local con Wrangler:
```bash
npx wrangler pages dev .         # lee .dev.vars (funciones) y sirve la estática
```
El panel quedará en `http://localhost:8788/admin/`.

---

## 3. Desplegar en Cloudflare Pages

### 3.1 Sube el código a un repositorio Git
El deployable es el **contenido de la carpeta `taller creativo esperimental/`** (no la carpeta raíz del proyecto). Súbela como raíz de un repo (GitHub/GitLab).

> El `.gitignore` ya excluye `.env`, `.dev.vars` y `node_modules`.

### 3.2 Crea el proyecto en Cloudflare
1. **Workers & Pages → Create → Pages → Connect to Git**.
2. Elige el repo. En **Build configuration**:
   - **Framework preset:** `None`.
   - **Build command:** `node build/sincronizar-supabase.mjs`
   - **Build output directory:** `/` (la raíz, donde está `index.html`).

### 3.3 Variables de entorno (obligatorias)
En **Settings → Environment variables → Production** agrega:

| Nombre | Valor |
|---|---|
| `SUPABASE_URL` | `https://vqefszeokokdbykzwloq.supabase.co` |
| `SUPABASE_ANON_KEY` | tu anon key (pública) |
| `SUPABASE_SERVICE_ROLE_KEY` | tu service role key (secreta, solo server) |
| `JWT_SECRET` | una cadena larga y aleatoria (firma las sesiones del panel) |
| `DEPLOY_HOOK_URL` | el Deploy Hook (paso 3.4) |

Marca `SUPABASE_SERVICE_ROLE_KEY` y `JWT_SECRET` como **secret** si Cloudflare lo permite.

### 3.4 Crea el Deploy Hook (para el botón "Publicar cambios")
1. En el proyecto Pages → **Settings → Builds & deployments → Deploy hooks → Add deploy hook**.
2. Nombre: `panel-admin` · Branch: `main` (o el que uses).
3. Copia la **URL** y pégala en la variable `DEPLOY_HOOK_URL` (paso 3.3).

### 3.5 Despliega
Cloudflare hará el primer build (ejecuta el sync y publica). Al terminar tendrás:
- **Tienda:** `https://tu-proyecto.pages.dev/`
- **Panel:** `https://tu-proyecto.pages.dev/admin/`  → login `admin@ek.com / admin123`

---

## 4. Cómo funciona el panel

1. Entra a `/admin/` y entra con `admin@ek.com / admin123`.
2. Edita lo que necesites (productos, categorías, banners, blog, configuración, reseñas, pedidos, clientes).
3. Para cambios **estáticos** (catálogo/interfaz) pulsa **"Publicar cambios"** → dispara el Deploy Hook → Cloudflare reconstruye y redeploya.
4. Los cambios **en vivo** (stock, reseñas, calificación, ventas) se ven al instante en la tienda, sin publicar.

### Secciones del panel
- **Resumen** — contadores y el botón de publicar.
- **Productos** — crear/editar/borrar; categorías múltiples, colores, tallas, precios, stock, destacados.
- **Categorías / Subcategorías** — temporadas y tipos de producto, con iconos y navegación.
- **Banners** — carrusel de la portada.
- **Blog** — artículos (HTML).
- **Reseñas** — aprobar/ocultar/borrar.
- **Pedidos** — ver detalle y cambiar estado.
- **Clientes** — crear/editar usuarios y contraseñas (bcrypt, por RPC).
- **Configuración** — datos de contacto, pagos, colores de marca, FAQ, etc.

---

## 5. Seguridad (léelo)

- ⚠️ **Rota las claves** que se compartieron en el chat: Supabase (anon, service role, contraseña de BD), Stripe y Resend. Especialmente la **service role key** y la contraseña de la base de datos.
- La **service role key** y el **JWT_SECRET** viven SOLO en el servidor (variables de Cloudflare / `.env` gitignorado). Nunca en el navegador.
- La **anon key** sí va en el navegador (`assets/ek-supabase.js`) y está protegida por **RLS**: solo puede LEER productos, categorías, banners, artículos publicados y reseñas aprobadas.
- El login del panel verifica bcrypt en Postgres (función `ek_login`) y firma un JWT de 8 h. Los cambios de contraseña pasan por `ek_upsert_usuario`, ejecutable **solo** por la service role.
- No subas `.env`, `.dev.vars` ni claves a Git.

---

## 6. Estructura nueva (lo que se añadió)

```
taller creativo esperimental/
├── admin/                 ← PANEL administrativo (HTML+JS puro)
│   ├── index.html · app.css · app.js
├── functions/             ← Cloudflare Pages Functions (backend sin npm)
│   ├── _lib.js            (JWT HS256 con WebCrypto)
│   └── api/ login.js · me.js · admin.js · publish.js
├── assets/
│   ├── ek-blog-data.js    ← contenido del blog (separado del motor)
│   ├── ek-supabase.js     ← URL + anon key (público)
│   └── ek-live.js         ← lectura en tiempo real (stock/reseñas/calif/vendidos)
├── build/sincronizar-supabase.mjs  ← build SSG: Supabase → archivos estáticos
├── .env · .dev.vars · .gitignore
└── DEPLOY.md (este archivo)
```
Y en la **raíz del proyecto**: `schema.sql` (esquema final), `seed.sql` (catálogo real), `generar-seed.mjs`.
