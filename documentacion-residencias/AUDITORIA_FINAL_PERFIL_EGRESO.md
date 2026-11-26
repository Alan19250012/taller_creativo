# Auditoría final del Perfil de Egreso

> Actualizada tras cerrar las correcciones de la auditoría técnica: validación de precios en el servidor (Stripe y Mercado Pago), honeypot anti-spam, validación de MIME y límite de tamaño en subida de imágenes, cabecera HSTS, términos y condiciones, prueba unitaria de matemáticas y diagramas. El porcentaje comprobado es **81.25% (13.0/16)**, reflejado en `MATRIZ_COMPETENCIAS.md`.

## 1. Resumen ejecutivo

El proyecto es una tienda en línea con panel administrativo, módulo de cotizaciones, personalizador de productos e integraciones con Stripe, Mercado Pago, Resend, WhatsApp y Supabase. La revisión se hizo sobre el código, la base de datos y la documentación, ejecutando las herramientas del propio proyecto y verificando que las afirmaciones de la documentación correspondan con lo implementado.

El resultado comprobado es **13.0 de 16 puntos (81.25%)**, por encima del 80% requerido. Se cumplen 12 competencias, 2 de forma parcial (1 y 8) y 2 quedan fuera del alcance de un sitio web (7 y 11).

## 2. Porcentaje comprobado

| Indicador | Valor |
|---|---|
| Competencias evaluadas | 16 |
| Cumple (1.0) | 12 |
| Parcial (0.5) | 2 (1, 8) |
| No cumple (0) | 2 (7, 11) |
| Puntuación | 13.0 / 16 |
| **Porcentaje** | **81.25%** |

## 3. Matriz de las 16 competencias

| # | Competencia | Estado | Evidencia verificada |
|---|---|---|---|
| 1 | Redes de cómputo y comunicaciones | Parcial | Uso y configuración de HTTPS, DNS, CDN y REST/webhooks documentado en `COMUNICACIONES_Y_RED.md` |
| 2 | Administración de proyectos TIC | Cumple | `REQUERIMIENTOS_Y_CRONOGRAMA.md`, historial de Git con commits por bloque |
| 3 | Sistemas de información | Cumple | Panel (`admin/app.js`), backend (`functions/api/*`), cotizaciones, bitácora |
| 4 | Bases de datos | Cumple | `schema.sql`: 19 tablas, llaves foráneas, RLS |
| 5 | Integración de sistemas de comunicación | Cumple | Stripe, Mercado Pago, Resend, WhatsApp, Supabase Storage |
| 6 | Consultoría y auditoría | Cumple | `DIAGNOSTICO_EMPRESARIAL.md`, `VALIDACION_TECNICA.md`, bitácora y validación empresarial firmada |
| 7 | Creación de empresas TIC | No cumple | Proyecto para una empresa existente |
| 8 | Arquitectura HW / plataformas de software | Parcial | Administra plataformas cloud (Cloudflare + Supabase); sin hardware |
| 9 | Seguridad informática | Cumple | JWT, bcrypt, RLS, HMAC, lista blanca, validación de precios en servidor, honeypot, MIME, HSTS |
| 10 | Legislación informática | Cumple | Aviso de privacidad + términos, devoluciones y referencia normativa |
| 11 | Software embebido | No cumple | No hay dispositivos con firmware |
| 12 | Tecnologías emergentes y herramientas actuales | Cumple | Serverless, Supabase, Stripe, WebCrypto, Jamstack |
| 13 | Interfaces gráficas de usuario | Cumple | `ek.css`, `ek.js`, editor de fotos, constructor visual, panel responsivo |
| 14 | Investigación | Cumple | `INVESTIGACION.md`, `DECISIONES_TECNICAS.md` con referencias |
| 15 | Herramientas matemáticas | Cumple | `MATEMATICAS.md`, `build/prueba-calculos.mjs` ejecutada (14/14) |
| 16 | Legal, ético y sustentable | Cumple | `ASPECTOS_LEGALES_ETICOS.md`, hash de contraseñas, accesibilidad, digitalización |

## 4. Correcciones aplicadas desde la auditoría anterior

1. **Validación de precios en el servidor** (`functions/api/checkout.js` y `checkout-mp.js`): los precios, el cupón y el envío se recalculan contra Supabase; el precio que envía el navegador se ignora. Se eliminó el fallo crítico de tampering de montos.
2. **Subida de imágenes** (`functions/api/upload.js`): lista blanca de MIME (se excluye SVG) y límite de 5 MB.
3. **Honeypot anti-spam** en registro y cotizaciones (`registro.js`, `cotizaciones.js` y los formularios correspondientes).
4. **Cabecera HSTS** en `_headers`.
5. **Términos y condiciones** con política de devoluciones y referencia normativa (`docs/TERMINOS_Y_CONDICIONES.md`).
6. **Prueba unitaria de matemáticas** (`build/prueba-calculos.mjs`) ejecutada con 14 comprobaciones aprobadas.
7. **Diagramas formales** (`docs/DIAGRAMAS.md`): arquitectura, entidad-relación, flujo de pago y de cotización.
8. **Validación empresarial firmada** por el responsable del taller (documento externo).

## 5. Riesgos pendientes

- El dominio de envío de correo debe verificarse en Resend (o usar el remitente de pruebas) para que la factura llegue al cliente.
- Se recomienda restringir el origen CORS y añadir una política CSP, probando en el dominio real antes de publicar.
- Se recomienda un límite de intentos de inicio de sesión (requiere KV o D1).
- Cargar las imágenes reales de los productos y activar variantes/personalización en más artículos (tarea de contenido, no de código).

## 6. Conclusión

El proyecto demuestra de forma verificable **13.0 de 16 puntos (81.25%)**, por encima del 80% requerido, con evidencia de código, base de datos, integraciones, seguridad y documentación coherente con lo implementado. Las competencias 7 y 11 no corresponden al alcance de una tienda en línea y se reportan como no cumplidas de forma honesta; la competencia 1 se mantiene parcial al no administrarse una red de cómputo.
