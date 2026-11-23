# Seguridad

## Autenticación

El inicio de sesión valida la contraseña dentro de PostgreSQL con la función `ek_login`, que compara el hash bcrypt generado por `pgcrypto`. Al validar, el servidor firma un JWT HS256 con `JWT_SECRET` y una vigencia de 8 horas. La firma y verificación se implementan con WebCrypto en `functions/_lib.js`, sin dependencias externas.

## Roles y permisos

El JWT lleva el campo `rol`. Las rutas administrativas (`/api/admin`, `/api/upload`, `/api/publish`) rechazan cualquier token cuyo rol no sea `ADMINISTRADOR`. Las rutas de cliente (`/api/mis-pedidos`, `/api/perfil`) validan la sesión pero no el rol, de modo que un cliente solo accede a sus propios datos.

## Protección de la información

La clave de la service role de Supabase vive únicamente en el servidor (variables de Cloudflare o `.dev.vars`). El navegador solo recibe la clave anónima, restringida por las políticas de Row Level Security: puede leer productos, categorías, banners, artículos publicados y reseñas aprobadas, pero no pedidos, clientes ni configuración.

`functions/api/admin.js` es el único punto de escritura del panel y actúa como proxy con dos controles: exige un JWT de administrador y valida la tabla o función contra una lista blanca. Cualquier tabla fuera de esa lista devuelve 403.

## Validación de entradas

- El registro y las cotizaciones validan correo con expresión regular y exigen longitud mínima en los campos obligatorios.
- Las imágenes subidas detectan el tipo MIME real desde el prefijo `data:` y se almacenan con la extensión correcta; la subida pública de cotizaciones limita el archivo a 4 MB.
- La salida de datos hacia el HTML usa la función `esc()` en el panel y en la tienda para evitar XSS.

## Protección contra inyección SQL

La aplicación no construye sentencias SQL en texto. Todas las operaciones se hacen mediante el API de PostgREST de Supabase con parámetros en el cuerpo JSON, o mediante funciones RPC definidas en `schema.sql`. Las únicas sentencias SQL del repositorio son las de `schema.sql` y `seed.sql`, que solo ejecuta un administrador de la base de datos.

## CSRF

Los tokens de sesión viajan en el encabezado `Authorization` y no en cookies, por lo que el riesgo de CSRF sobre la API es bajo. No se usa ningún mecanismo de cookies de sesión.

## Pagos

El webhook de Stripe verifica la firma del evento con `STRIPE_WEBHOOK_SECRET` mediante HMAC-SHA256 antes de registrar un pedido, de modo que un tercero no puede crear pedidos falsos.

## Gestión de credenciales

Las variables de entorno y los secretos se mantienen fuera del repositorio: `.env` y `.dev.vars` están en `.gitignore`. La documentación indica cuáles deben marcarse como secret en Cloudflare.

## Limitaciones conocidas

- No hay límite de intentos en el inicio de sesión, por lo que una contraseña débil podría probarse por fuerza bruta.
- El JWT se implementa de forma propia; funciona para este alcance, pero una librería madura aportaría validaciones adicionales.
- El encabezado CORS permite cualquier origen (`*`); las rutas protegidas exigen JWT, pero lo recomendable es restringir el origen al dominio real.
- La contraseña inicial del administrador (`admin@ek.com`) está en `seed.sql` y debe cambiarse en producción.
- Las credenciales de la base de datos y de Supabase se movieron a variables de entorno (archivo `.env`, cargado por `_env.mjs`); ya no están escritas en los scripts. Las claves que se compartieron durante el desarrollo deben rotarse.
- `/api/subir-personalizacion` es público y no limita el tamaño del archivo, de modo que un visitante podría saturar el bucket de imágenes; conviene restringir el origen o el peso de la imagen.
