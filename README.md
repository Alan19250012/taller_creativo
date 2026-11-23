# Taller Creativo EK · Tienda en línea y panel administrativo

Plataforma web desarrollada para **Taller Creativo E K** (GRUPO KMM DUCA S.A. de C.V.), taller de diseño, fabricación y personalización de productos para eventos, empresas y ocasiones especiales. El sistema muestra el catálogo, permite comprar y personalizar productos, recibe solicitudes de cotización y centraliza la administración del negocio en un panel privado.

## Objetivo

Ofrecer a la empresa una presencia digital que presente sus productos y servicios, facilite la comercialización y automatice la administración de clientes, pedidos y cotizaciones. La solución está pensada para un negocio pequeño que necesita una tienda funcional sin depender de plataformas de pago mensuales costosas.

## Funcionalidades

**Tienda pública**

- Catálogo con 100 productos, 22 categorías y 56 subcategorías, con filtros (categoría, color, precio, talla, calificación), orden y buscador con sugerencias.
- Fichas de producto con galería de imágenes, variantes (talla/color), precio de cliente y de distribuidor.
- Carrito lateral con cupones de descuento y dos formas de compra: por WhatsApp y con tarjeta mediante Stripe Checkout.
- Registro e inicio de sesión de clientes, con panel "Mi cuenta" para ver historial y editar perfil.
- Personalizador de productos: formulario dinámico, vista previa en tiempo real sobre la imagen del producto y editor de fotos con recorte, zoom, rotación y filtros. La imagen en blanco y la posición de cada campo se configuran por variante desde el panel.
- Formulario de solicitud de cotización con carga de imagen de referencia, materiales y medidas.
- Blog, reseñas, tiempo real de stock y calificación, y diseño responsivo.

**Panel administrativo**

- Resumen con indicadores (ventas, pedidos, clientes, productos, cotizaciones pendientes).
- Gestión completa de productos, categorías, subcategorías, banners, blog, reseñas, pedidos, clientes, cupones y cotizaciones.
- Cotizaciones: listado de solicitudes, cambio de estado (pendiente, en revisión, cotizada, aceptada, rechazada) y visualización de la imagen de referencia.
- Constructor visual de la página de inicio y configuración de políticas, pagos y datos de contacto.
- Publicación de cambios mediante un Deploy Hook que regenera el sitio estático.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Tienda | HTML, CSS y JavaScript puro, sin frameworks |
| Panel | HTML y JavaScript puro |
| Backend | Cloudflare Pages Functions, sin dependencias npm |
| Base de datos | Supabase (PostgreSQL) con Storage y Row Level Security |
| Autenticación | bcrypt (pgcrypto) y JWT HS256 firmado con WebCrypto |
| Pagos | Stripe Checkout con webhook verificado por HMAC-SHA256 |
| Correo | Resend |
| Despliegue | Cloudflare Pages conectado a Git, con Deploy Hook |

El proyecto usa el modelo **Jamstack híbrido**: el catálogo y la interfaz se generan como archivos estáticos desde Supabase y se redespliegan, mientras que stock, reseñas y ventas se leen en tiempo real.

## Requisitos

- Node.js 20 o superior para los scripts de la carpeta `build/` y las migraciones.
- Una cuenta de Supabase con un proyecto activo.
- Una cuenta de Cloudflare Pages.
- Cuentas de Stripe y Resend (solo para pagos con tarjeta y correo transaccional).

## Instalación

La guía completa de instalación, configuración y despliegue está en [`docs/INSTALACION.md`](docs/INSTALACION.md) y [`DEPLOY.md`](DEPLOY.md). En resumen:

1. Crear la base de datos en Supabase ejecutando `schema.sql` y `seed.sql` en el SQL Editor.
2. Configurar las variables de entorno (ver abajo).
3. Probar en local con `npx wrangler pages dev .`.
4. Desplegar en Cloudflare Pages conectando el repositorio.

## Variables de entorno

Las Pages Functions leen su configuración de las variables de Cloudflare (o del archivo `.dev.vars` en local):

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` (pública, va al navegador)
- `SUPABASE_SERVICE_ROLE_KEY` (secreta, solo servidor)
- `JWT_SECRET`
- `DEPLOY_HOOK_URL`
- `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY` y `EMAIL_FROM`

Estas variables nunca se suben al repositorio; `.env` y `.dev.vars` están en `.gitignore`.

## Pruebas

El proyecto cuenta con verificaciones automáticas del catálogo y de la base de datos:

```bash
node build/prueba.mjs       # revisiones del catálogo
node verificar-db.mjs       # tablas, columnas y datos de Supabase
node --check <archivo.js>   # sintaxis de los archivos JavaScript
```

El detalle de las pruebas realizadas y los casos pendientes está en [`docs/PRUEBAS.md`](docs/PRUEBAS.md).

## Documentación

- [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md) — organización del frontend y backend.
- [`docs/BASE_DE_DATOS.md`](docs/BASE_DE_DATOS.md) — tablas, relaciones y consultas.
- [`docs/API.md`](docs/API.md) — endpoints disponibles.
- [`docs/SEGURIDAD.md`](docs/SEGURIDAD.md) — medidas y limitaciones de seguridad.
- [`docs/DECISIONES_TECNICAS.md`](docs/DECISIONES_TECNICAS.md) — decisiones de diseño.
- [`docs/INSTALACION.md`](docs/INSTALACION.md) — instalación y solución de problemas.
- [`docs/DIAGNOSTICO_EMPRESARIAL.md`](docs/DIAGNOSTICO_EMPRESARIAL.md) — análisis del negocio y propuesta del sistema.
- [`docs/AVISO_DE_PRIVACIDAD.md`](docs/AVISO_DE_PRIVACIDAD.md) — aviso de privacidad y manejo de datos.
- [`documentacion-residencias/`](documentacion-residencias/) — requerimientos, cronograma, diccionario de datos, investigación, matemáticas y matriz de competencias.

## Estado

La tienda y el panel están desplegados. El módulo de cotizaciones y la documentación de este repositorio están terminados y pendientes de desplegarse. Quedan pendientes la generación de facturas en PDF, la protección contra intentos repetidos de inicio de sesión y una estrategia de respaldo automatizada de la base de datos; estas limitaciones se describen en los documentos correspondientes.
