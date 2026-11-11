# 🧭 Checkpoint Técnico de Handover — Taller Creativo EK

> Documento de traspaso para continuar el proyecto en una sesión nueva sin perder contexto.
> Última actualización: fin de la sesión de desarrollo.

---

## 1. Arquitectura actual

### Stack tecnológico
| Capa | Tecnología |
|---|---|
| Tienda pública | **HTML + CSS + JavaScript puro** (sin frameworks) |
| Panel admin (`/admin`) | **HTML + JS puro** (sin build) |
| Backend | **Cloudflare Pages Functions** (`functions/`) — **cero dependencias npm** |
| Base de datos | **Supabase**: PostgreSQL + Storage + RLS |
| Auth | bcrypt (pgcrypto) + **JWT HS256 firmado con WebCrypto** |
| Pagos | **Stripe Checkout** + webhooks (firma HMAC-SHA256 verificada) |
| Correo transaccional | **Resend** (factura por correo en HTML) |
| Generación estática (SSG) | Script Node `build/sincronizar-supabase.mjs` + **Deploy Hook** de Cloudflare Pages |
| Tiempo real | `assets/ek-live.js` lee Supabase (anon key + RLS) al abrir la página |

### Modelo de despliegue (Jamstack híbrido)
- **Estático (SSG):** catálogo, categorías, banners, blog, config → se regeneran desde Supabase y se redeployan.
- **Tiempo real:** stock, reseñas, calificación, vendidos → se leen en runtime desde Supabase.
- **Privado:** pedidos, clientes, contraseñas → solo en el panel vía service role.

```
Tienda (Cloudflare Pages) ──ek-live.js──▶ Supabase (anon + RLS)
Panel /admin ──/api/* (Functions)──▶ Supabase (service role)
Stripe ──webhook──▶ /api/webhook ──▶ Pedido + Factura + Resend
Admin "Publicar" ──▶ /api/publish ──▶ Deploy Hook ──▶ build → archivos estáticos
```

### Base de datos (Supabase) — tablas
`Usuario`, `Categoria`, `Subcategoria`, `Producto`, `Variante`, `Resena`, `Pedido`, `DetallePedido`, `Factura`, `Articulo`, `Banner`, `Cupon`, `Pagina`, `Configuracion`, `Auditoria` + tablas puente `_CategoriaToProducto`, `_ProductoToSubcategoria`, `_CategoriaToSubcategoria`.

### Columnas clave (no estándar) a recordar
- `Producto`: `colores[]`, `tallas[]`, `caracteristicas[]`, `keywords`, `precioMinorista`, `precioDistribuidor`, `precioAnterior`, `imagen`, `imagenes[]` (1–5), `imagen_personalizacion`, `print_area` JSONB (`{x,y,width,height}` en %), `personalizable` BOOL.
- `Variante`: `productoId`, `talla`, `color`, `stock`, `precio`.
- `Categoria`: `grupo` ('temporada'|'producto'), `emoji`, `enNav`, `enSidebar`, `orden`, `keywords`, `epoca`.
- `Articulo` (blog): `contenido` (HTML), `bloques` JSONB (constructor texto/imagen).
- `Pagina`: `slug`, `nombre`, `bloques` JSONB (constructor visual de la home).
- `Configuracion`: `clave`/`valor` (config de la tienda, FAQ, políticas).
- `Cupon`: `codigo`, `tipo` (pct|monto|envio), `valor`, `minimo`, `texto`.

### Auth / RLS
- `Usuario.contrasena` = bcrypt (`crypt()`). Login vía RPC `ek_login()` (SECURITY DEFINER, solo `anon`/`authenticated`).
- `ek_upsert_usuario()` (solo `service_role`) crea/edita usuarios con contraseña.
- RLS: la **anon key solo LEE** datos públicos (Producto, Categoria, Subcategoria, Banner, Articulo publicado, Resena aprobada, Cupon activo, Pagina). Pedidos/clientes/config cerrados.
- Service role **solo** vive en el servidor (Functions / scripts Node). Nunca en el navegador.

---

## 2. Funcionalidades implementadas

### Tienda pública
- Catálogo: **100 productos, 22 categorías, 56 subcategorías**, filtros (color, precio, talla, calificación), orden, buscador con sugerencias.
- **Carrito lateral** (localStorage) + cupones + checkout por **WhatsApp**.
- **Pago con tarjeta (Stripe Checkout)** → webhook → Pedido/DetallePedido/Factura + **factura por correo (Resend)**.
- **Login de distribuidores** (botón 👜 en cabecera): los distribuidores ven el precio `pd` además del minorista; el cliente general solo el minorista.
- **Precio por variante** (talla/color) y **stock por variante**.
- **Personalizador** (`ek-personalizador.js`): Canvas con imagen base + texto con **autoscaling**, Google Fonts, color, saltos de línea; captura con `toDataURL`. Se activa si `personalizable` + `print_area` + imagen.
- **Constructor visual** de la home (`ek-page.js`): bloques `hero`, `productos`, `categorias`, `texto`, `promo` leídos desde `Pagina.bloques`, con ancho editable (40–100%).
- **Blog** renderizado desde `ek-blog-data.js`.
- **Tiempo real**: stock, reseñas, calificación, vendidos.
- **Imágenes**: hotlink + locales (`img/`) + subidas desde panel (primera de `imagenes[]` es la principal).
- Responsive, SEO (JSON-LD, sitemap, Open Graph), animaciones AOS/partículas.

### Panel administrativo (`/admin`, login `admin@ek.com` / `admin123`)
- **Resumen**: ventas totales, pedidos pendientes, top productos vendidos.
- **Productos**: CRUD completo — galería **1–5 imágenes** con subida, precios (minorista/distribuidor/anterior), colores/tallas con **chips**, **variantes en filas** (talla|color|stock|precio), toggle **personalizable** + **imagen base de personalización** + **área de impresión** (dibujar rectángulo + %).
- **Categorías**: reordenar (↑↓) + toggles de **Menú** y **Lateral**.
- **Subcategorías / Banners / Blog** (blog con **constructor por bloques** texto+imagen).
- **Reseñas / Pedidos / Clientes / Cupones / Políticas / Configuración**.
- **Constructor visual**: lista de bloques con **vista previa** + reordenar/editar/eliminar + ancho.
- **Configuración**: subida de **logo y favicon**, datos de contacto, pagos, redes, FAQ, SEO.
- **Publicar cambios** (Deploy Hook; en local avisa que hay que correr el sync).

### Backend (Pages Functions)
`/api/login`, `/api/me`, `/api/admin` (proxy PostgREST/RPC con allowlist), `/api/publish`, `/api/upload` (Storage con MIME correcto), `/api/checkout` (Stripe), `/api/webhook` (verifica firma → pedido + factura por email).

---

## 3. Estado actual del código

### ✅ Completado
- Esquema + seed alineados al catálogo real; migraciones incrementales aplicadas a Supabase.
- Panel admin completo (todas las secciones + filtros + chips + variantes + galería + constructor + políticas + logo/favicon).
- Backend completo (auth, proxy, upload, Stripe, webhook, publish).
- Pipeline SSG (sync) + overlay en tiempo real + personalizador + constructor visual + blog por bloques.
- **Mojibake de los HTML corregido** (UTF-8 correcto).
- Repositorio GitHub sincronizado (rama `main`).

### ⚠️ Pendiente / por hacer (conocido)
- **No está desplegado en Cloudflare Pages todavía**: el usuario prueba en local (`npx wrangler pages dev .`). Faltan: crear proyecto Pages, variables de entorno, Deploy Hook y el webhook de Stripe apuntando a `/api/webhook`.
- `DEPLOY_HOOK_URL` está vacío (solo funciona en Cloudflare; en local se usa el sync manual).
- **Factura por correo en HTML** (no PDF) — pendiente adjuntar PDF (`pdf-lib`).
- **Imagen personalizada del pedido**: se guarda como data-URL en el carrito (localStorage), pero aún **no se sube a Storage** ni se enlaza al Pedido.
- "Menos tedioso" en el panel: mejorado (chips/variantes/galería/bloques) pero se puede seguir puliendo.

### Archivos clave
```
raíz/
├── schema.sql · seed.sql · generar-seed.mjs
├── cargar-db.mjs · migrar-db.mjs · verificar-db.mjs · probar-upload.mjs · arreglar-encoding.mjs  (⚠️ con contraseña DB; NO a Git)
└── taller creativo esperimental/           ← repo Git + deployable
    ├── index/tienda/categoria/articulo/carrito/contacto/blog/blog-articulo/404 .html
    ├── assets/  ek.js · ek.css · ek-config.js · ek-data.js · ek-subcategorias.js
    │            ek-blog.js · ek-blog-data.js · ek-imagenes.js · ek-supabase.js
    │            ek-live.js · ek-page.js · ek-personalizador.js
    ├── admin/   index.html · app.js · app.css · printarea.js
    ├── functions/  _lib.js · api/{login,me,admin,publish,upload,checkout,webhook}.js
    ├── build/   sincronizar-supabase.mjs · generar-paginas.mjs · detectar-imagenes.mjs · …
    ├── .env · .dev.vars · .gitignore · _headers
    └── DEPLOY.md · FUNCIONALIDADES.md · HANDOVER.md
```

---

## 4. Siguiente tarea exacta

**La última tarea pedida (vista previa de bloques en el constructor) ya quedó terminada y subida** (commit `e90ba50`).

Tareas ofrecidas y aún no ejecutadas, en orden sugerido:

1. **Subir la imagen personalizada al pedido** (la más directa y útil):
   - Al capturar en `ek-personalizador.js`, subir el PNG (`toDataURL`) a Supabase Storage y guardar la **URL** en el carrito/orden (en vez del data-URL gigante).
   - Requiere un endpoint público de subida (o reusar `/api/upload` con un token de cliente) y enlazar la URL al `Pedido`/`DetallePedido`.

2. **Botón "Ver tienda"** dentro del Constructor visual (abrir `../index.html` en pestaña nueva para previsualizar la home real).

3. **Desplegar en Cloudflare Pages** (guía ya en `DEPLOY.md`): conectar el repo, build `node build/sincronizar-supabase.mjs`, output `/`, y las 9 variables de entorno (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `DEPLOY_HOOK_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`) + webhook de Stripe (`checkout.session.completed`).

4. **Factura en PDF** adjunta al correo (hoy es HTML).

---

## 5. Reglas de estilo y mejores prácticas

### Código
- **JavaScript puro (vanilla)**, ES6 (`const/let`, arrow functions, `async/await`, template literals, `Array.prototype.map/filter`).
- **Modular y comentado**: cada archivo lleva cabecera `/* ===== ... ===== */` explicando su rol.
- UI y comentarios en **español**.
- Helpers compartidos: `esc()` (escapar HTML), `money()`, `nf()` (formato de números), `fld/input/area/check/select` (formularios del admin).
- **Cero dependencias npm en las Functions**: JWT con `crypto.subtle`; bcrypt se verifica en Postgres.

### Supabase / datos
- El admin escribe vía **Pages Functions con service role** (proxy `/api/admin` con **allowlist de tablas/RPC**); la anon key solo lee datos públicos (RLS).
- Migraciones **incrementales** con `migrar-db.mjs` (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`), usando el **pooler en MODO SESIÓN (puerto 5432)**, NO el 6543 (transacción, no admite DDL).
- Tras cambiar el esquema o antes de desplegar, correr `node build/sincronizar-supabase.mjs` para regenerar los archivos estáticos.

### ⚠️ CRÍTICO — Codificación UTF-8
- **NO usar PowerShell `Get-Content`/`Set-Content` para editar archivos HTML**: corrompe los acentos/emojis a mojibake (doble-codificación CP1252→UTF-8). Usar **Node** (`readFileSync`/`writeFileSync` con `"utf8"`) o las herramientas `edit`/`write`.
- Si reaparece mojibake, corregir con `node arreglar-encoding.mjs` (raíz) y luego quitar cualquier `\uFFFD`/BOM inicial.

### Seguridad
- `.env` y `.dev.vars` están en `.gitignore` (nunca a Git). La service role, `JWT_SECRET`, claves Stripe/Resend y la contraseña de BD **no van al navegador ni al repo**.
- **Rotar claves**: las credenciales se compartieron en el chat durante el desarrollo; conviene regenerar las de Supabase/Stripe/Resend en producción.
- Verificar con `git status` que **no se stagee ningún secreto** antes de cada commit.

### Git / flujo
- Repo: `https://github.com/Alan19250012/taller_creativo.git` (rama `main`). Identidad git local: `cetis3aarl4e-creator` (tiene acceso de colaborador).
- Hacer **commit + push** tras cada lote de cambios; revisar que `git log origin/main..main` quede vacío (sincronizado).

### Datos de acceso / entorno (para referencia)
- Supabase URL: `https://vqefszeokokdbykzwloq.supabase.co` (ref `vqefszeokokdbykzwloq`).
- Panel admin: `admin@ek.com` / `admin123`.
- Pruebas locales: `cd "taller creativo esperimental"` → `npx wrangler pages dev .` → `http://127.0.0.1:8788/admin/`.
- Stripe prueba: tarjeta `4242 4242 4242 4242`.
