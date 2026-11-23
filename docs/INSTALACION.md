# Instalación

## Herramientas necesarias

- Node.js 20 o superior para los scripts de `build/` y las migraciones.
- Una cuenta de Supabase y una de Cloudflare Pages.
- Cuentas de Stripe y Resend si se usan pagos con tarjeta y correo transaccional.

## Preparación de la base de datos

Ejecutar `schema.sql` y después `seed.sql` en el SQL Editor de Supabase, como indica `DEPLOY.md`. Las migraciones posteriores se aplican con `node migrar-db.mjs`, que es incremental y puede ejecutarse varias veces sin riesgo.

## Ejecución local

```bash
cd "taller creativo esperimental"
npx wrangler pages dev .
```

La tienda queda en `http://127.0.0.1:8788` y el panel en `http://127.0.0.1:8788/admin/`. Para regenerar el catálogo estático desde Supabase se usa `node build/sincronizar-supabase.mjs`.

## Variables de entorno

Las Pages Functions leen `.dev.vars` en local y las variables de Cloudflare en producción. La lista completa y cuáles deben marcarse como secretas están en `DEPLOY.md`.

## Despliegue

El paso a paso para publicar en Cloudflare Pages y configurar el webhook de Stripe está en `DEPLOY.md`.

## Solución de problemas frecuentes

- **El panel no carga los datos**: revisar que `SUPABASE_SERVICE_ROLE_KEY` esté configurada y que el JWT del login sea válido.
- **Error "Tabla no permitida"**: la tabla no está en la lista blanca de `functions/api/admin.js`; hay que agregarla si es una tabla nueva.
- **El catálogo no refleja los cambios**: los cambios estáticos requieren pulsar "Publicar cambios" para regenerar y redeployar.
- **El webhook no crea pedidos**: verificar que `STRIPE_WEBHOOK_SECRET` coincida con el del dashboard de Stripe.
- **`build/prueba.mjs` no corre**: instalar `jsdom` como indica el mensaje del propio script.
