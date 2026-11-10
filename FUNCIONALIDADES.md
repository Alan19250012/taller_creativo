# 🎨 Taller Creativo EK · Documentación del proyecto

> Tienda en línea de decoración en MDF, impresión DTF UV y regalos personalizados.
> Arquitectura **Jamstack híbrida**: front-end estático + Supabase + Cloudflare Pages.

---

## 1. ¿Qué es?

Un **e-commerce completo** con dos caras:

1. **Tienda pública** (estática, rápida, sin servidor).
2. **Panel administrativo** (`/admin`) para gestionar todo el negocio sin tocar código.

La tienda se sirve como archivos estáticos en **Cloudflare Pages**, pero los datos viven en **Supabase** (PostgreSQL). Los cambios se publican con un **Deploy Hook**, y los datos que cambian seguido (stock, reseñas, ventas) se leen **en tiempo real**.

---

## 2. Arquitectura general

```
┌──────────────────────────────────────────────────────────────┐
│  TIENDA PÚBLICA (Cloudflare Pages · HTML/CSS/JS puro)          │
│  · Catálogo, carrito, filtros, blog, reseñas, FAQ              │
│  · Login de distribuidores · Pago con tarjeta (Stripe)         │
│  · Constructor visual (bloques de la home)                     │
└───────────────┬──────────────────────────────────────────────┘
                │
        ┌───────┴────────┐
        │  SUPABASE      │  ← fuente de verdad
        │  Postgres      │  (productos, pedidos, clientes, config…)
        │  Storage       │  (imágenes subidas desde el panel)
        │  RLS           │  (seguridad por filas)
        └───────┬────────┘
                │
┌───────────────┴──────────────────────────────────────────────┐
│  PANEL ADMINISTRATIVO (/admin · HTML/JS puro)                  │
│  Login bcrypt + JWT · CRUD completo · métricas · filtros       │
└───────────────┬──────────────────────────────────────────────┘
                │
        ┌───────┴────────┐
        │  PAGES FUNCTIONS│  ← backend serverless (cero npm)
        │  /api/login     │  verifica credenciales (bcrypt vía RPC)
        │  /api/admin     │  proxy protegido → Supabase (service role)
        │  /api/upload    │  sube imágenes a Storage
        │  /api/checkout  │  crea sesión de Stripe
        │  /api/webhook   │  pago confirmado → pedido + factura
        │  /api/publish   │  dispara el redeploy (SSG)
        └─────────────────┘
```

---

## 3. Tienda pública — funcionalidades

| Funcionalidad | Detalle |
|---|---|
| **Catálogo** | 100 productos, 22 categorías, 56 subcategorías |
| **Filtros y orden** | Por categoría, subcategoría, color, precio, talla, calificación, más vendidos |
| **Buscador** | Con sugerencias en vivo |
| **Carrito lateral** | Deslizable, guardado en `localStorage` |
| **Cupones** | Códigos de descuento (%, monto fijo, envío gratis) |
| **Checkout por WhatsApp** | Envía el pedido armado al WhatsApp Business |
| **Pago con tarjeta** | Stripe Checkout (tarjeta 4242… en pruebas) |
| **Factura por correo** | Al pagar, se crea el pedido y se envía la factura por email (Resend) |
| **Precios por rol** | El cliente ve el precio minorista; el **distribuidor** (logueado) ve ambos precios |
| **Precio por variante** | Cada combinación talla/color puede tener su propio precio y stock |
| **Tiempo real** | Stock, reseñas, calificación y "vendidos" se actualizan solos desde Supabase |
| **Constructor visual** | Bloques de la home (banner, productos, categorías, texto, promo) desde el panel |
| **Blog** | Artículos con contenido HTML, categorías y buscador |
| **Reseñas** | Valoraciones por producto (solo se muestran las aprobadas) |
| **SEO** | JSON-LD de producto, sitemap.xml, meta tags, Open Graph |
| **Imágenes** | Hotlink por defecto, archivos locales (`img/`), o subidas desde el panel |
| **Responsive** | De 320 px a 4K; animaciones AOS, partículas, modo "reducir movimiento" |

---

## 4. Panel administrativo — funcionalidades

Acceso en `/admin` → login `admin@ek.com` / `admin123`.

| Sección | Qué permite |
|---|---|
| **Resumen** | Métricas: ventas totales, pedidos pendientes, top productos vendidos |
| **Productos** | Crear/editar/borrar; nombre, slug, descripción, **precio minorista + distribuidor**, stock, calificación, colores, tallas, **variantes (talla/color/stock/precio)**, **subida de imagen**, categorías múltiples, destacado/nuevo/oferta |
| **Categorías** | Temporadas y tipos de producto, emoji, navegación, orden, época |
| **Subcategorías** | Icono, orden, categorías donde aparece |
| **Banners** | Carrusel de portada (título, subtítulo, botón, tema, orden) |
| **Blog** | Artículos (título, slug, resumen, contenido HTML, autor, categoría) |
| **Reseñas** | Aprobar/ocultar/borrar + filtro por estado |
| **Pedidos** | Ver detalle, cambiar estado (Pendiente/Pagado/Enviado/Entregado/Cancelado) + filtro |
| **Clientes** | Crear/editar usuarios, **rol** (Cliente/Distribuidor/Administrador), contraseñas (bcrypt) + filtro por rol |
| **Cupones** | Códigos de descuento aplicables en el carrito |
| **Constructor visual** | Crear/reordenar/editar/eliminar bloques de la home (se guardan en JSON) |
| **Políticas** | Editar privacidad, envíos, devoluciones y términos |
| **Configuración** | Datos de contacto, colores de marca, pagos, redes, FAQ, SEO |
| **Publicar cambios** | Botón que dispara el redeploy de la tienda (Deploy Hook) |

---

## 5. Backend — Cloudflare Pages Functions

| Ruta | Método | Qué hace |
|---|---|---|
| `/api/login` | POST | Verifica email+contraseña (bcrypt en Postgres) y firma un JWT (HS256 con WebCrypto) |
| `/api/me` | GET | Valida el token y devuelve la sesión |
| `/api/admin` | POST | Proxy protegido hacia Supabase (PostgREST/RPC) usando **service role**; valida la tabla contra una lista blanca |
| `/api/publish` | POST | Dispara el Deploy Hook de Cloudflare (redeploy SSG) |
| `/api/upload` | POST | Sube una imagen a Supabase Storage y devuelve la URL pública |
| `/api/checkout` | POST | Crea una sesión de Stripe Checkout con el carrito |
| `/api/webhook` | POST | Recibe el webhook de Stripe (verifica firma), crea **Pedido + DetallePedido + Factura** y envía la **factura por correo** (Resend) |

> **Cero dependencias npm**: el JWT se firma con `crypto.subtle` (WebCrypto) y la verificación bcrypt se hace en Postgres (`pgcrypto`).

---

## 6. Base de datos (Supabase)

| Tabla | Contenido |
|---|---|
| `Usuario` | Clientes/distribuidores/admins (contraseña bcrypt, rol) |
| `Categoria` / `Subcategoria` | Taxonomía del catálogo |
| `Producto` | Artículos (precios minorista/distribuidor/anterior, colores, tallas, stock, características, keywords, imagen) |
| `Variante` | Stock y precio por combinación talla/color |
| `Resena` | Valoraciones (aprobada/no) |
| `Pedido` / `DetallePedido` | Ventas y líneas de pedido |
| `Factura` | Facturas emitidas |
| `Articulo` | Blog |
| `Banner` | Carrusel de portada |
| `Cupon` | Códigos de descuento |
| `Pagina` | Estructura de bloques de la home (JSON) |
| `Configuracion` | Clave-valor (datos de la tienda, políticas, FAQ) |
| `Auditoria` | Bitácora de acciones |
| `_CategoriaToProducto`, etc. | Relaciones muchos-a-muchos |

---

## 7. Cómo funciona — flujos de datos

### 7.1 Publicación de cambios (SSG + Deploy Hook)
```
Admin edita → Supabase → botón "Publicar" → /api/publish → Deploy Hook
→ Cloudflare reconstruye: node build/sincronizar-supabase.mjs
→ regenera ek-data.js / ek-config.js / ek-subcategorias.js / ek-blog-data.js
→ nueva versión estática (1–3 min)
```

### 7.2 Datos en tiempo real
```
Tienda carga → ek-live.js → Supabase (anon key, RLS)
→ stock, reseñas, calificación y vendidos se actualizan al abrir la página
```

### 7.3 Pago con tarjeta + factura
```
Cliente pulsa "Pagar con tarjeta" → /api/checkout → Stripe Checkout
→ paga → Stripe llama /api/webhook (firma verificada)
→ se crea Pedido/DetallePedido/Factura → se envía la factura por email (Resend)
```

### 7.4 Login de distribuidores
```
Botón 👜 en la tienda → /api/login → rol = DISTRIBUIDOR/ADMINISTRADOR
→ se guarda la sesión → la tienda muestra el precio de distribuidor
(el estatus de distribuidor lo asigna el admin en el panel → Clientes)
```

---

## 8. Seguridad

- **RLS (Row Level Security):** la anon key solo puede **LEER** datos públicos (productos, categorías, banners, artículos publicados, reseñas aprobadas). Pedidos, clientes y configuración están cerrados.
- **Service role:** solo vive en el servidor (Pages Functions). Nunca en el navegador.
- **Contraseñas:** bcrypt (nunca texto plano). El cambio de contraseña pasa por una RPC ejecutable solo por la service role.
- **Sesión del panel:** JWT firmado con HS256 (WebCrypto), expira a las 8 h.
- **Webhook de Stripe:** se verifica la firma HMAC-SHA256 antes de procesar.
- `.env` y `.dev.vars` están en `.gitignore` (nunca se suben a Git).

---

## 9. Despliegue

1. **Supabase:** ejecutar `schema.sql` y `seed.sql` en el SQL Editor.
2. **Cloudflare Pages:** conectar el repo, build command `node build/sincronizar-supabase.mjs`, output `/`.
3. **Variables de entorno** (en el dashboard de Cloudflare): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `DEPLOY_HOOK_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`.
4. **Stripe:** webhook apuntando a `/api/webhook` (evento `checkout.session.completed`).

*(El detalle completo está en `DEPLOY.md`.)*

---

## 10. Resumen técnico

| Aspecto | Tecnología |
|---|---|
| Front-end | HTML + CSS + JavaScript puro (sin frameworks) |
| Backend | Cloudflare Pages Functions (WebCrypto, sin npm) |
| Base de datos | Supabase (PostgreSQL + Storage + RLS) |
| Auth | bcrypt (pgcrypto) + JWT HS256 |
| Pagos | Stripe Checkout + webhooks |
| Correo | Resend |
| Generación estática | Script Node `build/sincronizar-supabase.mjs` |
| Tiempo real | Supabase REST (anon key) desde `ek-live.js` |
| Imágenes | Hotlink + archivos locales + Supabase Storage |

---

*Hecho para Taller Creativo EK · Ciudad de México 🇲🇽*
