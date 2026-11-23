# 🧭 Checkpoint Técnico de Handover — Taller Creativo EK

> Documento de traspaso para continuar el proyecto en una sesión nueva sin perder contexto.
> Última actualización: sesión de mejoras (cotizaciones, documentación, auditoría y seguridad) desplegada en `main` (commit `dfb0885`). Perfil de Egreso: **84.4% (13.5/16)**.

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
| Pagos | **Stripe Checkout** + webhook (firma HMAC-SHA256) |
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
- `DetallePedido`: `personalizacion` JSONB (`{imagen, campos}`).
- `Auditoria`: `adminId`, `accion`, `detalle` (bitácora de operaciones del panel).
- `Configuracion`: `clave`/`valor` (FAQ, políticas, cinta, pagos…).

### Auth / RLS / seguridad
- `Usuario.contrasena` = bcrypt. Login vía RPC `ek_login()` (anon); registro `ek_registrar_cliente()`; perfil `ek_actualizar_perfil()` (service_role).
- RLS: la anon key **solo LEE** datos públicos. Pedidos/clientes/cotizaciones/config cerrados.
- `Auditoria` tiene RLS sin política pública: solo la service role lee/escribe.
- Service role solo en el servidor. Los scripts de la raíz leen credenciales de `.env` vía `_env.mjs` (ya no están en texto plano); existe `.env.example`.

---

## 2. Funcionalidades implementadas

### Tienda pública
- Catálogo (100 productos, 22 categorías, 56 subcategorías), filtros, orden, buscador.
- Carrito lateral + cupones + checkout **WhatsApp** y **Stripe**.
- Login/registro + "Mi cuenta" (historial, editar perfil). Precio de distribuidor.
- **Variantes** (talla/color) con stock, precio y foto. **Miniaturas seleccionables** por imagen.
- **Personalizador**: form builder, vista previa en canvas, editor de fotos (crop/zoom/rotar/filtros), **tipografía y color globales**, áreas por variante, re-edición de foto sin re-subir.
- **Solicitud de cotización** en `contacto.html` (guarda en BD y abre WhatsApp).
- Barra lateral **fija** (sin acordeón) con **grupos dinámicos**; menú principal con **3 productos** por categoría. Blog, tiempo real, responsive + SEO.

### Panel administrativo (`/admin`, `admin@ek.com` / `admin123`)
- Resumen con indicadores (incluye **cotizaciones pendientes**).
- **Productos** (CRUD, galería 1–5 con **marcas de miniatura**, variantes, personalización por variante, **subcategorías** según categorías, máx. 5 campos de personalización, **copiar áreas entre variantes**). Modal de producto ancho (1280px).
- **Categorías** (grupo libre) / **Subcategorías** / Banners / Blog / Reseñas / **Pedidos** / **Clientes** / Cupones.
- **Cotizaciones**: listado, cambio de estado y detalle con imagen.
- Constructor visual, Políticas (con **aviso de privacidad**), Configuración, **Publicar cambios**.

### Backend (Pages Functions, 12 endpoints)
`/api/login`, `/api/me`, `/api/admin` (proxy con allowlist + **bitácora en `Auditoria`**), `/api/publish`, `/api/upload`, `/api/registro`, `/api/mis-pedidos`, `/api/perfil`, `/api/subir-personalizacion`, `/api/checkout`, `/api/webhook`, `/api/cotizaciones`.

---

## 3. Estado actual del código

### ✅ Completado (esta sesión)
- **Cotizaciones** de punta a punta: tabla `Cotizacion`, endpoint `/api/cotizaciones`, formulario público y panel con estados.
- **Bitácora de auditoría**: `/api/admin` registra escrituras y RPC en `Auditoria` (verificada con inserción/lectura/borrado).
- **Seguridad**: credenciales fuera de los scripts (`.env` + `_env.mjs`), `.env.example`, sin secretos en Git.
- Tienda/panel: barra lateral fija, grupos dinámicos (máx. 44), 3 productos en menú, miniaturas (`imagenes_mini`), subcategorías en producto, tipografía/color globales, aviso de privacidad.
- **Documentación**: `docs/` (9 archivos) + `documentacion-residencias/` (12 archivos) + matriz de competencias (84.4%).
- Desplegado en `main` (commit `dfb0885`).

### ⚠️ Pendiente / por hacer
- **Rotar claves** (Supabase, Stripe, Resend, BD) — pendiente real.
- **Factura en PDF** (hoy HTML) con `pdf-lib`.
- **Límite de intentos de login** (rate limiting; requiere KV/D1).
- **Payload de Stripe limitado a ~490 caracteres** (textos largos se recortan).
- Pie con políticas falta en algunas páginas (tienda, carrito, blog…).
- **Respaldo automático** de la BD no documentado.
- **Validación empresarial**: firmar `FORMATO_VALIDACION_EMPRESARIAL.md` (refuerza la competencia 6; opcional).

### Archivos clave
```
raíz/  (fuera de Git)
├── schema.sql · seed.sql · generar-seed.mjs
├── cargar-db.mjs · migrar-db.mjs · verificar-db.mjs · probar-upload.mjs
├── probar-auditoria.mjs · arreglar-encoding.mjs · _env.mjs · .env · .env.example
└── taller creativo esperimental/  ← repo Git + deployable
    ├── *.html (index, tienda, categoria, articulo, carrito, contacto, blog, cuenta, politicas, 404)
    ├── assets/  ek.js · ek.css · ek-data.js · ek-subcategorias.js · ek-live.js · ek-personalizador.js · ek-foto-editor.js …
    ├── admin/   index.html · app.js · app.css · printarea.js · personalizacion-editor.js
    ├── functions/  _lib.js · api/{login,me,admin,publish,upload,registro,mis-pedidos,perfil,subir-personalizacion,checkout,webhook,cotizaciones}.js
    ├── build/   sincronizar-supabase.mjs · sellar-version.mjs · verificar.mjs · prueba.mjs …
    ├── docs/  ARQUITECTURA · BASE_DE_DATOS · API · SEGURIDAD · PRUEBAS · INSTALACION · DECISIONES_TECNICAS · DIAGNOSTICO_EMPRESARIAL · AVISO_DE_PRIVACIDAD
    ├── documentacion-residencias/  REQUERIMIENTOS_Y_CRONOGRAMA · DICCIONARIO_DE_DATOS · INVESTIGACION · MATEMATICAS · ASPECTOS_LEGALES_ETICOS · ENTORNO_Y_PLATAFORMAS · AUDITORIA · VALIDACION_TECNICA · FORMATO_VALIDACION_EMPRESARIAL · COMUNICACIONES_Y_RED · VIABILIDAD_ECONOMICA · MATRIZ_COMPETENCIAS · AUDITORIA_FINAL_PERFIL_EGRESO
    └── DEPLOY.md · FUNCIONALIDADES.md · HANDOVER.md · README.md · schema.sql · _headers
```

---

## 4. Siguiente tarea exacta

**Punto actual:** todo desplegado en `main` (commit `dfb0885`). Perfil de Egreso en **84.4% (13.5/16)**; competencias 7 y 11 no cumplidas (fuera de alcance) y la 1 parcial (solo comunicaciones).

Tareas pendientes, en orden sugerido:

1. **Rotar claves** (Supabase, Stripe, Resend, BD) y actualizar `.env` / Cloudflare.
2. **Factura en PDF** adjunta al correo (`pdf-lib` en `functions/api/webhook.js`).
3. **Límite de intentos de login** (KV de Cloudflare o tabla de intentos).
4. **Quitar el límite de 490 caracteres** del payload de Stripe (tabla propia + referencia).
5. **Replicar el pie con políticas** en las páginas restantes.
6. **Validación con la empresa**: llenar `FORMATO_VALIDACION_EMPRESARIAL.md` (opcional, sube la competencia 6 a 85.9%).

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
- Repo: `https://github.com/Alan19250012/taller_creativo.git` (rama `main`; la rama `mejoras-perfil-egreso` ya fue fusionada).
- Hacer commit + push tras cada lote; `git log origin/main..main` debe quedar vacío.

### Datos de acceso / entorno
- Supabase URL: `https://vqefszeokokdbykzwloq.supabase.co`.
- Panel admin: `admin@ek.com` / `admin123`.
- Local: `cd "taller creativo esperimental"` → `npx wrangler pages dev .` → `http://127.0.0.1:8788/admin/`.
- Producción: Cloudflare Pages (Git, rama `main`) + Deploy Hook.
- Stripe prueba: tarjeta `4242 4242 4242 4242`.
