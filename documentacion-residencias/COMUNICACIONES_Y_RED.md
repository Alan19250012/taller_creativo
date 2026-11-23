# Comunicaciones y capa de red

## Alcance

El proyecto no administra una red local ni diseña infraestructura de red empresarial. Lo que sí demuestra es el uso y la configuración de servicios de comunicación basados en estándares internacionales, que es la parte de "comunicaciones" de la competencia.

## Infraestructura de comunicación utilizada

- **HTTPS (TLS)**: Cloudflare Pages sirve el sitio y las funciones por HTTPS; las llamadas a Supabase, Stripe y Resend también viajan cifradas.
- **DNS**: el dominio se resuelve a través de Cloudflare, que actúa como CDN y borde.
- **CDN**: Cloudflare Pages distribuye el contenido estático desde su red de borde.
- **REST sobre HTTP**: el frontend y el panel intercambian datos JSON con las Functions mediante peticiones HTTP.
- **Webhooks**: Stripe notifica el pago a `/api/webhook`; el mensaje se autentica con HMAC-SHA256.
- **Correo**: Resend envía el correo transaccional mediante su API sobre HTTPS.

## Flujo de comunicación

1. El navegador del cliente pide la página a Cloudflare, que la entrega desde el borde por HTTPS.
2. La tienda lee el catálogo desde Supabase con la clave anónima (REST/JSON).
3. Al comprar, el navegador llama a `/api/checkout`, que crea la sesión en Stripe.
4. Stripe confirma el pago con un webhook verificado; la Function crea el pedido y manda el correo con Resend.
5. El panel se comunica con Supabase a través de `/api/admin`, que valida el JWT y usa la service role en el servidor.

## Estándares

- HTTP y HTTPS (TLS).
- JSON como formato de intercambio.
- JWT HS256 para sesiones.
- HMAC-SHA256 para verificar la firma del webhook.
- bcrypt para el hash de contraseñas.

## Evidencia

- `functions/_lib.js`: firma y verificación de JWT.
- `functions/api/webhook.js`: verificación HMAC del webhook.
- `functions/api/checkout.js`: comunicación con Stripe.
- `DEPLOY.md`: configuración de DNS, HTTPS y despliegue en Cloudflare.
