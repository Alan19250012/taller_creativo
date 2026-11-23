# Investigación tecnológica

## Problema

Taller Creativo E K necesitaba mostrar su catálogo y recibir pedidos y cotizaciones sin depender de responder cada mensaje por WhatsApp. La solución debía ser económica de operar y sencilla de mantener por una sola persona, sin equipo de desarrollo.

## Alternativas analizadas

| Opción | Ventajas | Desventajas para el taller |
|---|---|---|
| Tienda en plataformas SaaS (Shopify, Tiendanube) | Rápida de montar | Costo mensual y menor control del diseño y de la personalización |
| WordPress + WooCommerce | Extensible, conocido | Requiere hosting, mantenimiento de plugins y actualizaciones constantes |
| Sitio estático con base de datos administrada | Bajo costo, rápido, sin servidor propio | Requiere desarrollo a medida |

## Elección

Se optó por un sitio estático generado desde Supabase, con backend serverless en Cloudflare Pages Functions. Las razones principales fueron:

- El catálogo no cambia en cada visita, por lo que servirlo como estático reduce el costo y mejora la velocidad.
- Supabase concentra base de datos, almacenamiento de imágenes y control de acceso en un servicio administrado, sin tener que operar un servidor de base de datos.
- Las Functions se despliegan junto con el sitio y permiten el login, el panel y el pago sin un servidor aparte.
- El negocio ya vendía por WhatsApp, así que se conservó ese canal y se agregó el pago con tarjeta como complemento.

## Resultados y limitaciones

La tienda quedó operativa con el catálogo completo, el panel y las cotizaciones. Como limitaciones se identificaron la falta de factura en PDF, la ausencia de límite de intentos de inicio de sesión y la dependencia de ejecutar una migración al cambiar el esquema.

## Referencias

- Documentación de Cloudflare Pages y Functions: https://developers.cloudflare.com/pages/
- Documentación de Supabase y Row Level Security: https://supabase.com/docs
- Documentación de Stripe Checkout y webhooks: https://docs.stripe.com/checkout
- Ley Federal de Protección de Datos Personales en Posesión de los Particulares (Cámara de Diputados).
