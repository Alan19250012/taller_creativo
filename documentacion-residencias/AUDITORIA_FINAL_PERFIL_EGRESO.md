# Auditoría final del Perfil de Egreso

> Actualización posterior a esta auditoría: se documentó la capa de comunicación (la competencia 1 queda como parcial) y se verificó la bitácora de auditoría con una operación real de inserción, lectura y borrado. El porcentaje actual es **84.4% (13.5/16)**, reflejado en `MATRIZ_COMPETENCIAS.md`.

## 1. Resumen ejecutivo

El proyecto es una tienda en línea con panel administrativo, módulo de cotizaciones, personalizador de productos e integraciones con Stripe, Resend, WhatsApp y Supabase. La revisión se hizo sobre el código, la base de datos y la documentación, ejecutando las herramientas del propio proyecto y verificando que las afirmaciones de la documentación correspondan con lo implementado.

El resultado comprobado es **13 de 16 competencias cumplidas (81.25%)**. Las competencias 1, 7 y 11 se consideran fuera del alcance de un sitio web y permanecen sin cumplir. La competencia 6 se mantiene como cumplida con la observación de que la aceptación formal de la empresa aún no se ha firmado.

No se encontraron secretos en el repositorio ni en los scripts. La bitácora de auditoría está implementada y protegida, aunque su inserción de extremo a extremo no se probó por requerir una sesión administrativa real.

## 2. Porcentaje actual comprobado

| Indicador | Valor |
|---|---|
| Competencias cumplidas | 13 |
| Competencias no cumplidas | 3 (1, 7, 11) |
| Puntuación | 13.0 / 16 |
| **Porcentaje** | **81.25%** |

## 3. Matriz de las 16 competencias

| # | Competencia | Estado | Evidencia verificada |
|---|---|---|---|
| 1 | Redes de cómputo y comunicaciones | No cumple | El sitio usa HTTPS/DNS/CDN, pero no administra una red de cómputo |
| 2 | Administración de proyectos TIC | Cumple | `REQUERIMIENTOS_Y_CRONOGRAMA.md`, historial de Git con commits por bloque |
| 3 | Sistemas de información | Cumple | Panel (`admin/app.js`), backend (`functions/api/*`), cotizaciones, bitácora |
| 4 | Bases de datos | Cumple | `schema.sql`: 19 tablas, llaves foráneas, RLS; `verificar-db.mjs` salió 0 |
| 5 | Integración de sistemas de comunicación | Cumple | Stripe Checkout, Resend, WhatsApp, Supabase Storage en `functions/api/*` |
| 6 | Consultoría y auditoría | Cumple | `DIAGNOSTICO_EMPRESARIAL.md`, `AUDITORIA.md`, `VALIDACION_TECNICA.md`, bitácora en `admin.js` |
| 7 | Creación de empresas TIC | No cumple | El proyecto es para una empresa existente, no crea una TIC |
| 8 | Arquitectura HW / plataformas de software | Cumple | `ENTORNO_Y_PLATAFORMAS.md`, `DEPLOY.md`, despliegue real en Cloudflare |
| 9 | Seguridad informática | Cumple | JWT, bcrypt, RLS, HMAC del webhook, lista blanca, secretos en entorno |
| 10 | Legislación informática | Cumple | Aviso de privacidad en `politicas.html` y `docs/AVISO_DE_PRIVACIDAD.md` |
| 11 | Software embebido | No cumple | No hay dispositivos con firmware |
| 12 | Tecnologías emergentes y herramientas actuales | Cumple | Serverless, Supabase, Stripe, WebCrypto, Jamstack |
| 13 | Interfaces gráficas de usuario | Cumple | `ek.css`, `ek.js`, editor de fotos, panel responsivo |
| 14 | Investigación | Cumple | `INVESTIGACION.md`, `DECISIONES_TECNICAS.md` con referencias |
| 15 | Herramientas matemáticas | Cumple | `MATEMATICAS.md`; fórmulas reales en `ek.js` y `ek-personalizador.js` |
| 16 | Legal, ético y sustentable | Cumple | `ASPECTOS_LEGALES_ETICOS.md`, hash de contraseñas, digitalización |

## 4. Evidencias técnicas encontradas

- **Bitácora de auditoría**: `functions/api/admin.js` define `registrarAuditoria` (líneas 22-29) y la invoca en la ruta RPC (línea 72) y en las escrituras de tabla (línea 114). La tabla `Auditoria` está en la lista blanca del proxy.
- **Protección de la bitácora**: `Auditoria` tiene Row Level Security activada y no tiene política de lectura o escritura pública, por lo que la clave anónima no puede leer ni modificar los registros; solo la service role del servidor accede.
- **Secretos**: la búsqueda en `migrar-db.mjs`, `verificar-db.mjs`, `cargar-db.mjs` y `probar-upload.mjs` no encontró contraseñas ni claves en texto plano. Leen de `.env` mediante `_env.mjs`.
- **Entorno**: `.env` y `.dev.vars` no están rastreados por Git (verificado con `git ls-files`).

## 5. Archivos y módulos revisados

- Frontend: `assets/ek.js`, `assets/ek.css`, `ek-personalizador.js`, `ek-foto-editor.js`, páginas HTML.
- Backend: `functions/_lib.js` y los 12 endpoints de `functions/api/`.
- Base de datos: `schema.sql` (19 tablas), `migrar-db.mjs`.
- Panel: `admin/index.html`, `admin/app.js`, `admin/personalizacion-editor.js`.
- Documentación: `README.md`, `docs/`, `documentacion-residencias/`.
- Scripts de la raíz: `migrar-db.mjs`, `verificar-db.mjs`, `cargar-db.mjs`, `probar-upload.mjs`, `_env.mjs`.

## 6. Problemas detectados

1. **Bitácora sin prueba de extremo a extremo**: el código inserta en `Auditoria`, pero no se ejecutó una operación administrativa real para confirmar la fila. Conviene probarlo desde el panel y revisar la tabla.
2. **Aviso de tallas**: `build/verificar.mjs` reporta que el producto `adorno-feliz-ocasiones-papel` tiene tallas fuera de rango.
3. **Factura en HTML**: el correo de pedido no adjunta PDF.
4. **Sin límite de intentos** en el inicio de sesión.
5. **Competencia 6 con matiz**: la auditoría técnica es real, pero la aceptación formal de la empresa sigue pendiente.

## 7. Riesgos de seguridad

- Las claves que se compartieron durante el desarrollo deben rotarse (no se ha hecho).
- `/api/subir-personalizacion` es público y sin límite de tamaño.
- CORS permite cualquier origen.
- No hay respaldo automatizado de la base de datos.

## 8. Pruebas ejecutadas y resultados

| Prueba | Resultado |
|---|---|
| `node --check` (backend, panel, tienda, scripts) | Sin errores |
| `node verificar-db.mjs` | 19 tablas, datos correctos, código de salida 0 |
| Búsqueda de secretos en scripts | Sin coincidencias |
| `node build/verificar.mjs` | 1 aviso de tallas |

## 9. Mejoras recomendadas

1. **Prueba unitaria de cálculos (competencia 15)**: un script que valide subtotal, descuento por cupón y envío gratis. Dificultad baja.
2. **Documentar la capa de comunicación (competencia 1, parcial)**: cómo el sitio usa HTTPS, DNS de Cloudflare y REST sobre HTTP con Supabase, Stripe y Resend. Dificultad baja.
3. **Análisis de viabilidad y costo-beneficio (competencia 7, parcial)**: comparar el costo de operar la tienda contra una plataforma SaaS. Dificultad baja.
4. **Límite de intentos de login (competencia 9)**: requiere almacenamiento de contadores (KV de Cloudflare). Dificultad media.
5. **Factura en PDF (competencias 3 y 6)**: con `pdf-lib`. Dificultad media.

## 10. Escenarios para superar el 80%

### Escenario A — Estado actual
13 competencias cumplidas. **Puntuación: 13.0 / 16 = 81.25%**.

### Escenario B — Mejoras pequeñas
Documentar la capa de comunicación de red (HTTPS, DNS, CDN, REST) para demostrar la parte de "comunicaciones" de la competencia 1 como parcial. Cambia la competencia 1 de 0 a 0.5. **Puntuación: 13.5 / 16 = 84.4%**.

### Escenario C — Fortalecimiento máximo razonable
Además del escenario B, elaborar un análisis de viabilidad económica y modelo de costo-beneficio de la solución, lo que demuestra parcialmente la competencia 7. Cambia la competencia 7 de 0 a 0.5. **Puntuación: 14.0 / 16 = 87.5%**.

La competencia 11 (software embebido) no se puede demostrar sin desviarse del alcance, por lo que el techo razonable es 87.5%.

## 11. Competencias que requieren validación humana

- **Competencia 6**: la firma del `FORMATO_VALIDACION_EMPRESARIAL.md` por el responsable de Taller Creativo E K reforzaría la evidencia, aunque la competencia ya se demuestra técnicamente.
- **Rotación de claves**: la rotación real de las claves de Supabase, Stripe y Resend debe hacerla el responsable de la empresa o del proyecto.

## 12. Conclusión

El proyecto demuestra de forma verificable **13 de 16 competencias (81.25%)**, por encima del 80% requerido, con evidencia de código, base de datos, integraciones y documentación coherente con lo implementado. Las competencias 1, 7 y 11 no corresponden al alcance de una tienda en línea y se reportan como no cumplidas de forma honesta.

Es viable alcanzar **84.4%** con documentación adicional de la capa de comunicación, y **87.5%** si además se elabora un análisis de viabilidad económica. Ambas mejoras son de baja dificultad y no requieren infraestructura nueva. La competencia 11 no es alcanzable sin forzar el proyecto.
