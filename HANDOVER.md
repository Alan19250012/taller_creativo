# 🧭 Checkpoint Técnico de Handover — Taller Creativo EK

> Documento de traspaso para continuar el proyecto en una sesión nueva sin perder contexto.
> Última actualización: personalización POR VARIANTE (imagen en blanco + áreas por campo) terminada y pusheada.

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
Stripe ──webhook──▶ /api/webhook ──▶ Pedido + DetallePedido + Factura + Resend
Admin "Publicar" ──▶ /api/publish ──▶ Deploy Hook ──▶ build → archivos estáticos
Cliente personaliza ──▶ /api/subir-personalizacion ──▶ Storage (imagen compuesta)
```

### Base de datos (Supabase) — tablas
`Usuario`, `Categoria`, `Subcategoria`, `Producto`, `Variante`, `Resena`, `Pedido`, `DetallePedido`, `Factura`, `Articulo`, `Banner`, `Cupon`, `Pagina`, `Configuracion`, `Auditoria` + tablas puente `_CategoriaToProducto`, `_ProductoToSubcategoria`, `_CategoriaToSubcategoria`.

### Columnas clave (no estándar) a recordar
- `Producto`: `colores[]`, `tallas[]`, `caracteristicas[]`, `keywords`, `precioMinorista`, `precioDistribuidor`, `precioAnterior`, `imagen`, `imagenes[]` (1–5), `imagen_personalizacion` (legado), `imagenes_personalizacion[]`, `personalizacion_campos` JSONB (form builder: `{tipo,label,max,opciones,obligatorio,forma}`; `forma` `cuadrada`|`redonda` solo en fotos), `personalizable` BOOL.
- `Variante`: `talla`, `color`, `stock`, `precio` (cliente), `precioDistribuidor`, `imagen` (muestra CON texto), `imagen_personalizacion` (en blanco SIN texto de esta variante), `print_area` JSONB (área general de respaldo), `areas_campos` JSONB (array paralelo a `personalizacion_campos`: `[{x,y,width,height}, …]` por campo).
- `Categoria`: `grupo`, `emoji`, `enNav`, `enSidebar`, `orden`, `keywords`, `epoca`, `imagen` (banner al entrar a la categoría).
- `Banner`: `titulo`, `subtitulo`, `boton`, `enlace`, `etiqueta`, `keywords`, `tema`, `imagen`, `orden`, `activo`.
- `Subcategoria`: `icono`, `iconoImagen` (icono subido).
- `Pedido`: `usuarioId`, `cliente`, `telefono`, `codigo` (único), `estado`, `subtotal/impuesto/envio/total`, `direccionEnvio`, `metodoPago`.
- `DetallePedido`: `pedidoId`, `productoId`, `nombreProducto`, `cantidad`, `precioUnitario`, `tipoPrecio`, `talla`, `personalizacion` JSONB (`{imagen, campos}`).
- `Articulo` (blog): `contenido` (HTML), `bloques` JSONB (constructor texto/imagen).
- `Pagina`: `slug`, `nombre`, `bloques` JSONB (constructor visual de la home).
- `Configuracion`: `clave`/`valor` (config, FAQ, políticas, `cinta` de la barra superior).
- `Cupon`: `codigo`, `tipo` (pct|monto|envio), `valor`, `minimo`, `texto`.

### Auth / RLS
- `Usuario.contrasena` = bcrypt (`crypt()`). Login vía RPC `ek_login()` (SECURITY DEFINER, solo `anon`/`authenticated`); devuelve `telefono`.
- `ek_upsert_usuario()` (service_role) crea/edita usuarios.
- `ek_registrar_cliente()` (service_role) — registro público de clientes.
- `ek_actualizar_perfil()` (service_role) — editar nombre/teléfono/contraseña.
- RLS: la **anon key solo LEE** datos públicos (Producto, Categoria, Subcategoria, Banner, Articulo publicado, Resena aprobada, Cupon activo, Pagina). Pedidos/clientes/config cerrados.
- Service role **solo** vive en el servidor (Functions / scripts Node). Nunca en el navegador.

---

## 2. Funcionalidades implementadas

### Tienda pública
- Catálogo: **100 productos, 22 categorías, 56 subcategorías**, filtros, orden, buscador con sugerencias.
- **Carrito lateral** (localStorage) + cupones + checkout por **WhatsApp** y **Stripe**.
- **Login/registro de clientes** (cabecera → "Iniciar sesión / Crear cuenta") + **panel "Mi cuenta"** (`cuenta.html`): historial de pedidos, "pedir de nuevo", editar perfil, cerrar sesión.
- **Precio de distribuidor** (además del minorista) por producto y por variante.
- **Variantes** (talla/color) con stock, precio cliente, precio distribuidor y **foto de muestra**; seleccionables en la ficha.
- **Personalizador** (`ek-personalizador.js`): form builder dinámico (texto/textarea/select/foto) con **vista previa en tiempo real** (canvas), contador de caracteres, validación de obligatorios y **editor de fotos** (`ek-foto-editor.js`: crop/zoom/rotar/filtros). La imagen en blanco y la ubicación de cada campo son **por variante** (talla/color); la foto del cliente puede ser **cuadrada o redonda**.
- **Constructor visual** de la home (`ek-page.js`): bloques `hero`, `productos`, `categorias`, `texto`, `promo`.
- **Blog**, **tiempo real**, **imágenes** (hotlink + locales + subidas), responsive + SEO.

### Panel administrativo (`/admin`, login `admin@ek.com` / `admin123`)
- **Resumen** con tarjetas clicables que redirigen a cada sección.
- **Productos**: CRUD con galería 1–5, precios, chips de colores/tallas, **variantes en tarjetas** (talla|color|stock|precio cliente|precio distribuidor|foto de muestra), toggle **personalizable** + **campos de personalización** (tipo/etiqueta/máx/obligatorio/forma de foto). Dentro de **cada variante** se sube su imagen en blanco y se arrastra cada campo a su lugar (`admin/personalizacion-editor.js`, `PosicionadorPersonalizacion`).
- **Categorías** (época con datalist + imagen), **Subcategorías** (categorías padre + filtros + selector de icono o subir icono), **Banners** (selector cat/sub + imagen + reordenar + activar/desactivar, máx. 11 activos), **Blog**.
- **Clientes**: teléfono + historial de pedidos + total + filtros; los **administradores** se gestionan en Configuración.
- **Pedidos**: fechas, productos, teléfono, código único, filtros (cliente/estado/fecha/personalizado); el detalle muestra **miniatura + textos** de la personalización.
- **Reseñas**: filtros por estrellas, producto, fecha, autor.
- **Políticas** (editor con formato/imágenes/desactivar) + **Configuración** (agrupada + editores simples de Pagos/Talleres/Hotlink/FAQ/cinta).
- **Constructor visual**: **mapa completo de la home** + vista previa real (productos/categorías) + bloques editables al hacer clic + "Ver tienda".
- **Publicar cambios** (Deploy Hook configurado).

### Backend (Pages Functions)
`/api/login`, `/api/me`, `/api/admin` (proxy PostgREST/RPC con allowlist), `/api/publish`, `/api/upload`, `/api/registro`, `/api/mis-pedidos`, `/api/perfil`, `/api/subir-personalizacion`, `/api/checkout`, `/api/webhook`.

---

## 3. Estado actual del código

### ✅ Completado (esta sesión)
- Personalización **por variante**: imagen en blanco + área por campo (cajas arrastrables) + foto cuadrada/redonda. Fix del bug que ocultaba el personalizador en la tienda (`esc` no global).
- Migración DB aplicada: `Variante.areas_campos` (JSONB).
- Variantes con doble precio (cliente + distribuidor) + foto de muestra; stock = suma, precio = menor.
- Login/registro de clientes + "Mi cuenta" (historial, pedir de nuevo, editar perfil) + código único de pedido.
- Banners/categorías/subcategorías/políticas/configuración mejoradas (ver sección 2).
- Desplegado en Cloudflare Pages (Git, rama `main`); Deploy Hook configurado.

### ⚠️ Pendiente / por hacer (conocido)
- **Payload de personalización en Stripe metadata limitado a ~490 caracteres**: textos largos se recortan. Mejor: guardar el payload completo en una tabla propia y pasar solo una referencia.
- **Factura por correo en HTML** (no PDF) — pendiente adjuntar PDF (`pdf-lib`).
- La **foto original del cliente** se compone en la imagen final; no se guarda como archivo separado (la imagen final ya la contiene).
- Pie de página con políticas solo está en `index.html` y `politicas.html`; falta replicarlo en las demás páginas (tienda, carrito, contacto, blog…).
- **Rotar claves** de Supabase/Stripe/Resend/BD antes de producción real.

### Archivos clave
```
raíz/
├── schema.sql · seed.sql · generar-seed.mjs
├── cargar-db.mjs · migrar-db.mjs · verificar-db.mjs · arreglar-encoding.mjs  (⚠️ con contraseña DB; NO a Git)
└── taller creativo esperimental/           ← repo Git + deployable
    ├── index/tienda/categoria/articulo/carrito/contacto/blog/blog-articulo/cuenta/politicas/404 .html
    ├── assets/  ek.js · ek.css · ek-config.js · ek-data.js · ek-subcategorias.js
    │            ek-blog.js · ek-blog-data.js · ek-imagenes.js · ek-supabase.js
    │            ek-live.js · ek-page.js · ek-personalizador.js · ek-foto-editor.js
    ├── admin/   index.html · app.js · app.css · printarea.js · personalizacion-editor.js
    ├── functions/  _lib.js · api/{login,me,admin,publish,upload,registro,mis-pedidos,perfil,subir-personalizacion,checkout,webhook}.js
    ├── build/   sincronizar-supabase.mjs · generar-paginas.mjs · detectar-imagenes.mjs · …
    ├── .env · .dev.vars · .gitignore · _headers
    └── DEPLOY.md · FUNCIONALIDADES.md · HANDOVER.md · PERSONALIZACION.md
```

---

## 4. Siguiente tarea exacta

**Punto actual:** personalización **por variante** terminada y pusheada (commit `d50e2b3`): cada talla/color tiene su propia imagen en blanco + áreas por campo (`Variante.areas_campos`) + forma de foto cuadrada/redonda. Es un cambio reciente: **falta probarlo de punta a punta en el panel y publicar** (no se ha validado en producción todavía).

Tareas pendientes, en orden sugerido:

1. **Probar la personalización por variante**: en el panel, abrir un producto personalizable, subir la imagen en blanco en cada variante, arrastrar los campos a su lugar, guardar, "Publicar cambios" y verificar en la tienda que cada talla/color usa su propia imagen y áreas.

2. **Quitar el límite de 490 caracteres del payload** (Stripe metadata): guardar el payload completo en una tabla propia y pasar solo una referencia; así los textos largos y la foto original no se recortan.

3. **Factura en PDF** adjunta al correo (hoy es HTML).

4. **Replicar el pie con políticas** en las páginas restantes (tienda, carrito, contacto, blog…).

5. **Rotar claves** (Supabase, Stripe, Resend, BD) antes de pasar a cobros reales.

---

## 5. Reglas de estilo y mejores prácticas

### Código
- **JavaScript puro (vanilla)**, ES6. UI y comentarios en **español**.
- Helpers compartidos: `esc()`, `money()`, `nf()`, `fld/input/area/check/select` (admin).
- **Cero dependencias npm en las Functions**: JWT con `crypto.subtle`; bcrypt en Postgres.

### Supabase / datos
- El admin escribe vía **Pages Functions con service role** (proxy `/api/admin` con allowlist); la anon key solo lee datos públicos (RLS).
- Migraciones **incrementales** con `migrar-db.mjs` (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`), pooler en **MODO SESIÓN (puerto 5432)**, NO el 6543.
- Tras cambiar el esquema o antes de desplegar, correr `node build/sincronizar-supabase.mjs`.
- Tras editar cualquier `assets/ek-*.js`, correr `node build/sellar-version.mjs` para renovar el `?v=` de caché (ya incluye ek-personalizador, ek-foto-editor, ek-page, ek-live, ek-blog-data y ek-supabase).

### ⚠️ CRÍTICO — Codificación UTF-8
- **NO usar PowerShell `Get-Content`/`Set-Content` para editar HTML**: corrompe acentos/emojis a mojibake. Usar **Node** o las herramientas `edit`/`write`.
- Si reaparece mojibake: `node arreglar-encoding.mjs` y quitar `\uFFFD`/BOM inicial.

### Seguridad
- `.env` y `.dev.vars` en `.gitignore` (nunca a Git). Service role, `JWT_SECRET`, claves Stripe/Resend y contraseña de BD **no van al repo**.
- **Rotar claves** antes de producción real.
- Verificar con `git status` que no se stagee ningún secreto antes de cada commit.

### Git / flujo
- Repo: `https://github.com/Alan19250012/taller_creativo.git` (rama `main`).
- Hacer **commit + push** tras cada lote; `git log origin/main..main` debe quedar vacío.

### Datos de acceso / entorno (para referencia)
- Supabase URL: `https://vqefszeokokdbykzwloq.supabase.co` (ref `vqefszeokokdbykzwloq`).
- Panel admin: `admin@ek.com` / `admin123`.
- Local: `cd "taller creativo esperimental"` → `npx wrangler pages dev .` → `http://127.0.0.1:8788/admin/`.
- Producción: desplegado en **Cloudflare Pages** (conectado vía Git, rama `main`); Deploy Hook configurado en `DEPLOY_HOOK_URL`.
- Stripe prueba: tarjeta `4242 4242 4242 4242`.
