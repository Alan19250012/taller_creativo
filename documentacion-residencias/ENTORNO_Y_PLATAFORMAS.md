# Entorno de desarrollo y administración de plataformas

## Entorno de desarrollo

El desarrollo se hace en local con Node.js y las herramientas de la carpeta `build/`. Para probar la tienda junto con el backend se ejecuta `npx wrangler pages dev .`, que lee las variables de `.dev.vars` y sirve la estática en `http://127.0.0.1:8788`.

## Entorno de ejecución

En producción el sitio y las funciones se ejecutan en Cloudflare Pages. Las funciones corren en el borde, sin servidor propio, y se comunican con Supabase, Stripe y Resend mediante HTTPS.

## Servicios de alojamiento

- **Cloudflare Pages** aloja el sitio estático y las Functions.
- **Supabase** aloja PostgreSQL y el bucket de imágenes.
- **Stripe** procesa los pagos con tarjeta.
- **Resend** envía el correo transaccional.

## Configuración de despliegue

El proyecto se conecta a un repositorio Git. El comando de compilación es `node build/sincronizar-supabase.mjs`, que regenera los archivos del catálogo desde Supabase. El directorio de salida es la raíz del repositorio. El botón "Publicar cambios" del panel dispara un Deploy Hook que vuelve a ejecutar ese proceso.

## Administración de variables de entorno

Las funciones leen su configuración de las variables de Cloudflare. En local usan `.dev.vars`. La lista completa y cuáles deben marcarse como secretas están en `DEPLOY.md`; las claves de servicio y de pago nunca se incluyen en el repositorio.

## Dependencias

Las Functions no usan dependencias npm; el JWT se firma con WebCrypto. Los únicos paquetes externos se usan en los scripts locales de la raíz (`pg` para las migraciones y la verificación) y no forman parte del código que se despliega.

## Procedimiento de actualización

Los cambios de esquema se aplican con `node migrar-db.mjs`, que es incremental. Los cambios de catálogo e interfaz se publican con el botón "Publicar cambios" del panel, que regenera el sitio y lo redeploya. El proceso completo está documentado en `DEPLOY.md`.
