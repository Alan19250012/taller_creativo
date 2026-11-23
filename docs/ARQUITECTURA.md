# Arquitectura del sistema

## Modelo general

El sistema sigue el modelo **Jamstack híbrido**. La tienda es un conjunto de páginas estáticas que se regeneran a partir de la base de datos y se redistribuyen por Cloudflare Pages; los datos que cambian con frecuencia (stock, reseñas, calificación y ventas) se leen en tiempo real desde Supabase al abrir la página. El panel administrativo es una aplicación separada, dentro de la carpeta `admin/`, que escribe en la base de datos mediante funciones serverless.

La decisión de separar la tienda del panel responde a dos necesidades del negocio: la tienda debe cargar rápido y resistir mucho tráfico, mientras que el panel necesita acceso completo a datos privados (pedidos, clientes, contraseñas) que nunca deben llegar al navegador del cliente.

## Organización del frontend

El frontend de la tienda se encuentra en la raíz del repositorio y en `assets/`:

- Las páginas HTML (`index.html`, `tienda.html`, `categoria.html`, `articulo.html`, `carrito.html`, `contacto.html`, `blog.html`, `blog-articulo.html`, `cuenta.html`, `politicas.html`, `404.html`) contienen la estructura de cada vista.
- `assets/ek.css` concentra todo el diseño, incluyendo el sistema de colores de la marca y las reglas responsivas.
- `assets/ek.js` es el motor de la tienda: renderiza el catálogo, los filtros, el buscador, el carrito y las fichas de producto.
- `assets/ek-data.js` y `assets/ek-blog-data.js` son archivos generados que contienen el catálogo y los artículos del blog. No se editan a mano; se regeneran con `build/sincronizar-supabase.mjs`.
- `assets/ek-subcategorias.js` relaciona productos con subcategorías.
- `assets/ek-live.js` lee stock, reseñas y calificación en tiempo real con la clave anónima de Supabase.
- `assets/ek-personalizador.js` y `assets/ek-foto-editor.js` implementan el personalizador de productos y su editor de imágenes.
- `assets/ek-page.js` pinta los bloques de la página de inicio definidos en el constructor visual.
- `assets/ek-supabase.js` guarda la URL y la clave anónima de Supabase.

El panel administrativo está en `admin/` y se compone de `index.html`, `app.js` y `app.css`. No usa framework ni proceso de compilación; el mismo `app.js` administra el enrutado por hash (`#/productos`, `#/pedidos`, etc.) y el renderizado de cada sección.

## Organización del backend

El backend son las Cloudflare Pages Functions de la carpeta `functions/`. Cada archivo exporta una función `onRequest*` que Cloudflare ejecuta en el borde:

- `functions/_lib.js` — utilidades compartidas: respuestas JSON, CORS y firma/verificación de JWT HS256 con WebCrypto.
- `functions/api/login.js` — inicio de sesión del cliente y del administrador.
- `functions/api/registro.js` — creación de cuentas de cliente.
- `functions/api/me.js` — devuelve la sesión actual a partir del JWT.
- `functions/api/admin.js` — proxy hacia Supabase con la service role, restringido a administradores y a una lista de tablas permitidas.
- `functions/api/upload.js` — subida de imágenes al bucket de Supabase (solo administradores).
- `functions/api/subir-personalizacion.js` — guarda la imagen compuesta generada por el personalizador.
- `functions/api/checkout.js` — crea una sesión de Stripe Checkout.
- `functions/api/webhook.js` — recibe el webhook de Stripe, verifica su firma y crea el pedido.
- `functions/api/mis-pedidos.js` y `api/perfil.js` — consulta de pedidos y edición de perfil del cliente.
- `functions/api/publish.js` — dispara el Deploy Hook de Cloudflare.
- `functions/api/cotizaciones.js` — recibe las solicitudes de cotización del formulario público.

## Comunicación entre componentes

La tienda se comunica con Supabase por dos vías. Para leer datos públicos usa la clave anónima directamente desde el navegador, protegida por las políticas de Row Level Security. Para operaciones que necesitan credenciales (crear pedidos, subir personalizaciones, enviar cotizaciones) llama a una Function, que ejecuta la petición con la service role en el servidor.

El panel nunca habla directamente con Supabase desde el navegador con la service role. Todas sus operaciones pasan por `functions/api/admin.js`, que valida el JWT del administrador y una lista blanca de tablas.

## Servicios externos

- **Supabase** almacena la base de datos y las imágenes (Storage).
- **Stripe** procesa los pagos con tarjeta mediante Checkout y notifica el resultado con un webhook.
- **Resend** envía el correo con la factura del pedido.
- **WhatsApp Business** se integra mediante enlaces `wa.me` con el mensaje prellenado, tanto para comprar como para contactar al taller.
- **Cloudflare Pages** aloja el sitio y ejecuta las Functions; el Deploy Hook permite republicar desde el panel.

## Flujo de información

Cuando un administrador edita un producto y pulsa "Publicar cambios", el panel llama a `functions/api/publish.js`, que dispara el Deploy Hook. Cloudflare ejecuta entonces `build/sincronizar-supabase.mjs`, que lee Supabase y regenera `ek-data.js`, `ek-subcategorias.js`, `ek-config.js` y `ek-blog-data.js`. De esta forma el catálogo queda actualizado sin que la tienda dependa de una base de datos en cada visita.

## Decisiones de diseño

Las razones de las decisiones más importantes (por qué JavaScript puro, por qué Supabase, por qué JWT propio) están documentadas en [`DECISIONES_TECNICAS.md`](DECISIONES_TECNICAS.md).
