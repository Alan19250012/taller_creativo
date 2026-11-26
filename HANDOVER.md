# 🧭 Checkpoint Técnico de Handover — Taller Creativo EK

> Documento de traspaso para continuar el proyecto en una sesión nueva sin perder contexto.
> Última actualización: sesión de pagos y personalización (Mercado Pago, modo catálogo, personalizador por campo, webhook Stripe corregido). Desplegado en `main` (commit `be2819c`).

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
| Pagos | **Stripe Checkout** + **Mercado Pago Checkout Pro** (webhooks firmados/revalidados) |
| Correo | **Resend** (factura en HTML, sin PDF) |
| SSG | `build/sincronizar-supabase.mjs` + **Deploy Hook** |
| Tiempo real | `assets/ek-live.js` (anon key + RLS) |

### Modelo de despliegue (Jamstack híbrido)
- **Estático (SSG):** catálogo, categorías, banners, blog, config → se regeneran desde Supabase y se redeployan.
- **Tiempo real:** stock, reseñas, calificación, vendidos.
- **Privado:** pedidos, clientes, cotizaciones, contraseñas → solo en el panel vía service role.

```
Tienda ──ek-live.js──▶ Supabase (anon + RLS)
Panel /admin ──/api/admin──▶ Supabase (service role) + Auditoria (bitácora)
Cliente cotiza ──/api/cotizaciones──▶ tabla Cotizacion
Stripe ──webhook──▶ /api/webhook ──▶ Pedido + DetallePedido + Factura + Resend
Mercado Pago ──notificación──▶ /api/webhook-mp ──▶ Pedido + DetallePedido + Factura + Resend
Admin "Publicar" ──▶ /api/publish ──▶ Deploy Hook ──▶ build → estáticos
```

### Base de datos — tablas (19)
`Usuario`, `Categoria`, `Subcategoria`, `Producto`, `Variante`, `Resena`, `Pedido`, `DetallePedido`, `Factura`, `Cotizacion`, `Articulo`, `Banner`, `Cupon`, `Pagina`, `Configuracion`, `Auditoria` + puente `_CategoriaToProducto`, `_ProductoToSubcategoria`, `_CategoriaToSubcategoria`.

### Columnas clave (no estándar)
- `Producto`: `colores[]`, `tallas[]`, `precioMinorista`, `precioDistribuidor`, `imagen`, `imagenes[]` (1–5), `imagenes_mini` JSONB (marca las miniaturas), `personalizacion_campos` JSONB, `personalizable` BOOL.
- `Variante`: `talla`, `color`, `stock`, `precio`, `precioDistribuidor`, `imagen`, `imagen_personalizacion`, `print_area`, `areas_campos` JSONB (paralelo a `personalizacion_campos`).
- `Categoria`: `grupo`, `emoji`, `enNav`, `enSidebar`, `orden`, `imagen`, `epoca`.
- `Cotizacion`: `nombre`, `telefono`, `email`, `producto`, `descripcion`, `cantidad`, `materiales`, `medidas`, `fecha`, `imagen`, `estado` (PENDIENTE/EN_REVISION/COTIZADA/ACEPTADA/RECHAZADA).
- `Pedido`: `usuarioId`, `cliente`, `telefono`, `codigo`, `estado`, `subtotal/impuesto/envio/total`, `metodoPago`.
- `DetallePedido`: `personalizacion` JSONB (`{imagen, campos}`) — **ya está en `schema.sql`** (en la BD se aplicó con `ALTER TABLE`).
- `Auditoria`: `adminId`, `accion`, `detalle` (bitácora de operaciones del panel).
- `Configuracion`: `clave`/`valor` (FAQ, políticas, cinta, pagos, `suspension`…).

### Auth / RLS / seguridad
- `Usuario.contrasena` = bcrypt. Login vía RPC `ek_login()` (anon); registro `ek_registrar_cliente()`; perfil `ek_actualizar_perfil()`; admin crea/edita usuarios con `ek_upsert_usuario()` (service_role).
- RLS: la anon key **solo LEE** datos públicos. Pedidos/clientes/cotizaciones/config cerrados.
- `Auditoria` tiene RLS sin política pública: solo la service role lee/escribe.
- Service role solo en el servidor. Los scripts de la raíz leen credenciales de `.env` vía `_env.mjs`; existe `.env.example`.

### Variables de entorno (Cloudflare / `.dev.vars`)
`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `DEPLOY_HOOK_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, **`MERCADO_PAGO_ACCESS_TOKEN`**, `RESEND_API_KEY`, `EMAIL_FROM`.

---

## 2. Funcionalidades implementadas

### Tienda pública
- Catálogo (100 productos, 22 categorías, 56 subcategorías), filtros, orden, buscador.
- Carrito lateral + cupones + checkout **WhatsApp**, **Stripe** y **Mercado Pago**.
- Login/registro + "Mi cuenta" (historial, editar perfil). Precio de distribuidor.
- **Variantes** (talla/color) con stock, precio y foto. **Miniaturas seleccionables** por imagen.
- **Personalizador**: form builder, vista previa en canvas, editor de fotos (crop/zoom/rotar/filtros), **tipografía y color por campo** (12 fuentes), áreas por variante, guarda **imagen + texto + fuente + color hex**, re-edición de foto sin re-subir, texto con ajuste automático (ya no desborda el área).
- **Solicitud de cotización** en `contacto.html` (guarda en BD y abre WhatsApp).
- Barra lateral **fija** (sin acordeón) con **grupos dinámicos**; menú principal con **3 productos** por categoría. Blog, tiempo real, responsive + SEO.
- **Modo catálogo / suspensión de ventas** (config `suspension`): oculta pasarelas y manda la compra a WhatsApp.
- FAQ en **dos columnas**, partículas visibles.

### Panel administrativo (`/admin`, `admin@ek.com` / `admin123`)
- Resumen con indicadores (incluye **cotizaciones pendientes**).
- **Productos** (CRUD, galería 1–5 con **marcas de miniatura**, variantes, personalización por variante, **subcategorías** según categorías, campos de personalización, **copiar áreas entre variantes**). Modal de producto ancho (1280px).
- **Categorías** (grupo libre, **máx. 44 espacios = grupos + categorías visibles en la barra lateral**) / **Subcategorías** / Banners / Blog / Reseñas / **Pedidos** / **Clientes** / Cupones.
- **Cotizaciones**: listado, cambio de estado y detalle con imagen.
- Constructor visual, Políticas (con **aviso de privacidad**), Configuración (incluye **suspensión de ventas**), **Publicar cambios**.

### Backend (Pages Functions, 14 endpoints)
`/api/login`, `/api/me`, `/api/admin` (proxy con allowlist + **bitácora en `Auditoria`**), `/api/publish`, `/api/upload`, `/api/registro`, `/api/mis-pedidos`, `/api/perfil`, `/api/subir-personalizacion`, `/api/checkout`, `/api/webhook`, `/api/checkout-mp`, `/api/webhook-mp`, `/api/cotizaciones`.

---

## 3. Estado actual del código

### ✅ Completado (esta sesión)
- **Mercado Pago** (Checkout Pro): `/api/checkout-mp` (preferencia) + `/api/webhook-mp` (revalida el pago y crea pedido, con idempotencia).
- **Modo catálogo / suspensión de ventas**: config `suspension` → oculta Stripe/Mercado Pago y la compra va a WhatsApp.
- **Personalizador**: tipografía y color **por campo** (12 fuentes), guardado de imagen + texto + fuente + color hex, y corrección del texto que desbordaba.
- **Webhook Stripe corregido**: metadata movido a `product_data`, `expand[]=data.price.product`, y columna `DetallePedido.personalizacion` añadida.
- **Barra lateral** sin corte (sticky solo si cabe) y **límite 44 = grupos + categorías** en la barra lateral.
- FAQ en 2 columnas y partículas visibles (se quitó la forma "star" que no venía en el bundle slim).
- Subida de personalización con límite 20 MB y lienzo del personalizador a 1600 px.
- **Desplegado en `main`** (commit `be2819c`).

### ⚠️ Pendiente / por hacer
- **[CRÍTICO] Validar precios en el servidor**: `checkout.js` y `checkout-mp.js` confían el precio del cliente; hay que recalcularlo contra `Producto`/`Variante` (slug).
- **Verificar el dominio en Resend** (o usar `onboarding@resend.dev`) — hoy el correo falla con `403 · domain not verified`.
- **Factura en PDF** (hoy HTML) con `pdf-lib`.
- **Límite de intentos de login** (rate limiting; requiere KV/D1).
- **Persistir pedidos de WhatsApp** (hoy solo abre `wa.me`).
- **Incluir envío y cupón** en Stripe y Mercado Pago (el total cobrado ≠ total del carrito).
- **Captura de reseñas** (hoy solo moderación) y **newsletter real** (hoy es ficticio).
- **Cargar imágenes reales** de productos (99/100 usan placeholder) y activar variantes/personalización en más productos.
- **Rotar claves** (Supabase, Stripe, Resend, BD) — pendiente real.
- **Validación empresarial**: firmar `FORMATO_VALIDACION_EMPRESARIAL.md`.

### Archivos clave
```
raíz/  (fuera de Git)
├── schema.sql · seed.sql · generar-seed.mjs
├── cargar-db.mjs · migrar-db.mjs · verificar-db.mjs · probar-upload.mjs
├── probar-auditoria.mjs · arreglar-encoding.mjs · _env.mjs · .env · .env.example
└── Reporte_Final/  (reporte final + carta, anteproyecto/cronograma, extractos, y Auditoria/ con informe + scripts)
taller creativo esperimental/  ← repo Git + deployable
    ├── *.html (index, tienda, categoria, articulo, carrito, contacto, blog, cuenta, politicas, 404)
    ├── assets/  ek.js · ek.css · ek-data.js · ek-subcategorias.js · ek-live.js · ek-personalizador.js · ek-foto-editor.js …
    ├── admin/   index.html · app.js · app.css · printarea.js · personalizacion-editor.js
    ├── functions/  _lib.js · api/{login,me,admin,publish,upload,registro,mis-pedidos,perfil,subir-personalizacion,checkout,checkout-mp,webhook,webhook-mp,cotizaciones}.js
    ├── build/   sincronizar-supabase.mjs · sellar-version.mjs · verificar.mjs · prueba.mjs …
    ├── docs/  ARQUITECTURA · BASE_DE_DATOS · API · SEGURIDAD · PRUEBAS · INSTALACION · DECISIONES_TECNICAS · DIAGNOSTICO_EMPRESARIAL · AVISO_DE_PRIVACIDAD
    ├── documentacion-residencias/  REQUERIMIENTOS_Y_CRONOGRAMA · DICCIONARIO_DE_DATOS · INVESTIGACION · MATEMATICAS · ASPECTOS_LEGALES_ETICOS · ENTORNO_Y_PLATAFORMAS · AUDITORIA · VALIDACION_TECNICA · FORMATO_VALIDACION_EMPRESARIAL · COMUNICACIONES_Y_RED · VIABILIDAD_ECONOMICA · MATRIZ_COMPETENCIAS · AUDITORIA_FINAL_PERFIL_EGRESO
    └── DEPLOY.md · FUNCIONALIDADES.md · HANDOVER.md · README.md · schema.sql · _headers
```

---

## 4. Siguiente tarea exacta

**Punto actual:** todo desplegado en `main` (commit `be2819c`). El pago con Stripe y Mercado Pago **ya crea pedidos reales** en la BD; el personalizador, el modo catálogo y el límite 44 de la barra lateral están listos. **Falta verificar el dominio de correo en Resend** para que la factura llegue al cliente.

Tareas pendientes, en orden sugerido:

1. **Validar precios en el servidor** (`functions/api/checkout.js` y `checkout-mp.js`): recalcular importes desde `Producto`/`Variante` por slug. *(Crítico de seguridad.)*
2. **Verificar `tallercreativoek.com` en Resend** (o poner `EMAIL_FROM=Taller Creativo EK <onboarding@resend.dev>` en Cloudflare). *(Correo no llega hoy.)*
3. **Factura en PDF** adjunta al correo (`pdf-lib` en `webhook.js` y `webhook-mp.js`).
4. **Límite de intentos de login** (KV de Cloudflare o tabla de intentos).
5. **Persistir pedidos de WhatsApp** (crear `Pedido` al confirmar, como hace Stripe).
6. **Incluir envío y cupón** en las sesiones de Stripe y Mercado Pago.
7. **Captura de reseñas** (formulario público) y **newsletter real**.
8. **Cargar imágenes reales** de productos y activar variantes/personalización en más artículos.

---

## 5. Reglas de estilo y mejores prácticas

### Código
- **JavaScript puro (vanilla)**, ES6. UI y comentarios en español.
- Helpers: `esc()`, `money()`, `nf()`, `fld/input/area/check/select` (admin).
- **Cero dependencias npm en Functions**: JWT con `crypto.subtle`; bcrypt en Postgres.

### Supabase / datos
- Admin escribe vía `/api/admin` (service role + allowlist); la anon key solo lee datos públicos (RLS).
- Migraciones incrementales con `migrar-db.mjs` (MODO SESIÓN, puerto 5432).
- Tras cambiar esquema o antes de desplegar: `node build/sincronizar-supabase.mjs`.
- Tras editar `assets/ek-*.js`: `node build/sellar-version.mjs`.

### ⚠️ CRÍTICO — Codificación UTF-8
- **NO usar PowerShell `Get-Content`/`Set-Content` para editar HTML** (corrompe acentos). Usar Node o `edit`/`write`.
- Si reaparece mojibake: `node arreglar-encoding.mjs`.

### Seguridad
- `.env` y `.dev.vars` en `.gitignore`. Los scripts de la raíz leen `.env` vía `_env.mjs` (sin secretos en texto plano). Existe `.env.example`.
- **Rotar claves** antes de producción real.
- Verificar `git status` antes de cada commit (que no se stagee ningún secreto).

### Git / flujo
- Repo: `https://github.com/Alan19250012/taller_creativo.git` (rama `main`).
- Hacer commit + push tras cada lote; `git log origin/main..main` debe quedar vacío.

### Datos de acceso / entorno
- Supabase URL: `https://vqefszeokokdbykzwloq.supabase.co`.
- Panel admin: `admin@ek.com` / `admin123`.
- Local: `cd "taller creativo esperimental"` → `npx wrangler pages dev .` → `http://127.0.0.1:8788/admin/`.
- Producción: Cloudflare Pages (Git, rama `main`) + Deploy Hook; URL `https://taller-creativo.pages.dev/`.
- Stripe prueba: tarjeta `4242 4242 4242 4242`. Mercado Pago prueba: tarjetas de prueba de MP.
- Stripe webhook: `https://taller-creativo.pages.dev/api/webhook` (evento `checkout.session.completed`).
