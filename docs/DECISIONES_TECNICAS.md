# Decisiones técnicas

## JavaScript puro en lugar de un framework

La tienda y el panel se escribieron en HTML, CSS y JavaScript sin framework. Para este proyecto, esa decisión tiene una razón práctica: el negocio no cuenta con un equipo de desarrollo que vaya a mantener dependencias, y el sitio debía poder editarse y corregirse sin un proceso de compilación. Además, al tratarse de una tienda pequeña con un catálogo acotado, la rejilla y el renderizado que se necesitan se resolvieron directamente, y el resultado pesa poco y carga rápido.

## Supabase como base de datos

Se eligió Supabase porque reúne PostgreSQL, almacenamiento de imágenes y políticas de seguridad de fila en un solo servicio administrado. Esto evita mantener un servidor de base de datos propio y permite que la tienda lea datos públicos con una clave anónima mientras el panel escribe con una clave de servicio restringida al servidor.

## Cloudflare Pages Functions como backend

El backend necesitaba pocas operaciones (login, proxy al panel, pago, webhook, subida de imágenes) y debía vivir junto al sitio estático. Las Pages Functions de Cloudflare cumplen ambas cosas: se despliegan con el sitio y se ejecutan en el borde, sin un servidor aparte. Su modelo serverless se adapta a un negocio con tráfico intermitente.

## JWT propio con WebCrypto

Las Functions se escribieron sin dependencias npm porque Cloudflare requiere empaquetar las librerías y el proyecto buscaba mantenerse simple. Por eso la firma de sesiones se implementó con `crypto.subtle` del navegador y de los workers, usando HMAC-SHA256. Es una implementación acotada y suficiente para el alcance, con la limitación de no contar con las validaciones de una librería especializada.

## Modelo Jamstack híbrido

El catálogo se genera como archivos estáticos porque no cambia en cada visita y así la tienda es rápida y barata de servir. El stock y las reseñas, que sí cambian, se leen en tiempo real. Esta separación evita que el sitio dependa de una consulta a la base de datos por cada página vista, manteniendo la información fresca donde importa.

## Stripe Checkout para pagos

Se usó Checkout en lugar de procesar tarjetas en el sitio porque transfiere el cumplimiento de PCI a Stripe y reduce el riesgo de manejar datos de tarjetas. El pedido solo se confirma cuando el webhook verificado llega, de modo que un pago cancelado no genera un pedido.

## WhatsApp como canal de contacto y venta

El taller ya vende por WhatsApp, así que la tienda lo conserva como vía principal: los enlaces `wa.me` llevan el mensaje prellenado con el producto o la solicitud. La pasarela con tarjeta se agregó como complemento, no como reemplazo del flujo que el negocio ya conoce.

## Generación desde Supabase en lugar de administración manual de datos

Los archivos `ek-data.js` y similares se generan con `build/sincronizar-supabase.mjs` desde la base de datos. Esto permite editar el catálogo desde el panel sin tocar archivos y publicar con un botón, que dispara el Deploy Hook de Cloudflare.
