# Matriz de evaluación del Perfil de Egreso

Escala: Cumple (1.0), Cumple parcialmente (0.5), No cumple (0).

| # | Competencia | Estado | Evidencia principal |
|---|---|---|---|
| 1 | Redes de cómputo y comunicaciones | Cumple parcialmente | `COMUNICACIONES_Y_RED.md`: uso y configuración de HTTPS, DNS, CDN, REST y webhooks (la parte de "comunicaciones", no la de administración de redes) |
| 2 | Administración de proyectos TIC | Cumple | `REQUERIMIENTOS_Y_CRONOGRAMA.md` (cronograma 16 semanas), historial de Git por bloque, `HANDOVER.md` |
| 3 | Sistemas de información | Cumple | Panel administrativo (14 módulos), backend (14 endpoints), cotizaciones, bitácora, tablero |
| 4 | Bases de datos | Cumple | `schema.sql` (19 tablas, FK, índices únicos, RLS), `DICCIONARIO_DE_DATOS.md` |
| 5 | Integración de sistemas de comunicación | Cumple | Stripe + webhook, Mercado Pago + webhook, Resend, WhatsApp, Supabase Storage |
| 6 | Consultoría y auditoría | Cumple | `DIAGNOSTICO_EMPRESARIAL.md`, `VALIDACION_TECNICA.md`, bitácora de auditoría y validación empresarial firmada |
| 7 | Creación de empresas TIC | No cumple | El proyecto es para una empresa existente; `VIABILIDAD_ECONOMICA.md` documenta el análisis, pero no equivale a crear una empresa |
| 8 | Arquitectura HW / plataformas de software | Cumple parcialmente | `ENTORNO_Y_PLATAFORMAS.md`, `DEPLOY.md`: administración de plataformas cloud (Cloudflare + Supabase); sin arquitectura de hardware |
| 9 | Seguridad informática | Cumple | bcrypt, JWT, RLS, HMAC, lista blanca, validación de precios en servidor, honeypot, validación MIME, HSTS, claves rotadas |
| 10 | Legislación informática | Cumple | Aviso de privacidad + `docs/TERMINOS_Y_CONDICIONES.md` (términos, devoluciones y referencia normativa) |
| 11 | Software embebido | No cumple | No hay dispositivos con firmware |
| 12 | Tecnologías emergentes y herramientas actuales | Cumple | Serverless, Supabase, Stripe, Mercado Pago, WebCrypto, Jamstack |
| 13 | Interfaces gráficas de usuario | Cumple | `ek.css`, `ek.js`, personalizador con canvas, editor de fotos, constructor visual, panel responsivo |
| 14 | Investigación | Cumple | `INVESTIGACION.md`, `DECISIONES_TECNICAS.md` con referencias |
| 15 | Herramientas matemáticas | Cumple | `MATEMATICAS.md`, `build/prueba-calculos.mjs` (prueba unitaria ejecutada, 14 comprobaciones) |
| 16 | Legal, ético y sustentable | Cumple | `ASPECTOS_LEGALES_ETICOS.md`, hash de contraseñas, accesibilidad, digitalización |

## Resultado

- Cumple: 12 competencias (12.0 puntos).
- Cumple parcialmente: 2 competencias (1.0 punto).
- No cumple: 2 competencias (0 puntos).

**Puntuación: 13.0 / 16 = 81.25%.**

## Clasificación de evidencias

- Demostradas con desarrollo de software: 3, 4, 5, 9, 12, 13.
- Demostradas con integración tecnológica: 5, 9.
- Demostradas con administración de plataformas: 8 (parcial).
- Demostradas con seguridad implementada: 9, 10.
- Demostradas con investigación y documentación: 2, 14, 15, 16.
- Demostradas con consultoría, auditoría y análisis: 6.
- Demostrada parcialmente (solo comunicaciones): 1.
- No corresponden al alcance: 7, 11.

## Nota sobre las competencias 7 y 11

El análisis de viabilidad económica (`VIABILIDAD_ECONOMICA.md`) es documentación útil para la defensa, pero no demuestra la creación de una empresa de TIC; la competencia 7 se mantiene como no cumplida por honestidad académica. La competencia 11 (software embebido) no corresponde al alcance de una tienda en línea y no se fuerza.
