# API de las Pages Functions

El backend expone endpoints HTTP bajo la ruta `/api`. Todos devuelven JSON. Las rutas que requieren autenticación leen el token del encabezado `Authorization: Bearer <token>`.

## Autenticación

| Endpoint | Método | Autenticación | Descripción |
|---|---|---|---|
| `/api/login` | POST | Pública | Valida correo y contraseña contra `ek_login` (bcrypt en PostgreSQL) y firma un JWT de 8 horas. Devuelve `{ ok, token, usuario }`. |
| `/api/registro` | POST | Pública | Crea una cuenta de cliente mediante `ek_registrar_cliente` y deja la sesión abierta. |
| `/api/cotizaciones` | POST | Pública | Guarda una solicitud de cotización en la tabla `Cotizacion`. Valida nombre y descripción; la imagen de referencia es opcional y se sube a Storage. |

## Sesión y cliente

| Endpoint | Método | Autenticación | Descripción |
|---|---|---|---|
| `/api/me` | GET (onRequest) | JWT | Devuelve los datos de la sesión actual. |
| `/api/mis-pedidos` | GET (onRequest) | JWT (cliente) | Lista los pedidos del usuario autenticado. |
| `/api/perfil` | POST | JWT (cliente) | Actualiza nombre, teléfono y contraseña mediante `ek_actualizar_perfil`. |

Los endpoints marcados como `onRequest` responden a cualquier método HTTP; la tienda y el panel los invocan con GET.

## Administración

| Endpoint | Método | Autenticación | Descripción |
|---|---|---|---|
| `/api/admin` | POST | JWT (ADMINISTRADOR) | Proxy hacia Supabase con la service role. Recibe `{ method, url, body }` y valida la tabla contra una lista blanca. |
| `/api/upload` | POST | JWT (ADMINISTRADOR) | Sube una imagen en base64 al bucket `imagenes` de Supabase Storage y devuelve su URL pública. |
| `/api/publish` | POST | JWT (ADMINISTRADOR) | Dispara el Deploy Hook de Cloudflare para regenerar el sitio. |

## Comercio electrónico

| Endpoint | Método | Autenticación | Descripción |
|---|---|---|---|
| `/api/checkout` | POST | Pública | Crea una sesión de Stripe Checkout con el contenido del carrito y devuelve la URL de pago. |
| `/api/webhook` | POST | Firma HMAC de Stripe | Verifica la firma del evento `checkout.session.completed`, crea el pedido, su detalle y la factura, y envía el correo con Resend. |
| `/api/subir-personalizacion` | POST | Pública | Guarda la imagen compuesta generada por el personalizador y devuelve su URL. |

## Códigos de estado

- `200` — operación exitosa.
- `400` — cuerpo inválido o validación fallida.
- `401` — token ausente o inválido.
- `403` — sin permisos (rol distinto a administrador, tabla o función no permitida).
- `500` — error del servicio externo (Supabase, Stripe, Resend).

Las respuestas de error incluyen un campo `error` con un mensaje legible.
